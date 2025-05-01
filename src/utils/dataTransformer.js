import crypto from 'crypto';

export class DataTransformer {
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
  
  clearCache() {
    this.transformationCache.clear();
  }
  
  extendTransformations(newTransformations) {
    this.transformations = {
      ...this.transformations,
      ...newTransformations
    };
    
    this.clearCache();
    return this;
  }
}

export const createTransformer = (options) => {
  return new DataTransformer(options);
};

export default {
  DataTransformer,
  createTransformer
};
