import { prisma } from '@/lib/prisma'
import { isPaidPlan, type PlanKey } from '@/lib/plan-definitions'
export { getPlan, isPaidPlan, PLANS } from '@/lib/plan-definitions'
export type { PaidPlanKey, PlanKey } from '@/lib/plan-definitions'

export async function getActiveSubscription(userId: string, now = new Date()) {
  await prisma.subscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
      endDate: { lte: now },
    },
    data: { status: 'EXPIRED' },
  })

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      status: 'ACTIVE',
      startDate: { lte: now },
      endDate: { gt: now },
      plan: { in: ['STARTER', 'BUSINESS', 'PREMIUM'] },
    },
    orderBy: { endDate: 'desc' },
  })
  const plan = subscription?.plan && isPaidPlan(subscription.plan)
    ? subscription.plan
    : 'FREE'
  await prisma.user.updateMany({
    where: { id: userId, plan: { not: plan } },
    data: { plan },
  })
  return subscription
}

export async function getUserPlan(userId: string) {
  const [user, subscription] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    }),
    getActiveSubscription(userId),
  ])
  if (!user) return { plan: 'FREE' as PlanKey, subscription: null }

  const plan: PlanKey = subscription?.plan && isPaidPlan(subscription.plan)
    ? subscription.plan
    : 'FREE'
  if (user.plan !== plan) {
    await prisma.user.update({
      where: { id: userId },
      data: { plan },
    })
  }
  return { plan, subscription }
}
