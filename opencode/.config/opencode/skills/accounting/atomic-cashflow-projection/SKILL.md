---
name: accounting/cashflow-projection
description: >
  Modelado de flujo de caja proyectado. Simulaciones para predecir insolvencia o excedentes.
  Trigger: Al proyectar flujos de caja, analizar liquidez, predecir excedentes o faltantes.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Generar proyecciones de flujo de caja basadas en historial de pagos y cobros. Predecir insolvencia o excedentes de caja.

## When to Load

- Analizando liquidez de la empresa
- Planificando inversiones de corto plazo
- Detectando posible insolvencia
- Preparando para créditos bancarios

## Core Structure

```typescript
interface CashFlowProjection {
  startDate: Date
  endDate: Date
  currency: Currency

  openingBalance: number

  inflows: CashFlowItem[]
  outflows: CashFlowItem[]

  closingBalance: number  // opening + inflows - outflows

  projections: ProjectedCashFlow[]  // daily/weekly breakdown
}

interface CashFlowItem {
  category: 'COLLECTION' | 'PAYMENT'
  subcategory: string      // 'SALES', 'A_R', 'PURCHASES', 'PAYROLL', etc.
  amount: number
  frequency: 'ONE_TIME' | 'RECURRING' | 'SEASONAL'
  recurrencePattern?: RecurrencePattern
  confidence: number       // 0-1, how sure about this amount
  relatedParties?: string[]
}
```

## Projection Methods

### 1. Based on Historical Patterns

```typescript
interface HistoricalPattern {
  subcategory: string
  averageAmount: number
  standardDeviation: number
  seasonality: SeasonalityPattern
  dayOfMonth: { typical: number[], variance: number }
}

function projectBasedOnHistory(
  pattern: HistoricalPattern,
  startDate: Date,
  periods: number
): ProjectedCashFlow[] {
  const projections: ProjectedCashFlow[] = []

  for (let i = 0; i < periods; i++) {
    const date = addMonths(startDate, i)
    const adjustedAmount = applySeasonality(pattern.seasonality, date, pattern.averageAmount)

    projections.push({
      date,
      category: pattern.subcategory,
      amount: adjustedAmount,
      confidence: calculateConfidence(pattern, date),
      type: 'PROJECTED'
    })
  }

  return projections
}
```

### 2. Accounts Receivable Projections

```typescript
interface ARProjection {
  customer: string
  currentBalance: number
  expectedCollections: CollectionProjection[]
}

function projectCollections(
  arBalances: ARBalance[],
  paymentHistory: PaymentHistory[]
): ARProjection[] {
  return arBalances.map(customer => {
    // Find average days to pay for this customer
    const avgDaysToPay = calculateAvgDaysToPay(customer, paymentHistory)

    // Calculate collection schedule
    const collections = customer.invoices.map(invoice => {
      const dueDate = addDays(invoice.date, avgDaysToPay)
      return {
        invoiceId: invoice.id,
        expectedDate: dueDate,
        amount: invoice.amount,
        probability: calculateCollectionProbability(customer, invoice)
      }
    })

    return {
      customer: customer.name,
      currentBalance: customer.balance,
      expectedCollections: collections
    }
  })
}
```

### 3. Insolvency Prediction

```typescript
interface InsolvencyRisk {
  score: number              // 0-100, higher = more risk
  level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  factors: string[]         //为什么会这样
  projectedDate: Date | null  // when cash runs out, if predictable
  recommendations: string[]
}

function predictInsolvency(
  projectedCashFlow: CashFlowProjection[],
  currentBalance: number
): InsolvencyRisk {
  let runningBalance = currentBalance
  let monthCounter = 0

  for (const period of projectedCashFlow) {
    runningBalance += period.inflows - period.outflows

    if (runningBalance < 0) {
      return {
        score: calculateScore(monthCounter),
        level: classifyRisk(monthCounter),
        factors: identifyFactors(projectedCashFlow, monthCounter),
        projectedDate: addMonths(startDate, monthCounter),
        recommendations: generateRecommendations(monthCounter)
      }
    }
    monthCounter++
  }

  return {
    score: 0,
    level: 'LOW',
    factors: [],
    projectedDate: null,
    recommendations: []
  }
}
```

## Scenario Modeling

```typescript
interface Scenario {
  name: string
  inflowMultiplier: number    // 0.8 = 80% de inflows esperados
  outflowMultiplier: number   // 1.2 = 120% de outflows esperados
  delayInflowsBy: number     // días de delay en cobros
  accelerationOutflows: number // días más rápido en pagos
}

function runScenario(
  baseProjection: CashFlowProjection,
  scenario: Scenario
): CashFlowProjection {
  return {
    ...baseProjection,
    inflows: baseProjection.inflows.map(i => ({
      ...i,
      amount: i.amount * scenario.inflowMultiplier,
      date: addDays(i.date, scenario.delayInflowsBy)
    })),
    outflows: baseProjection.outflows.map(o => ({
      ...o,
      amount: o.amount * scenario.outflowMultiplier,
      date: subDays(o.date, scenario.accelerationOutflows)
    }))
  }
}

// Common scenarios
const SCENARIOS = {
  OPTIMISTIC: { name: 'Optimista', inflowMultiplier: 1.1, outflowMultiplier: 0.9 },
  BASE: { name: 'Base', inflowMultiplier: 1.0, outflowMultiplier: 1.0 },
  PESSIMISTIC: { name: 'Pesimista', inflowMultiplier: 0.8, outflowMultiplier: 1.2 },
  CRISIS: { name: 'Crisis', inflowMultiplier: 0.5, outflowMultiplier: 1.5 }
}
```

## Dashboard Output

```typescript
interface CashFlowDashboard {
  summary: {
    currentBalance: number
    projected30Days: number
    projected90Days: number
    projected180Days: number
  }

  riskIndicators: {
    insolvencyRisk: InsolvencyRisk
    averageCollectionDays: number
    averagePaymentDays: number
    workingCapitalRatio: number
  }

  recommendations: string[]
}
```