export const PAPER_WIDTH = {
  MM_58: 58,
  MM_80: 80,
} as const

export type PaperWidthValue = (typeof PAPER_WIDTH)[keyof typeof PAPER_WIDTH]

export const PAPER_COLUMNS: Record<PaperWidthValue, number> = {
  [PAPER_WIDTH.MM_58]: 32,
  [PAPER_WIDTH.MM_80]: 48,
}
