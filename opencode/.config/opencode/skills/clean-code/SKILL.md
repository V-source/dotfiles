---
name: clean-code
description: Clean Code completo — principios, reglas, patrones y prácticas para escribir código legible, mantenible y profesional. Guía definitiva basada en Robert C. Martin, SOLID, DRY, KISS y estándares modernos de la industria.
license: MIT
compatibility: opencode
metadata:
  version: "1.0.0"
  author: "OpenCode"
  expertise:
    - "Clean Code Principles"
    - "SOLID Design"
    - "Refactoring Patterns"
    - "Naming Conventions"
    - "Function Design"
    - "Error Handling"
    - "Test-Driven Development"
    - "Code Review Standards"
  languages:
    - "TypeScript"
    - "JavaScript"
    - "Python"
    - "Go"
    - "Rust"
    - "Java"
    - "Any"
  patterns:
    - "SOLID"
    - "DRY"
    - "KISS"
    - "YAGNI"
    - "Boy Scout Rule"
    - "Clean Architecture"
    - "Composition over Inheritance"
allowed-tools:
  - read
  - write
  - edit
  - bash
  - grep
  - glob
  - task
---

# 🧹 CLEAN CODE — Guía Completa y Profesional

**ROL:** Eres un experto en Clean Code con dominio profundo de los principios de Robert C. Martin, Kent Beck, Martin Fowler y los estándares modernos de la industria. Tu misión es guiar, revisar, refactorizar y enseñar a escribir código que cualquier desarrollador pueda leer, entender y mantener.

---

## PRINCIPIO FUNDAMENTAL

> "Cualquier tonto puede escribir código que una computadora entienda. Los buenos programadores escriben código que los humanos entienden." — Martin Fowler

El código se lee **mucho más veces** de las que se escribe. Optimiza para legibilidad.

---

## 1. NOMENCLATURA (Naming)

### 1.1 Reglas Fundamentales

- **Revelar intención:** El nombre debe responder: ¿por qué existe? ¿qué hace? ¿cómo se usa?
- **Evitar desinformación:** No usar nombres que oculten el significado o engañen.
- **Hacer distinciones significativas:** `a1`, `a2`, `a3` no son nombres, son ruidos.
- **Usar nombres pronunciables:** `genymdhms` ❌ → `generationTimestamp` ✅
- **Usar nombres buscables:** Constantes para números mágicos, variables descriptivas.
- **Evitar codificaciones:** No prefijos hungaros (`strName`, `iCount`), no notación húngara.

### 1.2 Convenciones por Tipo

**Variables:**
```typescript
// ❌ Mal
const d = 30;                    // ¿días? ¿distancia? ¿dinero?
const el = document.querySelector('.btn');  // abreviatura innecesaria
const temp = getUserData();      // 'temp' no dice nada

// ✅ Bien
const daysSinceCreation = 30;
const submitButton = document.querySelector('.btn');
const userData = getUserData();
```

**Funciones/Métodos:**
```typescript
// ❌ Mal
function proc(data) { }
function handle() { }
function doStuff() { }

// ✅ Bien
function processPayment(payment: Payment): Receipt { }
function validateUserInput(input: FormData): ValidationResult { }
function calculateMonthlyRevenue(orders: Order[]): number { }
```

**Clases:**
```typescript
// ❌ Mal
class mgr { }
class data { }
class helper { }  // nombre genérico que no dice qué hace

// ✅ Bien
class PaymentProcessor { }
class UserRegistrationValidator { }
class InvoiceRepository { }
```

**Booleanos:**
```typescript
// ❌ Mal
const write = true;
const visible = false;

// ✅ Bien
const isWriteable = true;
const isVisible = false;
const hasPermission = true;
const canEdit = false;
const shouldRetry = true;
```

**Colecciones:**
```typescript
// ❌ Mal
const user = [];           // plural cuando es colección
const usersList = [];      // redundante

// ✅ Bien
const users = [];
const userMap = new Map();
const userSet = new Set();
```

### 1.3 Nombres de Dominio

```typescript
// Cuando no exista nombre del dominio, inventa uno que tenga sentido
// ❌ Mal
function foo(a, b) { return a + b; }

// ✅ Bien
function sum(amounts: number[]): number { }
function mergeConfigs(base: Config, override: Config): Config { }
```

### 1.4 Regla de Oro del Naming

> Si necesitas un comentario para explicar qué hace una variable o función, el nombre es malo.

---

## 2. FUNCIONES

### 2.1 Reglas Fundamentales

1. **Una sola cosa:** Cada función debe hacer UNA cosa, hacerla BIEN, y hacerla SOLA.
2. **Cortas:** Idealmente < 20 líneas. Máximo 40 líneas.
3. **Pocos parámetros:** Máximo 3. Más de 3 = usar objeto de configuración.
4. **Sin efectos secundarios:** Si los tiene, deben ser explícitos en el nombre.
5. **Un nivel de abstracción:** No mezclar alto nivel con bajo nivel.
6. **Sin banderas booleanas:** Indican que la función hace más de una cosa.

### 2.2 Estructura Ideal

```typescript
// ❌ Mal — Múltiples responsabilidades, banderas, efectos secundarios
function createUser(
  name: string,
  email: string,
  sendWelcome: boolean,
  isAdmin: boolean
) {
  // Validar email
  if (!email.includes('@')) throw new Error('Invalid email');
  
  // Crear usuario
  const user = { name, email, role: isAdmin ? 'admin' : 'user' };
  db.save(user);
  
  // Enviar email
  if (sendWelcome) {
    mailer.sendWelcome(email);
  }
  
  // Log
  console.log(`User ${name} created`);
  
  return user;
}

// ✅ Bien — Separado por responsabilidades
function createUser(data: CreateUserData): User {
  validateEmail(data.email);
  const user = buildUser(data);
  await saveUser(user);
  return user;
}

function validateEmail(email: string): void {
  if (!isValidEmail(email)) {
    throw new InvalidEmailError(email);
  }
}

function buildUser(data: CreateUserData): User {
  return {
    name: data.name,
    email: data.email,
    role: data.isAdmin ? 'admin' : 'user',
  };
}

async function saveUser(user: User): Promise<void> {
  await db.users.insert(user);
}

// Uso
const user = createUser({ name: 'John', email: 'john@example.com' });
await sendWelcomeEmail(user.email);
```

### 2.3 Parámetros

```typescript
// ❌ Mal — Demasiados parámetros
function createReport(
  title: string,
  author: string,
  date: Date,
  format: string,
  includeCharts: boolean,
  pageSize: number,
  orientation: string
) { }

// ✅ Bien — Objeto de configuración
interface ReportConfig {
  title: string;
  author: string;
  date: Date;
  format: 'pdf' | 'html' | 'csv';
  includeCharts: boolean;
  pageSize: 'A4' | 'letter';
  orientation: 'portrait' | 'landscape';
}

function createReport(config: ReportConfig): Report { }
```

### 2.4 Sin Banderas Booleanas

```typescript
// ❌ Mal — La bandera indica dos comportamientos
function render(isDetailed: boolean) {
  if (isDetailed) {
    // render detallado
  } else {
    // render simple
  }
}

// ✅ Bien — Dos funciones separadas
function renderSummary() { }
function renderDetailedReport() { }
```

---

## 3. COMENTARIOS

### 3.1 Regla Fundamental

> El mejor comentario es un código que no necesita uno.

### 3.2 Cuándo SÍ comentar

```typescript
// ✅ INTENCIÓN — Explicar el POR QUÉ, no el QUÉ
// Usamos un Set aquí porque necesitamos búsqueda O(1) y el orden no importa
const seen = new Set<string>();

// ✅ ADVERTENCIA — Consecuencias de cambiar algo
// NO eliminar este timeout — el backend necesita 200ms para inicializar la conexión
await delay(200);

// ✅ TODO — Trabajo pendiente con responsable
// TODO(@john): Migrar a la nueva API de pagos v2 (deadline: 2026-Q2)

// ✅ LEGAL — Licencias, copyrights
// Copyright 2026 Company Name. All rights reserved.

// ✅ HACK — Workaround temporal con razón
// HACK: El API de Stripe no soporta webhooks idempotentes aún.
// Esta verificación manual previene duplicados hasta que lo resuelvan.
if (await isDuplicateWebhook(event.id)) return;
```

### 3.3 Cuándo NO comentar

```typescript
// ❌ Redundante — El código ya lo dice
const total = price * tax; // Calcula el total

// ❌ Comentado-out — Usar git, no comentarios
// const oldFunction = () => { ... }

// ❌ Obvio
// Incrementa el contador en 1
counter++;

// ❌ Mentiroso — Desactualizado
// Retorna el nombre del usuario
function getUser() {
  return { firstName, lastName, email }; // Ya no retorna solo el nombre
}
```

### 3.4 Documentación de API (JSDoc/TSDoc)

```typescript
/**
 * Calcula el descuento aplicable según el tipo de cliente y monto.
 *
 * @param customerType - Tipo de cliente (regular, premium, vip)
 * @param amount - Monto de la compra en centavos
 * @returns El porcentaje de descuento (0-100)
 * @throws {InvalidAmountError} Si el monto es negativo
 */
function calculateDiscount(
  customerType: CustomerType,
  amount: number
): number {
  if (amount < 0) throw new InvalidAmountError(amount);
  // ...
}
```

---

## 4. FORMATO

### 4.1 Reglas

- **Líneas máximas:** ~120 caracteres
- **Indentación:** 2 espacios (consistente en todo el proyecto)
- **Líneas en blanco:** Separar conceptos, no llenar de líneas vacías
- **Densidad vertical:** Código relacionado debe estar junto
- **Orden natural:** Declaraciones antes de uso, funciones llamadas cerca de las que las llaman

### 4.2 Ejemplo

```typescript
// ❌ Mal — Sin separación de conceptos, desordenado
class UserService {
  constructor(private db: Database, private mailer: Mailer) {}
  async create(data: CreateUserData) {
    const user = await this.db.users.insert(data);
    await this.mailer.sendWelcome(user.email);
    return user;
  }
  async findById(id: string) { return this.db.users.findById(id); }
  async delete(id: string) { return this.db.users.delete(id); }
  private validate(data: CreateUserData) {
    if (!data.email) throw new Error('Email required');
  }
}

// ✅ Bien — Separado, ordenado, legible
class UserService {
  constructor(
    private db: Database,
    private mailer: Mailer,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    this.validate(data);
    const user = await this.db.users.insert(data);
    await this.mailer.sendWelcome(user.email);
    return user;
  }

  async findById(id: string): Promise<User | null> {
    return this.db.users.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.db.users.delete(id);
  }

  private validate(data: CreateUserData): void {
    if (!data.email) {
      throw new ValidationError('Email is required');
    }
  }
}
```

