---
name: accounting/immutable-traceability
description: >
  Trazabilidad inmutable. Log de auditoría para cada decisión contable.
  Trigger: Al necesitar audit trail, verificar quién hizo qué, mantener inmutabilidad de registros.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Mantener un log inmutable de cada decisión contable. Asegurar que ninguna skill atómica pueda alterar registros históricos sin dejar huella.

## When to Load

- Guardando cualquier transacción contable
- Modificando saldos o configuraciones
- Realizando auditorías
- Generando reportes de compliance

## Core Principle

**"Lo que se grabó, stay recorded."**

La única forma de "corregir" es creando una nueva entrada que reverça o ajusta la anterior. Nunca se borra ni se modifica lo existente.

## Audit Entry Structure

```typescript
interface AuditEntry {
  id: string                  // UUID
  timestamp: Date            // cuándo ocurrió

  // Who
  actor: string               // user ID, system, AI agent
  actorType: 'USER' | 'SYSTEM' | 'AI_AGENT'

  // What
  action: AuditAction
  entityType: 'JOURNAL_ENTRY' | 'ACCOUNT' | 'CONFIG' | 'USER' | 'REPORT'
  entityId: string            // ID del entity afectado

  // Change details
  previousState: unknown | null  // null for creates
  newState: unknown | null       // null for deletes

  // Context
  reason: string              // por qué se hizo este cambio
  source: string              // 'manual', 'sdd-propose', 'api', 'import'
  correlationId: string       // para agrupar cambios relacionados (ej: un SDD cycle)

  // Verification
  signature?: string          // hash para verificar integridad
  approvedBy?: string         // si requiere aprobación
}

type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'REVERSE'
  | 'CLOSE_PERIOD'
  | 'REOPEN_PERIOD'
```

## Immutability Pattern

```typescript
// WRONG - mutable approach
entry.amount = 1000  // ❌ ALTERÓ el registro

// RIGHT - append-only approach
function correctEntry(entry: JournalEntry, correction: CorrectEntry): AuditEntry {
  // 1. Create reversal of original
  const reversal = createReversalEntry(entry)

  // 2. Create new correct entry
  const newEntry = createCorrectEntry(correction)

  // 3. Log both with audit trail
  return logAuditEntry({
    action: 'REVERSE',
    entityType: 'JOURNAL_ENTRY',
    entityId: entry.id,
    previousState: entry,
    newState: reversal,
    reason: 'Corrección identificada'
  })
}
```

## Audit Log Implementation

```typescript
class ImmutableAuditLog {
  private entries: AuditEntry[] = []
  private chainHash: string = ''  // hash of previous entry for chain integrity

  async append(entry: Omit<AuditEntry, 'id' | 'signature'>): Promise<AuditEntry> {
    // Validate no historical data is being modified
    this.validateImmutability(entry)

    // Create entry with signature
    const auditEntry: AuditEntry = {
      ...entry,
      id: generateUUID(),
      signature: this.computeSignature(entry)
    }

    // Append to chain
    this.entries.push(auditEntry)
    this.chainHash = auditEntry.signature

    return auditEntry
  }

  async getHistory(entityType: string, entityId: string): Promise<AuditEntry[]> {
    return this.entries.filter(
      e => e.entityType === entityType && e.entityId === entityId
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  async verifyIntegrity(): Promise<boolean> {
    for (let i = 0; i < this.entries.length; i++) {
      const expectedSignature = this.computeSignature(this.entries[i])
      if (this.entries[i].signature !== expectedSignature) {
        return false  // Tampering detected
      }
    }
    return true
  }
}
```

## Period Closing (Sealing)

```typescript
interface PeriodSeal {
  periodId: string           // e.g., "2024-01"
  closedAt: Date
  closedBy: string
  snapshotHash: string       // hash of all entries at close time

  // Once sealed, no entries can be modified
  entriesSealed: number
  lastEntryTimestamp: Date
}

async function closePeriod(periodId: string, userId: string): Promise<PeriodSeal> {
  // 1. Verify all entries balance
  await validateAllEntries(periodId)

  // 2. Create seal
  const seal: PeriodSeal = {
    periodId,
    closedAt: new Date(),
    closedBy: userId,
    snapshotHash: computeSnapshotHash(periodId),
    entriesSealed: countEntries(periodId),
    lastEntryTimestamp: getLastEntryTimestamp(periodId)
  }

  // 3. Log the sealing action
  await auditLog.append({
    action: 'CLOSE_PERIOD',
    entityType: 'PERIOD',
    entityId: periodId,
    previousState: null,
    newState: seal,
    reason: 'Cierre de período contable',
    actor: userId
  })

  // 4. Mark period as sealed (no further modifications allowed)

  return seal
}
```

## Query Patterns

```typescript
// ¿Quién modificó esta cuenta en enero?
await auditLog.getHistory('ACCOUNT', accountId)
  .filter(e => e.timestamp >= '2024-01-01' && e.timestamp <= '2024-01-31')

// ¿Qué cambios hizo el agente AI en esta sesión?
await auditLog.getHistoryByActor('AI_AGENT', sessionId)

// ¿Qué SDD ciclo generó estos cambios?
await auditLog.getHistoryByCorrelationId(correlationId)
```

## Compliance Requirements (VEN-NIF)

- Todos los libros contables deben tener auditor trail
- No se puede modificar registros después de cierre de período
- Los cambios deben documentar razón y responsable
- Hash de verificación para detectar alteraciones