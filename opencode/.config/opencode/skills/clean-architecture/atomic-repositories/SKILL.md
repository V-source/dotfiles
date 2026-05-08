---
name: clean-architecture/repositories
description: >
  Clean Architecture repositories — domain interface definitions (ports).
  Trigger: Creating repository interfaces, data access contracts, port definitions.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create Clean Architecture repository interfaces: the ports (contracts) that use cases depend on. Implementation is in the infrastructure layer.

## When to Load

- User asks to create a repository interface, data access contract, port
- Context mentions "repository interface", "port", "data access abstraction"
- Pattern: interface with methods, no implementation

## What Are Repository Interfaces

```typescript
// src/domain/repositories/UserRepository.ts

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: Email): Promise<User | null>
  save(user: User): Promise<void>
  delete(id: string): Promise<void>
}
```

### Key Characteristics

1. **Lives in domain layer** — `src/domain/repositories/`
2. **Returns entities** — use cases work with domain objects
3. **Interface only** — no implementation, no imports from infrastructure
4. **Method naming** — describe what you can do, not how

### NOT Repositories

- Database models (those are data sources)
- API client methods (those are data sources)
- Framework-specific implementations

## Implementation Pattern

```typescript
// src/domain/repositories/{EntityName}Repository.ts

import { EntityName } from '@/domain/entities/EntityName'
import { Email } from '@/domain/value-objects/Email'

export interface EntityNameRepository {
  findById(id: string): Promise<EntityName | null>
  findByEmail(email: Email): Promise<EntityName | null>
  findAll(filter?: FilterOptions): Promise<EntityName[]>
  save(entity: EntityName): Promise<void>
  update(entity: EntityName): Promise<void>
  delete(id: string): Promise<void>
}
```

## Rules

1. **No implementation** — just the interface
2. **Returns entities or value objects** — not raw data
3. **Async methods** — repositories deal with I/O
4. **Method naming** — `findById`, `save`, `delete` — clear intent
5. **Generic interfaces for collections** — consider generic base

## File Structure

```
src/domain/
  repositories/
    UserRepository.ts
    OrderRepository.ts
    ProductRepository.ts
  errors/
    RepositoryError.ts
```

## Implementing in Infrastructure

The implementation lives outside the domain:

```typescript
// src/infrastructure/repositories/PostgresUserRepository.ts

import { UserRepository } from '@/domain/repositories/UserRepository'
import { User } from '@/domain/entities/User'
import { prisma } from '@/infrastructure/database/prisma'

export class PostgresUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const prismaUser = await prisma.user.findUnique({ where: { id } })
    if (!prismaUser) return null
    return User.reconstitute(prismaUser)
  }

  async save(user: User): Promise<void> {
    const data = user.toPrimitives()
    await prisma.user.create({ data })
  }
}
```

This separation allows: swapping databases, testing with mocks, multiple implementations.