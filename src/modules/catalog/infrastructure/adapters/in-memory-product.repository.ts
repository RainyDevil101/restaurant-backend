import { Injectable } from '@nestjs/common'
import { Product } from '../../domain/entities/product.entity'
import type { IProductRepository, ProductFilters } from '../../domain/ports/product.repository.port'

const SEED = [
  { id: 'prod-1',  name: 'Guacamole',            description: 'Con totopos',                    price: 85,  categoryId: 'cat-1', available: true  },
  { id: 'prod-2',  name: 'Sopa de tortilla',      description: 'Con crema y queso',              price: 75,  categoryId: 'cat-1', available: true  },
  { id: 'prod-3',  name: 'Flautas',               description: 'Pollo o papa, 3 pzas',           price: 90,  categoryId: 'cat-1', available: true  },
  { id: 'prod-4',  name: 'Carne asada',           description: '300g con guarnición',            price: 220, categoryId: 'cat-2', available: true  },
  { id: 'prod-5',  name: 'Pollo a la plancha',    description: 'Con arroz y ensalada',           price: 175, categoryId: 'cat-2', available: true  },
  { id: 'prod-6',  name: 'Enchiladas verdes',     description: 'Pollo, crema y queso',           price: 140, categoryId: 'cat-2', available: true  },
  { id: 'prod-7',  name: 'Quesadillas',           description: 'Con queso Oaxaca',               price: 120, categoryId: 'cat-2', available: false },
  { id: 'prod-8',  name: 'Agua fresca',           description: 'Jamaica, horchata o tamarindo',  price: 35,  categoryId: 'cat-3', available: true  },
  { id: 'prod-9',  name: 'Refresco',              description: 'Lata 355ml',                     price: 30,  categoryId: 'cat-3', available: true  },
  { id: 'prod-10', name: 'Cerveza',               description: 'Botella 355ml',                  price: 55,  categoryId: 'cat-3', available: true  },
  { id: 'prod-11', name: 'Agua mineral',          description: 'Botella 500ml',                  price: 25,  categoryId: 'cat-3', available: true  },
  { id: 'prod-12', name: 'Flan napolitano',       description: 'Con cajeta',                     price: 65,  categoryId: 'cat-4', available: true  },
  { id: 'prod-13', name: 'Pastel de chocolate',   description: 'Rebanada',                       price: 70,  categoryId: 'cat-4', available: true  },
]

@Injectable()
export class InMemoryProductRepository implements IProductRepository {
  private readonly store: Map<string, Product>

  constructor() {
    this.store = new Map(SEED.map((p) => [p.id, Product.create(p, p.id)]))
  }

  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let products = [...this.store.values()]
    if (filters?.categoryId) products = products.filter((p) => p.categoryId === filters.categoryId)
    if (filters?.available !== undefined) products = products.filter((p) => p.available === filters.available)
    return products
  }

  async findById(id: string): Promise<Product | null> {
    return this.store.get(id) ?? null
  }

  async findByIds(ids: string[]): Promise<Product[]> {
    return ids.flatMap((id) => this.store.get(id) ?? [])
  }

  async save(product: Product): Promise<Product> {
    this.store.set(product.id, product)
    return product
  }

  async update(product: Product): Promise<Product> {
    this.store.set(product.id, product)
    return product
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id)
  }
}