---

## 5. MANEJO DE ERRORES

### 5.1 Reglas

- **Usar excepciones en vez de códigos de error**
- **Escribir bloques try-catch-finally primero**
- **Dar contexto en las excepciones**
- **No retornar null ni pasar null**
- **No capturar excepciones genéricas sin razón**
- **Definir clases de excepción específicas del dominio**

### 5.2 Ejemplos

```typescript
// ❌ Mal — Códigos de error
function divide(a: number, b: number): number | string {
  if (b === 0) return 'ERROR_DIVISION_BY_ZERO';
  return a / b;
}
const result = divide(10, 0);
if (typeof result === 'string') { /* manejar */ }

// ✅ Bien — Excepciones con contexto
function divide(dividend: number, divisor: number): number {
  if (divisor === 0) {
    throw new DivisionByZeroError(
      `Cannot divide ${dividend} by zero`,
      { dividend, divisor }
    );
  }
  return dividend / divisor;
}

// ❌ Mal — Retornar null
function findUser(id: string): User | null {
  const user = db.users.findById(id);
  if (!user) return null;  // El llamador debe verificar null
}

// ✅ Bien — Null Object o excepción
function findUser(id: string): User {
  const user = db.users.findById(id);
  if (!user) {
    throw new UserNotFoundError(`User with id '${id}' not found`);
  }
  return user;
}

// O usar Option/Maybe pattern
function findUser(id: string): Option<User> {
  return Option.fromNullable(db.users.findById(id));
}
```

### 5.3 Excepciones Específicas del Dominio

```typescript
class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

class UserNotFoundError extends DomainError {
  constructor(userId: string) {
    super(`User '${userId}' not found`, 'USER_NOT_FOUND', { userId });
  }
}

class InsufficientFundsError extends DomainError {
  constructor(required: number, available: number) {
    super(
      `Insufficient funds: ${required} required, ${available} available`,
      'INSUFFICIENT_FUNDS',
      { required, available }
    );
  }
}
```

---

## 6. CLASES Y OBJETOS

### 6.1 Reglas

- **Responsabilidad Única (SRP):** Una clase, una razón para cambiar
- **Cohesión alta:** Los métodos deben usar las mismas variables de instancia
- **Encapsulamiento:** Ocultar detalles de implementación
- **Ley de Demeter:** Un módulo no debe conocer los internos de los objetos que manipula
- **Composición sobre herencia**
- **Clases pequeñas > Clases grandes**

### 6.2 Ejemplos

```typescript
// ❌ Mal — God Object, múltiples responsabilidades
class UserManager {
  createUser(data: any) { }
  validateEmail(email: string) { }
  sendWelcomeEmail(email: string) { }
  generateUserReport(users: User[]) { }
  connectToDatabase() { }
  hashPassword(password: string) { }
  logActivity(action: string) { }
}

// ✅ Bien — Separado por responsabilidades
class UserService {
  constructor(
    private repository: UserRepository,
    private validator: UserValidator,
    private notifier: NotificationService,
  ) {}

  async register(data: RegistrationData): Promise<User> {
    this.validator.validate(data);
    const user = await this.repository.save(data);
    await this.notifier.sendWelcome(user);
    return user;
  }
}

class UserValidator {
  validate(data: RegistrationData): void {
    this.validateEmail(data.email);
    this.validatePassword(data.password);
  }

  private validateEmail(email: string): void {
    if (!isValidEmail(email)) {
      throw new InvalidEmailError(email);
    }
  }

  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new WeakPasswordError('Password must be at least 8 characters');
    }
  }
}

class NotificationService {
  constructor(private mailer: Mailer) {}

  async sendWelcome(user: User): Promise<void> {
    await this.mailer.send({
      to: user.email,
      template: 'welcome',
      data: { name: user.name },
    });
  }
}
```

### 6.3 Ley de Demeter

```typescript
// ❌ Mal — Acoplamiento profundo (train wreck)
const city = user.address.getCoordinates().city;

// ✅ Bien — Delegar el comportamiento
const city = user.getCity();

// En la clase User:
class User {
  getCity(): string {
    return this.address.getCoordinates().city;
  }
}
```

---

## 7. PRINCIPIOS SOLID

### 7.1 S — Single Responsibility Principle

> Una clase/módulo debe tener una, y solo una, razón para cambiar.

```typescript
// ❌ Mal — Reporte maneja lógica, formato Y persistencia
class Report {
  calculate() { }
  formatAsPDF() { }
  formatAsCSV() { }
  saveToDatabase() { }
  sendByEmail() { }
}

// ✅ Bien — Cada clase con su responsabilidad
class ReportCalculator { calculate() { } }
class PDFReportFormatter { format(report: Report) { } }
class CSVReportFormatter { format(report: Report) { } }
class ReportRepository { save(report: Report) { } }
class ReportNotifier { send(report: Report) { } }
```

### 7.2 O — Open/Closed Principle

> Abierto para extensión, cerrado para modificación.

```typescript
// ❌ Mal — Modificar para agregar nuevo tipo
class DiscountCalculator {
  calculate(type: string, amount: number): number {
    if (type === 'regular') return amount * 0.05;
    if (type === 'premium') return amount * 0.10;
    if (type === 'vip') return amount * 0.15;
    // Hay que modificar esta clase para cada nuevo tipo
  }
}

// ✅ Bien — Extender sin modificar
interface DiscountStrategy {
  calculate(amount: number): number;
}

class RegularDiscount implements DiscountStrategy {
  calculate(amount: number): number { return amount * 0.05; }
}

class PremiumDiscount implements DiscountStrategy {
  calculate(amount: number): number { return amount * 0.10; }
}

class VIPDiscount implements DiscountStrategy {
  calculate(amount: number): number { return amount * 0.15; }
}

class DiscountCalculator {
  constructor(private strategies: Map<string, DiscountStrategy>) {}

  calculate(type: string, amount: number): number {
    const strategy = this.strategies.get(type);
    if (!strategy) throw new UnknownDiscountTypeError(type);
    return strategy.calculate(amount);
  }
}
```

### 7.3 L — Liskov Substitution Principle

> Las subclases deben poder sustituirse por sus clases base sin alterar el comportamiento.

```typescript
// ❌ Mal — Rectangle/Square viola LSP
class Rectangle {
  constructor(
    protected _width: number,
    protected _height: number
  ) {}

  set width(w: number) { this._width = w; }
  set height(h: number) { this._height = h; }
  get area() { return this._width * this._height; }
}

class Square extends Rectangle {
  set width(w: number) { this._width = w; this._height = w; }
  set height(h: number) { this._width = h; this._height = h; }
}

// Esto rompe con Square:
function resize(rect: Rectangle) {
  rect.width = 10;
  rect.height = 20;
  console.log(rect.area); // Espera 200, pero Square da 400
}

// ✅ Bien — Interfaces separadas
interface Shape {
  get area(): number;
}

class Rectangle implements Shape {
  constructor(private width: number, private height: number) {}
  get area() { return this.width * this.height; }
}

class Square implements Shape {
  constructor(private side: number) {}
  get area() { return this.side * this.side; }
}
```

### 7.4 I — Interface Segregation Principle

> Los clientes no deben depender de interfaces que no usan.

```typescript
// ❌ Mal — Interfaz gorda
interface Worker {
  work(): void;
  eat(): void;
  sleep(): void;
  attendMeeting(): void;
}

// Los robots no comen ni duermen
class Robot implements Worker {
  work() { }
  eat() { throw new Error('Robots do not eat'); }
  sleep() { throw new Error('Robots do not sleep'); }
  attendMeeting() { }
}

// ✅ Bien — Interfaces segregadas
interface Workable {
  work(): void;
}

interface Feedable {
  eat(): void;
}

interface Restable {
  sleep(): void;
}

interface Meetable {
  attendMeeting(): void;
}

class Robot implements Workable, Meetable {
  work() { }
  attendMeeting() { }
}

class Human implements Workable, Feedable, Restable, Meetable {
  work() { }
  eat() { }
  sleep() { }
  attendMeeting() { }
}
```

### 7.5 D — Dependency Inversion Principle

> Depender de abstracciones, no de concreciones.

```typescript
// ❌ Mal — Dependencia directa de implementación
class OrderService {
  private db = new MySQLDatabase();  // Acoplado a MySQL

  async saveOrder(order: Order): Promise<void> {
    await this.db.connect();
    await this.db.insert('orders', order);
    await this.db.disconnect();
  }
}

// ✅ Bien — Depender de abstracción
interface Database {
  connect(): Promise<void>;
  insert(table: string, data: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
}

class OrderService {
  constructor(private db: Database) {}  // Inyectado

  async saveOrder(order: Order): Promise<void> {
    await this.db.connect();
    await this.db.insert('orders', order);
    await this.db.disconnect();
  }
}

// Se puede usar cualquier implementación
const service = new OrderService(new MySQLDatabase());
// o
const service = new OrderService(new MongoDB());
// o
const service = new OrderService(new InMemoryDatabase()); // Para tests
```

---

## 8. PRINCIPIOS DE DISEÑO

### 8.1 DRY — Don't Repeat Yourself

> Cada pieza de conocimiento debe tener una representación única, inequívoca y autoritativa.

```typescript
// ❌ Mal — Duplicación
function calculateOrderTotal(orders: Order[]): number {
  let total = 0;
  for (const order of orders) {
    total += order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    total *= 1.21; // IVA
  }
  return total;
}

function calculateInvoiceTotal(invoice: Invoice): number {
  let total = 0;
  for (const line of invoice.lines) {
    total += line.price * line.quantity;
  }
  total *= 1.21; // IVA duplicado
  return total;
}

// ✅ Bien — Extraer lógica compartida
const TAX_RATE = 1.21;

function calculateSubtotal(items: { price: number; quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function applyTax(subtotal: number): number {
  return subtotal * TAX_RATE;
}

function calculateOrderTotal(orders: Order[]): number {
  const allItems = orders.flatMap(o => o.items);
  return applyTax(calculateSubtotal(allItems));
}

function calculateInvoiceTotal(invoice: Invoice): number {
  return applyTax(calculateSubtotal(invoice.lines));
}
```

### 8.2 KISS — Keep It Simple, Stupid

> La simplicidad debe ser un objetivo de diseño. Evitar complejidad innecesaria.

```typescript
// ❌ Mal — Sobre-ingeniería
class LoggerFactory {
  static createLogger(config: LoggerConfig): Logger {
    if (config.environment === 'production') {
      return new CompositeLogger(
        new StructuredLogger(
          new AsyncLoggerWrapper(
            new FileLogger(config.path),
            new QueueBuffer(1000)
          )
        ),
        new RemoteLogger(config.endpoint)
      );
    }
    return new ConsoleLogger();
  }
}

// ✅ Bien — Simple y directo
function createLogger(env: string): Logger {
  if (env === 'production') {
    return new FileLogger('/var/log/app.log');
  }
  return new ConsoleLogger();
}
```

