import { IMongoBase, IMongoLocaleBase, TMongoAutoID } from './base.schema';

/**
 * @TableName: products
 */
interface IMongoProducts extends IMongoBase {
  name: IMongoLocaleBase[];
  details: IMongoLocaleBase[];
  description: IMongoLocaleBase[];
  status: boolean;
  /**
   * @type Float: Max value +-5.0
   */
  rating: number;
  sku?: string;
  imgs: string[];
  options: IMongoProductsOptions[];
}

interface IMongoProductsOptions {
  sku?: string;
  name: IMongoLocaleBase[];
  imgs: string[];
  colors: IMongoProductsColors[];
}

interface IMongoProductsColors {
  sku?: string;
  id?: TMongoAutoID;
  name: IMongoLocaleBase[];
  /**
   * @type Float: 2 Decimal
   */
  price: number;
  /**
   * @type Int
   */
  quantity: number;
  imgs: string[];
}

export default IMongoProducts;
