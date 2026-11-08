export async function POST() {
  return Response.json(
    { error: 'Le paiement CinetPay est désactivé. Utilisez FedaPay.' },
    { status: 410 }
  )
}
