export const ESC = 0x1b
export const GS = 0x1d
export const LF = 0x0a

export function pad(left: string, right: string, w: number): string {
  const room = w - right.length - 1
  const trimmed = left.length > room ? left.slice(0, Math.max(0, room)) : left
  const gap = Math.max(1, w - trimmed.length - right.length)
  return trimmed + ' '.repeat(gap) + right
}

export function wrap(text: string, w: number): string[] {
  const lines: string[] = []
  let current = ''
  for (const word of text.split(/\s+/)) {
    if (current && current.length + word.length + 1 > w) {
      lines.push(current)
      current = word
    } else {
      current = current ? `${current} ${word}` : word
    }
  }
  if (current) lines.push(current)
  return lines.length > 0 ? lines : ['']
}

export function center(text: string, w: number): string[] {
  return wrap(text, w).map((line) => {
    const left = Math.max(0, Math.floor((w - line.length) / 2))
    return ' '.repeat(left) + line
  })
}

export function dateLabel(d: Date): string {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export function encode(text: string): number[] {
  const ascii = text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[·•]/g, '-')
  const out: number[] = []
  for (let i = 0; i < ascii.length; i++) {
    const code = ascii.charCodeAt(i)
    out.push(code < 128 ? code : 0x3f)
  }
  return out
}
