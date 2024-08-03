import { IMongoBase } from './base.schema';

/**
 * Please add dummy user yourself for referencing
 */
interface IMongoUser extends IMongoBase {
  name: string;
}

export default IMongoUser;
