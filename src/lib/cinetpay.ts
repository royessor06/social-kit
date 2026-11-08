export { getPosterPrice } from './payment'

const CINETPAY_API_BASE_URLS = {
  TEST: 'https://api-checkout.cinetpay.com',
  LIVE: 'https://api-checkout.cinetpay.com',
} as const

export function getCinetPayBaseUrl() {
  const mode = (process.env.CINETPAY_MODE || 'TEST').trim().toUpperCase()

  if (mode === 'TEST') {
    return CINETPAY_API_BASE_URLS.TEST
  }
  if (mode === 'LIVE') {
    // CinetPay uses the same API host for both modes; switch modes with the
    // matching live API key, site ID, and secret in the environment.
    return CINETPAY_API_BASE_URLS.LIVE
  }

  throw new Error('CINETPAY_MODE doit être TEST ou LIVE')
}
