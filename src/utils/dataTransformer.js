/**
 * @module DataTransformer
 * @description A powerful and flexible data transformation utility for handling complex data transformations.
 * This module provides a robust way to transform data structures according to specified schema and transformations.
 * It supports various operations like type conversion, date formatting, masking sensitive data, and more.
 * 
 * Features:
 * - Schema-based transformation of complex nested objects
 * - Built-in transformations for common data types
 * - Custom transformation functions
 * - Conditional transformations
 * - Transformation caching for performance
 * - Key mapping for property renaming
 * 
 * @example
 * // Basic usage
 * const transformer = new DataTransformer();
 * const transformed = transformer.transform(data, {
 *   name: 'string',
 *   age: 'number',
 *   email: ['mask', { prefix: 3, suffix: 4 }]
 * });
 * 
 * @example
 * // Advanced usage with options
 * const transformer = new DataTransformer({
 *   preserveNulls: true,
 *   dateFormat: 'ymd',
 *   keyMapping: { 'firstName': 'first_name' }
 * });
 */

import crypto from 'crypto';

export class DataTransformer {
  /**
   * Creates a new DataTransformer instance
   * 
   * @param {Object} options - Configuration options for the transformer
   * @param {boolean} [options.preserveNulls=false] - Whether to preserve null values or convert them to empty strings
   * @param {string} [options.dateFormat='iso'] - Default date format ('iso', 'timestamp', 'unix', 'ymd')
   * @param {Object} [options.keyMapping=null] - Mapping to rename keys in the output
   * @param {Object} [options.transformations={}] - Custom transformations to add to the default set
   * 
   * @example
   * const transformer = new DataTransformer({
   *   preserveNulls: true,
   *   dateFormat: 'ymd',
   *   keyMapping: { 'userId': 'user_id' }
   * });
   */
  constructor(options = {}) {
    this.options = {
      preserveNulls: false,
      dateFormat: 'iso',
      keyMapping: null,
      transformations: {},
      ...options
    };
    
    this.transformationCache = new Map();
    this._setupDefaultTransformations();
  }
  
  _setupDefaultTransformations() {
    const defaultTransforms = {
      string: (val) => String(val),
      number: (val) => Number(val),
      boolean: (val) => Boolean(val),
      date: (val) => this._formatDate(val),
      hash: (val, algo = 'sha256') => this._hashValue(val, algo),
      mask: (val, pattern = 'X') => this._maskValue(val, pattern)
    };
    
    this.transformations = {
      ...defaultTransforms,
      ...this.options.transformations
    };
  }
  
  _formatDate(date, format = this.options.dateFormat) {
    if (!date) return null;
    
    const d = date instanceof Date ? date : new Date(date);
    
    if (isNaN(d.getTime())) {
      throw new Error(`Invalid date: ${date}`);
    }
    
    switch (format) {
    case 'iso':
      return d.toISOString();
    case 'timestamp':
      return d.getTime();
    case 'unix':
      return Math.floor(d.getTime() / 1000);
    case 'ymd':
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    default:
      return d.toISOString();
    }
  }
  
  _hashValue(value, algorithm) {
    if (value === null || value === undefined) {
      return this.options.preserveNulls ? null : '';
    }
    
    const hash = crypto.createHash(algorithm);
    hash.update(String(value));
    return hash.digest('hex');
  }
  
  _maskValue(value, pattern) {
    if (value === null || value === undefined) {
      return this.options.preserveNulls ? null : '';
    }
    
    const str = String(value);
    
    if (typeof pattern === 'string') {
      return str.replace(/./g, pattern);
    }
    
    if (pattern instanceof RegExp) {
      return str.replace(pattern, 'X');
    }
    
    if (typeof pattern === 'function') {
      return pattern(str);
    }
    
    if (typeof pattern === 'object') {
      const { prefix = 0, suffix = 0, mask = 'X' } = pattern;
      
      if (str.length <= prefix + suffix) {
        return str;
      }
      
      const visiblePrefix = str.slice(0, prefix);
      const visibleSuffix = str.slice(-suffix);
      const maskedPart = mask.repeat(str.length - prefix - suffix);
      
      return `${visiblePrefix}${maskedPart}${visibleSuffix}`;
    }
    
    return str.replace(/./g, 'X');
  }
  
  _applyTransformation(value, transform, params) {
    if (value === null || value === undefined) {
      return this.options.preserveNulls ? null : '';
    }
    
    if (typeof transform === 'string') {
      if (!this.transformations[transform]) {
        throw new Error(`Unknown transformation: ${transform}`);
      }
      
      return this.transformations[transform](value, ...(params || []));
    }
    
    if (typeof transform === 'function') {
      return transform(value, ...(params || []));
    }
    
    throw new Error(`Invalid transformation type: ${typeof transform}`);
  }
  
