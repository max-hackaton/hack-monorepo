const MAX_PHOTOS = 5
const MAX_PHOTO_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])
const EXTENSION_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  heic: 'image/heic',
  heif: 'image/heif',
}

export function validatePhotos(files: readonly File[]): string | null {
  if (files.length > MAX_PHOTOS) return 'Можно приложить не более пяти фото.'

  for (const file of files) {
    const extension = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!(
      ACCEPTED_TYPES.has(file.type) ||
      (!file.type && EXTENSION_TYPES[extension])
    )) {
      return 'Допустимы только фото JPEG, PNG, WebP, HEIC или HEIF.'
    }
    if (file.size > MAX_PHOTO_SIZE)
      return 'Каждое фото должно быть не больше 10 МиБ.'
  }

  return null
}
