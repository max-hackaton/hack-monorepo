import { Button, Textarea } from '@maxhub/max-ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useId } from 'react'
import { useForm } from 'react-hook-form'

import { caseMessageSchema } from '../helpers/caseMessageForm'
import type { CaseMessageFormValues } from '../helpers/caseMessageForm'

type CaseMessageFormProps = {
  label: string
  submitLabel?: string
  pending: boolean
  submit: (values: CaseMessageFormValues) => Promise<unknown>
}

export const CaseMessageForm = ({
  label,
  submitLabel = 'Отправить сообщение',
  pending,
  submit,
}: CaseMessageFormProps) => {
  const id = useId()
  const form = useForm({
    resolver: zodResolver(caseMessageSchema),
    defaultValues: { body: '' },
    mode: 'onChange',
  })
  const error = form.formState.errors.body
  const submitting = pending || form.formState.isSubmitting

  return (
    <form
      className="grid gap-(--spacing-size-xl)"
      onSubmit={form.handleSubmit(async (values) => {
        if (submitting) return
        try {
          await submit(values)
          form.resetField('body')
        } catch {
          return
        }
      })}
    >
      <label htmlFor={id} className="text-(--font-size-detail) font-semibold">
        {label}
      </label>
      <Textarea
        id={id}
        mode="secondary"
        className="border border-(--divider-primary) focus-within:outline-2 focus-within:outline-(--text-themed)"
        {...form.register('body')}
        disabled={submitting}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-(length:--font-size-action-small) text-(--text-negative)"
        >
          {error.message}
        </p>
      )}
      <Button
        type="submit"
        stretched
        variant="secondary"
        disabled={submitting}
        loading={submitting}
      >
        {submitLabel}
      </Button>
    </form>
  )
}
