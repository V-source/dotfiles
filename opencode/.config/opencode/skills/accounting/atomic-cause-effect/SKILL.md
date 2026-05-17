---
name: accounting/cause-effect
description: >
  Reconstrucción del origen de un saldo. Explicar el "por qué" de un número.
  Trigger: Al analizar saldos, explicar variaciones, reconstruir historia de una cuenta.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Reconstruir el因果关系 (causa-efecto) de cualquier saldo contable. No solo decir "el saldo es X", sino explicar exactamente qué transacciones lo crearon.

## When to Load

- Analizando saldo de cuenta específico
- Explicando variaciones entre períodos
- Realizando auditoría de balance
- Respondiendo "¿por qué el banco tiene X?"

## Core Pattern

```typescript
interface BalanceReconstruction {
  accountCode: string
  accountName: string
  asOfDate: Date

  openingBalance: number
  transactions: TransactionSummary[]
  closingBalance: number

  variance: number  // closing - opening should match sum of transactions

  transactionCount: number
  entries: EntryDetail[]
}

interface EntryDetail {
  date: Date
  description: string
  debit: number
  credit: number
  runningBalance: number
  documentRef: string
  balanced: boolean
}
```

## Reconstruction Algorithm

```typescript
async function reconstructBalance(
  accountCode: string,
  startDate: Date,
  endDate: Date
): Promise<BalanceReconstruction> {
  // 1. Get opening balance (before startDate)
  const opening = await getBalanceAtDate(accountCode, subDays(startDate, 1))

  // 2. Get all transactions in range
  const transactions = await getTransactions(accountCode, startDate, endDate)

  // 3. Sort by date
  transactions.sort((a, b) => compareDates(a.date, b.date))

  // 4. Build running balance
  let running = opening
  const entries = transactions.map(tx => {
    const debit = tx.debit || 0
    const credit = tx.credit || 0

    // Apply normal balance direction
    running += getAccountNormalBalance(accountCode) === 'DEBIT' ? debit - credit : credit - debit

    return {
      date: tx.date,
      description: tx.description,
      debit,
      credit,
      runningBalance: running,
      documentRef: tx.documentNumber,
      balanced: true
    }
  })

  // 5. Calculate closing
  const closing = running

  // 6. Verify variance
  const sumOfMovements = transactions.reduce((sum, tx) =>
    sum + (tx.debit || 0) + (tx.credit || 0), 0)
  const variance = Math.abs(closing - opening - sumOfMovements)

  return {
    accountCode,
    asOfDate: endDate,
    openingBalance: opening,
    transactions: transactions.map(t => ({
      id: t.id,
      date: t.date,
      amount: t.debit || t.credit,
      type: t.debit ? 'DEBIT' : 'CREDIT'
    })),
    closingBalance: closing,
    variance,
    transactionCount: transactions.length,
    entries,
    isBalanced: variance < 0.01
  }
}
```

## Variance Explanation

```typescript
interface VarianceAnalysis {
  account: string
  period: { start: Date; end: Date }

  opening: number
  closing: number

  changes: VarianceChange[]
  // changes explain the difference between opening and closing
}

interface VarianceChange {
  cause: string
  amount: number
  transactions: string[]
  percentageOfTotal: number
}

async function analyzeVariance(
  accountCode: string,
  startDate: Date,
  endDate: Date
): Promise<VarianceAnalysis> {
  const reconstruction = await reconstructBalance(accountCode, startDate, endDate)

  // Identify major movements
  const entriesByImpact = reconstruction.entries
    .filter(e => Math.abs(e.debit - e.credit) > reconstruction.closingBalance * 0.1)
    .map(e => ({
      cause: e.description,
      amount: e.debit - e.credit,
      transactions: [e.documentRef],
      percentageOfTotal: Math.abs(e.debit - e.credit) / Math.abs(reconstruction.closingBalance) * 100
    }))

  return {
    account: accountCode,
    period: { start: startDate, end: endDate },
    opening: reconstruction.openingBalance,
    closing: reconstruction.closingBalance,
    changes: entriesByImpact
  }
}
```

## Account Reconciliation

```typescript
interface Reconciliation {
  account: string
  bookBalance: number
  bankStatementBalance: number

  adjustments: Adjustment[]
  difference: number  // should be 0 if reconciled
}

interface Adjustment {
  type: 'DEPOSIT_IN_TRANSIT' | 'OUTSTANDING_CHECK' | 'BANK_FEE' | 'ERROR'
  description: string
  amount: number
  documentation: string[]
  recommendedEntry: JournalEntry
}

async function reconcileWithBank(
  accountCode: string,
  bankStatementBalance: number,
  statementDate: Date
): Promise<Reconciliation> {
  const bookBalance = (await reconstructBalance(accountCode,
    subMonths(statementDate, 1),
    statementDate)).closingBalance

  const difference = bookBalance - bankStatementBalance

  return {
    account: accountCode,
    bookBalance,
    bankStatementBalance,
    adjustments: explainDifference(difference),
    difference
  }
}
```

## Natural Language Explanation

```typescript
function explainBalance(reconstruction: BalanceReconstruction): string {
  const lines = [
    `La cuenta ${reconstruction.accountCode} tenía un saldo de ${formatBs(reconstruction.openingBalance)}`,
    `Se registraron ${reconstruction.transactionCount} transacciones`,
    ``,
    `Movimientos significativos:`
  ]

  const topEntries = reconstruction.entries
    .sort((a, b) => Math.abs(b.debit - b.credit) - Math.abs(a.debit - a.credit))
    .slice(0, 5)

  for (const entry of topEntries) {
    lines.push(`- ${formatDate(entry.date)}: ${entry.description} (${entry.debit || entry.credit})`)
  }

  lines.push(``)
  lines.push(`Saldo final: ${formatBs(reconstruction.closingBalance)}`)

  return lines.join('\n')
}
```

## Query Patterns

```
User: "¿Por qué el banco tiene 50M menos que hace 2 meses?"
→ reconstructBalance('1.1.1.01', twoMonthsAgo, today)
→ identifyMajorChanges
→ explainVariance
```