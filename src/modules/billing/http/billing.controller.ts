import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { ConsolidateBillCommand } from '../application/commands/consolidate-bill.command'
import { ProcessPaymentCommand } from '../application/commands/process-payment.command'
import { GetBillByTableQuery } from '../application/queries/get-bill-by-table.query'
import { GetAllPaymentsQuery } from '../application/queries/get-all-payments.query'
import { ProcessPaymentDto } from '../application/dtos/payment.dto'

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('payments')
  @Roles(ROLE.ADMIN)
  getAllPayments() {
    return this.queryBus.execute(new GetAllPaymentsQuery())
  }

  @Get('table/:tableId')
  @Roles(ROLE.CAJERO, ROLE.ADMIN)
  getBill(@Param('tableId') tableId: string) {
    return this.queryBus.execute(new GetBillByTableQuery(tableId))
  }

  @Post('table/:tableId/consolidate')
  @Roles(ROLE.CAJERO, ROLE.ADMIN)
  consolidate(@Param('tableId') tableId: string) {
    return this.commandBus.execute(new ConsolidateBillCommand(tableId))
  }

  @Post('table/:tableId/payment')
  @Roles(ROLE.CAJERO, ROLE.ADMIN)
  pay(@Param('tableId') tableId: string, @Body() dto: ProcessPaymentDto) {
    return this.commandBus.execute(new ProcessPaymentCommand(tableId, dto))
  }
}
