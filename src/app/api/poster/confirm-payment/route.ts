export async function POST() {
  return Response.json(
    { error: 'La confirmation de paiement est temporairement désactivée.' },
    { status: 410 }
  )
}
