import { Button, Typography } from '@maxhub/max-ui'
import { Link } from '@tanstack/react-router'
import { CircleAlert, Globe2, LockKeyhole, UsersRound } from 'lucide-react'

import { formatCompactCaseDate } from '../helpers/formatCaseDate'
import { getCaseStatusTranslation } from '../helpers/getCaseStatusTranslation'
import { CaseCategoryIcon } from './CaseCategoryIcon'
import { CaseProgress } from './CaseProgress'
import type { CaseDetail } from '../api/endpoints'
import type { HomeCase } from '../types'
import type { DispatchSearch } from '@/modules/dispatch'

type CaseCardProps = {
  caseItem: HomeCase &
    Partial<Pick<CaseDetail, 'current_step' | 'house' | 'classification'>>
  detail?: boolean
  onConfirm?: () => void
  confirming?: boolean
  confirmError?: boolean
  houseId?: string
  dispatcher?: boolean
  search?: DispatchSearch
}

const cardClass =
  'block rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-card) p-(--app-card-padding) text-(--text-primary) no-underline'
const linkFocusClass =
  'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed)'
const countClass =
  'inline-flex shrink-0 items-center gap-(--spacing-size-xs) rounded-(--app-radius-small) bg-(--app-accent-subtle) px-(--spacing-size-m) py-(--spacing-size-xs) text-(--font-size-label) font-medium text-(--app-accent-text)'
const statusClass: Record<CaseDetail['current_step']['status_key'], string> = {
  new: 'bg-(--app-status-new-bg) text-(--app-status-new-fg)',
  in_progress:
    'bg-(--app-status-in-progress-bg) text-(--app-status-in-progress-fg)',
  action_required:
    'bg-(--app-status-action-required-bg) text-(--app-status-action-required-fg)',
  closed_by_executor:
    'bg-(--app-status-closed-by-executor-bg) text-(--app-status-closed-by-executor-fg)',
  awaiting_recalculation:
    'bg-(--app-status-closed-by-executor-bg) text-(--app-status-closed-by-executor-fg)',
  completed: 'bg-(--app-status-completed-bg) text-(--app-status-completed-fg)',
}

export const CaseCard = (props: CaseCardProps) => {
  const {
    caseItem,
    detail,
    dispatcher,
    houseId,
    onConfirm,
    confirming,
    confirmError,
    search,
  } = props
  const currentStep = caseItem.current_step
  const location = [caseItem.house?.full_address, caseItem.location_details]
    .filter(Boolean)
    .join(' · ')
  const dateTime = onConfirm ? caseItem.last_activity_at : caseItem.created_at
  const date = formatCompactCaseDate(dateTime)
  const contractor =
    dispatcher && !detail ? caseItem.classification?.contractor : undefined
  const showConfirmation =
    !!onConfirm &&
    caseItem.visibility === 'public' &&
    (caseItem.can_confirm || caseItem.confirmed_by_me)

  return (
    <div className={`${cardClass} relative`}>
      {!detail && (
        <Link
          to="/cases/$id"
          params={{ id: caseItem.id }}
          search={search}
          className={`absolute inset-0 z-1 rounded-(--app-radius-card) ${linkFocusClass}`}
          aria-label={`Открыть заявку: ${caseItem.title}`}
        />
      )}
      <div className="mb-(--spacing-size-l) flex items-center justify-between gap-(--spacing-size-m)">
        <span className="inline-flex items-center gap-(--spacing-size-xs) text-(length:--font-size-label) font-semibold text-(--text-secondary)">
          {caseItem.visibility === 'public' ? (
            <>
              <Globe2 size={16} aria-hidden="true" /> Видят соседи
            </>
          ) : (
            <>
              <LockKeyhole size={16} aria-hidden="true" />{' '}
              {dispatcher ? 'Не видят соседи' : 'Только вы'}
            </>
          )}
        </span>
        <span
          className={`${countClass} ml-auto`}
          aria-label={`Подтверждений: ${caseItem.confirmation_count}`}
        >
          <UsersRound size={16} aria-hidden="true" />
          <b className="text-(--font-size-action-small) leading-none">
            {caseItem.confirmation_count}
          </b>
        </span>
      </div>
      <div className="flex items-start gap-(--spacing-size-m)">
        <span className="grid size-10 shrink-0 place-items-center rounded-(--app-radius-control) bg-(--app-accent-subtle) text-(--app-accent-text)">
          <CaseCategoryIcon categoryKey={caseItem.case_type.key} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          {detail ? (
            <Typography.Headline variant="medium" asChild>
              <h1 className="line-clamp-2 leading-(--app-case-detail-title-line-height)">
                {caseItem.title}
              </h1>
            </Typography.Headline>
          ) : (
            <Typography.Title variant="medium-strong" asChild>
              <h2 className="line-clamp-2 leading-tight">{caseItem.title}</h2>
            </Typography.Title>
          )}
          <Typography.Label variant="large" asChild>
            <p className="mt-(--spacing-size-s) leading-snug text-(--text-secondary)">
              {[caseItem.case_type.name, location].filter(Boolean).join(' · ')}
              {' · '}
              <time dateTime={dateTime} className="whitespace-nowrap">
                {date}
              </time>
            </p>
          </Typography.Label>
          {caseItem.is_emergency && (
            <p className="mt-(--spacing-size-s) flex items-center gap-(--spacing-size-xs) text-(length:--font-size-label) font-semibold text-(--app-attention-fg)">
              <CircleAlert size={16} aria-hidden="true" /> Аварийная ситуация
            </p>
          )}
        </div>
      </div>
      {(currentStep || contractor || showConfirmation) && (
        <div
          aria-hidden="true"
          className="my-(--spacing-size-xl) border-t border-(--divider-primary)"
        />
      )}
      {currentStep && (
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-(--spacing-size-m)">
          <span className="text-(length:--font-size-label) text-(--text-secondary)">
            Статус
          </span>
          <span
            className={`min-w-0 max-w-full justify-self-end rounded-full px-(--spacing-size-m) py-(--spacing-size-s) text-center text-(--font-size-note) leading-tight font-semibold wrap-break-word ${statusClass[currentStep.status_key]}`}
          >
            {getCaseStatusTranslation(currentStep.status_key)}
          </span>
        </div>
      )}
      {contractor && (
        <p className="mt-(--spacing-size-m) text-(length:--font-size-label) wrap-break-word text-(--text-secondary)">
          Исполнитель: {contractor.name}
        </p>
      )}
      {houseId && currentStep && <CaseProgress currentStep={currentStep} />}
      {showConfirmation && (
        <div className="relative z-2 mt-(--spacing-size-xl)">
          <Button
            stretched
            variant="secondary"
            className="rounded-(--app-radius-control) bg-(--app-accent-subtle) font-semibold text-(--app-accent-text)"
            disabled={!caseItem.can_confirm || confirming}
            loading={confirming}
            onClick={onConfirm}
          >
            {caseItem.confirmed_by_me ? 'Вы подтвердили' : 'У меня так же'}
          </Button>
          {confirmError && (
            <p
              role="alert"
              className="mt-(--spacing-size-m) text-(length:--font-size-label) text-(--text-negative)"
            >
              Не удалось подтвердить проблему. Попробуйте ещё раз.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
