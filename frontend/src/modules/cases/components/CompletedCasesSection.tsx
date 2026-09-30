import type { ReactNode } from 'react'

import { Accordion } from '@/components/Accordion'

type CompletedCasesSectionProps = {
  children: ReactNode
  onOpenChange: (open: boolean) => void
}

export const CompletedCasesSection = ({
  children,
  onOpenChange,
}: CompletedCasesSectionProps) => (
  <Accordion
    mode="single"
    className="mt-(--app-section-gap) border-t border-(--divider-primary) pt-(--spacing-size2xl)"
    onValueChange={(value) => onOpenChange(value === 'completed')}
  >
    <Accordion.Item value="completed">
      <Accordion.Trigger
        showIndicator
        className="flex min-h-(--app-control-height) items-center justify-between gap-(--spacing-size-m) rounded-(--app-radius-control) px-(--spacing-size-m) text-(--font-size-action-large) font-semibold"
      >
        Завершённые
      </Accordion.Trigger>
      <Accordion.Content className="mt-(--spacing-size-xl)">
        {children}
      </Accordion.Content>
    </Accordion.Item>
  </Accordion>
)
