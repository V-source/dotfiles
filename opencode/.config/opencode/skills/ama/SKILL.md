---
name: ama
description: Arquitectura Modular Adaptativa - Principios y estructura para monolitos modulares preparados para evolucionar a microservicios sin refactoring masivo.
license: MIT
compatibility: opencode
metadata:
  version: "2.1.0"
  author: "OpenCode"
  expertise:
    - "Adaptive Modular Architecture (AMA)"
    - "Bounded Contexts"
    - "Clean Architecture"
    - "Microservices Preparation"
    - "Inversion of Control (IoC)"
    - "Event-Driven Communication"
  stack:
    - "Node.js"
    - "Express"
    - "JavaScript"
    - "TypeScript"
  patterns:
    - "Bounded Contexts"
    - "Repository Pattern"
    - "Dependency Injection"
    - "Module API"
    - "Externalization Readiness"
allowed-tools:
  - read
  - write
  - edit
  - bash
  - grep
  - glob
---

# 🛸 Arquitectura Modular Adaptativa (AMA)

Guía completa para construir monolitos modulares que puedan evolucionar a microservicios sin refactoring masivo.

---

## Principios Clave para una Arquitectura Modular Adaptativa (AMA)

Estos principios son la base para que tu monolito sea verdaderamente "adaptativo":

### 1. Módulos (Bounded Contexts) Fuertes y Aislados

- **Definición:** Cada módulo debe representar un "Bounded Context" claro de tu dominio (ej. `Usuarios`, `Productos`, `Pedidos`, `Pagos`).
- **Independencia:** Un módulo debe ser autocontenido. Su código debe vivir dentro de su propio directorio y no debe haber dependencias circulares entre módulos.
- **Propiedad de Datos:** Idealmente, cada módulo debería "poseer" sus propios datos. Esto significa que la estructura de la base de datos (tablas, colecciones) de un módulo no debe ser accedida directamente por otro módulo. Si comparten la misma DB física en el monolito, deben usar esquemas o prefijos de tabla distintos.

### 2. Contratos Explícitos y APIs Internas

- **Interfases Públicas:** Cada módulo debe exponer una API pública bien definida y limitada. Otros módulos solo pueden interactuar con él a través de esta API, no pueden acceder a sus componentes internos directamente. Esto es crucial para la extracción.
- **Tipado Fuerte (donde sea posible):** Utiliza TypeScript o JSDoc para definir explícitamente los contratos de datos (DTOs) y las firmas de funciones de estas APIs internas.

### 3. Inversión de Dependencias (DIP) entre Capas

- **Abstracciones:** Las capas internas (dominio, aplicación) de un módulo deben depender de abstracciones (interfaces o puertos) definidas por ellas mismas, no de implementaciones concretas de la infraestructura (bases de datos, frameworks web).
- **Inyección de Dependencias (DI):** Utiliza un contenedor de DI para ensamblar las dependencias en el punto de entrada de la aplicación, manteniendo los componentes desacoplados.

### 4. Comunicación Asíncrona (Event-Driven) como Preferencia

- **Eventos Internos:** Dentro del monolito, la comunicación entre módulos debe favorecer la publicación y suscripción de eventos (ej. "UsuarioCreado", "ProductoAgotado").
- **Beneficio:** Esta comunicación asíncrona es inherentemente desacoplada y se traduce *directamente* a sistemas de mensajería (Kafka, RabbitMQ) cuando los módulos se convierten en microservicios, minimizando el refactoring.
- **Evita Llamadas Directas:** Si un módulo necesita una respuesta síncrona, expón una API interna bien definida, pero considéralo un punto de mayor acoplamiento.

### 5. Externalización Lista (Externalization Readiness)

- **APIs Externas:** Cada módulo debe ser diseñado con la idea de que su API interna puede convertirse en una API externa (REST, GraphQL, gRPC).
- **Configuración Flexible:** Permite configurar dónde se encuentran las dependencias (ej. `DATABASE_URL` o `USER_SERVICE_API_URL`) para que un módulo pueda conectarse a otro módulo *localmente* o a un *microservicio remoto* simplemente cambiando la configuración.

