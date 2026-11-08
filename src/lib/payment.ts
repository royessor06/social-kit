export function getPosterPrice() {
  const value = process.env.POSTER_PRICE || '500'
  const amount = Number(value)
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('POSTER_PRICE doit être un entier positif')
  }
  return amount
}
