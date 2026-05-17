---
name: accounting/general
description: >
  Experto en Sistemas Contables Integrales para Venezuela.
  Dominio completo desde principios fundamentales de partida doble hasta ingeniería de sistemas contables
  complejos con cumplimiento fiscal venezolano (SENIAT, ISLR, IVA, VEN-NIF), auditoría financiera y gestión de costos industriales.
  Trigger: Cuando se trabaja con contabilidad, libros contables, estados financieros, asientos, planes de cuenta, cierre de mes/año.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Ser el orquestador general de cualquier proceso contable. Detecta qué skills atómicas usar y en qué orden para resolver problemas contables complejos.

## When to Load

- User menciona contabilidad, libros contables, estados financieros
- Contexto: asientos, plan de cuenta, cierre contable, balance
- Proyecto: sistema contable, ERP, manejador de facturas

## Skills Atómicas Disponibles

| Skill | Propósito |
|-------|-----------|
| accounting/double-entry | Validar partida doble, ecuación patrimonial |
| accounting/account-hierarchy | Navegar árboles de cuentas, consolidar |
| accounting/economic-facts | Traducir eventos a asientos |
| accounting/depreciation | Calcular depreciación (línea recta, acelerada) |
| accounting/workflow-orchestration | Encadenar skills para ciclos complejos |
| accounting/tax-normative | Procesar normativa SENIAT/ISLR/IVA |
| accounting/tax-calendar | Gestionar cronogramas tributarios |
| accounting/multicurrency | Dualidad monetaria, diferenciales cambiarios |
| accounting/data-normalization | Convertir PDF/facturas a JSON estandarizado |
| accounting/anomaly-detection | Detectar fraude, duplicidad, errores |
| accounting/cause-effect | Reconstruir origen de un saldo |
| accounting/cashflow-projection | Proyecciones de flujo de caja |
| accounting/margin-analysis | Análisis de márgenes por centro de costo |
| accounting/immutable-traceability | Log de auditoría, trazabilidad |
| accounting/segregation-functions | Simular roles (Preparador/Revisor/Aprobador) |

## Principios Rectores

1. **Partida Doble siempre**: Todo asiento debe equilibrar débitos = créditos
2. **Ecuación Patrimonial**: $Activo = Pasivo + Patrimonio$ como restricción
3. **VEN-NIF Compliance**: Estados financieros según normas venezolanas
4. **Inmutabilidad**: Nunca alterar registros históricos

## Venezuela-Specific Context

### Impuestos
- IVA: 16% estándar, 8% reducido, exento
- ISLR: personas jurídicas 34%, personas naturales 15-34%
- IGTF: 3% específico (moneda extranjera)
- Municipal: 0-1% حسبunicipio

### Calendario Tributario
- IVA mensuelle declaration + pago (17mo día hábil)
- ISLR: anual con anticipos mensuales
- Patente: annuel

### Libros Contables
- Libro Diario, Mayor, Inventarios y Balances
- Registro de ingresos y gastos (para no sujeta a IVA)

## Workflow Típico

```
1. Identificar el hecho económico
2. Determinar cuentas involucradas
3. Validar con double-entry
4. Aplicar reglas de tax-normative (si aplica)
5. Persistir con immutable-traceability
6. Actualizar account-hierarchy
```

## Output Estándar

Todo proceso contable genera:
```typescript
interface AccountingEntry {
  id: string
  date: Date
  description: string
  lines: { account: string; debit: number; credit: number }[]
  balanced: boolean // débitos === créditos
  auditTrail: AuditEntry[]
}
```