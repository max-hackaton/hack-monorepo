const STEPS = [1, 2, 3, 4] as const

export const CreateCaseProgress = ({ step }: { step: 1 | 2 | 3 | 4 }) => (
  <div
    className="mb-(--spacing-size4xl)"
    role="group"
    aria-label={`Шаг ${step} из 4`}
  >
    <p className="text-(--font-size-action-small) font-semibold">
      Новая проблема
    </p>
    <div
      className="mt-(--spacing-size-xl) grid grid-cols-4 gap-(--spacing-size-s)"
      aria-hidden="true"
    >
      {STEPS.map((item) => (
        <span
          key={item}
          className={`h-1.5 rounded-full ${item === step ? 'bg-(--text-themed)' : item < step ? 'bg-(--app-accent-muted)' : 'bg-(--divider-primary)'}`}
        />
      ))}
    </div>
  </div>
)
