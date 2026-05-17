---
name: accounting/data-normalization
description: >
  Normalización de datos no estructurados (facturas PDF, recibos, estados de cuenta).
  Trigger: Al procesar facturas, receipts, bank statements, convertir a JSON estructurado.
license: MIT
metadata:
  author: gentleman-programming
  version: "1.0"
---

## Purpose

Convertir documentos contables no estructurados (PDF, imágenes, texto) en registros JSON estandarizados con 100% de precisión. Extraer y validar datos.

## When to Load

- Procesando facturas de proveedores (PDF)
- Importando datos de estados de cuenta bancarios
- Convirtiendo recibos a registros
- Normalizando datos deExcel a estructura contable

## Input Types

| Type | Format | Challenge |
|------|--------|-----------|
| Invoice PDF | scanned/digital | text extraction, layout variance |
| Receipt | image/PDF | low quality, crumpled, partial |
| Bank Statement | CSV/Excel/PDF | formatting, multi-page |
| Excel Import | .xlsx/.csv | inconsistent columns |
| Email attachment | PDF/image | mixed content |

## Normalized Output Structure

```typescript
interface NormalizedInvoice {
  type: 'INVOICE' | 'RECEIPT' | 'BANK_STATEMENT' | 'CREDIT_NOTE' | 'DEBIT_NOTE'
  source: string              // filename or original identifier
  extractionDate: Date
  confidence: number          // 0-1, how sure we are

  // Document header
  documentNumber: string      // invoice number
  documentDate: Date
  dueDate?: Date

  // Parties
  seller: TaxPayer
  buyer: TaxPayer

  // Financial
  subtotal: number
  taxDetails: TaxLine[]
  total: number
  currency: Currency
  exchangeRate?: number

  // Line items
  items: InvoiceLine[]

  // Validation
  isValid: boolean
  validationErrors: string[]
  rawText: string             // for audit/debug
}

interface TaxLine {
  type: 'IVA' | 'ISLR' | 'MUNICIPAL' | 'OTHER'
  base: number
  rate: number
  amount: number
}

interface InvoiceLine {
  description: string
  quantity: number
  unitPrice: number
  total: number
  taxType?: string
  accountCode?: string  // mapped if recognized
}
```

## Extraction Patterns

### Venezuelan Invoice (SENIAT format)

```typescript
const SENIAT_INVOICE_PATTERNS = {
  controlNumber: /Nro\s*de\s*Control:\s*([A-Z0-9-]+)/i,
  fiscalNumber: /RIF\s*:\s*([JVEG]-[0-9]{9})/i,
  invoiceNumber: /Nro\s*Factura:\s*([0-9-]+)/i,
  date: /Fecha\s*:\s*(\d{2}\/\d{2}\/\d{4})/i,
  subtotal: /Sub-total\s*:\s*([\d.,]+)/i,
  iva: /IVA\s*16%?\s*:\s*([\d.,]+)/i,
  total: /Total\s*:\s*([\d.,]+)/i
}

function extractFromSENIATFormat(rawText: string): NormalizedInvoice {
  const data = {}

  for (const [field, regex] of Object.entries(SENIAT_INVOICE_PATTERNS)) {
    const match = rawText.match(regex)
    if (match) data[field] = parseValue(match[1])
  }

  return validateAndNormalize(data)
}
```

## Validation Rules

```typescript
interface ValidationRule {
  field: string
  rule: (value: unknown) => boolean
  errorMessage: string
}

const INVOICE_VALIDATION_RULES: ValidationRule[] = [
  { field: 'documentNumber', rule: v => v?.length > 0, error: 'Número de documento requerido' },
  { field: 'documentDate', rule: v => v instanceof Date && v <= new Date(), error: 'Fecha inválida' },
  { field: 'seller.rif', rule: v => /^[JVEG]-[0-9]{9}$/.test(v), error: 'RIF vendedor inválido' },
  { field: 'total', rule: v => v > 0, error: 'Total debe ser mayor a 0' },
  {
    field: 'taxCalculations',
    rule: v => Math.abs(v.subtotal * v.ivaRate - v.ivaAmount) < 0.01,
    error: 'Monto IVA no cuadra con base y alícuota'
  }
]

function validateInvoice(invoice: NormalizedInvoice): ValidationResult {
  const errors: string[] = []

  for (const rule of INVOICE_VALIDATION_RULES) {
    const value = getNestedValue(invoice, rule.field)
    if (!rule.rule(value)) {
      errors.push(rule.errorMessage)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
```

## OCR Integration Pattern

```typescript
interface OCRResult {
  rawText: string
  confidence: number
  boundingBoxes: BoundingBox[]
}

async function extractFromPDF(pdfPath: string): Promise<OCRResult> {
  // Use PDF.js for text extraction
  const text = await extractTextFromPDF(pdfPath)

  // Fallback to OCR for scanned documents
  if (isScannedDocument(text)) {
    return await runOCR(pdfPath)
  }

  return { rawText: text, confidence: 0.95 }
}
```

## Pipeline

```
PDF/Image → Text Extraction → Pattern Matching → Data Mapping → Validation → Normalized JSON
```

Each step:
1. **Extract**: PDF.js or OCR
2. **Parse**: Regex patterns for known formats
3. **Map**: Map extracted data to NormalizedInvoice structure
4. **Validate**: Apply validation rules
5. **Output**: JSON with confidence score