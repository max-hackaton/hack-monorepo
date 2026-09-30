import { CircleAlert } from 'lucide-react'

export const CaseFieldError = ({ message }: { message: string }) => (
  <p
    role="alert"
    className="flex items-center gap-(--spacing-size-m) rounded-(--app-radius-control) bg-(--background-secondary) px-(--spacing-size-xl) py-(--spacing-size-m) text-(length:--font-size-action-small) font-medium text-(--text-negative)"
  >
    <CircleAlert
      size={20}
      aria-hidden="true"
      className="mt-(--spacing-size2xs) shrink-0"
    />
    <span>{message}</span>
  </p>
)
