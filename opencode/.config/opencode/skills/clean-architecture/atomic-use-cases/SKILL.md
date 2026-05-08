---
name: clean-architecture/use-cases
description: >
  Clean Architecture use cases — application business rules (interactors).
  Trigger: Creating application services, business operations, use cases, interactors.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create Clean Architecture use cases: application services that orchestrate entities and repositories to fulfill business operations.

## When to Load

- User asks to create a use case, application service, business operation
- Context mentions "use case", "interactor", "application service", "command handler"
- Pattern: takes input, uses entities, returns output

## What Are Use Cases

- CreateUserUseCase: validates, creates User entity, saves via repository
- ProcessOrderUseCase: loads Order, validates, executes business logic, saves
- GetUserProfileUseCase: loads User, transforms to response format
- Any operation that represents a business action

### Use Case Flow

```
Input → Validate Input → Execute Business Logic → Access Entities → Access Repositories → Return Output
```

## Implementation Pattern

```typescript
// src/application/use-cases/{UseCaseName}/
// src/application/use-cases/CreateUserUseCase.ts

import { User } from '@/domain/entities/User'
import { UserRepository } from '@/domain/repositories/UserRepository'
import { Email } from '@/domain/value-objects/Email'

export interface CreateUserInput {
  email: string
  name: string
}

export interface CreateUserOutput {
  user: { id: string; email: string; name: string }
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(input: CreateUserInput): Promise<CreateUserOutput> {
    // 1. Validate input
    const email = Email.create(input.email)
    
    // 2. Check business rules (unique email)
    const existing = await this.userRepository.findByEmail(email)
    if (existing) throw new Error('Email already exists')
    
    // 3. Create entity
    const user = User.create({ email, name: input.name })
    
    // 4. Persist
    await this.userRepository.save(user)
    
    // 5. Return output (DTO, not entity)
    return { user: { id: user.id, email: user.email, name: user.name } }
  }
}
```

## Rules

1. **Single responsibility** — one use case = one business operation
2. **Input validation** — validate before using entities
3. **Repository interface** — use domain interfaces, not data source implementations
4. **DTO for output** — return data, not entities (decoupling)
5. **No framework code** — pure TypeScript, no Express/Prisma/TypeORM

## File Structure

```
src/application/
  use-cases/
    CreateUserUseCase/
      CreateUserUseCase.ts
      CreateUserUseCase.test.ts
    GetUserProfileUseCase/
      ...
  dto/
    CreateUserDTO.ts
    UserProfileDTO.ts
```

## Error Handling

```typescript
// Domain errors vs technical errors
export class DomainError extends Error {
  constructor(message: string, public code: string) {
    super(message)
  }
}

export class TechnicalError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message)
  }
}
```

Use cases should throw DomainError for business rule violations. Technical errors should be caught at the infrastructure layer.