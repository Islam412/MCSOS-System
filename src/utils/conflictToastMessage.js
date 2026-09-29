/**
 * Nest ConflictException bilingual body: { ar: string, en: string }.
 * client.js attaches it as error.apiMessage (and error.data.message).
 * Returns "ar\\nen" (Arabic first) or null when the payload is not bilingual.
 */
export function getBilingualConflictMessage(error) {
  const candidates = [
    error?.apiMessage,
    error?.data?.message,
    error?.response?.data?.message,
  ]

  for (const candidate of candidates) {
    if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
      const ar = typeof candidate.ar === 'string' ? candidate.ar.trim() : ''
      const en = typeof candidate.en === 'string' ? candidate.en.trim() : ''
      if (ar || en) {
        return [ar, en].filter(Boolean).join('\n')
      }
    }
  }

  return null
}
