---
name: accounting/tax-normative
description: >
  Procesamiento de normativa fiscal venezolana (SENIAT, ISLR, IVA).
  Trigger: Al calcular IVA, ISLR, IGTF, actualizar alícuotas, procesar leyes nuevas.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Interpretar y aplicar la normativa fiscal venezolana. Mantener parámetros actualizados según Gacetas Oficiales y cambios legales.

## When to Load

- Calculando IVA de transactions
- Procesando retención de ISLR
- Calculando IGTF (impuesto sobre transacciones en moneda extranjera)
- Actualizando alícuotas o parámetros

## Venezuela Tax Structure

### IVA (Impuesto al Valor Agregado)

```typescript
interface IVARates {
  standard: 0.16,    // 16% - general
  reduced: 0.08,     // 8% - alimentación, salud, educación
  additional: 0.03,   // 3% - adicionales sobre la base imponible
  exempt: 0,          // 0% - exonerado
  zero: 0             // 0% - tasa cero
}

interface IVATransaction {
  base: number
  rate: IVARate
  tax: number           // calculated
  total: number        // base + tax
  type: 'DEBIT' | 'CREDIT'
  documentType: 'FACTURA' | 'NOTA_DEBITO' | 'NOTA_CREDITO'
  documentNumber: string
  date: Date
  seller: TaxPayer
  buyer: TaxPayer
}

function calculateIVA(transaction: IVATransaction): IVACalculation {
  const tax = transaction.base * transaction.rate
  return {
    base: transaction.base,
    rate: transaction.rate,
    tax,
    total: transaction.base + tax,
    isWithholding: transaction.type === 'CREDIT'
  }
}
```

### ISLR (Impuesto sobre la Renta)

```typescript
interface ISLRRates {
  personJuridica: 0.34,      // 34% personas jurídicas
  personNatural: [
    { upTo: 1000, rate: 0 },
    { from: 1000, to: 2000, rate: 0.15 },
    { from: 2000, to: 3000, rate: 0.21 },
    { from: 3000, rate: 0.34 }
  ]
}

function calculateISLR(personType: 'JURIDICA' | 'NATURAL', taxableIncome: number): ISLRCalculation {
  if (personType === 'JURIDICA') {
    return {
      taxableIncome,
      rate: 0.34,
      tax: taxableIncome * 0.34,
      effectiveRate: 0.34
    }
  }
  // Natural: apply brackets
  return applyTaxBrackets(taxableIncome, ISLRRates.personNatural)
}
```

### IGTF (Impuesto sobre Transacciones con Moneda Extranjera)

```typescript
interface IGTFRates {
  general: 0.03  // 3% sobre el monto en moneda extranjera
}

function calculateIGTF(monedaExtranjeraAmount: number, exchangeRate: number): IGTFCalculation {
  const baseImponible = monedaExtranjeraAmount * exchangeRate
  return {
    base: baseImponible,
    rate: 0.03,
    tax: baseImponible * 0.03,
    currency: 'USD', // typically USD
    exchangeRate
  }
}
```

## Normativa Update Protocol

```typescript
interface TaxParameter {
  name: string
  value: number
  effectiveDate: Date
  source: string  // Gaceta Oficial number
  description: string
}

async function updateTaxParameter(param: TaxParameter): Promise<void> {
  // 1. Validate it's a real change
  // 2. Store previous value for audit
  // 3. Apply new value
  // 4. Log change for traceability
}
```

## Common Tax Operations

### Retención IVA (Agent de Retención)

```typescript
interface IVARetention {
  operationDate: Date
  documentNumber: string
  seller: string
  base: number
  iva: number
  retentionPercent: number  // typically 75% or 100%
  withheldAmount: number
}
```

### Retención ISLR (Agents de Retención)

```typescript
interface ISLRRetention {
  beneficiaryType: 'JURIDICA' | 'NATURAL' | 'DOMICILIADO' | 'NO_DOMICILIADO'
  paymentAmount: number
  retentionRate: number     // depends on type
  withholding: number
}
```

## VEN-NIF Compliance

Estados financieros deben refletir:
- IVA debit fiscal (por cobrar al fisco)
- IVA crédito fiscal (por recuperar)
- ISLR por pagar
-Impuesto diferido (si aplica)