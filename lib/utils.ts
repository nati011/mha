export function isUrl(str: string): boolean {
  try {
    const url = new URL(str)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function isGoogleMapsUrl(str: string): boolean {
  if (!isUrl(str)) return false
  try {
    const url = new URL(str)
    return (
      url.hostname.includes('google.com') &&
      (url.pathname.includes('/maps') || url.hostname.includes('maps'))
    )
  } catch {
    return false
  }
}

export function extractPlaceNameFromGoogleMaps(url: string): string | null {
  try {
    const urlObj = new URL(url)
    
    // Try to get place name from /place/ path
    const placeMatch = urlObj.pathname.match(/\/place\/([^/@]+)/)
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    }
    
    // Try to get from q parameter
    const qParam = urlObj.searchParams.get('q')
    if (qParam) {
      return decodeURIComponent(qParam.replace(/\+/g, ' '))
    }
    
    // Try to get from query parameter
    const query = urlObj.searchParams.get('query')
    if (query) {
      return decodeURIComponent(query.replace(/\+/g, ' '))
    }
    
    return null
  } catch {
    return null
  }
}

