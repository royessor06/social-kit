export async function POST() {
  return Response.json(
    { error: 'Les abonnements sont temporairement indisponibles.' },
    { status: 410 }
  )
}
