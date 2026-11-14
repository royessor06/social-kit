export async function POST() {
  return Response.json(
    { error: 'Le paiement des affiches est temporairement désactivé.' },
    { status: 410 }
  )
}
