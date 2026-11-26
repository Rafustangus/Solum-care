export function assetUrl(name = '') {
  return `${import.meta.env.BASE_URL}assets/${String(name).replace(/^\/+/, '')}`
}
