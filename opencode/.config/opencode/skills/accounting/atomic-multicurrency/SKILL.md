---
name: accounting/multicurrency
description: >
  Gestión de dualidad monetaria y reexpresión cambiaria (Venezuela).
  Trigger: Al procesar transacciones en USD/EUR/otra moneda, calcular diferenciales cambiarios, actualizar tipo de cambio.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Gestionar transacciones en múltiples monedas. Calcular diferenciales cambiarios, mantener saldos en moneda nacional y extranjera, aplicar ajustes por inflación cuando sea requerido.

## When to Load

- Procesando transactions en moneda extranjera
- Calculando differential cambiario
- Actualizando tipos de cambio
- Preparando estados financieros en dual currency
- Aplicando reexpresión monetaria

## Core Concepts

### BCV Official Rate

```typescript
interface ExchangeRate {
  currency: 'USD' | 'EUR' | 'COL' | 'OTHER'
  officialRate: number    // Bs por unidad de moneda
  parallelRate?: number    // si aplica
  effectiveDate: Date
  source: 'BCV' | 'BANCO' | 'PARALLEL'
}

// Actualizar periódicamente (mínimo diariamente)
async function getCurrentExchangeRate(currency: Currency): Promise<ExchangeRate>
```

### Transaction Structure

```typescript
interface MultiCurrencyTransaction {
  id: string
  date: Date
  description: string
  lines: MultiCurrencyLine[]
}

interface MultiCurrencyLine {
  accountCode: string
  amount: number           // siempre en moneda de la cuenta
  currency: Currency
  exchangeRate: number    // rate used for this transaction
  amountInLocalCurrency: number  // amount * exchangeRate
  exchangeDifference: number      // si hay diferencia vs tasa oficial
}
```

## Exchange Difference Calculation

```typescript
interface ExchangeDifference {
  transactionId: string
  date: Date
  currency: Currency
  transactionRate: number    // rate usado en la transacción
  officialRate: number      // rate oficial a la fecha
  amountInFC: number         // monto en moneda extranjera
  difference: number        // (transactionRate - officialRate) * amountInFC
  type: 'FAVORABLE' | 'UNFAVORABLE'
  journalEntry: JournalEntry // asiento para registrar
}

function calculateExchangeDifference(
  transaction: MultiCurrencyTransaction,
  officialRate: number
): ExchangeDifference {
  const line = transaction.lines[0]
  const difference = (line.exchangeRate - officialRate) * line.amount

  return {
    transactionId: transaction.id,
    date: transaction.date,
    currency: line.currency,
    transactionRate: line.exchangeRate,
    officialRate,
    amountInFC: line.amount,
    difference,
    type: difference >= 0 ? 'FAVORABLE' : 'UNFAVORABLE', // para la empresa
    journalEntry: difference > 0
      ? { debit: 'GAIN_ON_EXCHANGE', credit: 'CASH' }  // favorable
      : { debit: 'LOSS_ON_EXCHANGE', credit: 'CASH' }  // unfavorable
  }
}
```

## Currency Account Structure

```typescript
interface CurrencyAccount {
  accountCode: string
  currency: Currency
  balanceInFC: number      // saldo en moneda extranjera
  balanceInLocalCurrency: number // saldo en Bs al último rate
  lastExchangeRate: number
  lastUpdated: Date
}

function updateCurrencyAccountBalance(
  account: CurrencyAccount,
  newAmount: number,
  newRate: number
): CurrencyAccount {
  return {
    ...account,
    balanceInFC: newAmount,
    balanceInLocalCurrency: newAmount * newRate,
    lastExchangeRate: newRate,
    lastUpdated: new Date()
  }
}
```

## Closing Rate Method (VEN-NIF)

```typescript
interface FinancialStatement {
  assets: Map<Currency, number>
  liabilities: Map<Currency, number>
  inLocalCurrency: number  // todos convertidos a Bs
}

// Al cerrar período, convertir todo al tipo de cambio de cierre
function convertToClosingRate(
  statement: FinancialStatement,
  closingRate: number
): ConvertedStatement {
  return {
    ...statement,
    inLocalCurrency: statement.inLocalCurrency.map(item => ({
      ...item,
      amountInBs: item.amountInFC * closingRate
    }))
  }
}
```

## Common Journal Entries

```typescript
// Al recibir pago en moneda extranjera
const paymentInFC = {
  debit: 'CASH_USD',           // cuenta en USD
  credit: 'ACCOUNTS_RECEIVABLE' // o revenue
}

// Diferencia cambiaria al cierre
const monthEndAdjustment = {
  favorable: {
    debit: 'CASH_USD',
    credit: 'EXCHANGE_GAIN'
  },
  unfavorable: {
    debit: 'EXCHANGE_LOSS',
    credit: 'CASH_USD'
  }
}
```