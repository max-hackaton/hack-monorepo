import { IconButton } from '@maxhub/max-ui'
import { ChevronLeft, ChevronRight, Minus, Plus, X } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent, TouchEvent } from 'react'
import { createPortal } from 'react-dom'

import type { CaseDetail } from '../api/endpoints'
import { CaseViewerImage } from './CaseViewerImage'

type Photo = CaseDetail['photos'][number]
type Transform = { scale: number; x: number; y: number }
type Gesture =
  | { kind: 'swipe'; x: number; y: number }
  | { kind: 'pan'; x: number; y: number; offset: Transform }
  | {
      kind: 'pinch'
      distance: number
      centerX: number
      centerY: number
      offset: Transform
    }

const MIN_SCALE = 1
const MAX_SCALE = 3
const SWIPE_DISTANCE = 50
const initialTransform: Transform = { scale: 1, x: 0, y: 0 }

const clampScale = (scale: number) =>
  Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale))

const distanceBetween = (
  first: { clientX: number; clientY: number },
  second: { clientX: number; clientY: number },
) => Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)

export const CasePhotoViewer = ({
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  photos: Photo[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const gestureRef = useRef<Gesture | null>(null)
  const pointerRef = useRef<{ x: number; y: number; offset: Transform } | null>(
    null,
  )
  const titleId = useId()
  const [transform, setTransform] = useState<Transform>(initialTransform)
  const photo = photos[index]

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    if (!dialog.open) dialog.showModal()
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  const clampPosition = (scale: number, x: number, y: number): Transform => {
    if (scale <= MIN_SCALE) return initialTransform
    const stage = stageRef.current
    const image = imageRef.current
    if (!stage || !image?.naturalWidth || !image.naturalHeight)
      return { scale, x: 0, y: 0 }
    const fit = Math.min(
      stage.clientWidth / image.naturalWidth,
      stage.clientHeight / image.naturalHeight,
    )
    const width = image.naturalWidth * fit
    const height = image.naturalHeight * fit
    const maxX = Math.max(0, (width * scale - stage.clientWidth) / 2)
    const maxY = Math.max(0, (height * scale - stage.clientHeight) / 2)
    return {
      scale,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    }
  }

  const changeIndex = (nextIndex: number) => {
    if (nextIndex < 0 || nextIndex >= photos.length) return
    gestureRef.current = null
    pointerRef.current = null
    setTransform(initialTransform)
    onIndexChange(nextIndex)
  }

  const changeScale = (delta: number) => {
    setTransform((current) => {
      const scale = clampScale(current.scale + delta)
      return clampPosition(scale, current.x, current.y)
    })
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      dialogRef.current?.close()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      changeIndex(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      changeIndex(index + 1)
    }
  }

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length === 2) {
      const [first, second] = [event.touches[0], event.touches[1]]
      gestureRef.current = {
        kind: 'pinch',
        distance: distanceBetween(first, second),
        centerX: (first.clientX + second.clientX) / 2,
        centerY: (first.clientY + second.clientY) / 2,
        offset: transform,
      }
    } else if (event.touches.length === 1 && !gestureRef.current) {
      const touch = event.touches[0]
      gestureRef.current =
        transform.scale > MIN_SCALE
          ? {
              kind: 'pan',
              x: touch.clientX,
              y: touch.clientY,
              offset: transform,
            }
          : { kind: 'swipe', x: touch.clientX, y: touch.clientY }
    }
  }

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const gesture = gestureRef.current
    if (!gesture) return
    if (gesture.kind === 'pinch' && event.touches.length === 2) {
      if (gesture.distance < 1) return
      const [first, second] = [event.touches[0], event.touches[1]]
      const scale = clampScale(
        (gesture.offset.scale * distanceBetween(first, second)) /
          gesture.distance,
      )
      const rect = stageRef.current?.getBoundingClientRect()
      if (!rect) return
      const originX = rect.left + rect.width / 2
      const originY = rect.top + rect.height / 2
      const centerX = (first.clientX + second.clientX) / 2
      const centerY = (first.clientY + second.clientY) / 2
      const ratio = scale / gesture.offset.scale
      setTransform(
        clampPosition(
          scale,
          centerX -
            originX -
            (gesture.centerX - originX - gesture.offset.x) * ratio,
          centerY -
            originY -
            (gesture.centerY - originY - gesture.offset.y) * ratio,
        ),
      )
    } else if (gesture.kind === 'pan' && event.touches.length === 1) {
      const touch = event.touches[0]
      setTransform(
        clampPosition(
          gesture.offset.scale,
          gesture.offset.x + touch.clientX - gesture.x,
          gesture.offset.y + touch.clientY - gesture.y,
        ),
      )
    }
  }

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (event.touches.length > 0) return
    const gesture = gestureRef.current
    gestureRef.current = null
    if (gesture?.kind !== 'swipe') return
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - gesture.x
    const deltaY = touch.clientY - gesture.y
    if (
      Math.abs(deltaX) < SWIPE_DISTANCE ||
      Math.abs(deltaX) <= Math.abs(deltaY)
    )
      return
    changeIndex(index + (deltaX < 0 ? 1 : -1))
  }

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || transform.scale <= MIN_SCALE) return
    pointerRef.current = {
      x: event.clientX,
      y: event.clientY,
      offset: transform,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointer = pointerRef.current
    if (!pointer) return
    setTransform(
      clampPosition(
        pointer.offset.scale,
        pointer.offset.x + event.clientX - pointer.x,
        pointer.offset.y + event.clientY - pointer.y,
      ),
    )
  }

  const handleCloseClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    dialogRef.current?.close()
  }

  const portalRoot = document.getElementById('modal-root') ?? document.body

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault()
        dialogRef.current?.close()
      }}
      onKeyDown={handleKeyDown}
      className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none border-0 bg-(--background-primary) p-0 text-(--text-primary) backdrop:bg-black/70"
    >
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-(--spacing-size-m) border-b border-(--divider-primary) px-(--spacing-size2xl) py-(--spacing-size-m) pt-[max(var(--spacing-size-m),env(safe-area-inset-top))]">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate font-semibold">
              {photo.filename}
            </h2>
            <p className="text-(length:--font-size-label) text-(--text-secondary)">
              {index + 1} из {photos.length}
            </p>
          </div>
          <IconButton
            type="button"
            variant="ghost"
            size="small"
            aria-label="Закрыть просмотр"
            onClick={handleCloseClick}
          >
            <X size={24} aria-hidden="true" />
          </IconButton>
        </header>
        <div
          ref={stageRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={() => {
            gestureRef.current = null
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => {
            pointerRef.current = null
          }}
          onPointerCancel={() => {
            pointerRef.current = null
          }}
          className="relative min-h-0 flex-1 overflow-hidden bg-(--background-secondary) touch-none select-none"
        >
          <CaseViewerImage
            key={photo.id}
            photo={photo}
            imageRef={imageRef}
            transform={transform}
          />
        </div>
        <footer className="flex items-center justify-between gap-(--spacing-size-m) border-t border-(--divider-primary) px-(--spacing-size2xl) py-(--spacing-size-m) pb-[max(var(--spacing-size-m),env(safe-area-inset-bottom))]">
          <IconButton
            type="button"
            variant="ghost"
            size="medium"
            aria-label="Предыдущее изображение"
            disabled={index === 0}
            onClick={() => changeIndex(index - 1)}
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </IconButton>
          <div className="flex items-center gap-(--spacing-size-m)">
            <IconButton
              type="button"
              variant="ghost"
              size="medium"
              aria-label="Уменьшить изображение"
              disabled={transform.scale <= MIN_SCALE}
              onClick={() => changeScale(-0.5)}
            >
              <Minus size={20} aria-hidden="true" />
            </IconButton>
            <span
              aria-live="polite"
              className="min-w-10 text-center text-(--font-size-label)"
            >
              {Math.round(transform.scale * 100)}%
            </span>
            <IconButton
              type="button"
              variant="ghost"
              size="medium"
              aria-label="Увеличить изображение"
              disabled={transform.scale >= MAX_SCALE}
              onClick={() => changeScale(0.5)}
            >
              <Plus size={20} aria-hidden="true" />
            </IconButton>
          </div>
          <IconButton
            type="button"
            variant="ghost"
            size="medium"
            aria-label="Следующее изображение"
            disabled={index === photos.length - 1}
            onClick={() => changeIndex(index + 1)}
          >
            <ChevronRight size={24} aria-hidden="true" />
          </IconButton>
        </footer>
      </div>
    </dialog>,
    portalRoot,
  )
}
