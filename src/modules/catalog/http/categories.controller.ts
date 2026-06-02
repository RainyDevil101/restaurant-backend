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
  UseGuards,
} from '@nestjs/common'
import { CommandBus, QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { CreateCategoryCommand } from '../application/commands/create-category.command'
import { DeleteCategoryCommand } from '../application/commands/delete-category.command'
import { UpdateCategoryCommand } from '../application/commands/update-category.command'
import { ListCategoriesQuery } from '../application/queries/list-categories.query'
import { CreateCategoryDto, UpdateCategoryDto } from '../application/dtos/category.dto'

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  findAll() {
    return this.queryBus.execute(new ListCategoriesQuery())
  }

  @Post()
  @Roles(ROLE.ADMIN)
  create(@Body() dto: CreateCategoryDto) {
    return this.commandBus.execute(new CreateCategoryCommand(dto))
  }

  @Patch(':id')
  @Roles(ROLE.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateCategoryDto) {
    return this.commandBus.execute(new UpdateCategoryCommand(id, dto))
  }

  @Delete(':id')
  @Roles(ROLE.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.commandBus.execute(new DeleteCategoryCommand(id))
  }
}
