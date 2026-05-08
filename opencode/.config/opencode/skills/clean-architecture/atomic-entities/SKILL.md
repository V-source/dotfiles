---
name: clean-architecture/entities
description: >
  Clean Architecture entities — domain objects with business logic.
  Trigger: Creating domain models, business objects, value objects, entity classes.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create Clean Architecture entities: domain objects that encapsulate business rules and state. They have NO external dependencies.

## When to Load

- User asks to create a domain model, entity, value object, business object
- Context mentions "entity", "domain model", "business object", "value object"
- No framework imports (no Prisma, no TypeORM, no DB drivers)

## What Are Entities

- User, Order, Product, Account (domain objects)
- Money, Email, Address (value objects)
- Any object with business rules that govern its state changes

### Entity Characteristics

1. **No external dependencies** — pure TypeScript, no framework decorators
2. **Business rules encapsulated** — validation, state transitions, invariants
3. **Identity** — entities have identity (ID), value objects don't
4. **Methods** — behavior lives here, not in services

### NOT Entities

- API response types (those are DTOs, not domain)
- Database models (that's data source, not entity)
- React components (that's presentation)

## Implementation Pattern

```typescript
// src/domain/entities/{EntityName}.ts

export interface {EntityName}Props {
  id: string
  // ... other props
}

export class {EntityName} {
  private constructor(private props: {EntityName}Props) {}

  static create(props: {EntityName}Props): {EntityName} {
    // Business validation
    if (!props.id) throw new Error('ID required')
    return new {EntityName}(props)
  }

  get id(): string { return this.props.id }

  // Business methods
  public execute(): void {
    if (this.isInvalid()) throw new Error('Invalid state')
    // business logic
  }

  private isInvalid(): boolean {
    // invariants
    return false
  }
}
```

## Rules

1. **Pure TypeScript** — no imports from frameworks or external libs
2. **Business rules in methods** — validate input, enforce invariants
3. **Factory methods** — use `create()` or `reconstitute()` for construction
4. **No getters that expose internals** — behavior through methods, not data exposure
5. **Value objects** — if it has no identity, make it a value object instead

## File Structure

```
src/domain/
  entities/
    User/
      User.ts
      User.test.ts
    Order/
      Order.ts
      Order.test.ts
  value-objects/
    Money/
      Money.ts
    Email/
      Email.ts
```

## Domain Events (Optional)

Entities can emit domain events for state changes:

```typescript
export type DomainEvent = {
  eventType: string
  occurredAt: Date
  payload: unknown
}

export interface EntityWithEvents {
  pullEvents(): DomainEvent[]
}
```