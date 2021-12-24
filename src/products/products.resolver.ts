import { Resolver } from '@nestjs/graphql';
import { ProductsService } from './products.service';

@Resolver('Product')
export class ProductsResolver {
  constructor(private readonly productsService: ProductsService) {}
}
