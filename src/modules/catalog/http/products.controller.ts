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
  Query,
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { CreateProductCommand } from '../application/commands/create-product.command'
import { DeleteProductCommand } from '../application/commands/delete-product.command'
import { ToggleProductAvailabilityCommand } from '../application/commands/toggle-product-availability.command'
import { UpdateProductCommand } from '../application/commands/update-product.command'
import { ListProductsQuery } from '../application/queries/list-products.query'
import { CreateProductDto, UpdateProductDto } from '../application/dtos/product.dto'

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('available') available?: string) {
    return this.queryBus.execute(
      new ListProductsQuery({
        categoryId,
        available: available !== undefined ? available === 'true' : undefined,
      }),
    )
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateProductDto) {
    return this.commandBus.execute(new CreateProductCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.commandBus.execute(new UpdateProductCommand(id, dto))
  }

  @Patch(':id/availability')
  @Roles(ROLE.ADMIN)
  toggleAvailability(@Param('id') id: string) {
    return this.commandBus.execute(new ToggleProductAvailabilityCommand(id))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteProductCommand(id))
  }
}