### 6. Automatización de Pruebas

- **Cobertura Exhaustiva:** Test unitarios, de integración y end-to-end son críticos.
- **Testing de Contratos:** Especialmente para las APIs internas, para asegurar que los módulos no rompan las expectativas de otros módulos.

---

## Estructura de Directorios para la AMA (con JavaScript/Node.js)

La clave es la organización por **módulos/bounded contexts** en el nivel superior, y dentro de cada módulo, una estructura de capas simplificada (similar a lo que vimos antes, o una Clean Architecture completa si el módulo es muy complejo).

```
.
├── src/
│   ├── core/                  # Código verdaderamente global/compartido (¡minimizalo!)
│   │   ├── config/            # Configuraciones globales (DB, Logger)
│   │   │   └── database.js
│   │   └── shared/            # Utilidades generales, helpers, librerías, DTOs compartidos (¡con cuidado!)
│   │       ├── errors/
│   │       │   └── customError.js
│   │       └── eventBus.js    # Implementación de un Event Bus interno
│   │
│   ├── modules/               # Contiene TODOS los módulos de tu dominio
│   │   ├── Users/             # Módulo 1: Gestión de Usuarios
│   │   │   ├── domain/        # Entidades, Value Objects, Agregados, Repositorios (Interfaces)
│   │   │   │   ├── user.js
│   │   │   │   └── userRepository.js # Interface
│   │   │   ├── application/   # Servicios de Aplicación, DTOs, Handlers (Use Cases)
│   │   │   │   ├── services/
│   │   │   │   │   └── userService.js # Lógica de negocio orquestando el dominio y repos
│   │   │   │   └── dtos/
│   │   │   │       ├── createUserDto.js
│   │   │   │       └── userResponseDto.js
│   │   │   ├── infrastructure/# Implementaciones de Repositorios, Controladores API, Event Producers/Consumers
│   │   │   │   ├── persistence/
│   │   │   │   │   └── mongoUserRepository.js # Implementación del UserRepository
│   │   │   │   ├── web/
│   │   │   │   │   └── userController.js # Lógica de Request/Response para las APIs REST
│   │   │   │   └── events/
│   │   │   │       └── userEventPublisher.js # Publica eventos de User (ej. 'UserCreated')
│   │   │   │       └── userEventSubscriber.js # Suscribe a eventos de otros módulos
│   │   │   ├── module.js      # <--- Punto de entrada/API pública del módulo Users
│   │   │   └── index.js       # (Opcional) Exporta los componentes públicos del módulo para el DI
│   │   │
│   │   ├── Products/          # Módulo 2: Gestión de Productos
│   │   │   ├── domain/
│   │   │   │   ├── product.js
│   │   │   │   └── productRepository.js
│   │   │   ├── application/
│   │   │   │   └── services/
│   │   │   │       └── productService.js
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   └── mongoProductRepository.js
│   │   │   │   ├── web/
│   │   │   │   │   └── productController.js
│   │   │   │   └── events/
│   │   │   │       └── productEventPublisher.js
│   │   │   │       └── productEventSubscriber.js
│   │   │   ├── module.js      # <--- API pública del módulo Products
│   │   │   └── index.js       # (Opcional)
│   │   │
│   │   └── Orders/            # Módulo 3: Gestión de Pedidos
│   │       ├── ... (estructura similar)
│   │       ├── module.js
│   │       └── index.js
│   │
│   └── app.js                 # Configuración principal del servidor (Express)
│   └── container.js           # Contenedor de Inversión de Control (DI) para ensamblar todos los módulos
│   └── server.js              # Inicializa y arranca el servidor Express
│
├── config/                    # Configuraciones de entorno (ej. `.env`)
├── tests/
│   ├── modules/
│   │   ├── Users/
│   │   └── Products/
│   └── e2e/
├── package.json
└── README.md
```

---

