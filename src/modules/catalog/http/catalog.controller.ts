import { Controller, Get, UseGuards } from '@nestjs/common'
import { QueryBus } from '@nestjs/cqrs'
import { JwtAuthGuard } from '../../auth/infrastructure/guards/jwt-auth.guard'
import { RolesGuard } from '../../auth/infrastructure/guards/roles.guard'
import { Roles } from '../../auth/infrastructure/decorators/roles.decorator'
import { ROLE } from '../../../shared/constants/roles.constants'
import { GetCatalogStampQuery } from '../application/queries/get-catalog-stamp.query'

@Controller('catalog')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stamp')
  @Roles(ROLE.MESERO, ROLE.CAJERO, ROLE.ADMIN)
  stamp() {
    return this.queryBus.execute(new GetCatalogStampQuery())
  }
}