### 8.3 YAGNI — You Ain't Gonna Need It

> No agregar funcionalidad hasta que sea necesaria.

```typescript
// ❌ Mal — Preparando para el futuro incierto
class UserService {
  // Funcionalidad que nadie pidió aún
  async exportToXML() { }
  async syncWithLDAP() { }
  async generateAuditTrail() { }
  async scheduleBackup() { }
}

// ✅ Bien — Solo lo necesario ahora
class UserService {
  async create(data: CreateUserData): Promise<User> { }
  async findById(id: string): Promise<User> { }
  async update(id: string, data: UpdateUserData): Promise<User> { }
  async delete(id: string): Promise<void> { }
}
```

### 8.4 Boy Scout Rule

> Deja el código más limpio de como lo encontraste.

Cada vez que toques un archivo:
- Renombra una variable confusa
- Extrae una función larga
- Elimina código muerto
- Mejora un nombre
- Agrega un test faltante

---

## 9. TESTS

### 9.1 Reglas

- **Tests legibles:** Deben leerse como documentación
- **Una aserción por concepto:** No mezclar múltiples verificaciones
- **Setup claro:** Arrange, Act, Assert
- **Nombres descriptivos:** Deben explicar el escenario
- **Independientes:** No depender del orden de ejecución
- **Rápidos:** Ejecutar en milisegundos

### 9.2 Estructura AAA

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('should create user and send welcome email', async () => {
      // Arrange
      const userData = { name: 'John', email: 'john@example.com' };
      const mockRepository = new MockUserRepository();
      const mockNotifier = new MockNotificationService();
      const service = new UserService(mockRepository, mockNotifier);

      // Act
      const user = await service.createUser(userData);

      // Assert
      expect(user.name).toBe('John');
      expect(user.email).toBe('john@example.com');
      expect(mockNotifier.wasWelcomeEmailSentTo('john@example.com')).toBe(true);
    });

    it('should throw ValidationError when email is invalid', async () => {
      // Arrange
      const invalidData = { name: 'John', email: 'not-an-email' };
      const service = new UserService(new MockRepository(), new MockNotifier());

      // Act & Assert
      await expect(service.createUser(invalidData))
        .rejects
        .toThrow(InvalidEmailError);
    });
  });
});
```

---

## 10. PATRONES DE DISEÑO

### 10.1 Patrones Creacionales

#### Factory Method

Define una interfaz para crear un objeto, pero deja que las subclases decidan cuál instanciar.

```typescript
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(`[CONSOLE] ${message}`);
  }
}

class FileLogger implements Logger {
  log(message: string): void {
    fs.appendFileSync('app.log', `[FILE] ${message}\n`);
  }
}

abstract class LoggerFactory {
  abstract createLogger(): Logger;

  getLogger(): Logger {
    return this.createLogger();
  }
}

class ConsoleLoggerFactory extends LoggerFactory {
  createLogger(): Logger { return new ConsoleLogger(); }
}

class FileLoggerFactory extends LoggerFactory {
  createLogger(): Logger { return new FileLogger(); }
}

// Uso
const factory: LoggerFactory = process.env.NODE_ENV === 'production'
  ? new FileLoggerFactory()
  : new ConsoleLoggerFactory();

const logger = factory.getLogger();
logger.log('App started');
```

#### Abstract Factory

Proporciona una interfaz para crear familias de objetos relacionados sin especificar sus clases concretas.

```typescript
interface Button { render(): string; }
interface Checkbox { render(): string; }
interface Input { render(): string; }

interface UIFactory {
  createButton(): Button;
  createCheckbox(): Checkbox;
  createInput(): Input;
}

class DarkThemeFactory implements UIFactory {
  createButton(): Button { return new DarkButton(); }
  createCheckbox(): Checkbox { return new DarkCheckbox(); }
  createInput(): Input { return new DarkInput(); }
}

class LightThemeFactory implements UIFactory {
  createButton(): Button { return new LightButton(); }
  createCheckbox(): Checkbox { return new LightCheckbox(); }
  createInput(): Input { return new LightInput(); }
}

// Uso
const factory: UIFactory = theme === 'dark'
  ? new DarkThemeFactory()
  : new LightThemeFactory();

const button = factory.createButton();
const checkbox = factory.createCheckbox();
const input = factory.createInput();
```

#### Builder

Construye objetos complejos paso a paso, separando la construcción de la representación.

```typescript
class HttpRequest {
  constructor(
    readonly method: string,
    readonly url: string,
    readonly headers: Record<string, string>,
    readonly body?: string,
    readonly timeout?: number,
    readonly retries?: number,
  ) {}
}

class HttpRequestBuilder {
  private method = 'GET';
  private url = '';
  private headers: Record<string, string> = {};
  private body?: string;
  private timeout = 30000;
  private retries = 0;

  setMethod(method: string): this {
    this.method = method;
    return this;
  }

  setUrl(url: string): this {
    this.url = url;
    return this;
  }

  addHeader(key: string, value: string): this {
    this.headers[key] = value;
    return this;
  }

  setBody(body: string): this {
    this.body = body;
    return this;
  }

  setTimeout(ms: number): this {
    this.timeout = ms;
    return this;
  }

  setRetries(count: number): this {
    this.retries = count;
    return this;
  }

  build(): HttpRequest {
    if (!this.url) throw new Error('URL is required');
    return new HttpRequest(
      this.method, this.url, this.headers, this.body, this.timeout, this.retries
    );
  }
}

// Uso — Fluent interface
const request = new HttpRequestBuilder()
  .setMethod('POST')
  .setUrl('/api/users')
  .addHeader('Content-Type', 'application/json')
  .addHeader('Authorization', 'Bearer token123')
  .setBody(JSON.stringify({ name: 'John' }))
  .setTimeout(5000)
  .setRetries(3)
  .build();
```

#### Prototype

Crea nuevos objetos clonando una instancia existente.

```typescript
interface Prototype {
  clone(): Prototype;
}

class Document implements Prototype {
  constructor(
    public title: string,
    public content: string,
    public metadata: Record<string, string>,
  ) {}

  clone(): Document {
    return new Document(
      this.title,
      this.content,
      { ...this.metadata }  // shallow copy
    );
  }
}

// Uso
const template = new Document(
  'Invoice Template',
  '...',
  { currency: 'USD', locale: 'en-US' }
);

const invoice1 = template.clone();
invoice1.title = 'Invoice #001';
invoice1.metadata.customer = 'Acme Corp';

const invoice2 = template.clone();
invoice2.title = 'Invoice #002';
invoice2.metadata.customer = 'Globex';
```

#### Singleton

Garantiza una única instancia y proporciona un punto de acceso global.

```typescript
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private connection: any;

  private constructor() {}

  static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await createConnection(process.env.DB_URL);
    }
  }

  getConnection(): any {
    return this.connection;
  }
}

// Uso
const db1 = DatabaseConnection.getInstance();
const db2 = DatabaseConnection.getInstance();
console.log(db1 === db2); // true — misma instancia
```

> **Nota:** El Singleton es considerado un anti-patrón por muchos. Usar con precaución. Preferir Inyección de Dependencias.

#### Object Pool

Reutiliza objetos en vez de crearlos y destruirlos constantemente.

```typescript
class ConnectionPool {
  private available: DatabaseConnection[] = [];
  private inUse: Set<DatabaseConnection> = new Set();

  constructor(private maxSize: number, private factory: () => DatabaseConnection) {
    for (let i = 0; i < maxSize; i++) {
      this.available.push(factory());
    }
  }

  acquire(): DatabaseConnection {
    if (this.available.length === 0) {
      throw new Error('No connections available');
    }
    const conn = this.available.pop()!;
    this.inUse.add(conn);
    return conn;
  }

  release(conn: DatabaseConnection): void {
    this.inUse.delete(conn);
    this.available.push(conn);
  }
}
```

---

### 10.2 Patrones Estructurales

#### Adapter

Convierte la interfaz de una clase en otra que el cliente espera.

```typescript
// Servicio externo con interfaz incompatible
interface LegacyPaymentGateway {
  processPayment(amount: number, currency: string, cardToken: string): boolean;
}

// Nuestra interfaz deseada
interface PaymentProcessor {
  charge(request: ChargeRequest): PaymentResult;
}

interface ChargeRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
}

interface PaymentResult {
  success: boolean;
  transactionId: string;
}

// Adapter
class LegacyPaymentAdapter implements PaymentProcessor {
  constructor(private legacyGateway: LegacyPaymentGateway) {}

  charge(request: ChargeRequest): PaymentResult {
    const success = this.legacyGateway.processPayment(
      request.amount,
      request.currency,
      request.paymentMethodId
    );

    return {
      success,
      transactionId: success ? `TXN-${Date.now()}` : '',
    };
  }
}

// Uso — el resto del sistema usa PaymentProcessor sin saber del adapter
const processor: PaymentProcessor = new LegacyPaymentAdapter(legacyGateway);
const result = processor.charge({ amount: 100, currency: 'USD', paymentMethodId: 'tok_123' });
```

#### Bridge

Separa una abstracción de su implementación para que puedan variar independientemente.

```typescript
// Implementación
interface Renderer {
  renderCircle(radius: number): string;
}

class VectorRenderer implements Renderer {
  renderCircle(radius: number): string {
    return `Drawing circle with radius ${radius} as vector`;
  }
}

class RasterRenderer implements Renderer {
  renderCircle(radius: number): string {
    return `Drawing circle with radius ${radius} as raster at ${radius * 2}px`;
  }
}

// Abstracción
abstract class Shape {
  constructor(protected renderer: Renderer) {}
  abstract draw(): string;
  abstract resize(factor: number): void;
}

class Circle extends Shape {
  constructor(renderer: Renderer, private radius: number) {
    super(renderer);
  }

  draw(): string {
    return this.renderer.renderCircle(this.radius);
  }

  resize(factor: number): void {
    this.radius *= factor;
  }
}

// Uso — Combinar abstracción e implementación independientemente
const vectorCircle = new Circle(new VectorRenderer(), 5);
const rasterCircle = new Circle(new RasterRenderer(), 5);
console.log(vectorCircle.draw()); // vector
console.log(rasterCircle.draw()); // raster
```

#### Composite

Compone objetos en estructuras de árbol para representar jerarquías parte-todo.

```typescript
interface FileSystemComponent {
  getSize(): number;
  print(indent?: number): string;
}

class File implements FileSystemComponent {
  constructor(private name: string, private size: number) {}

  getSize(): number { return this.size; }

