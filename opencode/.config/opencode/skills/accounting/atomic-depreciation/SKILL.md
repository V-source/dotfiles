---
name: accounting/depreciation
description: >
  Cálculo de depreciación de activos fijos (línea recta, acelerada).
  Trigger: Al calcular depreciación mensual, generar asientos de cierre de mes, gestionar vida útil de activos.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Calcular depreciación de activos fijos usando métodos estándar. Generar asientos mensuales de depreciación.

## When to Load

- Calculando depreciación mensual
- Creando schedule de depreciación
- Generando asientos de cierre de mes para activos
- Evaluando reemplazo de activos

## Depreciation Methods

### 1. Línea Recta (Straight-Line)

```typescript
function straightLine(
  cost: number,
  residualValue: number,
  usefulLifeYears: number
): DepreciationSchedule {
  const depreciableAmount = cost - residualValue
  const annualDepreciation = depreciableAmount / usefulLifeYears
  const monthlyDepreciation = annualDepreciation / 12

  return {
    method: 'STRAIGHT_LINE',
    annual: annualDepreciation,
    monthly: monthlyDepreciation,
    totalOverLife: depreciableAmount
  }
}
```

### 2. Suma de Dígitos (Sum-of-Years Digits - SYD)

```typescript
function sumOfYearsDigits(
  cost: number,
  residualValue: number,
  usefulLifeYears: number
): DepreciationSchedule {
  const sumOfYears = (usefulLifeYears * (usefulLifeYears + 1)) / 2
  const depreciableAmount = cost - residualValue

  return {
    method: 'SYD',
    rates: Array.from({ length: usefulLifeYears }, (_, i) => {
      const year = i + 1
      const fraction = (usefulLifeYears - year + 1) / sumOfYears
      return { year, fraction, amount: depreciableAmount * fraction }
    })
  }
}
```

### 3. Unidades Producidas (Units of Production)

```typescript
function unitsOfProduction(
  cost: number,
  residualValue: number,
  totalExpectedUnits: number
): (unitsProduced: number) => DepreciationEntry {
  const depreciableAmount = cost - residualValue
  const perUnitRate = depreciableAmount / totalExpectedUnits

  return (unitsProduced: number) => ({
    method: 'UNITS_OF_PRODUCTION',
    unitsThisPeriod: unitsProduced,
    depreciationThisPeriod: perUnitRate * unitsProduced,
    accumulatedDepreciation: perUnitRate * unitsProduced // running total
  })
}
```

## Asset Record Structure

```typescript
interface FixedAsset {
  id: string
  code: string
  description: string
  acquisitionDate: Date
  acquisitionCost: number
  residualValue: number
  usefulLifeYears: number
  method: 'STRAIGHT_LINE' | 'SYD' | 'UNITS_OF_PRODUCTION'
  category: AssetCategory
  location: string
  responsible: string
  status: 'ACTIVE' | 'DISPOSED' | 'IN_REPAIR'
}

type AssetCategory =
  | 'BUILDINGS'
  | 'VEHICLES'
  | 'MACHINERY'
  | 'FURNITURE'
  | 'EQUIPMENT'
  | 'COMPUTERS'
  | 'LAND' // no depreciation
```

## Monthly Journal Entry

```typescript
function generateDepreciationEntry(
  asset: FixedAsset,
  monthlyDepreciation: number,
  month: Date
): JournalEntry {
  const accountCode = getDepreciationExpenseAccount(asset.category)
  return {
    id: generateId(),
    date: lastDayOfMonth(month),
    description: `Depreciación ${formatMonth(month)} - ${asset.description}`,
    lines: [
      { accountCode, debit: monthlyDepreciation, credit: 0 },
      { accountCode: getAccumulatedDepreciationAccount(asset.category), debit: 0, credit: monthlyDepreciation }
    ]
  }
}
```

## Venezuela-Specific Rules

- Vida útil según VEN-NIF para cada categoría
- Activos土地no se deprecian
- La depreciaciónAccelerada está permitida para ciertos activos
- Al final de vida útil, valor residual = valor en libros