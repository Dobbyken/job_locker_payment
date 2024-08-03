import { IMongoBase } from './base.schema';
// import IMongoUser from './user.schema';

/**
 * @TableName: shopping_cart | shoppingcart
 */
interface IMongoShoppingCart extends IMongoBase {
  user_id_fk: string; // Many to One to user id
  cart: IMongoCart[];
}

interface IMongoCart {
  product_id: string; // Reference to IMongoProducts.id
  color_id: string; // Reference to IMongoProducts.options[x].colors[x].id
  /**
   * @type Int
   * @validate Insert if add number > IMongoProducts.options[x].colors[x].quantity else reject
   */
  quantity: number;
}

export default IMongoShoppingCart;
