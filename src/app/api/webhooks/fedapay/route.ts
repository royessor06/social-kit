export async function POST() {
  return Response.json(
    { error: 'Le traitement des paiements est temporairement désactivé.' },
    { status: 410 }
  )
}