## Contenido Clave de los Archivos (Enfoque AMA)

### 1. `src/modules/Users/module.js` (La "API Pública" del Módulo)

Este archivo es crucial. Es el *único* punto de interacción para otros módulos o para la capa web principal. Exporta las interfaces o adaptadores que otros módulos o la aplicación central necesitan.

```javascript
// src/modules/Users/module.js
// Define lo que el módulo 'Users' expone al resto del sistema.
// Esto podría ser un servicio, una interfaz para un cliente HTTP si se vuelve microservicio, etc.

const UserRepository = require('./domain/userRepository'); // La interfaz
const UserService = require('./application/services/userService');
const UserController = require('./infrastructure/web/userController');
const { UserCreatedEvent } = require('./infrastructure/events/userEvents'); // Eventos que publica

module.exports = {
    // Para la inyección de dependencias en otros módulos/capas:
    // Expone la INTERFAZ del repositorio si otro módulo necesita usarlo directamente (raro, preferir un servicio)
    UserRepository,

    // Expone el servicio de aplicación como la API principal para otros módulos
    UserService,

    // Expone el controlador para que la capa web principal monte sus rutas
    UserController,

    // Expone los eventos que este módulo publica, para que otros puedan escucharlos
    UserCreatedEvent, // y otros eventos
};
```

### 2. `src/app.js` (Configuración de Express y Rutas Centrales)

Este es el orquestador de las APIs externas.

```javascript
// src/app.js
const express = require('express');
const { Users, Products, Orders } = require('./container'); // Importa los módulos ensamblados

const app = express();
app.use(express.json());

// Monta las rutas de cada módulo.
// Esto permite que cada módulo defina sus propios endpoints.
app.use('/api/users', Users.userController.router); // Suponiendo que userController expone un router
app.use('/api/products', Products.productController.router);
app.use('/api/orders', Orders.orderController.router);

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

module.exports = app;
```

### 3. `src/container.js` (Contenedor de Inversión de Control Global)

Aquí es donde se ensamblan todas las piezas de cada módulo.

```javascript
// src/container.js
const { connectDb, getDb } = require('./core/config/database');
const EventBus = require('./core/shared/eventBus');

// --- Ensamblaje del Módulo Users ---
const UsersModule = require('./modules/Users'); // Importa todo lo que el módulo exporta
const UserDomain = require('./modules/Users/domain/user');
const MongoUserRepository = require('./modules/Users/infrastructure/persistence/mongoUserRepository');
const UserService = require('./modules/Users/application/services/userService');
const UserController = require('./modules/Users/infrastructure/web/userController');
const UserEventPublisher = require('./modules/Users/infrastructure/events/userEventPublisher');
const UserEventSubscriber = require('./modules/Users/infrastructure/events/userEventSubscriber');

// Instantiate dependencies for Users module
const mongoUserRepository = new MongoUserRepository(getDb());
const userEventPublisher = new UserEventPublisher(EventBus);
const userService = new UserService(mongoUserRepository, userEventPublisher);
const userController = new UserController(userService);

// Subscribe internal user event handlers
new UserEventSubscriber(EventBus, userService); // Example: if User module listens to its own events

// --- Ensamblaje del Módulo Products ---
const ProductsModule = require('./modules/Products');
const ProductDomain = require('./modules/Products/domain/product');
const MongoProductRepository = require('./modules/Products/infrastructure/persistence/mongoProductRepository');
const ProductService = require('./modules/Products/application/services/productService');
const ProductController = require('./modules/Products/infrastructure/web/productController');
const ProductEventPublisher = require('./modules/Products/infrastructure/events/productEventPublisher');
const ProductEventSubscriber = require('./modules/Products/infrastructure/events/productEventSubscriber');

const mongoProductRepository = new MongoProductRepository(getDb());
const productEventPublisher = new ProductEventPublisher(EventBus);
const productService = new ProductService(mongoProductRepository, productEventPublisher);
const productController = new ProductController(productService);

new ProductEventSubscriber(EventBus, productService);

// --- Ensamblaje de inter-módulo (si es necesario) ---
// Ejemplo: El servicio de pedidos podría necesitar el servicio de productos
// const OrderService = require('./modules/Orders/application/services/orderService');
// const orderService = new OrderService(mongoOrderRepository, productService); // Inyectamos productService

// Exporta las APIs públicas de cada módulo
module.exports = {
    // Módulo Users
    Users: {
        userService,
        userController,
        eventPublisher: userEventPublisher,
        eventSubscriber: userEventSubscriber,
    },
    // Módulo Products
    Products: {
        productService,
        productController,
        eventPublisher: productEventPublisher,
        eventSubscriber: productEventSubscriber,
    },
    // Otros módulos...
    EventBus, // El Event Bus global
};
```

