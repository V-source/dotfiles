---
name: clean-architecture/data-sources
description: >
  Clean Architecture data sources — external data access implementations (adapters).
  Trigger: Creating database clients, API clients, external service connectors, infrastructure.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create Clean Architecture data sources: implementations of repository interfaces that connect to external systems (databases, APIs, third-party services).

## When to Load

- User asks to create a repository implementation, database client, API connector
- Context mentions "data source", "adapter", "infrastructure", "database", "API client"
- Pattern: implements repository interface, connects to external system

## What Are Data Sources

- PostgresUserRepository: implements UserRepository with Prisma
- RestApiProductDataSource: implements ProductRepository with HTTP
- StripePaymentAdapter: implements PaymentRepository with Stripe SDK
- FileStorageAdapter: implements StorageRepository with filesystem

### Data Source vs Repository Interface

```
Domain Layer (pure):
  UserRepository (interface) ← depends on this

Application Layer:
  CreateUserUseCase (uses UserRepository)

Infrastructure Layer:
  PostgresUserRepository (implements UserRepository) ← implements this
  RestApiUserRepository (implements UserRepository) ← alternative implementation
```

## Implementation Pattern

```typescript
// src/infrastructure/repositories/Postgres{EntityName}Repository.ts

import { EntityNameRepository } from '@/domain/repositories/EntityNameRepository'
import { EntityName } from '@/domain/entities/EntityName'
import { prisma } from '@/infrastructure/database/prisma'

export class Postgres{EntityName}Repository implements EntityNameRepository {
  async findById(id: string): Promise<EntityName | null> {
    const record = await this.prisma.{tableName}.findUnique({ where: { id } })
    if (!record) return null
    return EntityName.reconstitute(record)
  }

  async save(entity: EntityName): Promise<void> {
    const data = entity.toPrimitives()
    await this.prisma.{tableName}.create({ data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.{tableName}.delete({ where: { id } })
  }
}
```

## Rules

1. **Implements domain interface** — satisfies the contract
2. **Knows about external system** — Prisma, Axios, Stripe SDK
3. **Maps to/from entities** — converts between external format and domain
4. **Handles connection** — manages connection lifecycle
5. **Error translation** — converts external errors to domain errors

## File Structure

```
src/infrastructure/
  repositories/
    postgres/
      PostgresUserRepository.ts
      PostgresOrderRepository.ts
    api/
      RestApiProductRepository.ts
  database/
    prisma.ts
    migrations/
  external/
    stripe/
      StripePaymentAdapter.ts
    sendgrid/
      SendGridEmailAdapter.ts
```

## Data Mapping

```typescript
// External → Domain
private toDomain(record: PrismaUserRecord): User {
  return User.reconstitute({
    id: record.id,
    email: record.email,
    name: record.name,
    createdAt: record.createdAt
  })
}

// Domain → External
private toPrimitives(entity: User): PrismaUserCreateInput {
  return {
    id: entity.id,
    email: entity.email,
    name: entity.name
  }
}
```

## External API Adapters

```typescript
// src/infrastructure/external/RestApiProductDataSource.ts

import { ProductRepository } from '@/domain/repositories/ProductRepository'
import { Product } from '@/domain/entities/Product'
import { httpClient } from '../http/httpClient'

export class RestApiProductRepository implements ProductRepository {
  constructor(private baseUrl: string) {}

  async findAll(): Promise<Product[]> {
    const response = await httpClient.get(`${this.baseUrl}/products`)
    return response.data.map(this.toDomain.bind(this))
  }

  private toDomain(apiProduct: ApiProduct): Product {
    return Product.reconstitute({ ...apiProduct })
  }
}
```