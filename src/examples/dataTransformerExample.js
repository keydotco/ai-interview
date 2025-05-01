/**
 * Example usage of the DataTransformer utility
 */

import { createTransformer } from '../utils/dataTransformer.js';

const transformer = createTransformer();

const userData = {
  id: 123,
  name: 'John Doe',
  email: 'john.doe@example.com',
  password: 'secret123',
  createdAt: '2023-01-15T08:30:00.000Z',
  lastLogin: new Date(),
  settings: {
    theme: 'dark',
    notifications: true,
    language: 'en'
  },
  roles: ['user', 'editor'],
  metadata: {
    loginCount: 42,
    lastIp: '192.168.1.1'
  }
};

const userSchema = {
  id: 'number',
  name: 'string',
  email: 'string',
  password: ['mask', { prefix: 0, suffix: 0 }],
  createdAt: 'date',
  lastLogin: ['date', 'ymd'],
  settings: {
    properties: {
      theme: 'string',
      notifications: 'boolean',
      language: 'string'
    }
  },
  roles: {
    items: 'string'
  },
  metadata: {
    properties: {
      loginCount: 'number',
      lastIp: ['mask', { prefix: 3, suffix: 0, mask: '*' }]
    }
  }
};

const transformedData = transformer.transform(userData, userSchema);

console.log('Original data:', userData);
console.log('Transformed data:', transformedData);

const advancedTransformer = createTransformer({
  dateFormat: 'unix',
  preserveNulls: true,
  transformations: {
    uppercase: (val) => String(val).toUpperCase(),
    truncate: (val, length = 10) => String(val).substring(0, length) + '...'
  }
});

const advancedSchema = {
  id: 'number',
  name: 'uppercase',
  email: ['truncate', 15],
  password: {
    transform: 'hash',
    params: ['sha1']
  },
  createdAt: {
    pipe: ['date', 'string']
  },
  lastLogin: {
    conditional: (val) => val instanceof Date,
    then: 'date',
    otherwise: 'string'
  },
  settings: null, // Exclude this field
  roles: {
    items: 'uppercase'
  }
};

const advancedResult = advancedTransformer.transform(userData, advancedSchema);

console.log('Advanced transformation:', advancedResult);
