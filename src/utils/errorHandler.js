export function getSafeErrorMessage(error) {
  if (!error) return 'Terjadi kesalahan. Silakan coba lagi.'
  const message = typeof error === 'string' ? error : error.message
  if (!message) return 'Terjadi kesalahan. Silakan coba lagi.'
  return message.replace(/service_role|secret|password|token/gi, '[protected]').slice(0, 300)
}
