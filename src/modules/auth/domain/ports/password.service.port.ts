export const PASSWORD_SERVICE = Symbol('PASSWORD_SERVICE')

export interface IPasswordService {
  hash(plain: string): Promise<string>
  compare(plain: string, hashed: string): Promise<boolean>
}
