import type { CaseMessageInput } from './caseMessages'
import type { CaseStatusInput } from './caseStatus'
import type { CaseWorkflowInput } from './caseActions'

export * from './confirmCase'
export * from './caseTypes'
export * from './caseType'
export * from './cases'
export * from './caseDetail'
export * from './caseEvents'
export * from './casePhoto'
export * from './caseMessages'
export * from './caseStatus'
export * from './caseActions'
export * from './caseActionForm'

export type CaseAction =
  | { kind: 'workflow'; body: CaseWorkflowInput }
  | { kind: 'messages'; body: CaseMessageInput }
  | { kind: 'status'; body: CaseStatusInput }
