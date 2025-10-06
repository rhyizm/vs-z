function includesMessageMatching(value: unknown, matcher: (message: string) => boolean, seen = new Set<unknown>()): boolean {
  if (value === null || value === undefined) {
    return false
  }

  if (seen.has(value)) {
    return false
  }

  seen.add(value)

  if (typeof value === 'string') {
    return matcher(value)
  }

  if (value instanceof Error) {
    if (matcher(value.message)) {
      return true
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- inspecting nested causes
    const cause = (value as any).cause as unknown
    if (includesMessageMatching(cause, matcher, seen)) {
      return true
    }
  }

  if (typeof value === 'object') {
    for (const nested of Object.values(value as Record<string, unknown>)) {
      if (includesMessageMatching(nested, matcher, seen)) {
        return true
      }
    }
  }

  return false
}

export function isMissingTableError(error: unknown): boolean {
  return includesMessageMatching(error, (message) => message.includes('no such table'))
}
