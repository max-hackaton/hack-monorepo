import { Button, Typography } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useRef, useState } from 'react'

import { Accordion } from '@/components/Accordion'
import { AppPageContainer } from '@/components/AppPageContainer'
import type { DispatchSearch } from '@/modules/dispatch'
import type { CaseDetail } from '../api/endpoints'
import type { useCaseEvents } from '../api/hooks/useCaseEvents'
import type { useConfirmCaseMutation } from '../api/hooks/useConfirmCaseMutation'
import { CasePhoto, isPreviewableCasePhoto } from './CasePhoto'
import { CasePhotoViewer } from './CasePhotoViewer'
import { CaseCard } from './CaseCard'
import { CaseDetailError } from './CaseDetailError'
import { isCaseAccessError } from '../helpers/isCaseAccessError'
import { CaseHistory } from './CaseHistory'
import { CaseDetailSkeleton } from './CaseDetailSkeleton'

type CaseDetailViewProps = {
  detail: {
    data: CaseDetail | undefined
    isPending: boolean
    isError: boolean
    error: unknown
    refetch: () => unknown
  }
  events: ReturnType<typeof useCaseEvents>
  confirmation?: ReturnType<typeof useConfirmCaseMutation>
  children?: ReactNode
  dispatcher?: boolean
  dispatchFeedSearch?: DispatchSearch
}

export const CaseDetailView = ({
  detail,
  events,
  confirmation,
  children,
  dispatcher = false,
  dispatchFeedSearch,
}: CaseDetailViewProps) => {
  return (
    <AppPageContainer>
      {detail.isPending ? (
        <CaseDetailSkeleton />
      ) : !detail.data ||
        (detail.isError && isCaseAccessError(detail.error)) ? (
        <CaseDetailError
          error={detail.error}
          onRetry={() => detail.refetch()}
        />
      ) : (
        <>
          <CaseCard detail caseItem={detail.data} dispatcher={dispatcher} />
          {detail.isError && (
            <div
              role="alert"
              className="mt-(--spacing-size2xl) grid gap-(--spacing-size-m) text-(--font-size-action-small)"
            >
              <p>
                Не удалось обновить заявку. Показаны последние загруженные
                данные.
              </p>
              <Button variant="secondary" onClick={() => detail.refetch()}>
                Обновить заявку
              </Button>
            </div>
          )}
          <section
            className="mt-(--spacing-size3xl)"
            aria-labelledby="case-description-title"
          >
            <h2
              id="case-description-title"
              className="mb-(--spacing-size-m) text-(--font-size-detail) font-semibold"
            >
              Описание
            </h2>
            <p className="text-(length:--font-size-description) leading-relaxed whitespace-pre-wrap text-(--text-secondary)">
              {detail.data.description}
            </p>
          </section>
          {(detail.data.can_confirm || detail.data.confirmed_by_me) &&
            confirmation && (
              <Button
                stretched
                variant="secondary"
                className="mt-(--spacing-size2xl)"
                loading={confirmation.isPending}
                disabled={detail.data.confirmed_by_me || confirmation.isPending}
                onClick={() => confirmation.mutate(detail.data!.id)}
              >
                {detail.data.confirmed_by_me
                  ? 'Вы подтвердили эту заявку'
                  : 'У меня так же'}
              </Button>
            )}
          {confirmation?.isError && (
            <Typography.Body
              variant="small"
              role="alert"
              className="mt-(--spacing-size-m) block"
            >
              Не удалось подтвердить проблему. Попробуйте ещё раз.
            </Typography.Body>
          )}
          {children}
          <Accordion mode="multiple" className="mt-(--spacing-size-m)">
            <Accordion.Item value="history" variant="card">
              <Accordion.Trigger>История</Accordion.Trigger>
              <Accordion.Content>
                <CaseHistory
                  key={`history:${detail.data.id}`}
                  events={events}
                  isEmergency={detail.data.is_emergency}
                />
              </Accordion.Content>
            </Accordion.Item>
          </Accordion>
          <CaseMaterials photos={detail.data.photos} />
          <Button
            stretched
            variant="secondary"
            asChild
            className="mt-(--spacing-size4xl)"
          >
            {dispatcher ? (
              <Link to="/" search={dispatchFeedSearch}>
                К ленте
              </Link>
            ) : (
              <Link to="/cases" search={{ scope: 'mine' }}>
                К моим заявкам
              </Link>
            )}
          </Button>
        </>
      )}
    </AppPageContainer>
  )
}

const CaseMaterials = ({ photos }: { photos: CaseDetail['photos'] }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const openerRef = useRef<HTMLButtonElement | null>(null)
  const previewablePhotos = photos.filter(isPreviewableCasePhoto)
  const selectedIndex = previewablePhotos.findIndex(
    (photo) => photo.id === selectedId,
  )

  const closeViewer = () => {
    setSelectedId(null)
    openerRef.current?.focus()
    openerRef.current = null
  }

  return (
    <section
      className="mt-(--spacing-size2xl)"
      aria-labelledby="case-photos-title"
    >
      <Typography.Title variant="medium-strong" asChild>
        <h2 id="case-photos-title" className="mb-(--spacing-size-xl)">
          Материалы
        </h2>
      </Typography.Title>
      {photos.length === 0 ? (
        <p>Вложений нет</p>
      ) : (
        <div className="flex flex-wrap gap-(--spacing-size-m)">
          {photos.map((photo) => (
            <CasePhoto
              key={photo.id}
              photo={photo}
              compact
              onOpen={
                isPreviewableCasePhoto(photo)
                  ? (trigger) => {
                      openerRef.current = trigger
                      setSelectedId(photo.id)
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
      {selectedIndex >= 0 && (
        <CasePhotoViewer
          photos={previewablePhotos}
          index={selectedIndex}
          onIndexChange={(index) => setSelectedId(previewablePhotos[index].id)}
          onClose={closeViewer}
        />
      )}
    </section>
  )
}
