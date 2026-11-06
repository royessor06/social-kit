import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { RESERVED_SITE_SLUGS } from '@/lib/site'

export default auth(async (request) => {
  const segments = request.nextUrl.pathname.split('/').filter(Boolean)
  if (
    segments.length !== 1 ||
    segments[0].includes('.') ||
    RESERVED_SITE_SLUGS.has(segments[0].toLowerCase())
  ) {
    return
  }

  const site = await prisma.clientSite.findUnique({
    where: {
      slug: segments[0],
      published: true,
      suspended: false,
    },
    select: { template: { select: { active: true } } },
  })

  if (!site || !site.template.active) {
    return new Response(null, { status: 404 })
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/site/:slug/edit', '/:slug'],
}
