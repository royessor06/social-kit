import { createHash } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

type MemoryBucket = {
  count: number
  resetAt: number
}

type RateLimitState = typeof globalThis & {
  socialKitMemoryRateLimits?: Map<string, MemoryBucket>
  socialKitUpstashLimiters?: Map<string, Ratelimit>
  socialKitRateLimitWarningLogged?: boolean
}

const globalState = globalThis as RateLimitState
const MAX_MEMORY_BUCKETS = 10_000

function getClientKey(request: Request) {
  const ip =
    request.headers.get('x-real-ip')?.trim() ||
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ||
    'unknown'

  return createHash('sha256').update(ip.slice(0, 100)).digest('hex')
}

function getUpstashLimiter(scope: string, limit: number) {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url && !token) return null
  if (!url || !token) {
    throw new Error('UPSTASH_REDIS_REST_URL et UPSTASH_REDIS_REST_TOKEN doivent être configurées ensemble.')
  }

  const key = `${scope}:${limit}:1m`
  globalState.socialKitUpstashLimiters ??= new Map()
  let limiter = globalState.socialKitUpstashLimiters.get(key)
  if (!limiter) {
    limiter = new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(limit, '1 m'),
      prefix: `social-kit:ratelimit:${scope}`,
    })
    globalState.socialKitUpstashLimiters.set(key, limiter)
  }

  return limiter
}

function checkMemoryLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number
) {
  globalState.socialKitMemoryRateLimits ??= new Map()
  const buckets = globalState.socialKitMemoryRateLimits

  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(bucketKey)
  }

  let bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    if (!bucket && buckets.size >= MAX_MEMORY_BUCKETS) {
      return { success: false, reset: now + windowMs, unavailable: true }
    }
    bucket = { count: 0, resetAt: now + windowMs }
    buckets.set(key, bucket)
  }

  bucket.count += 1
  return {
    success: bucket.count <= limit,
    reset: bucket.resetAt,
    unavailable: false,
  }
}

export async function enforceRateLimit(
  request: Request,
  scope: string,
  limit: number
) {
  const clientKey = getClientKey(request)
  const identifier = `${scope}:${clientKey}`
  const windowMs = 60_000

  try {
    const limiter = getUpstashLimiter(scope, limit)
    if (limiter) {
      const result = await limiter.limit(identifier)
      if (result.success) return null

      const retryAfter = Math.max(
        1,
        Math.ceil((result.reset - Date.now()) / 1000)
      )
      return Response.json(
        { error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
            'X-RateLimit-Limit': String(result.limit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
          },
        }
      )
    }

    if (
      process.env.NODE_ENV === 'production' &&
      !globalState.socialKitRateLimitWarningLogged
    ) {
      console.warn(
        'Upstash non configuré : le rate limiting utilise un état local, non partagé entre instances.'
      )
      globalState.socialKitRateLimitWarningLogged = true
    }

    const result = checkMemoryLimit(
      identifier,
      limit,
      windowMs,
      Date.now()
    )
    if (result.unavailable) {
      return Response.json(
        { error: 'Le service de protection est temporairement saturé.' },
        { status: 503 }
      )
    }
    if (result.success) return null

    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000))
    return Response.json(
      { error: 'Trop de requêtes. Veuillez réessayer dans quelques instants.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        },
      }
    )
  } catch (error) {
    console.error(`Erreur du rate limiter (${scope}):`, error)
    return Response.json(
      { error: 'La vérification de sécurité est temporairement indisponible.' },
      { status: 503 }
    )
  }
}
