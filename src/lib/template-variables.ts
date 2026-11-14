export type TemplateVariableType = 'text' | 'textarea' | 'color' | 'image'

export type TemplateVariableMeta = {
  key: string
  label: string
  type: TemplateVariableType
  default: string
}

const VARIABLE_TYPES = ['text', 'textarea', 'color', 'image'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isVariableType(value: unknown): value is TemplateVariableType {
  return typeof value === 'string' && VARIABLE_TYPES.some((type) => type === value)
}

export function getTemplateVariables(value: unknown): TemplateVariableMeta[] {
  if (!Array.isArray(value)) {
    throw new Error('Métadonnées de variables du template invalides')
  }

  return value.map((item) => {
    if (
      !isRecord(item) ||
      typeof item.key !== 'string' ||
      !/^\w+$/.test(item.key) ||
      typeof item.label !== 'string' ||
      !isVariableType(item.type) ||
      typeof item.default !== 'string'
    ) {
      throw new Error('Métadonnées de variables du template invalides')
    }

    return {
      key: item.key,
      label: item.label,
      type: item.type,
      default: item.default,
    }
  })
}
