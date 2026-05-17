---
name: accounting/economic-facts
description: >
  Traducción de eventos del mundo real a eventos contables.
  Trigger: Al procesar hechos económicos (venta, compra, daño, pago) y convertirlos a asientos.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Traducir cualquier evento económico del mundo real en un asiento contable válido. Entender el "por qué" de cada transacción.

## When to Load

- Procesando facturas o recibos
- Creando asientos por eventos específicos
- Analizando transacciones comerciales
- Validando que un evento se tradujo correctamente

## Event → Entry Pattern

```typescript
// src/accounting/services/EconomicEventTranslator.ts

export interface EconomicEvent {
  type: EventType
  description: string
  date: Date
  amount: number
  currency: string
  parties: Party[]         // quién recibió, quién entregó
  documents: Document[]
  metadata: Record<string, unknown>
}

export type EventType =
  | 'SALE'              // Venta de mercadería
  | 'PURCHASE'          // Compra de mercadería
  | 'PAYMENT'           // Pago a proveedor/cliente
  | 'COLLECTION'        // Cobro de cliente
  | 'EXPENSE'           // Gasto operativo
  | 'DEPRECIATION'      // Desgaste de activo
  | 'DAMAGE'            // Pérdida de mercadería
  | 'INSURANCE_CLAIM'   // Reclamo de seguro
  | 'LOAN'              // Préstamo recibido
  | 'INVESTMENT'        // Aporte de capital
  | 'WITHDRAWAL'        // Retirada de socio

export function translateToJournalEntry(event: EconomicEvent): JournalEntry {
  switch (event.type) {
    case 'SALE':
      return translateSale(event)
    case 'PURCHASE':
      return translatePurchase(event)
    // ... otros casos
  }
}
```

## Common Translations

### Venta de Mercadería
```
Débito:   1.1.1.01.001  Banco / Cuentas por Cobrar
Crédito:  4.1.01        Ingresos por Ventas
Crédito:  2.1.01.001   IVA Debito Fiscal (16%)
```

### Compra de Mercadería
```
Débito:   1.1.02        Inventario de Mercadería
Débito:  1.2.1.001     IVA Crédito Fiscal
Crédito: 1.1.1.01.001  Banco / Cuentas por Pagar
```

### Pago de Nomina
```
Débito:  6.1.01.001    Sueldos y Salarios
Débito:  6.1.02        Bonificaciones
Débito:  2.1.05.001    SSO Por Pagar
Débito:  2.1.05.002    PF Por Pagar
Débito:  2.1.05.003    INCES Por Pagar
Crédito: 1.1.1.01.001  Banco
```

## Abstracción Layers

| Layer | Description | Example |
|-------|-------------|---------|
| Evento Real | Lo que pasó en el mundo | "Se rompió un vidrio" |
| Evento Contable | Clasificación contable | "Gasto por reparaciones" |
| Asiento | Movimiento específico | D: Gasto Rep., C: Banco |
| Validación | Partida doble verificada | balance = true |

## Validation Questions

Para validar una traducción correcta:
1. ¿Las cuentas están en el plan?
2. ¿El monto de IVA está calculado correctamente?
3. ¿La naturaleza de las cuentas corresponde al tipo de movimiento?
4. ¿Débito = Crédito?