  print(indent = 0): string {
    return `${'  '.repeat(indent)}📄 ${this.name} (${this.size}KB)`;
  }
}

class Directory implements FileSystemComponent {
  private children: FileSystemComponent[] = [];

  constructor(private name: string) {}

  add(component: FileSystemComponent): void {
    this.children.push(component);
  }

  getSize(): number {
    return this.children.reduce((sum, child) => sum + child.getSize(), 0);
  }

  print(indent = 0): string {
    const header = `${'  '.repeat(indent)}📁 ${this.name} (${this.getSize()}KB)`;
    const children = this.children.map(c => c.print(indent + 1)).join('\n');
    return `${header}\n${children}`;
  }
}

// Uso
const root = new Directory('root');
const src = new Directory('src');
src.add(new File('index.ts', 5));
src.add(new File('utils.ts', 3));
root.add(src);
root.add(new File('package.json', 1));
console.log(root.print());
```

#### Decorator

Añade responsabilidades a un objeto dinámicamente sin modificar su clase.

```typescript
interface DataSource {
  read(): string;
  write(data: string): void;
}

class FileDataSource implements DataSource {
  constructor(private filename: string) {}

  read(): string {
    return fs.readFileSync(this.filename, 'utf-8');
  }

  write(data: string): void {
    fs.writeFileSync(this.filename, data);
  }
}

abstract class DataSourceDecorator implements DataSource {
  constructor(protected wrapped: DataSource) {}
  abstract read(): string;
  abstract write(data: string): void;
}

class EncryptionDecorator extends DataSourceDecorator {
  read(): string {
    return this.decrypt(this.wrapped.read());
  }

  write(data: string): void {
    this.wrapped.write(this.encrypt(data));
  }

  private encrypt(data: string): string {
    return Buffer.from(data).toString('base64');
  }

  private decrypt(data: string): string {
    return Buffer.from(data, 'base64').toString('utf-8');
  }
}

class CompressionDecorator extends DataSourceDecorator {
  read(): string {
    return this.decompress(this.wrapped.read());
  }

  write(data: string): void {
    this.wrapped.write(this.compress(data));
  }

  private compress(data: string): string {
    return zlib.deflateSync(data).toString('base64');
  }

  private decompress(data: string): string {
    return zlib.inflateSync(Buffer.from(data, 'base64')).toString();
  }
}

// Uso — Apilar decoradores
let source: DataSource = new FileDataSource('data.txt');
source = new EncryptionDecorator(source);
source = new CompressionDecorator(source);

source.write('Secret data');  // Comprime → Encripta → Escribe
const data = source.read();   // Lee → Desencripta → Descomprime
```

#### Facade

Proporciona una interfaz simplificada a un subsistema complejo.

```typescript
// Subsistema complejo
class InventoryService {
  checkStock(productId: string): number { /* ... */ return 10; }
  reserve(productId: string, quantity: number): void { /* ... */ }
}

class PaymentService {
  processPayment(userId: string, amount: number): PaymentResult { /* ... */ return { success: true, id: 'pay_123' }; }
}

class ShippingService {
  createShipment(userId: string, productId: string, quantity: number): string { /* ... */ return 'ship_456'; }
}

class NotificationService {
  sendOrderConfirmation(userId: string, orderId: string): void { /* ... */ }
}

// Facade
class OrderFacade {
  constructor(
    private inventory: InventoryService,
    private payment: PaymentService,
    private shipping: ShippingService,
    private notification: NotificationService,
  ) {}

  placeOrder(userId: string, productId: string, quantity: number, amount: number): OrderResult {
    // 1. Verificar stock
    const stock = this.inventory.checkStock(productId);
    if (stock < quantity) throw new InsufficientStockError(productId, stock);

    // 2. Reservar inventario
    this.inventory.reserve(productId, quantity);

    // 3. Procesar pago
    const paymentResult = this.payment.processPayment(userId, amount);
    if (!paymentResult.success) throw new PaymentFailedError(paymentResult.id);

    // 4. Crear envío
    const shipmentId = this.shipping.createShipment(userId, productId, quantity);

    // 5. Notificar
    const orderId = `ORD-${Date.now()}`;
    this.notification.sendOrderConfirmation(userId, orderId);

    return { orderId, paymentId: paymentResult.id, shipmentId };
  }
}

// Uso — Simple para el cliente
const orderSystem = new OrderFacade(
  new InventoryService(),
  new PaymentService(),
  new ShippingService(),
  new NotificationService()
);

const result = orderSystem.placeOrder('user_1', 'prod_42', 2, 99.99);
```

#### Flyweight

Minimiza el uso de memoria compartiendo el máximo posible de datos entre objetos similares.

```typescript
class TreeType {
  constructor(
    readonly name: string,
    readonly color: string,
    readonly texture: string,
  ) {}

  render(canvas: Canvas, x: number, y: number): void {
    // Datos intrínsecos (compartidos)
    canvas.drawImage(this.texture, x, y);
    canvas.setColor(this.color);
  }
}

class TreeTypeFactory {
  private static treeTypes = new Map<string, TreeType>();

  static getTreeType(name: string, color: string, texture: string): TreeType {
    const key = `${name}-${color}-${texture}`;
    if (!this.treeTypes.has(key)) {
      this.treeTypes.set(key, new TreeType(name, color, texture));
    }
    return this.treeTypes.get(key)!;
  }
}

class Tree {
  constructor(
    private x: number,
    private y: number,
    private type: TreeType,
  ) {}

  render(canvas: Canvas): void {
    this.type.render(canvas, this.x, this.y);  // Datos extrínsecos (x, y)
  }
}

// Uso — 10,000 árboles pero solo 5 TreeType en memoria
const oak = TreeTypeFactory.getTreeType('Oak', 'green', 'oak.png');
const pine = TreeTypeFactory.getTreeType('Pine', 'darkgreen', 'pine.png');

const forest: Tree[] = [];
for (let i = 0; i < 10000; i++) {
  const type = Math.random() > 0.5 ? oak : pine;
  forest.push(new Tree(Math.random() * 1000, Math.random() * 1000, type));
}
```

#### Proxy

Proporciona un sustituto o marcador de posición para controlar el acceso a otro objeto.

```typescript
interface Image {
  display(): void;
}

class RealImage implements Image {
  constructor(private filename: string) {
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    console.log(`Loading ${this.filename}...`);
  }

  display(): void {
    console.log(`Displaying ${this.filename}`);
  }
}

class ProxyImage implements Image {
  private realImage?: RealImage;

  constructor(private filename: string) {}

  display(): void {
    if (!this.realImage) {
      this.realImage = new RealImage(this.filename);  // Lazy loading
    }
    this.realImage.display();
  }
}

// Uso — La imagen real solo se carga cuando se necesita
const image1: Image = new ProxyImage('photo1.jpg');
const image2: Image = new ProxyImage('photo2.jpg');

image1.display(); // Carga y muestra
image1.display(); // Ya cargada, solo muestra
image2.display(); // Carga y muestra
```

---

### 10.3 Patrones Comportamentales

#### Chain of Responsibility

Pasa una solicitud a lo largo de una cadena de manejadores.

```typescript
interface Handler {
  setNext(handler: Handler): Handler;
  handle(request: Request): Result;
}

abstract class BaseHandler implements Handler {
  private nextHandler?: Handler;

  setNext(handler: Handler): Handler {
    this.nextHandler = handler;
    return handler;
  }

  handle(request: Request): Result {
    if (this.nextHandler) {
      return this.nextHandler.handle(request);
    }
    return { success: false, error: 'No handler found' };
  }
}

class AuthHandler extends BaseHandler {
  handle(request: Request): Result {
    if (!request.token) {
      return { success: false, error: 'Unauthorized' };
    }
    return super.handle(request);
  }
}

class ValidationHandler extends BaseHandler {
  handle(request: Request): Result {
    if (!request.body || Object.keys(request.body).length === 0) {
      return { success: false, error: 'Validation failed' };
    }
    return super.handle(request);
  }
}

class RateLimitHandler extends BaseHandler {
  private requests = new Map<string, number>();

  handle(request: Request): Result {
    const count = this.requests.get(request.ip) || 0;
    if (count >= 100) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    this.requests.set(request.ip, count + 1);
    return super.handle(request);
  }
}

class ControllerHandler extends BaseHandler {
  handle(request: Request): Result {
    return { success: true, data: processRequest(request) };
  }
}

// Uso — Construir la cadena
const chain = new AuthHandler()
  .setNext(new ValidationHandler())
  .setNext(new RateLimitHandler())
  .setNext(new ControllerHandler());

const result = chain.handle(request);
```

#### Command

Encapsula una solicitud como un objeto, permitiendo parametrizar clientes con diferentes solicitudes.

```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class Light {
  turnOn(): void { console.log('Light ON'); }
  turnOff(): void { console.log('Light OFF'); }
}

class LightOnCommand implements Command {
  constructor(private light: Light) {}
  execute(): void { this.light.turnOn(); }
  undo(): void { this.light.turnOff(); }
}

class LightOffCommand implements Command {
  constructor(private light: Light) {}
  execute(): void { this.light.turnOff(); }
  undo(): void { this.light.turnOn(); }
}

class RemoteControl {
  private history: Command[] = [];

  pressButton(command: Command): void {
    command.execute();
    this.history.push(command);
  }

  pressUndo(): void {
    const lastCommand = this.history.pop();
    if (lastCommand) lastCommand.undo();
  }
}

// Uso
const light = new Light();
const remote = new RemoteControl();

remote.pressButton(new LightOnCommand(light));
remote.pressButton(new LightOffCommand(light));
remote.pressUndo(); // Re-enciende
```

#### Interpreter

Define una representación gramatical y un intérprete para un lenguaje.

```typescript
interface Expression {
  interpret(context: Map<string, number>): number;
}

class NumberExpression implements Expression {
  constructor(private value: number) {}
  interpret(): number { return this.value; }
}

class VariableExpression implements Expression {
  constructor(private name: string) {}
  interpret(context: Map<string, number>): number {
    return context.get(this.name) || 0;
  }
}

class AddExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression,
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) + this.right.interpret(context);
  }
}

class MultiplyExpression implements Expression {
  constructor(
    private left: Expression,
    private right: Expression,
  ) {}

  interpret(context: Map<string, number>): number {
    return this.left.interpret(context) * this.right.interpret(context);
  }
}

// Uso — (x + 5) * 3 donde x = 10
const context = new Map([['x', 10]]);
const expression = new MultiplyExpression(
  new AddExpression(new VariableExpression('x'), new NumberExpression(5)),
  new NumberExpression(3)
);

console.log(expression.interpret(context)); // (10 + 5) * 3 = 45
```

#### Iterator

Proporciona una forma de acceder secuencialmente a los elementos de un agregado sin exponer su estructura interna.

```typescript
interface Iterator<T> {
  next(): T | null;
  hasNext(): boolean;
  current(): T | null;
}

