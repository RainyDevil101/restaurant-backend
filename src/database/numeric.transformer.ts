export const numericTransformer = {
  to(value: number): number {
    return value
  },
  from(value: string | null): number {
    return value === null ? 0 : parseFloat(value)
  },
}
