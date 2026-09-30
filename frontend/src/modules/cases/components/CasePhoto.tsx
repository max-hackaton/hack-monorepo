import { useEffect, useState } from 'react'
import { Button, Typography } from '@maxhub/max-ui'

import { Skeleton } from '@/components/Skeleton'

import { useCasePhoto } from '../api/hooks/useCasePhoto'
import type { CaseDetail } from '../api/endpoints'

type Photo = CaseDetail['photos'][number]
const previewable = new Set(['image/jpeg', 'image/png', 'image/webp'])

export const isPreviewableCasePhoto = (photo: Photo) =>
  previewable.has(photo.content_type)

export const CasePhoto = ({
  photo,
  compact = false,
  onOpen,
}: {
  photo: Photo
  compact?: boolean
  onOpen?: (trigger: HTMLButtonElement) => void
}) => {
  const query = useCasePhoto(photo.url)
  const blob = query.data
  const [loaded, setLoaded] = useState<{ blob: Blob; url: string }>()
  const [imageFailedBlob, setImageFailedBlob] = useState<Blob>()
  const url = blob && loaded?.blob === blob ? loaded.url : undefined

  useEffect(() => {
    if (!blob) return
    const objectUrl = URL.createObjectURL(blob)
    setLoaded({ blob, url: objectUrl })
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  if (query.isError && !query.isFetching) {
    return (
      <div
        role="alert"
        className={`grid gap-(--spacing-size-m) rounded-(--app-radius-control) p-(--spacing-size-xl) ${compact ? 'w-20' : ''}`}
      >
        <Typography.Body variant="small">
          Не удалось загрузить {photo.filename}
        </Typography.Body>
        <Button
          size="small"
          variant="secondary"
          onClick={() => query.refetch()}
        >
          Повторить загрузку фото
        </Button>
      </div>
    )
  }

  if (!url || (query.isError && query.isFetching))
    return (
      <div
        role="status"
        aria-label={`Загрузка ${photo.filename}`}
        className={compact ? 'size-20' : 'h-32 w-full'}
      >
        <Skeleton className="size-full rounded-(--app-radius-control)" />
      </div>
    )

  const canPreview = isPreviewableCasePhoto(photo) && imageFailedBlob !== blob

  return (
    <div className={`grid gap-(--spacing-size-m) ${compact ? 'w-20' : ''}`}>
      {canPreview &&
        (compact && onOpen ? (
          <button
            type="button"
            aria-label={`Просмотреть ${photo.filename}`}
            onClick={(event) => onOpen(event.currentTarget)}
            className="cursor-zoom-in rounded-(--app-radius-control) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed)"
          >
            <img
              src={url}
              alt={photo.filename}
              className="size-20 rounded-(--app-radius-control) object-cover"
              onError={() => setImageFailedBlob(blob)}
            />
          </button>
        ) : compact ? (
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Открыть ${photo.filename}`}
          >
            <img
              src={url}
              alt={photo.filename}
              className="size-20 rounded-(--app-radius-control) object-cover"
              onError={() => setImageFailedBlob(blob)}
            />
          </a>
        ) : (
          <img
            src={url}
            alt={photo.filename}
            className="max-h-72 w-full rounded-(--app-radius-control) object-contain"
            onError={() => setImageFailedBlob(blob)}
          />
        ))}
      {imageFailedBlob === blob && (
        <p role="alert">Не удалось показать {photo.filename}.</p>
      )}
      {(!compact || !canPreview) && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className={`text-(--font-size-action-small) underline ${compact ? 'break-all text-(--font-size-label)' : ''}`}
        >
          Открыть {photo.filename}
        </a>
      )}
    </div>
  )
}
