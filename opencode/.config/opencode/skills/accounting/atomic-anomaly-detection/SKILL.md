---
name: accounting/anomaly-detection
description: >
  Detección de anomalías, patrones de fraude, duplicidad de pagos.
  Trigger: Al auditar transacciones, detectar errores humanos, encontrar duplicados, identificar patrones sospechosos.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Identificar patrones de fraude, duplicidad de pagos, errores humanos y anomalías antes de que lleguen al Balance General.

## When to Load

- Ejecutando auditoría preventiva
- Procesando alta volume de transacciones
- Validando facturas de proveedores
- Realizando cierres de período

## Anomaly Types

```typescript
type AnomalyType =
  | 'DUPLICATE_PAYMENT'      // Pago duplicado
  | 'AMOUNT_MISMATCH'        // Monto no cuadra con documento
  | 'CIRCULAR_PAYMENT'       // Pago circular entre empresas relacionadas
  | 'TIMING_ANOMALY'         // Fecha sospechosa (muy lejos de otra)
  | 'VENDOR_CONCENTRATION'   // Demasiado dependencia de un proveedor
  | 'PATTERN_DEVIATION'      // Comportamiento fuera de lo normal
  | 'ROUND_NUMBER_ABUSE'     // Montos todos redondos (posible fake)
  | 'WEEKEND_TRANSACTION'    // Transacciones en días no hábiles
  | 'HIGH_VALUE_LOW_FREQUENCY' // Monto alto para proveedor infrequent
```

## Detection Patterns

### 1. Duplicate Detection

```typescript
interface DuplicateCheck {
  fields: ('vendor' | 'amount' | 'date' | 'description')[]
  tolerance: { field: string, maxDiff: number }[]
  timeWindow: { field: 'date', days: number }
}

function detectDuplicates(
  transactions: Transaction[],
  check: DuplicateCheck
): Anomaly[] {
  const anomalies: Anomaly[] = []

  for (const tx of transactions) {
    const potentialDuplicates = transactions.filter(t =>
      t.id !== tx.id &&
      t.vendor === tx.vendor &&
      Math.abs(t.amount - tx.amount) < 0.01 &&
      Math.abs(dateDiff(t.date, tx.date)) <= check.timeWindow.days
    )

    if (potentialDuplicates.length > 0) {
      anomalies.push({
        type: 'DUPLICATE_PAYMENT',
        transaction: tx,
        candidates: potentialDuplicates,
        severity: 'HIGH'
      })
    }
  }

  return anomalies
}
```

### 2. Amount Pattern Analysis

```typescript
function detectRoundNumberAbuse(transactions: Transaction[]): Anomaly[] {
  return transactions
    .filter(tx => tx.amount % 1000 === 0 && tx.amount > 10000)
    .map(tx => ({
      type: 'ROUND_NUMBER_ABUSE',
      transaction: tx,
      description: `Monto ${tx.amount} suspiciously round`,
      severity: 'MEDIUM'
    }))
}

function detectHighValueInfrequent(
  transactions: Transaction[],
  vendorHistory: Map<string, number>
): Anomaly[] {
  return transactions
    .filter(tx => {
      const avgAmount = vendorHistory.get(tx.vendor) || 0
      return tx.amount > avgAmount * 5
    })
    .map(tx => ({
      type: 'HIGH_VALUE_LOW_FREQUENCY',
      transaction: tx,
      description: `Amount ${tx.amount} is 5x vendor average`,
      severity: 'HIGH'
    }))
}
```

### 3. Circular Payment Detection

```typescript
function detectCircularPayments(
  transactions: Transaction[]
): Anomaly[] {
  const paymentGraph = buildPaymentGraph(transactions)

  const cycles = findCycles(paymentGraph, { minCycle: 3, maxDepth: 5 })

  return cycles.map(cycle => ({
    type: 'CIRCULAR_PAYMENT',
    path: cycle,
    description: `Circular payment detected: ${cycle.join(' → ')}`,
    severity: 'CRITICAL'
  }))
}
```

## Risk Scoring

```typescript
interface AnomalyRiskScore {
  anomaly: Anomaly
  score: number          // 0-100
  factors: string[]
  recommendation: string
}

function calculateRiskScore(anomaly: Anomaly): AnomalyRiskScore {
  let score = 0
  const factors: string[] = []

  // Amount factor
  if (anomaly.transaction.amount > 10000000) { score += 30; factors.push('Monto alto') }
  if (anomaly.transaction.amount > 50000000) { score += 20; factors.push('Monto muy alto') }

  // Timing factor
  if (isWeekend(anomaly.transaction.date)) { score += 15; factors.push('Fin de semana') }
  if (isEndOfMonth(anomaly.transaction.date)) { score += 10; factors.push('Fin de mes') }

  // Pattern factor
  if (anomaly.type === 'DUPLICATE_PAYMENT') { score += 40; factors.push('Duplicado') }
  if (anomaly.type === 'CIRCULAR_PAYMENT') { score += 50; factors.push('Circular') }

  return {
    anomaly,
    score,
    factors,
    recommendation: score > 70 ? 'BLOCK_AND_REVIEW' : 'REVIEW_LATER'
  }
}
```

## Alert Generation

```typescript
interface Alert {
  timestamp: Date
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  title: string
  description: string
  transactions: string[]
  riskScore: number
  actionRequired: boolean
}

function generateAlerts(anomalies: Anomaly[]): Alert[] {
  return anomalies
    .map(a => calculateRiskScore(a))
    .filter(r => r.score > 50)
    .map(r => ({
      timestamp: new Date(),
      severity: r.score > 80 ? 'CRITICAL' : r.score > 60 ? 'HIGH' : 'MEDIUM',
      title: `${r.anomaly.type} detected`,
      description: r.anomaly.description,
      transactions: [r.anomaly.transaction.id],
      riskScore: r.score,
      actionRequired: r.score > 70
    }))
}
```

## Integration with Audit Workflow

```typescript
// Part of preventive audit workflow
const auditSteps = [
  // ... previous steps
  {
    order: 2,
    skill: 'accounting/anomaly-detection',
    action: 'scanAllTransactions',
    description: 'Scan for duplicates, patterns, fraud signals'
  },
  {
    order: 3,
    skill: 'accounting/anomaly-detection',
    action: 'generateAlerts',
    description: 'Generate prioritized alert list'
  }
]
```