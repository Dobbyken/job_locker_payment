import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoProducts } from '../../schema/product.schema';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    @InjectModel(MongoProducts.name)
    private readonly productModel: Model<MongoProducts>,
  ) {}

  /**
   * Create a new product
   * @param createProductDto - Data Transfer Object containing product details
   * @returns The created product
   */
  async create(createProductDto: MongoProducts): Promise<MongoProducts> {
    this.logger.log(`Creating product: ${JSON.stringify(createProductDto)}`);
    this.validateProduct(createProductDto);

    try {
      const createdProduct = new this.productModel(createProductDto);
      return await createdProduct.save();
    } catch (error) {
      this.logger.error(`Failed to create product: ${error.message}`);
      throw new HttpException(
        'Failed to create product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieve all products
   * @returns An array of all products
   */
  async findAll(): Promise<MongoProducts[]> {
    this.logger.log('Fetching all products');
    try {
      return await this.productModel.find().exec();
    } catch (error) {
      this.logger.error(`Failed to fetch products: ${error.message}`);
      throw new HttpException(
        'Failed to fetch products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieve products by a list of IDs
   * @param ids - Array of product IDs
   * @returns An array of products matching the provided IDs
   */
  async findByIds(ids: string[]): Promise<MongoProducts[]> {
    this.logger.log(`Fetching products with IDs: ${ids}`);
    try {
      return await this.productModel.find({ id: { $in: ids } }).exec();
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
   * @returns The updated product
   */
  async update(
    id: string,
    updateProductDto: Partial<MongoProducts>,
  ): Promise<MongoProducts> {
    this.logger.log(
      `Updating product with ID: ${id} with details: ${JSON.stringify(updateProductDto)}`,
    );
    this.validateProduct(updateProductDto);

    try {
      return await this.productModel
        .findOneAndUpdate({ id: id }, updateProductDto, { new: true })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to update product: ${error.message}`);
      throw new HttpException(
        'Failed to update product',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete multiple products by a list of IDs
   * @param ids - Array of product IDs
   * @returns The result of the delete operation
   */
  async remove(ids: string[]): Promise<any> {
    this.logger.log(`Deleting products with IDs: ${ids}`);
    try {
      return await this.productModel.deleteMany({ id: { $in: ids } }).exec();
    } catch (error) {
      this.logger.error(`Failed to delete products: ${error.message}`);
      throw new HttpException(
        'Failed to delete products',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Validate product details
   * @param productDto - Data Transfer Object containing product details
   */
  private validateProduct(productDto: Partial<MongoProducts>): void {
    if (
      productDto.reviews !== undefined &&
      (productDto.reviews.find((_) => _.rating < -5.0) ||
        productDto.reviews.find((_) => _.rating > 5.0))
    ) {
      throw new HttpException(
        'Product rating must be between -5.0 and 5.0',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (productDto.options) {
      productDto.options.forEach((option) => {
        option.colors.forEach((color) => {
          if (
            color.price !== undefined &&
            (color.price < 0 ||
              color.price > 99999.99 ||
              !/^\d+(\.\d{1,2})?$/.test(color.price.toString()))
          ) {
            throw new HttpException(
              'Product color price must be a float up to 2 decimal points and between 0 and 99999.99',
              HttpStatus.BAD_REQUEST,
            );
          }
          if (
            color.quantity !== undefined &&
            (!Number.isInteger(color.quantity) || color.quantity < 0)
          ) {
            throw new HttpException(
              'Product color quantity must be a non-negative integer',
              HttpStatus.BAD_REQUEST,
            );
          }
        });
      });
    }
  }
}
