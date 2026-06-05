import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { CreatePrinterCommand } from '../application/commands/create-printer.command'
import { DeletePrinterCommand } from '../application/commands/delete-printer.command'
import { UpdatePrinterCommand } from '../application/commands/update-printer.command'
import { UpdateReceiptSettingsCommand } from '../application/commands/update-receipt-settings.command'
import { ListPrintersQuery } from '../application/queries/list-printers.query'
import { GetReceiptSettingsQuery } from '../application/queries/get-receipt-settings.query'
import { CreatePrinterDto, UpdatePrinterDto } from '../application/dtos/printer.dto'
import { UpdateReceiptSettingsDto } from '../application/dtos/receipt-settings.dto'

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('printers')
  @Roles(ROLE.ADMIN)
  listPrinters() {
    return this.queryBus.execute(new ListPrintersQuery())
  }

  @Post('printers')
  @Roles(ROLE.ADMIN)
  createPrinter(@Body() dto: CreatePrinterDto) {
    return this.commandBus.execute(new CreatePrinterCommand(dto))
  }

  @Patch('printers/:id')
  @Roles(ROLE.ADMIN)
  updatePrinter(@Param('id') id: string, @Body() dto: UpdatePrinterDto) {
    return this.commandBus.execute(new UpdatePrinterCommand(id, dto))
  }

  @Delete('printers/:id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  deletePrinter(@Param('id') id: string) {
    return this.commandBus.execute(new DeletePrinterCommand(id))
  }

  @Get('receipt')
  @Roles(ROLE.ADMIN)
  getReceipt() {
    return this.queryBus.execute(new GetReceiptSettingsQuery())
  }

  @Put('receipt')
  @Roles(ROLE.ADMIN)
  updateReceipt(@Body() dto: UpdateReceiptSettingsDto) {
    return this.commandBus.execute(new UpdateReceiptSettingsCommand(dto))
  }
}
