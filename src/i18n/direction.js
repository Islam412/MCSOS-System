export function applyDocumentDirection(language) {
  const lang = String(language || 'en').split('-')[0]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  document.documentElement.dir = dir
  document.documentElement.lang = lang
  return dir
}