class CollectionIterator<T> implements Iterator<T> {
  private index = 0;

  constructor(private collection: T[]) {}

  next(): T | null {
    if (this.hasNext()) {
      return this.collection[this.index++];
    }
    return null;
  }

  hasNext(): boolean {
    return this.index < this.collection.length;
  }

  current(): T | null {
    return this.collection[this.index] ?? null;
  }
}

class PaginatedIterator<T> implements Iterator<T> {
  private items: T[] = [];
  private index = 0;

  constructor(
    private fetchPage: (page: number) => Promise<T[]>,
    private pageSize: number,
  ) {}

  async next(): Promise<T | null> {
    if (this.index >= this.items.length) {
      const page = Math.floor(this.index / this.pageSize);
      const newItems = await this.fetchPage(page);
      if (newItems.length === 0) return null;
      this.items = [...this.items, ...newItems];
    }
    return this.items[this.index++] ?? null;
  }

  hasNext(): boolean {
    return this.index < this.items.length;
  }

  current(): T | null {
    return this.items[this.index] ?? null;
  }
}
```

#### Mediator

Define un objeto que encapsula cómo interactúan un conjunto de objetos.

```typescript
interface ChatMediator {
  sendMessage(message: string, sender: User): void;
  addUser(user: User): void;
}

class ChatRoom implements ChatMediator {
  private users: User[] = [];

  addUser(user: User): void {
    this.users.push(user);
  }

  sendMessage(message: string, sender: User): void {
    const recipients = this.users.filter(u => u !== sender);
    recipients.forEach(user => user.receive(message, sender));
  }
}

class User {
  constructor(
    readonly name: string,
    private mediator: ChatMediator,
  ) {}

  send(message: string): void {
    console.log(`${this.name} sends: ${message}`);
    this.mediator.sendMessage(message, this);
  }

  receive(message: string, sender: User): void {
    console.log(`${this.name} receives from ${sender.name}: ${message}`);
  }
}

// Uso
const chatRoom = new ChatRoom();
const alice = new User('Alice', chatRoom);
const bob = new User('Bob', chatRoom);
const charlie = new User('Charlie', chatRoom);

chatRoom.addUser(alice);
chatRoom.addUser(bob);
chatRoom.addUser(charlie);

alice.send('Hello everyone!');
// Bob receives from Alice: Hello everyone!
// Charlie receives from Alice: Hello everyone!
```

#### Memento

Captura y externaliza el estado interno de un objeto sin violar encapsulamiento.

```typescript
class EditorMemento {
  constructor(readonly content: string) {}
}

class TextEditor {
  private content = '';

  type(words: string): void {
    this.content += words;
  }

  getContent(): string {
    return this.content;
  }

  save(): EditorMemento {
    return new EditorMemento(this.content);
  }

  restore(memento: EditorMemento): void {
    this.content = memento.content;
  }
}

class History {
  private mementos: EditorMemento[] = [];

  push(memento: EditorMemento): void {
    this.mementos.push(memento);
  }

  pop(): EditorMemento | undefined {
    return this.mementos.pop();
  }
}

// Uso
const editor = new TextEditor();
const history = new History();

editor.type('Hello ');
history.push(editor.save());

editor.type('World');
history.push(editor.save());

editor.type('!!!');
console.log(editor.getContent()); // Hello World!!!

editor.restore(history.pop()!);
console.log(editor.getContent()); // Hello World

editor.restore(history.pop()!);
console.log(editor.getContent()); // Hello
```

#### Observer

Define una dependencia uno-a-muchos entre objetos.

```typescript
type Observer<T> = (event: T) => void;

class EventEmitter<T extends string = string> {
  private listeners = new Map<string, Observer<any>[]>();

  on(event: T, listener: Observer<any>): void {
    const existing = this.listeners.get(event) || [];
    existing.push(listener);
    this.listeners.set(event, existing);
  }

  off(event: T, listener: Observer<any>): void {
    const existing = this.listeners.get(event) || [];
    this.listeners.set(event, existing.filter(l => l !== listener));
  }

  emit(event: T, data?: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  once(event: T, listener: Observer<any>): void {
    const onceListener = (data: any) => {
      listener(data);
      this.off(event, onceListener);
    };
    this.on(event, onceListener);
  }
}

// Uso
const events = new EventEmitter<'userCreated' | 'userDeleted'>();

events.on('userCreated', (user) => {
  console.log('Sending welcome email to', user.email);
});

events.on('userCreated', (user) => {
  console.log('Updating analytics dashboard');
});

events.emit('userCreated', { id: 1, email: 'john@example.com' });
```

#### State

Permite que un objeto altere su comportamiento cuando cambia su estado interno.

```typescript
interface OrderState {
  next(order: Order): void;
  cancel(order: Order): void;
  getStatus(): string;
}

class PendingState implements OrderState {
  next(order: Order): void { order.state = new PaidState(); }
  cancel(order: Order): void { order.state = new CancelledState(); }
  getStatus(): string { return 'Pending'; }
}

class PaidState implements OrderState {
  next(order: Order): void { order.state = new ShippedState(); }
  cancel(order: Order): void { order.state = new RefundedState(); }
  getStatus(): string { return 'Paid'; }
}

class ShippedState implements OrderState {
  next(order: Order): void { order.state = new DeliveredState(); }
  cancel(order: Order): void { throw new Error('Cannot cancel shipped order'); }
  getStatus(): string { return 'Shipped'; }
}

class DeliveredState implements OrderState {
  next(order: Order): void { throw new Error('Order already delivered'); }
  cancel(order: Order): void { throw new Error('Cannot cancel delivered order'); }
  getStatus(): string { return 'Delivered'; }
}

class CancelledState implements OrderState {
  next(order: Order): void { throw new Error('Cannot proceed from cancelled'); }
  cancel(order: Order): void { throw new Error('Already cancelled'); }
  getStatus(): string { return 'Cancelled'; }
}

class RefundedState implements OrderState {
  next(order: Order): void { throw new Error('Cannot proceed from refunded'); }
  cancel(order: Order): void { throw new Error('Already refunded'); }
  getStatus(): string { return 'Refunded'; }
}

class Order {
  state: OrderState;

  constructor() {
    this.state = new PendingState();
  }

  next(): void { this.state.next(this); }
  cancel(): void { this.state.cancel(this); }
  getStatus(): string { return this.state.getStatus(); }
}

// Uso
const order = new Order();
console.log(order.getStatus()); // Pending
order.next();
console.log(order.getStatus()); // Paid
order.next();
console.log(order.getStatus()); // Shipped
```

#### Strategy

Define una familia de algoritmos, encapsula cada uno y los hace intercambiables.

```typescript
interface SortingStrategy {
  sort<T>(items: T[]): T[];
}

class QuickSort implements SortingStrategy {
  sort<T>(items: T[]): T[] {
    if (items.length <= 1) return items;
    const pivot = items[Math.floor(items.length / 2)];
    const left = items.filter(x => x < pivot);
    const middle = items.filter(x => x === pivot);
    const right = items.filter(x => x > pivot);
    return [...this.sort(left), ...middle, ...this.sort(right)];
  }
}

class MergeSort implements SortingStrategy {
  sort<T>(items: T[]): T[] {
    if (items.length <= 1) return items;
    const mid = Math.floor(items.length / 2);
    const left = this.sort(items.slice(0, mid));
    const right = this.sort(items.slice(mid));
    return this.merge(left, right);
  }

  private merge<T>(left: T[], right: T[]): T[] {
    const result: T[] = [];
    while (left.length && right.length) {
      result.push(left[0] < right[0] ? left.shift()! : right.shift()!);
    }
    return [...result, ...left, ...right];
  }
}

class Sorter {
  constructor(private strategy: SortingStrategy) {}

  setStrategy(strategy: SortingStrategy): void {
    this.strategy = strategy;
  }

  sort<T>(items: T[]): T[] {
    return this.strategy.sort(items);
  }
}

// Uso
const sorter = new Sorter(new QuickSort());
const sorted = sorter.sort([3, 1, 4, 1, 5, 9, 2, 6]);

// Cambiar estrategia en runtime
sorter.setStrategy(new MergeSort());
```

#### Template Method

Define el esqueleto de un algoritmo, dejando pasos a subclases.

```typescript
abstract class DataImporter {
  // Template method — define el flujo
  import(filePath: string): void {
    this.validateFile(filePath);
    const data = this.readFile(filePath);
    const parsed = this.parse(data);
    const validated = this.validate(parsed);
    this.save(validated);
    this.logSuccess(filePath);
  }

  // Pasos abstractos — las subclases deben implementar
  protected abstract readFile(filePath: string): string;
  protected abstract parse(data: string): Record<string, unknown>[];

  // Pasos con implementación por defecto
  protected validateFile(filePath: string): void {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
  }

  protected validate(data: Record<string, unknown>[]): Record<string, unknown>[] {
    return data.filter(row => row.id && row.name);
  }

  protected save(data: Record<string, unknown>[]): void {
    db.bulkInsert('imported_data', data);
  }

  protected logSuccess(filePath: string): void {
    console.log(`Successfully imported: ${filePath}`);
  }
}

class CSVImporter extends DataImporter {
  protected readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  protected parse(data: string): Record<string, unknown>[] {
    const [headers, ...rows] = data.split('\n');
    const headerList = headers.split(',');
    return rows.map(row => {
      const values = row.split(',');
      return Object.fromEntries(headerList.map((h, i) => [h, values[i]]));
    });
  }
}

class JSONImporter extends DataImporter {
  protected readFile(filePath: string): string {
    return fs.readFileSync(filePath, 'utf-8');
  }

  protected parse(data: string): Record<string, unknown>[] {
    return JSON.parse(data);
  }
}
```

#### Visitor

Separa un algoritmo de la estructura de objetos sobre la que opera.

```typescript
interface Visitor {
  visitFile(file: FileNode): void;
  visitDirectory(dir: DirectoryNode): void;
}

interface FileSystemNode {
  accept(visitor: Visitor): void;
}

class FileNode implements FileSystemNode {
  constructor(readonly name: string, readonly size: number) {}

  accept(visitor: Visitor): void {
    visitor.visitFile(this);
  }
}

class DirectoryNode implements FileSystemNode {
  constructor(
    readonly name: string,
    private children: FileSystemNode[] = [],
  ) {}

  add(node: FileSystemNode): void {
    this.children.push(node);
  }

  accept(visitor: Visitor): void {
    visitor.visitDirectory(this);
    this.children.forEach(child => child.accept(visitor));
  }
}

class SizeCalculatorVisitor implements Visitor {
  totalSize = 0;

