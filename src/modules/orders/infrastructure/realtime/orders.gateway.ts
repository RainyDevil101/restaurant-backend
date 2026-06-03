import { Injectable } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets'
import type { Server, Socket } from 'socket.io'
import { corsOrigins } from '../../../../config/cors.config'
import type { Order } from '../../domain/entities/order.entity'
import type { IOrderNotifier } from '../../domain/ports/order-notifier.port'
import { WS_EVENT, WS_NAMESPACE, WS_ROOM } from './ws-events.constants'

@Injectable()
@WebSocketGateway({
  cors: { origin: corsOrigins(), credentials: true },
  namespace: WS_NAMESPACE,
})
export class OrdersGateway implements IOrderNotifier {
  @WebSocketServer()
  private server: Server

  /** Cashier client calls this once to subscribe to all order events. */
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
