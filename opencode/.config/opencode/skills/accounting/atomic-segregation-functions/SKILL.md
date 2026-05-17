---
name: accounting/segregation-functions
description: >
  Segregación virtual de funciones. Simular roles de Preparador/Revisor/Aprobador.
  Trigger: Al procesar transacciones, validar que roles estén separados, minimizar sesgos.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Simular los roles contables de Preparador, Revisor y Aprobador dentro del procesamiento. Minimizar sesgos asegurando separación de funciones.

## When to Load

- Procesando transacciones de alto valor
- Validando compliance interno
- Realizando controles de segregación
- Auditando AI-generated entries

## Traditional Roles

```typescript
interface SegregationRoles {
  PREPARER: {
    can: 'CREATE_ENTRIES'
    cannot: 'APPROVE' | 'DELETE'
  }

  REVIEWER: {
    can: 'REVIEW' | 'REQUEST_CHANGES' | 'APPROVE'
    cannot: 'CREATE_DIRECTLY' | 'DELETE'
  }

  APPROVER: {
    can: 'FINAL_APPROVAL' | 'REJECT'
    cannot: 'CREATE' | 'MODIFY'
  }
}

const ROLE_PERMISSIONS = {
  PREPARER: ['create', 'submit_for_review'],
  REVIEWER: ['review', 'request_changes', 'approve'],
  APPROVER: ['final_approve', 'reject']
}
```

## Virtual Segregation for AI

```typescript
interface ProcessingStep {
  step: 'PREPARE' | 'REVIEW' | 'APPROVE'
  handler: 'AI_PREPARER' | 'AI_REVIEWER' | 'AI_APPROVER'
  input: unknown
  output: unknown
  approved: boolean
  approvalReason?: string
}

interface SegregatedTransaction {
  originalInput: unknown
  preparedBy: AI_PREPARER
  reviewedBy: AI_REVIEWER
  approvedBy: AI_APPROVER

  preparationNote: string
  reviewNote: string
  approvalNote?: string

  steps: ProcessingStep[]
  allApproved: boolean
}

function processWithSegregation(
  transaction: unknown
): SegregatedTransaction {
  // Step 1: AI Preparer creates the entry
  const preparation = aiPreparer.process(transaction)
  const preparedEntry = preparation.output

  // Step 2: AI Reviewer validates
  const review = aiReviewer.validate(preparedEntry)
  if (!review.approved) {
    return { status: 'REJECTED', reason: review.rejectionReason }
  }

  // Step 3: AI Approver gives final sign-off
  const approval = aiApprover.finalCheck(preparedEntry)

  return {
    originalInput: transaction,
    preparedBy: preparation,
    reviewedBy: review,
    approvedBy: approval,
    steps: [preparation, review, approval],
    allApproved: approval.approved
  }
}
```

## AI Role Definitions

```typescript
interface AIPreparer {
  role: 'PREPARER'
  responsibilities: [
    'Classify economic event',
    'Determine accounts involved',
    'Calculate amounts',
    'Generate initial journal entry',
    'Apply accounting rules'
  ]

  // Self-check before submitting
  checkDoubleEntry: boolean
  checkAccountCodes: boolean
  checkAmounts: boolean
}

interface AIReviewer {
  role: 'REVIEWER'
  responsibilities: [
    'Validate accounting principles',
    'Check compliance with policies',
    'Verify mathematical accuracy',
    'Assess business rationale',
    'Detect potential anomalies'
  ]

  // Validation criteria
  validateAgainstPolicy: boolean
  checkForDuplicates: boolean
  checkAmountThresholds: boolean
  requireDocumentation: boolean
}

interface AIApprover {
  role: 'APPROVER'
  responsibilities: [
    'Final validation of entry',
    'Authorization decision',
    'Risk assessment',
    'Final sign-off or rejection'
  ]

  // Approval thresholds
  highValueThreshold: number  // transactions above this need extra scrutiny
  requiresHumanApproval: boolean  // some transactions always need human
}
```

## Threshold-Based Routing

```typescript
interface TransactionRisk {
  amount: number
  isNewVendor: boolean
  isUnusualTiming: boolean
  riskScore: number
}

function determineApprovalPath(transaction: TransactionRisk): ApprovalPath {
  // High value transactions get extra scrutiny
  if (transaction.amount > 50000000) {
    return {
      path: 'FULL_SEGREGATION',  // AI-Preparer → AI-Reviewer → Human-Approver
      humanRequired: true
    }
  }

  // Medium value - AI segregation sufficient
  if (transaction.amount > 10000000) {
    return {
      path: 'AI_SEGREGATION',  // AI-Preparer → AI-Reviewer → AI-Approver
      humanRequired: false
    }
  }

  // Low value - accelerated path
  return {
    path: 'EXPEDITED',  // AI-Preparer → AI-Approver only
    humanRequired: false
  }
}
```

## Validation Checkpoints

```typescript
interface ValidationCheckpoint {
  atStep: 'PREPARE' | 'REVIEW' | 'APPROVE'
  checkName: string
  checkFunction: (input: unknown) => ValidationResult
  blocking: boolean  // if true, blocks progression
}

const CHECKPOINTS: ValidationCheckpoint[] = [
  // Preparer checkpoints
  { atStep: 'PREPARE', checkName: 'Double Entry', checkFunction: validateDoubleEntry, blocking: true },
  { atStep: 'PREPARE', checkName: 'Account Valid', checkFunction: validateAccountsExist, blocking: true },
  { atStep: 'PREPARE', checkName: 'Amount > 0', checkFunction: validatePositiveAmount, blocking: true },

  // Reviewer checkpoints
  { atStep: 'REVIEW', checkName: 'Policy Compliance', checkFunction: validatePolicyCompliance, blocking: true },
  { atStep: 'REVIEW', checkName: 'Not Duplicate', checkFunction: validateNotDuplicate, blocking: true },
  { atStep: 'REVIEW', checkName: 'Documentation', checkFunction: validateDocumentationExists, blocking: false },

  // Approver checkpoints
  { atStep: 'APPROVE', checkName: 'Final Sanity', checkFunction: finalSanityCheck, blocking: true },
  { atStep: 'APPROVE', checkName: 'Risk Assessment', checkFunction: assessRiskLevel, blocking: false }
]
```

## Audit Report

```typescript
interface SegregationAuditReport {
  transactionId: string
  date: Date

  preparation: {
    preparer: string
    duration: number
    checksPassed: boolean
    notes: string
  }

  review: {
    reviewer: string
    duration: number
    checksPassed: boolean
    anomaliesFound: Anomaly[]
    notes: string
  }

  approval: {
    approver: string
    duration: number
    decision: 'APPROVED' | 'REJECTED'
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
    notes: string
  }

  overallCompliance: boolean
  segregationViolations: string[]
}
```