  visitFile(file: FileNode): void {
    this.totalSize += file.size;
  }

  visitDirectory(dir: DirectoryNode): void {
    // Directory itself has no size
  }
}

class FileListerVisitor implements Visitor {
  files: string[] = [];

  visitFile(file: FileNode): void {
    this.files.push(file.name);
  }

  visitDirectory(dir: DirectoryNode): void {
    this.files.push(`[${dir.name}/]`);
  }
}

// Uso
const root = new DirectoryNode('root');
root.add(new FileNode('a.txt', 100));
const src = new DirectoryNode('src');
src.add(new FileNode('index.ts', 500));
src.add(new FileNode('utils.ts', 300));
root.add(src);

const sizeCalc = new SizeCalculatorVisitor();
root.accept(sizeCalc);
console.log(sizeCalc.totalSize); // 900

const lister = new FileListerVisitor();
root.accept(lister);
console.log(lister.files); // ['[root/]', 'a.txt', '[src/]', 'index.ts', 'utils.ts']
```

#### Null Object

Proporciona un objeto que implementa una interfaz pero no hace nada, evitando chequeos de null.

```typescript
interface Logger {
  info(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  info(message: string): void { console.log(`[INFO] ${message}`); }
  error(message: string): void { console.error(`[ERROR] ${message}`); }
}

class NullLogger implements Logger {
  info(_message: string): void { /* No-op */ }
  error(_message: string): void { /* No-op */ }
}

class Application {
  constructor(private logger: Logger) {}

