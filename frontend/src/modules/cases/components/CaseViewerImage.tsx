import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

import type { CaseDetail } from '../api/endpoints'
import { useCasePhoto } from '../api/hooks/useCasePhoto'

type Photo = CaseDetail['photos'][number]

export const CaseViewerImage = ({
  photo,
  imageRef,
  transform,
}: {
  photo: Photo
  imageRef: RefObject<HTMLImageElement | null>
  transform: { scale: number; x: number; y: number }
}) => {
  const query = useCasePhoto(photo.url)
  const blob = query.data
  const [loaded, setLoaded] = useState<{ blob: Blob; url: string }>()
  const [failedBlob, setFailedBlob] = useState<Blob>()
  const url = blob && loaded?.blob === blob ? loaded.url : undefined

  useEffect(() => {
    if (!blob) return
    const objectUrl = URL.createObjectURL(blob)
    setLoaded({ blob, url: objectUrl })
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  if (query.isError && !query.isFetching)
    return (
      <div
        role="alert"
        className="absolute inset-0 grid place-content-center gap-(--spacing-size-m) p-(--spacing-size2xl) text-center"
      >
        <p>Не удалось загрузить {photo.filename}.</p>
        <button
          type="button"
          className="underline"
          onClick={() => query.refetch()}
        >
          Повторить загрузку
        </button>
      </div>
    )

  if (!url || (query.isError && query.isFetching))
    return (
      <p role="status" className="absolute inset-0 grid place-content-center">
        Загрузка {photo.filename}…
      </p>
    )

  if (failedBlob === blob)
    return (
      <div
        role="alert"
        className="absolute inset-0 grid place-content-center gap-(--spacing-size-m) p-(--spacing-size2xl) text-center"
      >
        <p>Не удалось показать {photo.filename}.</p>
        <a href={url} target="_blank" rel="noreferrer" className="underline">
          Открыть исходный файл
        </a>
      </div>
    )

  return (
    <img
      ref={imageRef}
      src={url}
      alt={photo.filename}
      draggable={false}
      onError={() => setFailedBlob(blob)}
      className="size-full object-contain"
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
      }}
    />
  )
}
