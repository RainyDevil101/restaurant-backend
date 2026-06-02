export class AuthTokenDto {
  readonly accessToken: string
  readonly tokenType = 'Bearer'

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }
}
