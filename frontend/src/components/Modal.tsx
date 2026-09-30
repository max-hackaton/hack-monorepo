import { IconButton, Typography } from '@maxhub/max-ui'
import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  closeDisabled?: boolean
}

export const Modal = ({
  open,
  onClose,
  title,
  children,
  closeDisabled = false,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement as HTMLElement | null
      dialog.showModal()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [open])

  const portalRoot = document.getElementById('modal-root') ?? document.body

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClose={() => {
        previousFocusRef.current?.focus()
        onClose()
      }}
      onCancel={(event) => {
        if (closeDisabled) event.preventDefault()
      }}
      className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-(--app-radius-floating) border border-(--divider-primary) bg-(--background-primary) p-(--spacing-size2xl) text-(--text-primary) shadow-(--app-shadow-floating) backdrop:bg-black/50"
    >
      <div className="mb-(--spacing-size2xl) flex items-center justify-between gap-(--spacing-size-xl)">
        <Typography.Title variant="medium-strong" asChild>
          <h2 id={titleId}>{title}</h2>
        </Typography.Title>
        <IconButton
          type="button"
          variant="ghost"
          size="small"
          aria-label="Закрыть"
          disabled={closeDisabled}
          onClick={onClose}
        >
          <X size={20} aria-hidden="true" />
        </IconButton>
      </div>
      {children}
    </dialog>,
    portalRoot,
  )
}
