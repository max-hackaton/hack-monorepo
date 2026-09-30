import { Check } from 'lucide-react'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
  Ref,
  RefObject,
} from 'react'

type SelectProps = {
  children: ReactNode
  className?: string
  onOpenChange?: (open: boolean) => void
} & (
  | {
      mode: 'single'
      value: string | null
      onValueChange: (value: string) => void
      selectAll?: never
    }
  | {
      mode: 'multiple'
      value: string[]
      onValueChange: (value: string[]) => void
      selectAll?: boolean
    }
)

type SelectContextValue = {
  mode: SelectProps['mode']
  open: boolean
  mounted: boolean
  panelId: string
  rootRef: Ref<HTMLDivElement>
  triggerRef: RefObject<HTMLButtonElement | null>
  panelRef: RefObject<HTMLDivElement | null>
  toggle: () => void
  isSelected: (value: string) => boolean
  select: (value: string) => void
  showSelectAll: boolean
  itemCount: number
  allSelected: boolean
  toggleAll: () => void
  registerItem: (value: string) => () => void
}

const SelectContext = createContext<SelectContextValue | null>(null)

function useSelectContext() {
  const context = useContext(SelectContext)
  if (!context) throw new Error('Select components must be inside Select')
  return context
}

const SelectRoot = (props: SelectProps) => {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [itemValues, setItemValues] = useState<string[]>([])
  const panelId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const selectedValuesRef = useRef<string[]>(
    props.mode === 'multiple' ? props.value : [],
  )
  const onOpenChangeRef = useRef(props.onOpenChange)
  onOpenChangeRef.current = props.onOpenChange

  useEffect(() => {
    if (props.mode === 'multiple') selectedValuesRef.current = props.value
  }, [props.mode, props.value])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
        onOpenChangeRef.current?.(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setOpen(false)
      onOpenChangeRef.current?.(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    panelRef.current?.focus()
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const toggle = () => {
    const next = !open
    setOpen(next)
    props.onOpenChange?.(next)
    setMounted(true)
  }

  const isSelected = (value: string) =>
    props.mode === 'multiple'
      ? props.value.includes(value)
      : props.value === value

  const select = (value: string) => {
    if (props.mode === 'multiple') {
      const current = selectedValuesRef.current
      const next = current.includes(value)
        ? current.filter((selected) => selected !== value)
        : [...current, value]
      selectedValuesRef.current = next
      props.onValueChange(next)
    } else {
      props.onValueChange(value)
      setOpen(false)
      props.onOpenChange?.(false)
      triggerRef.current?.focus()
    }
  }

  const registerItem = useCallback((value: string) => {
    setItemValues((previous) =>
      previous.includes(value) ? previous : [...previous, value],
    )
    return () =>
      setItemValues((previous) => previous.filter((item) => item !== value))
  }, [])

  const allSelected =
    props.mode === 'multiple' &&
    itemValues.length > 0 &&
    itemValues.every((value) => props.value.includes(value))

  const toggleAll = () => {
    if (props.mode !== 'multiple' || itemValues.length === 0) return
    const visible = new Set(itemValues)
    const current = selectedValuesRef.current
    const allCurrentlySelected = itemValues.every((value) =>
      current.includes(value),
    )
    const next = allCurrentlySelected
      ? current.filter((value) => !visible.has(value))
      : [...current, ...itemValues.filter((value) => !current.includes(value))]
    selectedValuesRef.current = next
    props.onValueChange(next)
  }

  return (
    <SelectContext
      value={{
        mode: props.mode,
        open,
        mounted,
        panelId,
        rootRef,
        triggerRef,
        panelRef,
        toggle,
        isSelected,
        select,
        showSelectAll: props.mode === 'multiple' && Boolean(props.selectAll),
        itemCount: itemValues.length,
        allSelected,
        toggleAll,
        registerItem,
      }}
    >
      <div ref={rootRef} className={`relative ${props.className ?? ''}`}>
        {props.children}
      </div>
    </SelectContext>
  )
}

type TriggerRenderProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  ref: Ref<HTMLButtonElement>
}

const SelectTrigger = ({
  children,
}: {
  children: (props: TriggerRenderProps) => ReactNode
}) => {
  const { open, panelId, triggerRef, toggle } = useSelectContext()
  return children({
    ref: triggerRef,
    type: 'button',
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    'aria-controls': panelId,
    onClick: toggle,
  })
}

const SelectContent = ({
  children,
  className = '',
  floating = false,
  'aria-label': label,
}: {
  children: ReactNode
  className?: string
  floating?: boolean
  'aria-label': string
}) => {
  const {
    open,
    mounted,
    panelId,
    panelRef,
    triggerRef,
    showSelectAll,
    itemCount,
    allSelected,
    toggleAll,
  } = useSelectContext()
  const [floatingStyle, setFloatingStyle] = useState<CSSProperties>()

  useLayoutEffect(() => {
    if (!open || !floating) return

    const updatePosition = () => {
      const trigger = triggerRef.current
      const panel = panelRef.current
      if (!trigger || !panel) return

      const rect = trigger.getBoundingClientRect()
      const below = window.innerHeight - rect.bottom - 8
      const above = rect.top - 8
      const desiredHeight = Math.min(panel.scrollHeight, 320)
      const showAbove = below < desiredHeight && above > below
      const availableHeight = showAbove ? above : below
      const maxHeight = Math.max(0, Math.min(desiredHeight, availableHeight))

      setFloatingStyle({
        top: showAbove ? rect.top - maxHeight - 8 : rect.bottom + 8,
        left: Math.max(
          8,
          Math.min(rect.left, window.innerWidth - rect.width - 8),
        ),
        width: Math.min(rect.width, window.innerWidth - 16),
        maxHeight,
      })
    }

    const handleScroll = (event: Event) => {
      if (
        event.target instanceof Node &&
        panelRef.current?.contains(event.target)
      )
        return
      updatePosition()
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [open, floating, panelRef, triggerRef])

  if (!mounted) return null
  return (
    <div
      ref={panelRef}
      id={panelId}
      role="dialog"
      aria-label={label}
      tabIndex={-1}
      hidden={!open}
      style={floating ? (floatingStyle ?? { visibility: 'hidden' }) : undefined}
      className={`${floating ? 'fixed' : 'absolute'} z-20 rounded-(--app-radius-card) border border-(--divider-primary) bg-(--background-primary) shadow-(--app-shadow-floating) focus:outline-none ${!open ? 'hidden' : ''} ${className}`}
    >
      {showSelectAll && itemCount > 0 && (
        <button
          type="button"
          onClick={toggleAll}
          className="mb-(--spacing-size-m) min-h-(--app-control-height-compact) w-full rounded-(--app-radius-small) px-(--spacing-size-m) text-left text-(length:--font-size-action-small) font-medium text-(--app-accent-text) active:bg-(--background-secondary) focus-visible:outline-2 focus-visible:outline-(--text-themed)"
        >
          {allSelected ? 'Убрать все' : 'Выбрать все'}
        </button>
      )}
      {children}
    </div>
  )
}

const SelectItem = ({
  value,
  children,
  className = '',
  'aria-invalid': invalid,
  'aria-describedby': describedBy,
}: {
  value: string
  children: ReactNode
  className?: string
  'aria-invalid'?: boolean
  'aria-describedby'?: string
}) => {
  const { mode, panelId, isSelected, select, registerItem } = useSelectContext()
  useEffect(() => registerItem(value), [registerItem, value])
  const selected = isSelected(value)
  return (
    <label
      className={`flex min-h-(--app-control-height) cursor-pointer items-center gap-(--spacing-size-xl) rounded-(--app-radius-small) px-(--spacing-size-m) py-(--spacing-size-s) text-(--font-size-action-small) active:bg-(--background-secondary) has-focus-visible:outline-2 has-focus-visible:outline-(--text-themed) ${className}`}
    >
      <input
        type={mode === 'multiple' ? 'checkbox' : 'radio'}
        name={mode === 'single' ? panelId : undefined}
        value={value}
        checked={selected}
        onChange={() => select(value)}
        aria-invalid={invalid}
        aria-describedby={describedBy}
        className="sr-only"
      />
      <span className="min-w-0 flex-1 wrap-break-word">{children}</span>
      <Check
        size={20}
        aria-hidden="true"
        className={`shrink-0 text-(--app-accent-text) ${selected ? '' : 'invisible'}`}
      />
    </label>
  )
}

export const Select = Object.assign(SelectRoot, {
  Trigger: SelectTrigger,
  Content: SelectContent,
  Item: SelectItem,
})
