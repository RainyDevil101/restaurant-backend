import type { Socket } from 'socket.io'
import { OrdersGateway } from '@src/modules/orders/infrastructure/realtime/orders.gateway'
import type { ITokenService, TokenPayload } from '@src/modules/auth/domain/ports/token.service.port'

type SocketOpts = { auth?: Record<string, unknown>; headers?: Record<string, unknown> }

function makeSocket(opts: SocketOpts = {}): Socket {
  return {
    handshake: { auth: opts.auth ?? {}, headers: opts.headers ?? {} },
    data: {} as Record<string, unknown>,
    disconnect: jest.fn(),
  } as unknown as Socket
}

describe('OrdersGateway handshake authentication', () => {
  const payload: TokenPayload = { sub: 'user-1', email: 'carlos@subito.cl', role: 'C' }
  let tokens: jest.Mocked<ITokenService>
  let gateway: OrdersGateway

  beforeEach(() => {
    tokens = { sign: jest.fn(), verify: jest.fn() }
    gateway = new OrdersGateway(tokens)
  })

  it('accepts a client with a valid token in handshake.auth', () => {
    tokens.verify.mockReturnValue(payload)
    const client = makeSocket({ auth: { token: 'valid-token' } })

    gateway.handleConnection(client)

    expect(tokens.verify).toHaveBeenCalledWith('valid-token')
    expect(client.data.user).toEqual(payload)
    expect(client.disconnect).not.toHaveBeenCalled()
  })

  it('accepts a token from the Authorization Bearer header', () => {
    tokens.verify.mockReturnValue(payload)
    const client = makeSocket({ headers: { authorization: 'Bearer header-token' } })

    gateway.handleConnection(client)

    expect(tokens.verify).toHaveBeenCalledWith('header-token')
    expect(client.data.user).toEqual(payload)
    expect(client.disconnect).not.toHaveBeenCalled()
  })

  it('disconnects a client whose token is invalid', () => {
    tokens.verify.mockImplementation(() => {
      throw new Error('invalid signature')
    })
    const client = makeSocket({ auth: { token: 'tampered' } })

    gateway.handleConnection(client)

    expect(client.data.user).toBeUndefined()
    expect(client.disconnect).toHaveBeenCalledTimes(1)
  })

  it('disconnects a client that sends no token, without calling verify', () => {
    const client = makeSocket({ auth: {} })

    gateway.handleConnection(client)

    expect(tokens.verify).not.toHaveBeenCalled()
    expect(client.data.user).toBeUndefined()
    expect(client.disconnect).toHaveBeenCalledTimes(1)
  })
})
