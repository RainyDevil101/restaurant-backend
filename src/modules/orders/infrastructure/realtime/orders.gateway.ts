import { Inject, Injectable } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { corsOrigins } from '../../../../config/cors.config'
import { TOKEN_SERVICE, type ITokenService } from '../../../auth/domain/ports/token.service.port'
import type { Order } from '../../domain/entities/order.entity'
import type { IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { WS_EVENT, WS_NAMESPACE, WS_ROOM } from './ws-events.constants'

@Injectable()
@WebSocketGateway({
  cors: { origin: corsOrigins(), credentials: true },
  namespace: WS_NAMESPACE,
})
export class OrdersGateway implements IOrderNotifier, OnGatewayConnection {
  @WebSocketServer()
  private server!: Server

  constructor(@Inject(TOKEN_SERVICE) private readonly tokens: ITokenService) {}

  handleConnection(client: Socket): void {
    try {
      const token = this.extractToken(client)
      if (!token) throw new Error('missing token')
      client.data.user = this.tokens.verify(token)
    } catch {
      client.disconnect()
    }
  }

  @SubscribeMessage(WS_EVENT.JOIN_CHECKOUT)
  async handleJoinCheckout(
    @ConnectedSocket() client: Socket,
    @MessageBody() _payload: unknown,
  ): Promise<{ event: string; data: string }> {
    await client.join(WS_ROOM.CHECKOUT)
    return { event: WS_EVENT.JOINED_CHECKOUT, data: 'ok' }
  }

  notifyNewOrder(order: Order): void {
    this.server.to(WS_ROOM.CHECKOUT).emit(WS_EVENT.ORDER_CREATED, this.serialize(order))
  }

  notifyStatusChanged(order: Order): void {
    this.server.to(WS_ROOM.CHECKOUT).emit(WS_EVENT.ORDER_STATUS_CHANGED, this.serialize(order))
  }

  notifyTableStatusChanged(tableId: string, status: string) {
    this.server.to(WS_ROOM.CHECKOUT).emit(WS_EVENT.TABLE_STATUS_CHANGED, { id: tableId, status })
  }

  private extractToken(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.token
    if (typeof fromAuth === 'string' && fromAuth.length > 0) return fromAuth
    const header = client.handshake.headers?.authorization
    if (typeof header === 'string' && header.startsWith('Bearer ')) return header.slice(7)
    return undefined
  }

  private serialize(order: Order) {
    return {
      id: order.id,
      tableId: order.tableId,
      status: order.status.value,
      total: order.total,
      items: order.items,
      createdAt: order.createdAt,
      createdBy: order.createdBy,
    }
  }
}
