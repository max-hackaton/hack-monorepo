import { useEffect, useState } from 'react'

const previewable = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const PhotoPreview = ({ file }: { file: File }) => {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!previewable.has(file.type)) return
    const objectUrl = URL.createObjectURL(file)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [file])

  return url ? (
    <img
      src={url}
      alt={file.name}
      className="aspect-square w-full rounded-(--app-radius-control) object-cover"
    />
  ) : (
    <span className="flex aspect-square items-center justify-center rounded-(--app-radius-control) bg-(--app-accent-subtle) text-(--font-size-label)">
      {file.name.split('.').pop()?.toUpperCase() || 'Файл'}
    </span>
  )
}