  _getCacheKey(obj, schema) {
    return JSON.stringify({ o: obj, s: schema });
  }
  
  _transformValue(value, schema) {
    if (schema === null || schema === undefined) {
      return value;
    }
    
    if (typeof schema === 'string' || typeof schema === 'function') {
      return this._applyTransformation(value, schema);
    }
    
    if (Array.isArray(schema)) {
      const [transform, ...params] = schema;
      return this._applyTransformation(value, transform, params);
    }
    
    if (typeof schema === 'object') {
      if (schema.transform) {
        const { transform, params = [] } = schema;
        return this._applyTransformation(value, transform, params);
      }
      
      if (schema.conditional) {
        const { conditional, then, otherwise } = schema;
        const condition = typeof conditional === 'function' 
          ? conditional(value)
          : !!value;
          
        return condition 
          ? this._transformValue(value, then)
          : this._transformValue(value, otherwise);
      }
      
      if (schema.pipe) {
        return schema.pipe.reduce((result, transform) => {
          return this._transformValue(result, transform);
        }, value);
      }
    }
    
    return value;
  }
  
  /**
   * Transforms data according to the provided schema
   * 
   * @param {any} data - The data to transform
   * @param {Object|string|Function|Array} schema - Schema defining the transformations to apply
   * @returns {any} The transformed data
   * 
   * @example
   * // Transform an object
   * transformer.transform({
   *   name: 'John Doe',
   *   email: 'john.doe@example.com',
   *   age: '42'
   * }, {
   *   name: 'string',
   *   email: ['mask', { prefix: 3, suffix: 4 }],
   *   age: 'number'
   * });
   * 
   * @example
   * // Transform an array of objects
   * transformer.transform([user1, user2], {
   *   name: 'string',
   *   email: ['mask', { prefix: 3, suffix: 4 }]
   * });
   */
  transform(data, schema) {
    if (!data) return data;
    
    const cacheKey = this._getCacheKey(data, schema);
    if (this.transformationCache.has(cacheKey)) {
      return this.transformationCache.get(cacheKey);
    }
    
    let result;
    
    if (Array.isArray(data)) {
      result = data.map(item => this.transform(item, schema));
    } else if (typeof data === 'object' && data !== null) {
      result = {};
      
      for (const [key, value] of Object.entries(data)) {
        const mappedKey = this.options.keyMapping && this.options.keyMapping[key] 
          ? this.options.keyMapping[key] 
          : key;
          
        const fieldSchema = schema && schema[key];
        
        if (fieldSchema === undefined) {
          result[mappedKey] = value;
          continue;
        }
        
        if (fieldSchema === null) {
          continue;
        }
        
        if (Array.isArray(value)) {
          if (fieldSchema.items) {
            result[mappedKey] = value.map(item => this._transformValue(item, fieldSchema.items));
          } else {
            result[mappedKey] = value.map(item => this._transformValue(item, fieldSchema));
          }
        } else if (typeof value === 'object' && value !== null && fieldSchema.properties) {
          result[mappedKey] = this.transform(value, fieldSchema.properties);
        } else {
          result[mappedKey] = this._transformValue(value, fieldSchema);
        }
      }
    } else {
      result = this._transformValue(data, schema);
    }
    
    this.transformationCache.set(cacheKey, result);
    return result;
  }
  
  /**
   * Clears the transformation cache
   * Use this when you want to force recalculation of all transformations
   */
  clearCache() {
    this.transformationCache.clear();
  }
  
  /**
   * Extends the available transformations with new ones
   * 
   * @param {Object} newTransformations - Object containing new transformation functions
   * @returns {DataTransformer} The transformer instance for chaining
   * 
   * @example
   * transformer.extendTransformations({
   *   uppercase: (val) => String(val).toUpperCase(),
   *   truncate: (val, length = 10) => String(val).substring(0, length)
   * });
   */
  extendTransformations(newTransformations) {
    this.transformations = {
      ...this.transformations,
      ...newTransformations
    };
    
    this.clearCache();
    return this;
  }
}

/**
 * Creates and returns a new DataTransformer instance
 * 
 * @param {Object} options - Configuration options for the transformer
 * @returns {DataTransformer} A new DataTransformer instance
 * 
 * @example
 * const transformer = createTransformer({ dateFormat: 'unix' });
 * const result = transformer.transform(data, schema);
 */
export const createTransformer = (options) => {
  return new DataTransformer(options);
};

export default {
  DataTransformer,
  createTransformer
};
