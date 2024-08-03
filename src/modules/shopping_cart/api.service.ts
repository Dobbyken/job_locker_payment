import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoShoppingCart } from '../../schema/shopping_cart.schema';
import { MongoProducts } from '../../schema/product.schema';

@Injectable()
export class ShoppingCartService {
  private readonly logger = new Logger(ShoppingCartService.name);

  constructor(
    @InjectModel(MongoShoppingCart.name)
    private readonly cartModel: Model<MongoShoppingCart>,
    @InjectModel(MongoProducts.name)
    private readonly productModel: Model<MongoProducts>,
  ) {}

  /**
   * Add a product to the shopping cart
   * @param createCartDto - Data Transfer Object containing shopping cart details
   * @returns The updated or newly created shopping cart
   */
  async addProductToCart(
    createCartDto: MongoShoppingCart,
  ): Promise<MongoShoppingCart> {
    this.logger.log(
      `Adding product to cart for user ID: ${createCartDto.user_id_fk}`,
    );
    try {
      const existingCart = await this.cartModel
        .findOne({ user_id_fk: createCartDto.user_id_fk })
        .exec();

      if (existingCart) {
        // Create a map of existing cart items for quick lookup
        const existingCartItemsMap = new Map(
          existingCart.cart.map((item) => [item.product_id, item]),
        );

        // Loop through the new cart items
        createCartDto.cart.forEach((newCartItem) => {
          const existingCartItem = existingCartItemsMap.get(
            newCartItem.product_id,
          );
          if (existingCartItem) {
            // Update the quantity of the existing product
            existingCartItem.quantity += newCartItem.quantity;
          } else {
            // Add the new product to the cart
            existingCart.cart.push(newCartItem);
          }
        });

        // Mark the document as modified
        existingCart.markModified('cart');

        // Save the updated cart
        return await existingCart.save();
      } else {
        // Create a new cart
        this.logger.log(
          `No existing cart found for user ID: ${createCartDto.user_id_fk}. Creating new cart.`,
        );
        const createdCart = new this.cartModel(createCartDto);
        return await createdCart.save();
      }
    } catch (error) {
      this.logger.error(`Failed to add product to cart: ${error.message}`);
      throw new HttpException(
        'Failed to add product to cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Find the shopping cart by user ID
   * @param user_id_fk - User ID
   * @returns The shopping cart and associated products
   */
  async findByUserId(user_id_fk: string): Promise<any> {
    this.logger.log(`Fetching cart items for user ID: ${user_id_fk}`);
    try {
      const cart = await this.cartModel.findOne({ user_id_fk }).exec();
      if (cart) {
        const productIds = cart.cart.map((item) => item.product_id);
        const products = await this.productModel
          .find({ id: { $in: productIds } })
          .exec();
        return { cart, products };
      }
      return null;
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
   * @returns The updated shopping cart
   */
  async updateCart(
    user_id_fk: string,
    updateCartDto: Partial<MongoShoppingCart>,
  ): Promise<MongoShoppingCart> {
    this.logger.log(
      `Updating cart for user ID: ${user_id_fk} with details: ${JSON.stringify(updateCartDto)}`,
    );
    try {
      return await this.cartModel
        .findOneAndUpdate({ user_id_fk }, updateCartDto, { new: true })
        .exec();
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
   * @returns The result of the remove operation
   */
  async removeCartItem(user_id_fk: string, product_id: string): Promise<any> {
    this.logger.log(
      `Removing product with ID: ${product_id} from cart for user ID: ${user_id_fk}`,
    );
    try {
      return await this.cartModel
        .updateOne({ user_id_fk }, { $pull: { cart: { product_id } } })
        .exec();
    } catch (error) {
      this.logger.error(`Failed to remove product from cart: ${error.message}`);
      throw new HttpException(
        'Failed to remove product from cart',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
