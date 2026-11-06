import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const template = await prisma.posterTemplate.findUnique({
    where: { id, active: true },
  })
  if (!template) {
    return Response.json({ error: 'Template introuvable' }, { status: 404 })
  }

  return Response.json({
    id: template.id,
    name: template.name,
    category: template.category,
    variables: template.variables || [],
  })
}