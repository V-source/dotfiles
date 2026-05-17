---
name: accounting/double-entry
description: >
  Validación de partida doble y ecuación patrimonial.
  Trigger: Al crear/modificar asientos contables, validar equilibrio, verificar débito = crédito.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Validar que todo asiento contable cumpla con el principio de partida doble: débitos = créditos. Mantener la ecuación patrimonial como restricción inviolable.

## When to Load

- Creando asiento contable
- Validando equilibrio de libros
- Detectando errores de digitación en débitos/créditos
- Verificando que $Activo = Pasivo + Patrimonio$

## Core Rule

```
SUM(débitos) === SUM(créditos)
```

Si no se cumple → error. No hay excepciones.

## Implementation Pattern

```typescript
// src/accounting/validators/double-entry.ts

export interface JournalLine {
  accountCode: string
  description: string
  debit: number
  credit: number
}

export interface JournalEntry {
  id: string
  date: Date
  lines: JournalLine[]
  isBalanced: boolean // computed
  variance: number // debit - credit
}

export function validateDoubleEntry(entry: JournalEntry): ValidationResult {
  const totalDebit = sum(entry.lines.map(l => l.debit))
  const totalCredit = sum(entry.lines.map(l => l.credit))
  const variance = totalDebit - totalCredit

  return {
    isValid: variance === 0,
    totalDebit,
    totalCredit,
    variance,
    error: variance !== 0 ? `Débitos ${totalDebit} != Créditos ${totalCredit}` : null
  }
}
```

## Ecuación Patrimonial

```typescript
// src/accounting/validators/equation.ts

export interface BalanceSheet {
  assets: number      // Activos
  liabilities: number // Pasivos
  equity: number      // Patrimonio
}

export function validateEquation(balance: BalanceSheet): boolean {
  return balance.assets === (balance.liabilities + balance.equity)
}
```

## Validation Types

| Type | Description |
|------|-------------|
| Entry-level | Cada línea individual balanceada |
| Transaction-level | Suma de débitos = suma de créditos |
| Period-level | Balance de comprobación cierra parejo |
| Year-level | Estados financieros respetan ecuación |

## Error Handling

```typescript
export class DoubleEntryViolation extends Error {
  constructor(
    message: string,
    public debitTotal: number,
    public creditTotal: number,
    public variance: number
  ) {
    super(message)
  }
}
```

## Common Rules

1. **No partida sin efecto**: Si todos los campos son 0 → error
2. **No montos negativos**: Débitos y créditos siempre >= 0
3. **Redondeo**: 2 decimales máximo, manejar diferencias de округления
4. **Cierre de período**: El último asiento debe balancear exactamente