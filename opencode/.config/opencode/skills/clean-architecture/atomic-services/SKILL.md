---
name: clean-architecture/services
description: >
  Clean Architecture services — orchestrate use cases and manage dependencies.
  Trigger: Creating service coordinators, dependency injection setup, composition root, factories.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Create Clean Architecture services: the wiring layer that orchestrates use cases, manages dependencies, and provides the composition root for the application.

## When to Load

- User asks to create a service container, DI setup, composition root, factory
- Context mentions "service", "dependency injection", "container", "wiring"
- Pattern: creates use cases with their dependencies

## What Are Services

### 1. Service Classes (Use Case Orchestration)

```typescript
// src/application/services/UserService.ts

export class UserService {
  constructor(
    private createUserUseCase: CreateUserUseCase,
    private getUserProfileUseCase: GetUserProfileUseCase,
    private updateUserUseCase: UpdateUserUseCase
  ) {}

  async createUser(input: CreateUserInput): Promise<CreateUserOutput> {
    return this.createUserUseCase.execute(input)
  }

  async getProfile(userId: string): Promise<UserProfileOutput> {
    return this.getUserProfileUseCase.execute({ userId })
  }
}
```

### 2. Composition Root / DI Container

```typescript
// src/infrastructure/di/container.ts

import { PrismaUserRepository } from '@/infrastructure/repositories/PostgresUserRepository'
import { CreateUserUseCase } from '@/application/use-cases/CreateUserUseCase'
import { UserService } from '@/application/services/UserService'

export function createUserService(): UserService {
  // Wire up dependencies
  const userRepository = new PrismaUserRepository(prisma)
  const createUserUseCase = new CreateUserUseCase(userRepository)
  const getUserProfileUseCase = new GetUserProfileUseCase(userRepository)
  const updateUserUseCase = new UpdateUserUseCase(userRepository)

  return new UserService(
    createUserUseCase,
    getUserProfileUseCase,
    updateUserUseCase
  )
}
```

### 3. API Controller (Infrastructure)

```typescript
// src/infrastructure/http/controllers/user.controller.ts

import { Request, Response } from 'express'
import { createUserService } from '@/infrastructure/di/container'

export async function createUserController(req: Request, res: Response) {
  try {
    const service = createUserService()
    const result = await service.createUser(req.body)
    res.status(201).json(result)
  } catch (error) {
    if (error instanceof DomainError) {
      res.status(400).json({ code: error.code, message: error.message })
    } else {
      res.status(500).json({ message: 'Internal server error' })
    }
  }
}
```

## When to Use Each

| Type | When |
|------|------|
| Service class | When you need to compose multiple use cases into one logical operation |
| DI Container | When setting up the application and wiring all dependencies |
| Controller | When connecting use cases to HTTP/CLI/etc endpoints |

## Rules

1. **Services are optional** — if a use case stands alone, use it directly
2. **Controllers handle protocol** — HTTP responses, CLI output, etc.
3. **DI container is single** — create once at app startup, not per request
4. **Factory functions** — use factory functions for creating services with deps

## File Structure

```
src/
  application/
    services/
      UserService.ts
      OrderService.ts
    use-cases/
      ...
  infrastructure/
    di/
      container.ts
      factories.ts
    http/
      controllers/
        user.controller.ts
        order.controller.ts
      middleware/
        auth.middleware.ts
    cli/
      commands/
        create-user.command.ts
```

## Testing with Mocks

```typescript
// Tests use real dependencies or mocks via DI
describe('CreateUserUseCase', () => {
  it('creates user successfully', async () => {
    const mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(undefined)
    }
    const useCase = new CreateUserUseCase(mockRepo as any)
    const result = await useCase.execute({ email: 'test@test.com', name: 'Test' })
    expect(result.user.email).toBe('test@test.com')
  })
})
```

The DI container makes testing easy — inject mocks where needed.