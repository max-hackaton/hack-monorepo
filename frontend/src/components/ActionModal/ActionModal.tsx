import { Button } from '@maxhub/max-ui'

import { Modal } from '@/components/Modal'
import { ActionModalField } from './ActionModalField'
import { useActionModalForm } from './useActionModalForm'
import type { ActionForm, ActionModalValues } from './actionModalSchema'

type Props = {
  form: ActionForm
  pending: boolean
  errorMessage?: string
  onClose: () => void
  onSubmit: (values: ActionModalValues) => Promise<unknown>
}

export const ActionModal = ({
  form,
  pending,
  errorMessage,
  onClose,
  onSubmit,
}: Props) => {
  const { control, errors, values, onSelectChange, handleSubmit } =
    useActionModalForm({ form, onClose, onSubmit })

  return (
    <Modal
      open
      title={form.title}
      closeDisabled={pending}
      onClose={() => {
        if (!pending) onClose()
      }}
    >
      <form className="grid gap-(--spacing-size-xl)" onSubmit={handleSubmit}>
        {form.context && (
          <section aria-label={form.context.label} className="grid min-w-0">
            <p>{form.context.label}</p>
            <p className="wrap-anywhere whitespace-pre-wrap p-(--spacing-size-xl)">
              {form.context.text}
            </p>
          </section>
        )}
        <fieldset
          disabled={pending}
          className="grid min-w-0 gap-(--spacing-size-xl)"
        >
          {form.fields.map((field) => (
            <ActionModalField
              key={field.key}
              field={field}
              formControl={control}
              values={values}
              error={errors[field.key]?.message}
              onSelectChange={onSelectChange}
            />
          ))}
          {form.fields.length === 0 && (
            <p>Подтвердите действие «{form.submit_label.toLowerCase()}».</p>
          )}
          {errorMessage && (
            <p role="alert" className="text-(--text-negative)">
              {errorMessage}
            </p>
          )}
          <Button type="submit" stretched loading={pending} disabled={pending}>
            {form.submit_label}
          </Button>
          <Button type="button" stretched variant="secondary" onClick={onClose}>
            Отмена
          </Button>
        </fieldset>
      </form>
    </Modal>
  )
}
