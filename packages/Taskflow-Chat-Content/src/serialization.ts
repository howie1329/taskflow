const DEFAULT_MAX_DEPTH = 30

export class ChatContentError extends Error {
  code: string

  constructor(code: string, message: string) {
    super(message)
    this.name = "ChatContentError"
    this.code = code
  }
}

type JsonPrimitive = string | number | boolean | null
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") return false
  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

const sanitizeUnknown = (
  value: unknown,
  seen: WeakSet<object>,
  depth: number
): JsonValue => {
  if (depth > DEFAULT_MAX_DEPTH) {
    throw new ChatContentError(
      "MAX_DEPTH_EXCEEDED",
      "Value exceeds serialization depth limit"
    )
  }

  if (value === null) return null

  const valueType = typeof value
  if (
    valueType === "string" ||
    valueType === "number" ||
    valueType === "boolean"
  ) {
    return value as JsonPrimitive
  }

  if (valueType === "bigint") {
    return String(value)
  }

  if (valueType === "undefined" || valueType === "function" || valueType === "symbol") {
    return null
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item, seen, depth + 1))
  }

  if (value && typeof value === "object") {
    if (seen.has(value)) {
      throw new ChatContentError(
        "CIRCULAR_REFERENCE",
        "Circular references are not serializable"
      )
    }
    seen.add(value)

    if (!isPlainObject(value)) {
      const objectString = String(value)
      return objectString === "[object Object]" ? null : objectString
    }

    const output: Record<string, JsonValue> = {}
    for (const [key, nestedValue] of Object.entries(value)) {
      const sanitized = sanitizeUnknown(nestedValue, seen, depth + 1)
      output[key] = sanitized
    }
    return output
  }

  return null
}

export const makeJsonSerializable = (value: unknown): JsonValue => {
  return sanitizeUnknown(value, new WeakSet<object>(), 0)
}

export const assertJsonSerializable = (value: unknown): void => {
  makeJsonSerializable(value)
}
