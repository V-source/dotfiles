---
name: accounting/workflow-orchestration
description: >
  Encadenamiento de skills atómicas para ciclos contables complejos.
  Trigger: Al ejecutar ciclos como cierre de mes, cierre de año, auditoría preventiva, proceso de facturación masiva.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Orquestar múltiples skills atómicas en el orden correcto para completar ciclos contables complejos. Funciona como el "director de orquesta".

## When to Load

- Ejecutando cierre de mes
- Realizando cierre de año
- Procesando auditoría preventiva
- Ejecutando ciclo de facturación masivo
- Preparando estados financieros

## Workflow Templates

### Cierre de Mes

```typescript
interface MonthCloseWorkflow {
  name: 'MONTH_CLOSE'
  steps: WorkflowStep[] = [
    {
      order: 1,
      skill: 'accounting/double-entry',
      action: 'validateUnbalancedEntries',
      description: 'Verificar que todos los asientos balanceen'
    },
    {
      order: 2,
      skill: 'accounting/anomaly-detection',
      action: 'scanForDuplicates',
      description: 'Detectar asientos duplicados o similares'
    },
    {
      order: 3,
      skill: 'accounting/economic-facts',
      action: 'classifyUnclassified',
      description: 'Clasificar transacciones sin clasificar'
    },
    {
      order: 4,
      skill: 'accounting/depreciation',
      action: 'calculateMonthlyDepreciation',
      description: 'Generar asientos de depreciación del mes'
    },
    {
      order: 5,
      skill: 'accounting/tax-normative',
      action: 'calculateAccruedTaxes',
      description: 'Calcular impuestos acumulados por pagar'
    },
    {
      order: 6,
      skill: 'accounting/double-entry',
      action: 'postMonthClosingEntry',
      description: 'Generar asiento de cierre mensual'
    },
    {
      order: 7,
      skill: 'accounting/immutable-traceability',
      action: 'sealMonth',
      description: 'Bloquear período, crear snapshot'
    }
  ]
}
```

### Auditoría Preventiva

```typescript
interface AuditWorkflow {
  name: 'PREVENTIVE_AUDIT'
  steps: [
    {
      order: 1,
      skill: 'accounting/double-entry',
      action: 'validateAllEntries',
      description: 'Validar todos los asientos no balanceados'
    },
    {
      order: 2,
      skill: 'accounting/anomaly-detection',
      action: 'detectPatterns',
      description: 'Buscar anomalías y patrones de fraude'
    },
    {
      order: 3,
      skill: 'accounting/cause-effect',
      action: 'reconstructBalances',
      description: 'Verificar origen de saldos significativos'
    },
    {
      order: 4,
      skill: 'accounting/segregation-functions',
      action: 'checkSegregation',
      description: 'Validar que roles estén separados'
    },
    {
      order: 5,
      skill: 'accounting/account-hierarchy',
      action: 'verifyAccountMapping',
      description: 'Confirmar mapeo correcto de cuentas'
    }
  ]
}
```

## Orchestrator Implementation

```typescript
class AccountingWorkflowOrchestrator {
  async execute<T>(
    workflow: WorkflowTemplate,
    context: WorkflowContext
  ): Promise<WorkflowResult> {
    const results: StepResult[] = []
    const errors: StepError[] = []

    for (const step of workflow.steps) {
      try {
        const result = await this.executeStep(step, context)
        results.push(result)

        if (result.blockingError) {
          return { status: 'FAILED', failedAt: step.order, errors }
        }
      } catch (error) {
        errors.push({ step: step.order, error })
        if (step.critical) {
          return { status: 'FAILED', failedAt: step.order, errors }
        }
      }
    }

    return { status: 'SUCCESS', results }
  }
}
```

## Validation Between Steps

```typescript
interface StepValidation {
  previousStep: number
  requiredOutput: string
  validationRule: (output: unknown) => boolean
}

// Example: before generating tax entries, must have validated all entries
const taxStepValidation: StepValidation = {
  previousStep: 1, // double-entry validation
  requiredOutput: 'allEntriesBalanced',
  validationRule: (output) => output === true
}
```

## Error Recovery

1. **Non-blocking error**: Log, continue, report at end
2. **Blocking error**: Stop workflow, rollback if needed, report
3. **Retryable error**: Retry up to 3 times with exponential backoff