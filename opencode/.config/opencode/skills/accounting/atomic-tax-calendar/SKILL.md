---
name: accounting/tax-calendar
description: >
  Gestión de cronogramas tributarios venezolanos.
  Trigger: Al planificar obligaciones mensuales, anuales, determinar contribuyente especial vs. ordinario.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Gestionar el calendario de obligaciones tributarias en Venezuela. Priorizar tareas basadas en fechas de cumplimiento.

## When to Load

- Planificando obligaciones mensuales
- Determinando si es contribuyente especial
- Creando recordatorios de vencimientos
- Priorizando tareas contables

## Venezuela Tax Calendar

### Contribuyentes Especiales vs Ordinarios

```typescript
interface TaxpayerStatus {
  type: 'SPECIAL' | 'ORDINARY'
  since: Date
  reason: string
  conditions: string[]
}

function determineTaxpayerStatus(
  annualSales: number,
  vatCredits: number,
  vatDebits: number
): TaxpayerStatus {
  // Según SENIAT: especiales > 1500 UT anuales o cierta clasificación
  if (annualSales > 1500 * 50000) { // UT value ~50k Bs
    return { type: 'SPECIAL', since: new Date(), reason: 'Ventas > 1500 UT' }
  }
  return { type: 'ORDINARY' }
}
```

### Monthly Calendar

```typescript
interface TaxObligation {
  name: string
  type: 'IVA' | 'ISLR' | 'MUNICIPAL' | 'OTHER'
  frequency: 'MONTHLY' | 'BIMONTHLY' | 'ANNUAL' | 'QUARTERLY'
  dueDay: number             // día del mes
  declarativeDeadline: Date // cuándo debe declararse
  paymentDeadline: Date      // cuándo debe pagarse
  taxpayerTypes: ('SPECIAL' | 'ORDINARY')[]
  penalties: PenaltyRule
}

const TAX_CALENDAR: TaxObligation[] = [
  {
    name: 'IVA Mensual',
    type: 'IVA',
    frequency: 'MONTHLY',
    dueDay: 17,              // 17mo día hábil
    taxpayerTypes: ['SPECIAL', 'ORDINARY'],
    penalties: { type: 'INTEREST', rate: 1.2 * LAV }
  },
  {
    name: 'Patente Municipal',
    type: 'MUNICIPAL',
    frequency: 'ANNUAL',
    dueDay: 31,             // marzo
    taxpayerTypes: ['SPECIAL', 'ORDINARY'],
    penalties: { type: 'PERCENTAGE', rate: 0.10 } // 10% intereses + multa
  }
]
```

### Due Date Calculation

```typescript
function getNextDueDate(obligation: TaxObligation, fromDate: Date): DueDate {
  const nextMonth = addMonths(fromDate, 1)

  if (obligation.frequency === 'MONTHLY') {
    return {
      declarative: getNthBusinessDay(nextMonth, obligation.dueDay),
      payment: getNthBusinessDay(nextMonth, obligation.dueDay)
    }
  }

  // Quarterly, annual, etc.
  return calculateBasedOnFrequency(obligation, fromDate)
}
```

## Priority System

```typescript
interface TaskPriority {
  task: string
  dueDate: Date
  daysUntilDue: number
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  taxType: string
  penaltyRisk: number  // en Bs, costo de no cumplir
}

function prioritizeTasks(obligations: TaxObligation[], currentDate: Date): TaskPriority[] {
  return obligations
    .map(obs => ({
      task: obs.name,
      dueDate: getNextDueDate(obs, currentDate).declarative,
      daysUntilDue: daysBetween(currentDate, getNextDueDate(obs, currentDate).declarative),
      urgency: calculateUrgency(daysUntilDue),
      taxType: obs.type,
      penaltyRisk: obs.penalties.calculate(obs)
    }))
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}
```

## Venezuela-specific UT

```typescript
// Unidad Tributaria value (actualizado anualmente)
// 2024: ~50,000 Bs (verificar publicación SENIAT)
const UT_CURRENT_YEAR = 50000

function utToBs(utAmount: number): number {
  return utAmount * UT_CURRENT_YEAR
}
```

## Alert System

```typescript
interface TaxAlert {
  daysUntilDue: number
  message: string
  actionRequired: boolean
}

function generateAlerts(currentDate: Date): TaxAlert[] {
  const upcomingTasks = prioritizeTasks(TAX_CALENDAR, currentDate)

  return upcomingTasks
    .filter(t => t.daysUntilDue <= 7)
    .map(t => ({
      daysUntilDue: t.daysUntilDue,
      message: `Faltan ${t.daysUntilDue} días para ${t.task}`,
      actionRequired: t.daysUntilDue <= 3
    }))
}
```