export abstract class Entity {
  readonly id: string

  protected constructor(id: string) {
    this.id = id
  }

  equals(other?: Entity): boolean {
    if (!other) return false
    return this.id === other.id
  }
}
