import type { DispatchClassificationInput } from './caseClassification'
import type { DispatchAssignmentInput } from './caseAssignment'
import type { DispatchStatusInput } from './caseStatus'
import type { DispatchMessageInput } from './caseMessages'
import type { DispatchWorkflowInput } from './caseActions'

export * from './houses'
export * from './houseSelection'
export * from './cases'
export * from './caseDetail'
export * from './caseEvents'
export * from './caseTypes'
export * from './caseType'
export * from './caseClassification'
export * from './caseAssignment'
export * from './caseStatus'
export * from './caseMessages'
export * from './caseActions'
export * from './caseActionForm'

export type DispatchAction =
  | { kind: 'workflow'; body: DispatchWorkflowInput }
  | { kind: 'classification'; body: DispatchClassificationInput }
  | { kind: 'assignment'; body: DispatchAssignmentInput }
  | { kind: 'status'; body: DispatchStatusInput }
  | { kind: 'messages'; body: DispatchMessageInput }
