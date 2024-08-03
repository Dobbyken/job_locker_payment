/**
 * UUID -> Auto Generate
 */
export type TMongoAutoID = string;

/**
 * Suggestion: Using Database build function to finish below auto generation
 */
export interface IMongoBase {
  id?: TMongoAutoID;
  /**
   * Format: YYYYMMDDhhmmss | Auto gen utc datetime
   */
  createdAt?: string;
  /**
   * Format: YYYYMMDDhhmmss | Auto gen utc datetime when null || Accept assigned data
   */
  updatedAt?: string;
}

export interface IMongoLocaleBase {
  /**
   * Default Value: default
   */
  locale: string;
  value: string;
}
