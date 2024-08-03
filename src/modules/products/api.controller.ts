import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductsService } from './api.service';
import { MongoProducts } from '../../schema/product.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private readonly logger = new Logger(ProductsController.name);

  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product
   * @param createProductDto - Data Transfer Object containing product details
   */
  @Post()
  async create(@Body() createProductDto: MongoProducts) {
    this.logger.log(
      `Creating a new product with details: ${JSON.stringify(createProductDto)}`,
    );
    try {
      const createdProduct =
        await this.productsService.create(createProductDto);
      return createdProduct;
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get multiple products by list of IDs or all products if no IDs are provided
   * @param ids - Comma-separated list of product IDs
   */
  @Get()
  async findAll(@Query('ids') ids: string) {
    try {
      if (ids) {
        this.logger.log(`Fetching products with IDs: ${ids}`);
        const idArray = ids.split(',');
        return await this.productsService.findByIds(idArray);
      } else {
        this.logger.log('Fetching all products');
        return await this.productsService.findAll();
      }
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`);
      throw new HttpException(
        'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a product by ID
   * @param id - ID of the product to update
   * @param updateProductDto - Data Transfer Object containing updated product details
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<MongoProducts>,
  ) {
    this.logger.log(
      `Updating product with ID: ${id} with details: ${JSON.stringify(updateProductDto)}`,
    );
    try {
      const updatedProduct = await this.productsService.update(
        id,
        updateProductDto,
      );
      return updatedProduct;
    } catch (error) {
      this.logger.error(`Failed to update product: ${error.message}`);
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete multiple products by list of IDs
   * @param ids - Comma-separated list of product IDs
   */
  @Delete()
  async remove(@Query('ids') ids: string) {
    this.logger.log(`Deleting products with IDs: ${ids}`);
    try {
      const idArray = ids.split(',');
      const result = await this.productsService.remove(idArray);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete products: ${error.message}`);
      throw new HttpException(
        'Failed to delete products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