### 4. `src/server.js` (Punto de Entrada Real de la Aplicación)

```javascript
// src/server.js
const app = require('./app'); // El servidor Express configurado
const { connectDb } = require('./core/config/database'); // Conexión a la DB
const { EventBus } = require('./container'); // El Event Bus

const PORT = process.env.PORT || 3000;

async function start() {
    try {
        await connectDb();
        console.log('Database connected.');

        // Inicializa el Event Bus y carga las suscripciones
        // (Esto podría hacerse dentro de cada módulo, pero aquí se asegura que todo esté listo)
        // Por ejemplo, aquí podrías forzar la carga de los suscriptores de eventos de cada módulo
        // require('./modules/Products/infrastructure/events/productEventSubscriber');
        // require('./modules/Users/infrastructure/events/userEventSubscriber');
        // Esto asegura que los módulos estén "escuchando" los eventos relevantes al inicio.

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
```

---

## ¿Cómo facilita esto la Extracción a Microservicios?

Cuando llegue el momento de extraer un módulo (ej. `Users`) a un microservicio:

1. **Copia el Directorio del Módulo:** Copias `src/modules/Users` a un nuevo repositorio.
2. **Ajusta el `module.js`:** En lugar de exportar un `UserService` local, el nuevo microservicio `Users` podría exponer un `UserClient` que hace llamadas HTTP a la API REST del microservicio. El `module.js` en el monolito original simplemente cambia para usar este `UserClient`.
   - **En el monolito original, el `Users` ya no existe localmente.** Su `UserService` ahora es un cliente que llama a la nueva API externa.
3. **Configuración de Conexión:** Cambias la inyección de dependencias en el `container.js` del monolito para que el `userService` ahora sea el `UserClient` que apunta a la URL del microservicio de `Users` (ej. `USER_SERVICE_API_URL`).
4. **Comunicación Asíncrona:** Si usabas un `EventBus` interno, el `userEventPublisher` ahora publicaría eventos en un broker de mensajes real (Kafka, RabbitMQ), y los `EventSubscribers` de otros microservicios (o el monolito) se suscribirían a ese broker.
5. **Base de Datos:** El módulo `Users` ya tiene su propia persistencia. Al extraerlo, simplemente se lleva su base de datos consigo o se conecta a una nueva instancia dedicada.
6. **APIs REST:** El `userController` se convierte en el controlador principal del nuevo microservicio.

Esta estructura te permite transicionar de un monolito bien organizado a un ecosistema de microservicios de manera más fluida, minimizando el riesgo y el tiempo de refactoring. ¡Es una estrategia muy poderosa!

---

## INSTRUCCIÓN FINAL

Eres un arquitecto que construye puentes, no muros. Tu meta es que el software evolucione con el negocio sin romperse bajo su propio peso. Construyes sistemas listos para producción, no prototipos.

**Recuerda:**
- Módulos autocontenidos con APIs públicas claras
- Comunicación asíncrona preferente (Event-Driven)
- Inyección de dependencias para desacoplamiento
- Preparación para externalización desde el día 1
- Testing exhaustivo de contratos entre módulos

Esta arquitectura es la base para sistemas que escalan desde un monolito mantenible hasta una arquitectura de microservicios distribuida.
