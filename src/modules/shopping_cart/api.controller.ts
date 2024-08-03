import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ShoppingCartService } from './api.service';
import { MongoShoppingCart } from '../../schema/shopping_cart.schema';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Shopping Cart')
@Controller('shopping_cart')
export class ShoppingCartController {
  private readonly logger = new Logger(ShoppingCartController.name);

  constructor(private readonly shoppingCartService: ShoppingCartService) {}

  /**
   * Add a product to the shopping cart
   * @param createCartDto - Data Transfer Object containing shopping cart details
   */
  @Post()
  async addProductToCart(@Body() createCartDto: MongoShoppingCart) {
    this.logger.log(
      `Adding product to cart with details: ${JSON.stringify(createCartDto)}`,
    );
    try {
      return await this.shoppingCartService.addProductToCart(createCartDto);
    } catch (error) {
      this.logger.error(`Failed to add product to cart: ${error.message}`);
      throw new HttpException(
        'Failed to add product to cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get shopping cart items by user ID
   * @param user_id_fk - User ID
   */
  @Get(':user_id_fk')
  async findByUserId(@Param('user_id_fk') user_id_fk: string) {
    this.logger.log(`Fetching cart items for user ID: ${user_id_fk}`);
    try {
      return await this.shoppingCartService.findByUserId(user_id_fk);
    } catch (error) {
      this.logger.error(`Failed to fetch cart items: ${error.message}`);
      throw new HttpException(
        'Failed to fetch cart items',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update the shopping cart by user ID
   * @param user_id_fk - User ID
   * @param updateCartDto - Data Transfer Object containing updated shopping cart details
   */
  @Put(':user_id_fk')
  async updateCart(
    @Param('user_id_fk') user_id_fk: string,
    @Body() updateCartDto: Partial<MongoShoppingCart>,
  ) {
    this.logger.log(
      `Updating cart for user ID: ${user_id_fk} with details: ${JSON.stringify(updateCartDto)}`,
    );
    try {
      return await this.shoppingCartService.updateCart(
        user_id_fk,
        updateCartDto,
      );
    } catch (error) {
      this.logger.error(`Failed to update cart: ${error.message}`);
      throw new HttpException(
        'Failed to update cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Remove a cart item by user ID and product ID
   * @param user_id_fk - User ID
   * @param product_id - Product ID
   */
  @Delete(':user_id_fk/:product_id')
  async removeCartItem(
    @Param('user_id_fk') user_id_fk: string,
    @Param('product_id') product_id: string,
  ) {
    this.logger.log(
      `Removing product with ID: ${product_id} from cart for user ID: ${user_id_fk}`,
    );
    try {
      return await this.shoppingCartService.removeCartItem(
        user_id_fk,
        product_id,
      );
    } catch (error) {
      this.logger.error(`Failed to remove product from cart: ${error.message}`);
      throw new HttpException(
        'Failed to remove product from cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