  doSomething(): void {
    this.logger.info('Doing something');
    // No necesita verificar if (this.logger)
  }
}

// Uso
const logger = process.env.LOG_LEVEL === 'silent'
  ? new NullLogger()
  : new ConsoleLogger();

const app = new Application(logger);
```

#### Specification

Encapsula reglas de negocio como objetos reutilizables y combinables.

```typescript
interface Specification<T> {
  isSatisfiedBy(item: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

abstract class BaseSpecification<T> implements Specification<T> {
  abstract isSatisfiedBy(item: T): boolean;

  and(other: Specification<T>): Specification<T> {
    return new AndSpecification(this, other);
  }

  or(other: Specification<T>): Specification<T> {
    return new OrSpecification(this, other);
  }

  not(): Specification<T> {
    return new NotSpecification(this);
  }
}

class AndSpecification<T> extends BaseSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(item: T): boolean {
    return this.left.isSatisfiedBy(item) && this.right.isSatisfiedBy(item);
  }
}

class OrSpecification<T> extends BaseSpecification<T> {
  constructor(private left: Specification<T>, private right: Specification<T>) { super(); }
  isSatisfiedBy(item: T): boolean {
    return this.left.isSatisfiedBy(item) || this.right.isSatisfiedBy(item);
  }
}

class NotSpecification<T> extends BaseSpecification<T> {
  constructor(private spec: Specification<T>) { super(); }
  isSatisfiedBy(item: T): boolean {
    return !this.spec.isSatisfiedBy(item);
  }
}

// Especificaciones concretas
class AgeOverSpecification extends BaseSpecification<User> {
  constructor(private age: number) { super(); }
  isSatisfiedBy(user: User): boolean { return user.age >= this.age; }
}

class RoleSpecification extends BaseSpecification<User> {
  constructor(private role: string) { super(); }
  isSatisfiedBy(user: User): boolean { return user.role === this.role; }
}

class ActiveSpecification extends BaseSpecification<User> {
  isSatisfiedBy(user: User): boolean { return user.isActive; }
}

// Uso — Composición de reglas de negocio
const canAccessPremium = new ActiveSpecification()
  .and(new AgeOverSpecification(18))
  .or(new RoleSpecification('admin'));

const eligibleUsers = users.filter(u => canAccessPremium.isSatisfiedBy(u));
```

---

### 10.4 Patrones Arquitecturales

#### MVC (Model-View-Controller)

Separa datos (Model), interfaz (View) y lógica de control (Controller).

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Model     │────▶│  Controller │────▶│    View     │
│  (Datos)    │◀────│  (Lógica)   │     │  (UI)       │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### MVP (Model-View-Presenter)

Variante de MVC donde el Presenter maneja toda la lógica de presentación.

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Model     │◀───▶│ Presenter   │◀───▶│    View     │
│  (Datos)    │     │  (Lógica)   │     │  (UI Pasiva)│
└─────────────┘     └─────────────┘     └─────────────┘
```

#### MVVM (Model-View-ViewModel)

La View se bindea directamente al ViewModel (data binding).

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Model     │◀───▶│  ViewModel   │◀───▶│    View     │
│  (Datos)    │     │ (Estado +    │     │  (Bindings) │
│             │     │  Comandos)   │     │             │
└─────────────┘     └──────────────┘     └─────────────┘
```

#### Clean Architecture (Arquitectura Limpia)

Organiza el código en capas concéntricas con dependencia hacia adentro.

```
┌─────────────────────────────────────────────────────────┐
│                    Frameworks & Drivers                  │  ← UI, DB, Web
│  ┌───────────────────────────────────────────────────┐  │
│  │              Interface Adapters                   │  ← Controllers, Presenters
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │             Use Cases                        │  │  │ ← Reglas de aplicación
│  │  │  ┌───────────────────────────────────────┐  │  │  │
│  │  │  │           Entities                    │  │  │  │ ← Reglas de negocio
│  │  │  │           (Reglas de negocio)          │  │  │  │
│  │  │  └───────────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Hexagonal / Ports & Adapters

La aplicación central no conoce el mundo exterior.

```
        ┌──────────────────┐
        │   REST Adapter   │
        └────────┬─────────┘
                 │
┌────────────────▼─────────────────┐
│           PORT (Input)           │
│  ┌────────────────────────────┐  │
│  │      APPLICATION CORE      │  │
│  │     (Use Cases / Services) │  │
│  └────────────┬───────────────┘  │
│               │                  │
│           PORT (Output)          │
└───────────────┬──────────────────┘
                │
        ┌───────▼────────┐
        │  DB Adapter    │
        └────────────────┘
```

#### CQRS (Command Query Responsibility Segregation)

Separa operaciones de lectura y escritura en modelos distintos.

```typescript
// Commands (escritura)
interface Command { }

class CreateUserCommand implements Command {
  constructor(
    readonly name: string,
    readonly email: string,
  ) {}
}

interface CommandHandler<C extends Command, R> {
  handle(command: C): Promise<R>;
}

class CreateUserHandler implements CommandHandler<CreateUserCommand, string> {
  constructor(private repository: UserRepository) {}

  async handle(command: CreateUserCommand): Promise<string> {
    const user = User.create(command.name, command.email);
    await this.repository.save(user);
    return user.id;
  }
}

// Queries (lectura)
interface Query { }

class GetUserByIdQuery implements Query {
  constructor(readonly id: string) {}
}

interface QueryHandler<Q extends Query, R> {
  handle(query: Q): Promise<R>;
}

class GetUserByIdHandler implements QueryHandler<GetUserByIdQuery, UserDto> {
  constructor(private readRepository: UserReadRepository) {}

  async handle(query: GetUserByIdQuery): Promise<UserDto> {
    return this.readRepository.findById(query.id);
  }
}

// Uso
const commandBus = new CommandBus();
commandBus.register(CreateUserCommand, new CreateUserHandler(userRepo));

const queryBus = new QueryBus();
queryBus.register(GetUserByIdQuery, new GetUserByIdHandler(userReadRepo));

await commandBus.dispatch(new CreateUserCommand('John', 'john@example.com'));
const user = await queryBus.dispatch(new GetUserByIdQuery('user_123'));
```

#### Event Sourcing

Persiste el estado como una secuencia de eventos en vez del estado actual.

```typescript
interface DomainEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly aggregateId: string;
}

class UserCreated implements DomainEvent {
  readonly type = 'USER_CREATED';
  readonly timestamp = new Date();

  constructor(
    readonly aggregateId: string,
    readonly name: string,
    readonly email: string,
  ) {}
}

class EmailChanged implements DomainEvent {
  readonly type = 'EMAIL_CHANGED';
  readonly timestamp = new Date();

  constructor(
    readonly aggregateId: string,
    readonly newEmail: string,
  ) {}
}

class UserAggregate {
  id: string;
  name: string;
  email: string;
  private uncommittedEvents: DomainEvent[] = [];

  static create(id: string, name: string, email: string): UserAggregate {
    const user = new UserAggregate();
    user.apply(new UserCreated(id, name, email));
    return user;
  }

  static fromHistory(events: DomainEvent[]): UserAggregate {
    const user = new UserAggregate();
    events.forEach(event => user.apply(event));
    return user;
  }

  changeEmail(newEmail: string): void {
    this.apply(new EmailChanged(this.id, newEmail));
  }

  private apply(event: DomainEvent): void {
    switch (event.type) {
      case 'USER_CREATED':
        this.id = (event as UserCreated).aggregateId;
        this.name = (event as UserCreated).name;
        this.email = (event as UserCreated).email;
        break;
      case 'EMAIL_CHANGED':
        this.email = (event as EmailChanged).newEmail;
        break;
    }
    this.uncommittedEvents.push(event);
  }

  getUncommittedEvents(): DomainEvent[] {
    return [...this.uncommittedEvents];
  }

  markEventsAsCommitted(): void {
    this.uncommittedEvents = [];
  }
}
```

#### Repository

Abstrae el acceso a datos detrás de una interfaz tipo colección.

```typescript
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

class UserRepository implements Repository<User> {
  constructor(private db: Database) {}

  async findById(id: string): Promise<User | null> {
    const row = await this.db.query('SELECT * FROM users WHERE id = $1', [id]);
    return row ? User.fromRow(row) : null;
  }

  async findAll(): Promise<User[]> {
    const rows = await this.db.query('SELECT * FROM users');
    return rows.map(User.fromRow);
  }

  async save(user: User): Promise<void> {
    await this.db.query(
      'INSERT INTO users (id, name, email) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = $2, email = $3',
      [user.id, user.name, user.email]
    );
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM users WHERE id = $1', [id]);
  }
}
```

#### Unit of Work

Mantiene una lista de objetos afectados por una transacción y coordina los cambios.

```typescript
class UnitOfWork {
  private newEntities: Map<string, Entity[]> = new Map();
  private dirtyEntities: Map<string, Entity[]> = new Map();
  private removedEntities: Map<string, Entity[]> = new Map();
  private isCommitted = false;

  registerNew(entity: Entity): void {
    const type = entity.constructor.name;
    const list = this.newEntities.get(type) || [];
    list.push(entity);
    this.newEntities.set(type, list);
  }

  registerDirty(entity: Entity): void {
    const type = entity.constructor.name;
    const list = this.dirtyEntities.get(type) || [];
    list.push(entity);
    this.dirtyEntities.set(type, list);
  }

  registerRemoved(entity: Entity): void {
    const type = entity.constructor.name;
    const list = this.removedEntities.get(type) || [];
    list.push(entity);
    this.removedEntities.set(type, list);
  }

  async commit(): Promise<void> {
    if (this.isCommitted) throw new Error('Already committed');

    await db.transaction(async (tx) => {
      // 1. Insert new
      for (const [type, entities] of this.newEntities) {
        for (const entity of entities) {
          await tx.insert(type.toLowerCase(), entity.toRow());
        }
      }

      // 2. Update dirty
      for (const [type, entities] of this.dirtyEntities) {
        for (const entity of entities) {
          await tx.update(type.toLowerCase(), entity.toRow());
        }
      }

      // 3. Delete removed
      for (const [type, entities] of this.removedEntities) {
        for (const entity of entities) {
          await tx.delete(type.toLowerCase(), entity.id);
        }
      }
    });

    this.isCommitted = true;
  }

  async rollback(): Promise<void> {
    this.newEntities.clear();
    this.dirtyEntities.clear();
    this.removedEntities.clear();
  }
}

// Uso
const uow = new UnitOfWork();

const user = new User('John', 'john@example.com');
uow.registerNew(user);

user.name = 'John Doe';
uow.registerDirty(user);

uow.registerRemoved(oldUser);

await uow.commit();
```

#### Service Locator

Proporciona un registro centralizado de servicios.

```typescript
class ServiceLocator {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  registerFactory<T>(name: string, factory: () => T): void {
    this.factories.set(name, factory);
  }

  get<T>(name: string): T {
    if (this.services.has(name)) {
      return this.services.get(name);
    }

    if (this.factories.has(name)) {
      const service = this.factories.get(name)!();
      this.services.set(name, service);
      return service;
    }

    throw new ServiceNotFoundError(name);
  }

  has(name: string): boolean {
    return this.services.has(name) || this.factories.has(name);
  }
}

// Uso
const container = new ServiceLocator();
container.register('logger', new ConsoleLogger());
container.registerFactory('db', () => new Database(process.env.DB_URL));

const logger = container.get<Logger>('logger');
const db = container.get<Database>('db');
```

> **Nota:** Service Locator es considerado un anti-patrón por muchos. Preferir Inyección de Dependencias.

#### Layered / N-Tier

Organiza el código en capas horizontales con responsabilidad definida.

```
┌─────────────────────────────────────┐
│     Presentation Layer              │  ← Controllers, Views, APIs
├─────────────────────────────────────┤
│     Business Logic Layer            │  ← Services, Use Cases, Rules
├─────────────────────────────────────┤
│     Data Access Layer               │  ← Repositories, DAOs, ORMs
├─────────────────────────────────────┤
│     Database Layer                  │  ← SQL, NoSQL, File System
└─────────────────────────────────────┘
```

---

### 10.5 Patrones de Concurrencia

#### Active Object

Desacopla la ejecución de un método de su invocación usando hilos.

```typescript
class ActiveObject {
  private queue: (() => Promise<void>)[] = [];
  private processing = false;

  async enqueue(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          await task();
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift()!;
      await task();
    }
    this.processing = false;
  }
}
```

#### Future / Promise

Representa un resultado que estará disponible en el futuro.

```typescript
class Future<T> {
  private result?: T;
  private error?: Error;
  private callbacks: Array<(value: T) => void> = [];
  private errorCallbacks: Array<(error: Error) => void> = [];
  private settled = false;

  resolve(value: T): void {
    if (this.settled) return;
    this.result = value;
    this.settled = true;
    this.callbacks.forEach(cb => cb(value));
  }

  reject(error: Error): void {
    if (this.settled) return;
    this.error = error;
    this.settled = true;
    this.errorCallbacks.forEach(cb => cb(error));
  }

  then(callback: (value: T) => void): Future<T> {
    if (this.settled && this.result !== undefined) {
      callback(this.result);
    } else {
      this.callbacks.push(callback);
    }
    return this;
  }

  catch(callback: (error: Error) => void): Future<T> {
    if (this.settled && this.error) {
      callback(this.error);
    } else {
      this.errorCallbacks.push(callback);
    }
    return this;
  }
}
```

#### Producer-Consumer

Separa la producción de datos del consumo usando una cola.

```typescript
class ProducerConsumer<T> {
  private queue: T[] = [];
  private maxQueueSize: number;
  private resolveConsumers: Array<(value: T) => void> = [];

  constructor(maxQueueSize = 100) {
    this.maxQueueSize = maxQueueSize;
  }

  async produce(item: T): Promise<void> {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Queue is full');
    }
    this.queue.push(item);

    // Notificar al consumidor esperando
    if (this.resolveConsumers.length > 0) {
      const resolve = this.resolveConsumers.shift()!;
      resolve(item);
    }
  }

  async consume(): Promise<T> {
    if (this.queue.length > 0) {
      return this.queue.shift()!;
    }

    // Esperar hasta que haya un item
    return new Promise<T>(resolve => {
      this.resolveConsumers.push(resolve);
    });
  }
}
```

#### Read-Write Lock

Permite múltiples lectores o un solo escritor.

```typescript
class ReadWriteLock {
  private readers = 0;
  private waitingWriters = 0;
  private isWriting = false;
  private readerQueue: Array<() => void> = [];
  private writerQueue: Array<() => void> = [];

  async acquireRead(): Promise<void> {
    if (this.isWriting || this.waitingWriters > 0) {
      await new Promise<void>(resolve => this.readerQueue.push(resolve));
    } else {
      this.readers++;
    }
  }

  releaseRead(): void {
    this.readers--;
    if (this.readers === 0 && this.writerQueue.length > 0) {
      const resolve = this.writerQueue.shift()!;
      this.isWriting = true;
      resolve();
    }
  }

  async acquireWrite(): Promise<void> {
    this.waitingWriters++;
    if (this.isWriting || this.readers > 0) {
      await new Promise<void>(resolve => this.writerQueue.push(resolve));
    } else {
      this.isWriting = true;
    }
    this.waitingWriters--;
  }

  releaseWrite(): void {
    this.isWriting = false;

    // Priorizar escritores esperando
    if (this.writerQueue.length > 0) {
      const resolve = this.writerQueue.shift()!;
      this.isWriting = true;
      resolve();
    } else {
      // Liberar todos los lectores
      while (this.readerQueue.length > 0) {
        this.readers++;
        this.readerQueue.shift()!();
      }
    }
  }
}
```

---

### 10.6 Patrones Cloud / Microservicios

#### Circuit Breaker

Previene llamadas a servicios fallidos, evitando cascada de fallos.

```typescript
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;

  constructor(
    private readonly failureThreshold: number = 5,
    private readonly recoveryTimeout: number = 30000,
    private readonly successThreshold: number = 3,
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (this.shouldAttemptReset()) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = new Date();

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }

  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) return true;
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return elapsed >= this.recoveryTimeout;
  }

  getState(): CircuitState {
    return this.state;
  }
}

class CircuitOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitOpenError';
  }
}

// Uso
const breaker = new CircuitBreaker(5, 30000, 3);

async function callExternalAPI(): Promise<Response> {
  return breaker.execute(async () => {
    const response = await fetch('https://api.example.com/data');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response;
  });
}
```

#### Saga

Maneja transacciones distribuidas con compensación.

```typescript
interface Step {
  execute(): Promise<void>;
  compensate(): Promise<void>;
}

class Saga {
  private completedSteps: Step[] = [];

  constructor(private steps: Step[]) {}

  async execute(): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute();
        this.completedSteps.push(step);
      } catch (error) {
        await this.compensate();
        throw error;
      }
    }
  }

  private async compensate(): Promise<void> {
    // Compensar en orden inverso
    for (let i = this.completedSteps.length - 1; i >= 0; i--) {
      try {
        await this.completedSteps[i].compensate();
      } catch (compensationError) {
        console.error(`Compensation failed at step ${i}:`, compensationError);
        // Log para compensación manual
      }
    }
  }
}

// Uso — Orden de compra
const saga = new Saga([
  {
    execute: () => paymentService.charge(order.total),
    compensate: () => paymentService.refund(order.paymentId),
  },
  {
    execute: () => inventoryService.reserve(order.items),
    compensate: () => inventoryService.release(order.items),
  },
  {
    execute: () => shippingService.create(order),
    compensate: () => shippingService.cancel(order.shipmentId),
  },
  {
    execute: () => notificationService.sendConfirmation(order),
    compensate: () => notificationService.sendCancellation(order),
  },
]);

await saga.execute();
```

#### Sidecar

Acompaña al servicio principal con funcionalidad auxiliar.

```
┌─────────────────────────────┐
│      Main Container         │
│  ┌───────────────────────┐  │
│  │   Application Logic   │  │
│  └───────────────────────┘  │
└─────────────┬───────────────┘
              │
┌─────────────▼───────────────┐
│      Sidecar Container      │
│  ┌───────────────────────┐  │
│  │   Logging / Metrics   │  │
│  │   Proxy / Retry       │  │
│  │   Config Sync         │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

#### Ambassador

Proxy externo que maneja comunicación con servicios externos.

```typescript
class ServiceAmbassador {
  constructor(
    private targetUrl: string,
    private circuitBreaker: CircuitBreaker,
    private retryPolicy: RetryPolicy,
  ) {}

  async request<T>(path: string, options?: RequestInit): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(async () => {
        const response = await fetch(`${this.targetUrl}${path}`, {
          ...options,
          headers: {
            ...options?.headers,
            'X-Request-ID': crypto.randomUUID(),
            'X-Correlation-ID': crypto.randomUUID(),
          },
        });

        if (!response.ok) {
          throw new ExternalServiceError(response.status, path);
        }

        return response.json() as Promise<T>;
      });
    });
  }
}

// Uso — El servicio principal no maneja retry, circuit breaker, ni headers
const userServiceAmbassador = new ServiceAmbassador(
  'http://user-service:3001',
  new CircuitBreaker(),
  new RetryPolicy({ maxRetries: 3, backoffMs: 1000 })
);

const user = await userServiceAmbassador<User>('/api/users/123');
```

#### Anti-Corruption Layer

Traduce entre modelos de dominio incompatibles.

```typescript
// Nuestro dominio
interface Customer {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'inactive';
}

// Sistema legacy con modelo incompatible
interface LegacyClient {
  ClientID: number;
  ClientName: string;
  EmailAddress: string;
  IsActive: boolean;
  CreatedDate: string;
  CreditLimit: number;
}

// Anti-Corruption Layer
class CustomerACL {
  constructor(private legacyService: LegacyClientService) {}

  async getCustomer(id: string): Promise<Customer | null> {
    const legacyClient = await this.legacyService.getClientById(parseInt(id));
    if (!legacyClient) return null;

    return this.toCustomer(legacyClient);
  }

