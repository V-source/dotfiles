---
name: accounting/margin-analysis
description: >
  Análisis de márgenes y rentabilidad por centro de costo/unidad de negocio.
  Trigger: Al calcular utilidad por producto, asignar costos indirectos, analizar rentabilidad.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Calcular márgenes de rentabilidad por producto, línea, cliente o unidad de negocio. Asignar costos indirectos a centros de costo específicos.

## When to Load

- Analizando rentabilidad de productos
- Calculando margen por cliente
- Asignando costos indirectos a centros de costo
- Preparando reportes de rentabilidad

## Core Concepts

```typescript
interface CostCenter {
  id: string
  name: string
  type: 'PRODUCTION' | 'ADMIN' | 'SALES' | 'SUPPORT'
  parentId?: string
}

interface MarginAnalysis {
  entity: string              // producto, cliente, línea
  entityType: 'PRODUCT' | 'CUSTOMER' | 'LINE' | 'DIVISION'
  period: { start: Date; end: Date }

  revenue: number
  directCosts: number
  contributionMargin: number
  marginPercentage: number

  allocatedIndirectCosts: number
  netMargin: number

  unitsSold?: number
  averageMarginPerUnit?: number
}
```

## Margin Calculation Layers

### 1. Contribution Margin (Margen de Contribución)

```typescript
interface ContributionMargin {
  revenue: number
  variableCosts: CostBreakdown[]
  contributionMargin: number
  contributionMarginPercent: number
}

function calculateContributionMargin(
  revenue: number,
  variableCosts: { name: string; amount: number }[]
): ContributionMargin {
  const totalVariable = variableCosts.reduce((sum, c) => sum + c.amount, 0)

  return {
    revenue,
    variableCosts,
    contributionMargin: revenue - totalVariable,
    contributionMarginPercent: (revenue - totalVariable) / revenue * 100
  }
}
```

### 2. Product Margin

```typescript
interface ProductMargin {
  productCode: string
  productName: string

  unitsSold: number
  unitPrice: number
  unitCost: number

  revenue: number
  totalCost: number
  grossMargin: number
  marginPercent: number

  contributionMargin: number
}

function calculateProductMargin(
  product: Product,
  salesData: SalesRecord[],
  costData: CostRecord[]
): ProductMargin {
  const totalRevenue = salesData.reduce((sum, s) => sum + s.amount, 0)
  const totalCost = costData.reduce((sum, c) => sum + c.amount, 0)
  const units = salesData.reduce((sum, s) => sum + s.quantity, 0)

  return {
    productCode: product.code,
    productName: product.name,
    unitsSold: units,
    unitPrice: totalRevenue / units,
    unitCost: totalCost / units,
    revenue: totalRevenue,
    totalCost: totalCost,
    grossMargin: totalRevenue - totalCost,
    marginPercent: (totalRevenue - totalCost) / totalRevenue * 100,
    contributionMargin: totalRevenue - getVariableCosts(product)
  }
}
```

### 3. Customer Margin

```typescript
interface CustomerMargin {
  customerId: string
  customerName: string

  totalRevenue: number
  directCosts: number
  contributionMargin: number

  allocatedCosts: AllocatedCost[]
  netMargin: number

  customersLifetimeValue?: number
}

function calculateCustomerMargin(
  customerId: string,
  invoices: Invoice[],
  costAllocations: CostAllocation[]
): CustomerMargin {
  const revenue = invoices.reduce((sum, i) => sum + i.total, 0)

  const directCosts = calculateDirectCosts(customerId)
  const contributionMargin = revenue - directCosts

  const allocated = allocateIndirectCosts(customerId, costAllocations)

  return {
    customerId,
    customerName: getCustomerName(customerId),
    totalRevenue: revenue,
    directCosts,
    contributionMargin,
    allocatedCosts: allocated,
    netMargin: contributionMargin - allocated.total
  }
}
```

## Indirect Cost Allocation

```typescript
interface CostAllocationMethod {
  name: string
  description: string
  calculateAllocation: (costCenter: CostCenter, totalCosts: number) => number
}

// Common methods
const ALLOCATION_METHODS = {
  DIRECT_LABOR_HOURS: {
    name: 'Hours de mano de obra directa',
    calculate: (center, total) => (center.laborHours / totalLaborHours) * total
  },
  REVENUE_BASED: {
    name: 'Basado en revenue',
    calculate: (center, total) => (center.revenue / totalRevenue) * total
  },
  SQUARE_FOOTAGE: {
    name: 'Metros cuadrados',
    calculate: (center, total) => (center.sqMeters / totalSqMeters) * total
  },
  MACHINE_HOURS: {
    name: 'Hours máquina',
    calculate: (center, total) => (center.machineHours / totalMachineHours) * total
  }
}

function allocateIndirectCosts(
  costCenters: CostCenter[],
  totalIndirectCosts: number,
  method: CostAllocationMethod
): Map<string, number> {
  const totalDriver = costCenters.reduce((sum, c) => sum + c.driverValue, 0)

  return new Map(
    costCenters.map(center => [
      center.id,
      (center.driverValue / totalDriver) * totalIndirectCosts
    ])
  )
}
```

## Profitability Report

```typescript
interface ProfitabilityReport {
  period: { start: Date; end: Date }
  currency: Currency

  byProduct: ProductMargin[]
  byCustomer: CustomerMargin[]
  byDivision: DivisionMargin[]

  summary: {
    totalRevenue: number
    totalCosts: number
    totalMargin: number
    marginPercent: number
  }

  topPerformers: { entity: string; margin: number }[]
  underPerformers: { entity: string; margin: number }[]
}
```

## Decision Support

```typescript
interface PricingRecommendation {
  product: string
  currentPrice: number
  currentMargin: number

  scenarios: {
    priceChange: number
    newMargin: number
    volumeImpact: number  // estimated volume change %
    netEffect: number    // positive or negative effect
  }[]

  recommendation: 'RAISE_PRICE' | 'REDUCE_COST' | 'MAINTAIN' | 'DISCONTINUE'
  confidence: number
}
```