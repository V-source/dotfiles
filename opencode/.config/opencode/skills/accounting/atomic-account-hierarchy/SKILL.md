---
name: accounting/account-hierarchy
description: >
  Navegación y construcción de árboles de cuentas contables.
  Trigger: Al consolidar cuentas, construir plan de cuentas, trabajar con cuentas auxiliares vs. de resumen.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Construir, navegar y consolidar árboles de cuentas contables. Entender cómo cuentas auxiliares (nivel más bajo) consolidan en cuentas de orden superior.

## When to Load

- Trabajando con plan de cuentas
- Consolidando balances de prueba
- Navegando entre cuenta detalle y cuenta resumen
- Construyendo estados financieros

## Account Hierarchy Structure

```
1.0    ACTIVO (Clase)
  1.1   Activo Corriente (Grupo)
    1.1.1   Efectivo y Equivalentes (Cuenta)
      1.1.1.01  Banco Nacional - Cuenta Corriente (Subcuenta)
        1.1.1.01.001  Moneda Local (Auxiliar)
        1.1.1.01.002  Moneda Extranjera (Auxiliar)
```

## Implementation Pattern

```typescript
// src/accounting/domain/AccountTree.ts

export interface AccountNode {
  code: string           // "1.1.1.01.001"
  name: string           // "Banco Nacional - Cuenta Corriente"
  level: number          // 1-6
  type: AccountType      // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  isGroup: boolean       // true si tiene subcuentas
  parentCode: string | null
  balance: number        // sum of children if group, else own balance
}

export class AccountTree {
  private accounts: Map<string, AccountNode>

  getChildren(parentCode: string): AccountNode[] {
    return [...this.accounts.values()].filter(a => a.parentCode === parentCode)
  }

  getRoot(): AccountNode[] {
    return [...this.accounts.values()].filter(a => a.parentCode === null)
  }

  getAncestors(code: string): AccountNode[] {
    const ancestors: AccountNode[] = []
    let current = this.accounts.get(code)
    while (current?.parentCode) {
      const parent = this.accounts.get(current.parentCode)
      if (parent) ancestors.unshift(parent)
      current = parent
    }
    return ancestors
  }

  getBalanceAtLevel(code: string, recursive = true): number {
    const node = this.accounts.get(code)
    if (!node) return 0

    if (!recursive || !node.isGroup) return node.balance

    return this.getChildren(code)
      .reduce((sum, child) => sum + this.getBalanceAtLevel(child.code, true), 0)
  }
}
```

## Account Types

| Code Prefix | Type | Normal Balance |
|-------------|------|----------------|
| 1xxx | Activo | Débito |
| 2xxx | Pasivo | Crédito |
| 3xxx | Patrimonio | Crédito |
| 4xxx | Ingreso | Crédito |
| 5xxx | Costo/Gasto | Débito |
| 6xxx | Gasto | Débito |
| 7xxx | Otro Ingreso | Crédito |
| 8xxx | Otro Gasto | Débito |

## Consolidation Rules

1. **Grupos no tienen balance propio** — solo la suma de hijos
2. **Cuentas de detalle** — último nivel, tienen balance real
3. **Roll-up** — al consolidar, sube por el árbol sumando

## Venezuela Plan de Cuentas (VEN-NIF)

```
1 - Activo
2 - Pasivo
3 - Patrimonio
4 - Ingresos
5 - Costos
6 - Gastos
7 - Otros Ingresos
8 - Otros Gastos
9 - Cuentas de Orden
```