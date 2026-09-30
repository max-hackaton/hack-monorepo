import { ChevronDown } from 'lucide-react'
import { createContext, useContext, useId, useState } from 'react'
import type { ReactNode } from 'react'

type AccordionProps = {
  children: ReactNode
  className?: string
} & (
  | {
      mode: 'single'
      defaultValue?: string
      onValueChange?: (value: string) => void
    }
  | {
      mode: 'multiple'
      defaultValue?: string[]
      onValueChange?: (value: string[]) => void
    }
)

type AccordionContextValue = {
  openValues: string[]
  toggle: (value: string) => void
}

type AccordionItemContextValue = {
  variant: 'plain' | 'card'
  open: boolean
  triggerId: string
  panelId: string
  toggle: () => void
}

const AccordionContext = createContext<AccordionContextValue | null>(null)
const AccordionItemContext = createContext<AccordionItemContextValue | null>(
  null,
)

const cardItemClassName =
  'overflow-hidden rounded-(--app-radius-card) border border-(--divider-primary)'
const cardTriggerClassName =
  'group flex min-h-(--app-control-height) items-center justify-between gap-(--spacing-size-m) bg-(--background-secondary) px-(--spacing-size2xl) py-(--spacing-size-m) text-(--font-size-detail) font-semibold hover:bg-(--app-accent-subtle)'
const cardContentClassName =
  'border-t border-(--divider-primary) bg-(--background-primary) p-(--spacing-size2xl)'

function useAccordionContext() {
  const context = useContext(AccordionContext)
  if (!context) throw new Error('Accordion.Item must be inside Accordion')
  return context
}

function useAccordionItemContext() {
  const context = useContext(AccordionItemContext)
  if (!context) {
    throw new Error(
      'Accordion.Trigger and Accordion.Content must be inside Accordion.Item',
    )
  }
  return context
}

const AccordionRoot = ({
  mode,
  defaultValue,
  children,
  className,
  onValueChange,
}: AccordionProps) => {
  const [openValues, setOpenValues] = useState<string[]>(() => {
    if (mode === 'multiple') return defaultValue ?? []
    return defaultValue ? [defaultValue] : []
  })

  const toggle = (value: string) => {
    const nextValues = openValues.includes(value)
      ? openValues.filter((openValue) => openValue !== value)
      : mode === 'single'
        ? [value]
        : [...openValues, value]

    setOpenValues(nextValues)

    if (mode === 'single') onValueChange?.(nextValues[0] ?? null)
    else onValueChange?.(nextValues)
  }

  return (
    <AccordionContext value={{ openValues, toggle }}>
      <div className={className}>{children}</div>
    </AccordionContext>
  )
}

const AccordionItem = ({
  value,
  children,
  className,
  variant = 'plain',
}: {
  value: string
  children: ReactNode
  className?: string
  variant?: 'plain' | 'card'
}) => {
  const { openValues, toggle } = useAccordionContext()
  const id = useId()

  return (
    <AccordionItemContext
      value={{
        variant,
        open: openValues.includes(value),
        triggerId: `${id}-trigger`,
        panelId: `${id}-panel`,
        toggle: () => toggle(value),
      }}
    >
      <div
        className={`${variant === 'card' ? cardItemClassName : ''} ${className ?? ''}`}
      >
        {children}
      </div>
    </AccordionItemContext>
  )
}

const AccordionTrigger = ({
  children,
  className = '',
  indicator,
  showIndicator = false,
}: {
  children: ReactNode
  className?: string
  indicator?: ReactNode
  showIndicator?: boolean
}) => {
  const { variant, open, triggerId, panelId, toggle } =
    useAccordionItemContext()

  return (
    <button
      id={triggerId}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={toggle}
      className={`group w-full cursor-pointer text-left focus-visible:rounded-(--app-radius-small) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--text-themed) ${variant === 'card' ? cardTriggerClassName : ''} ${className}`}
    >
      {children}
      {indicator === undefined && (variant === 'card' || showIndicator) ? (
        <ChevronDown
          size={20}
          aria-hidden="true"
          className="shrink-0 text-(--text-secondary) transition-transform duration-200 group-aria-expanded:rotate-180 motion-reduce:transition-none"
        />
      ) : (
        indicator
      )}
    </button>
  )
}

const AccordionContent = ({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) => {
  const { variant, open, triggerId, panelId } = useAccordionItemContext()

  return (
    <div
      id={panelId}
      role="region"
      aria-labelledby={triggerId}
      aria-hidden={!open}
      inert={!open}
      data-open={open}
      className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-200 ease-in-out data-[open=true]:grid-rows-[1fr] data-[open=true]:opacity-100 motion-reduce:transition-none"
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={`${variant === 'card' ? cardContentClassName : ''} ${className ?? ''}`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
})