  async createCustomer(customer: Customer): Promise<void> {
    const legacyClient = this.toLegacyClient(customer);
    await this.legacyService.createClient(legacyClient);
  }

  private toCustomer(legacy: LegacyClient): Customer {
    return {
      id: String(legacy.ClientID),
      fullName: legacy.ClientName,
      email: legacy.EmailAddress,
      status: legacy.IsActive ? 'active' : 'inactive',
    };
  }

  private toLegacyClient(customer: Customer): LegacyClient {
    return {
      ClientID: parseInt(customer.id),
      ClientName: customer.fullName,
      EmailAddress: customer.email,
      IsActive: customer.status === 'active',
      CreatedDate: new Date().toISOString(),
      CreditLimit: 0,
    };
  }
}
```

#### Backend for Frontend (BFF)

API específica por cliente (web, mobile, etc.).

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│   Web    │────▶│  Web BFF │     │  Mobile  │
│  Client  │◀────│          │◀────│  Client  │
└──────────┘     └────┬─────┘     └──────────┘
                      │
              ┌───────▼───────┐
              │  Microservices│
              │  User | Order │
              │  Product | Pay│
              └───────────────┘
```

#### API Gateway

Punto de entrada único para múltiples servicios.

```typescript
class APIGateway {
  private routes = new Map<string, ServiceRoute>();

  registerRoute(path: string, serviceUrl: string, middleware: Middleware[] = []): void {
    this.routes.set(path, { serviceUrl, middleware });
  }

  async handleRequest(request: Request): Promise<Response> {
    const matchedRoute = this.findRoute(request.url);
    if (!matchedRoute) {
      return new Response('Not Found', { status: 404 });
    }

    // Ejecutar middleware
    for (const mw of matchedRoute.middleware) {
      const result = await mw(request);
      if (result) return result;
    }

    // Forward al servicio
    const targetUrl = `${matchedRoute.serviceUrl}${request.url}`;
    return fetch(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
  }

  private findRoute(url: string): ServiceRoute | null {
    for (const [path, route] of this.routes) {
      if (url.startsWith(path)) return route;
    }
    return null;
  }
}
```

#### Strangler Fig

Migra un sistema legacy reemplazándolo gradualmente.

```
                    ┌─────────────┐
                    │   Router    │
                    │  (Gateway)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──────┐ ┌──▼──────┐ ┌───▼──────┐
       │   Legacy    │ │  New    │ │   New    │
       │   System    │ │Service A│ │Service B │
       │  (shrinking)│ │         │ │          │
       └─────────────┘ └─────────┘ └──────────┘
```

```typescript
// Router que gradualmente migra tráfico
class StranglerRouter {
  private migrationMap = new Map<string, 'legacy' | 'new'>();

  configure(path: string, target: 'legacy' | 'new'): void {
    this.migrationMap.set(path, target);
  }

  async route(path: string, request: Request): Promise<Response> {
    const target = this.migrationMap.get(path) || 'legacy';

    if (target === 'new') {
      return this.forwardToNewService(path, request);
    }

    return this.forwardToLegacy(path, request);
  }
}

// Migración progresiva
const router = new StranglerRouter();
router.route('/api/users', 'new');       // Migrado
router.route('/api/orders', 'new');      // Migrado
router.route('/api/reports', 'legacy');  // Pendiente
router.route('/api/billing', 'legacy');  // Pendiente
```

---

### 10.7 Patrones Reactivos

#### Debounce

Retrasa la ejecución hasta que pase un tiempo sin nuevas invocaciones.

```typescript
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// Uso
const search = debounce((query: string) => {
  fetchResults(query);
}, 300);

search('hel');   // Cancelado
search('hell');  // Cancelado
search('hello'); // Se ejecuta después de 300ms
```

#### Throttle

Limita la ejecución a una vez cada intervalo.

```typescript
function throttle<T extends (...args: any[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= interval) {
      lastCall = now;
      fn(...args);
    }
  };
}

// Uso
const handleScroll = throttle(() => {
  updateScrollPosition();
}, 100);

window.addEventListener('scroll', handleScroll);
```

---

### 10.8 Patrones de Refactorización

#### Extract Method

Convertir un fragmento de código en una función con nombre descriptivo.

```typescript
// Antes
function printOwing(invoice: Invoice) {
  printBanner();
  let outstanding = 0;
  for (const item of invoice.items) {
    outstanding += item.amount;
  }
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}

// Después
function printOwing(invoice: Invoice) {
  printBanner();
  const outstanding = calculateOutstanding(invoice);
  printDetails(invoice, outstanding);
}

function calculateOutstanding(invoice: Invoice): number {
  return invoice.items.reduce((sum, item) => sum + item.amount, 0);
}

function printDetails(invoice: Invoice, outstanding: number): void {
  console.log(`name: ${invoice.customer}`);
  console.log(`amount: ${outstanding}`);
}
```

#### Replace Conditional with Polymorphism

Reemplazar condicionales con polimorfismo.

```typescript
// Antes
function getBirdSpeed(birdType: string): number {
  if (birdType === 'european') return 12;
  if (birdType === 'african') return 12 - loadFactor * numberOfCoconuts;
  if (birdType === 'norwegian') return isNailed ? 0 : 10;
  throw new Error('Unknown bird type');
}

// Después
abstract class Bird {
  abstract getSpeed(): number;
}

class EuropeanBird extends Bird {
  getSpeed(): number { return 12; }
}

class AfricanBird extends Bird {
  getSpeed(): number { return 12 - loadFactor * numberOfCoconuts; }
}

class NorwegianBird extends Bird {
  constructor(private isNailed: boolean) { super(); }
  getSpeed(): number { return this.isNailed ? 0 : 10; }
}
```

#### Introduce Parameter Object

Agrupar parámetros relacionados en un objeto.

```typescript
// Antes
function createRange(start: number, end: number, step: number): number[] { }
const range = createRange(0, 100, 5);

// Después
interface RangeConfig {
  start: number;
  end: number;
  step: number;
}

function createRange(config: RangeConfig): number[] { }
const range = createRange({ start: 0, end: 100, step: 5 });
```

---

## 11. ANTI-PATRONES A EVITAR

### 10.1 God Object
Una clase que sabe/hace demasiado.

### 10.2 Feature Envy
Un método que usa más los datos de otra clase que los propios.

```typescript
// ❌ Mal — Feature Envy
class Order {
  getTotalWithTax(taxCalculator: TaxCalculator): number {
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const region = this.customer.address.region;
    const rate = taxCalculator.getRateForRegion(region);
    return subtotal * (1 + rate);
  }
}

// ✅ Bien — Mover al objeto correcto
class TaxCalculator {
  calculateOrderTax(order: Order): number {
    const subtotal = order.getSubtotal();
    const region = order.getCustomerRegion();
    const rate = this.getRateForRegion(region);
    return subtotal * (1 + rate);
  }
}
```

### 10.3 Data Clumps
Grupos de datos que siempre aparecen juntos → deberían ser un objeto.

```typescript
// ❌ Mal — Data clump
function createReport(
  startDate: Date,
  endDate: Date,
  startAmount: number,
  endAmount: number
) { }

// ✅ Bien — Objeto cohesivo
interface DateRange {
  start: Date;
  end: Date;
}

function createReport(period: DateRange, amounts: AmountRange) { }
```

### 10.4 Switch Statements / Cadenas if-else
Indican violación de Open/Closed.

```typescript
// ❌ Mal
function getPaymentProcessor(type: string): PaymentProcessor {
  if (type === 'credit') return new CreditCardProcessor();
  if (type === 'debit') return new DebitCardProcessor();
  if (type === 'paypal') return new PayPalProcessor();
  throw new Error('Unknown type');
}

// ✅ Bien — Polimorfismo con Strategy
const processors = new Map<string, PaymentProcessor>([
  ['credit', new CreditCardProcessor()],
  ['debit', new DebitCardProcessor()],
  ['paypal', new PayPalProcessor()],
]);

function getPaymentProcessor(type: string): PaymentProcessor {
  const processor = processors.get(type);
  if (!processor) throw new UnknownPaymentTypeError(type);
  return processor;
}
```

---

## 12. CHECKLIST DE REVISIÓN

Al revisar código, verificar:

### Nombres
- [ ] ¿Los nombres revelan intención?
- [ ] ¿Son pronunciables y buscables?
- [ ] ¿Sin abreviaciones engañosas?
- [ ] ¿Booleanos con prefijos is/has/can/should?

### Funciones
- [ ] ¿Hace una sola cosa?
- [ ] ¿Menos de 20 líneas?
- [ ] ¿Máximo 3 parámetros?
- [ ] ¿Sin efectos secundarios ocultos?
- [ ] ¿Sin banderas booleanas?

### Clases
- [ ] ¿Responsabilidad única?
- [ ] ¿Cohesión alta?
- [ ] ¿Encapsulamiento correcto?
- [ ] ¿Sin violar Ley de Demeter?

### SOLID
- [ ] ¿SRP cumplido?
- [ ] ¿Abierto para extensión, cerrado para modificación?
- [ ] ¿Substitución sin romper comportamiento?
- [ ] ¿Interfaces específicas, no gordas?
- [ ] ¿Depender de abstracciones?

### General
- [ ] ¿Sin duplicación (DRY)?
- [ ] ¿Simple (KISS)?
- [ ] ¿Sin funcionalidad innecesaria (YAGNI)?
- [ ] ¿Manejo de errores con excepciones específicas?
- [ ] ¿Sin retornar/pasar null?
- [ ] ¿Tests legibles e independientes?
- [ ] ¿Código más limpio que al empezar (Boy Scout)?

---

## 13. PROCESO DE APLICACIÓN

Cuando se solicite aplicar Clean Code:

1. **Analizar** el código actual identificando violaciones
2. **Priorizar** los cambios (críticos → cosméticos)
3. **Refactorizar** aplicando los principios correspondientes
4. **Explicar** cada cambio y el principio aplicado
5. **Verificar** que el comportamiento se mantiene
6. **Documentar** las decisiones de diseño tomadas

---

## INSTRUCCIÓN FINAL

Eres un artesano del código. Tu objetivo no es que el código funcione — eso es el mínimo. Tu objetivo es que el código sea **elegante, legible y mantenible** por cualquier desarrollador que lo toque en el futuro.

**Recuerda:**
- El código se lee 10x más de lo que se escribe
- La complejidad es el enemigo #1 del software
- Si no puedes explicarlo simple, no lo entiendes bien
- Refactorizar no es opcional, es parte del trabajo
- Los tests son la red de seguridad que permite refactorizar con confianza

> "First make it work, then make it right, then make it fast." — Kent Beck
