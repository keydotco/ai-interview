# DataTransformer Utility Documentation

## Overview

The `DataTransformer` is a powerful utility class that provides flexible data transformation capabilities for JavaScript objects and arrays. It allows you to define transformation schemas to convert, format, mask, or otherwise manipulate data structures in a declarative way.

This utility is particularly useful when:
- Processing API responses before presenting them to users
- Sanitizing or formatting data before storage
- Creating consistent data representations across your application
- Implementing data masking for sensitive information
- Converting between different data formats

## Installation

The `DataTransformer` is available as part of the application's utility modules:

```javascript
import { DataTransformer, createTransformer } from '../utils/dataTransformer.js';
```

## Constructor Options

When creating a new `DataTransformer` instance, you can provide an options object to customize its behavior:

```javascript
const transformer = new DataTransformer({
  preserveNulls: true,
  dateFormat: 'ymd',
  keyMapping: { originalKey: 'newKey' },
  transformations: { custom: (val) => val.toUpperCase() }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `preserveNulls` | Boolean | `false` | When `true`, null values are preserved. When `false`, null values are converted to empty strings. |
| `dateFormat` | String | `'iso'` | Format for date transformations. Options: `'iso'`, `'timestamp'`, `'unix'`, `'ymd'`. |
| `keyMapping` | Object | `null` | Object mapping original keys to new keys. Used to rename fields during transformation. |
| `transformations` | Object | `{}` | Custom transformations to extend the default set. |

## Methods

### transform(data, schema)

The primary method for transforming data according to a schema.

**Parameters:**
- `data` (Object|Array): The data to transform
- `schema` (Object): The transformation schema defining how to transform each field

**Returns:** The transformed data structure

**Example:**
```javascript
const data = { name: 'John', age: '30', createdAt: '2023-01-01' };
const schema = {
  name: 'string',
  age: 'number',
  createdAt: 'date'
};

const result = transformer.transform(data, schema);
// Result: { name: 'John', age: 30, createdAt: '2023-01-01T00:00:00.000Z' }
```

### extendTransformations(newTransformations)

Extends the available transformations with custom functions.

**Parameters:**
- `newTransformations` (Object): Object containing named transformation functions

**Returns:** The transformer instance (for chaining)

**Example:**
```javascript
transformer.extendTransformations({
  uppercase: (val) => String(val).toUpperCase(),
  truncate: (val, length = 10) => String(val).substring(0, length)
});
```

### clearCache()

Clears the internal transformation cache.

**Returns:** void

**Example:**
```javascript
transformer.clearCache();
```

## Transformation Schema

The transformation schema is a powerful way to define how data should be transformed. The schema can be defined in several formats:

### Simple String Transformation

Use a string to reference a built-in transformation:

```javascript
const schema = {
  name: 'string',
  age: 'number',
  isActive: 'boolean'
};
```

### Transformation with Parameters

Use an array where the first element is the transformation name and subsequent elements are parameters:

```javascript
const schema = {
  password: ['hash', 'sha256'],
  creditCard: ['mask', { prefix: 4, suffix: 4, mask: '*' }]
};
```

### Object Transformation

Use an object for more complex transformations:

```javascript
const schema = {
  data: {
    transform: 'number',
    params: [10] // Base 10
  }
};
```

### Conditional Transformation

Apply different transformations based on conditions:

```javascript
const schema = {
  status: {
    conditional: (value) => value === 'ACTIVE',
    then: 'uppercase',
    otherwise: 'lowercase'
  }
};
```

### Transformation Pipeline

Apply multiple transformations in sequence:

```javascript
const schema = {
  description: {
    pipe: ['string', 'trim', ['truncate', 100]]
  }
};
```

### Nested Object Transformation

Transform nested objects with their own schemas:

```javascript
const schema = {
  user: {
    properties: {
      name: 'string',
      email: 'lowercase'
    }
  }
};
```

### Array Transformation

Transform arrays of items:

```javascript
const schema = {
  tags: {
    items: 'lowercase'
  }
};
```

## Built-in Transformations

The `DataTransformer` comes with several built-in transformations:

| Name | Parameters | Description |
|------|------------|-------------|
| `string` | None | Converts value to string |
| `number` | None | Converts value to number |
| `boolean` | None | Converts value to boolean |
| `date` | None | Formats date according to dateFormat option |
| `hash` | `algorithm` (default: 'sha256') | Hashes the value using the specified algorithm |
| `mask` | `pattern` (default: 'X') | Masks the value according to the pattern |

The `mask` transformation supports several pattern types:
- String: Replaces each character with the pattern
- RegExp: Replaces matches with 'X'
- Function: Custom masking function
- Object: `{ prefix, suffix, mask }` to show parts of the value

## Usage Examples

### Basic Transformation

```javascript
import { createTransformer } from '../utils/dataTransformer.js';

const transformer = createTransformer();

const userData = {
  name: 'John Doe',
  email: 'JOHN@EXAMPLE.COM',
  age: '42',
  registeredAt: '2023-01-15'
};

const schema = {
  name: 'string',
  email: 'string',
  age: 'number',
  registeredAt: 'date'
};

const result = transformer.transform(userData, schema);
// Result:
// {
//   name: 'John Doe',
//   email: 'JOHN@EXAMPLE.COM',
//   age: 42,
//   registeredAt: '2023-01-15T00:00:00.000Z'
// }
```

### Masking Sensitive Data

```javascript
const userData = {
  name: 'John Doe',
  email: 'john@example.com',
  ssn: '123-45-6789',
  creditCard: '4111111111111111'
};

const schema = {
  name: 'string',
  email: ['mask', { prefix: 2, suffix: 8, mask: '*' }],
  ssn: ['mask', { prefix: 0, suffix: 4, mask: 'X' }],
  creditCard: ['mask', { prefix: 4, suffix: 4, mask: '*' }]
};

const result = transformer.transform(userData, schema);
// Result:
// {
//   name: 'John Doe',
//   email: 'jo**********om',
//   ssn: 'XXXXX6789',
//   creditCard: '4111************1111'
// }
```

### Key Mapping

```javascript
const transformer = createTransformer({
  keyMapping: {
    user_name: 'userName',
    user_email: 'userEmail'
  }
});

const userData = {
  user_name: 'John Doe',
  user_email: 'john@example.com'
};

const schema = {
  user_name: 'string',
  user_email: 'string'
};

const result = transformer.transform(userData, schema);
// Result:
// {
//   userName: 'John Doe',
//   userEmail: 'john@example.com'
// }
```

### Conditional Transformations

```javascript
const userData = {
  status: 'active',
  role: 'admin'
};

const schema = {
  status: {
    conditional: (value) => value === 'active',
    then: 'uppercase',
    otherwise: 'lowercase'
  },
  role: {
    conditional: (value) => value === 'admin',
    then: ['mask', 'X'],
    otherwise: 'string'
  }
};

const result = transformer.transform(userData, schema);
// Result:
// {
//   status: 'ACTIVE',
//   role: 'XXXXX'
// }
```

### Transformation Pipeline

```javascript
const transformer = createTransformer();
transformer.extendTransformations({
  trim: (val) => String(val).trim(),
  truncate: (val, length) => String(val).substring(0, length)
});

const data = {
  description: '  This is a very long description that needs to be truncated  '
};

const schema = {
  description: {
    pipe: ['string', 'trim', ['truncate', 20]]
  }
};

const result = transformer.transform(data, schema);
// Result:
// {
//   description: 'This is a very long'
// }
```

### Transforming Arrays

```javascript
const data = {
  users: [
    { name: 'John', age: '30' },
    { name: 'Jane', age: '25' }
  ],
  tags: ['JavaScript', 'NODE', 'express']
};

const schema = {
  users: {
    items: {
      properties: {
        name: 'string',
        age: 'number'
      }
    }
  },
  tags: {
    items: 'lowercase'
  }
};

const result = transformer.transform(data, schema);
// Result:
// {
//   users: [
//     { name: 'John', age: 30 },
//     { name: 'Jane', age: 25 }
//   ],
//   tags: ['javascript', 'node', 'express']
// }
```

## Advanced Usage

### Custom Transformations

You can extend the transformer with custom transformations:

```javascript
transformer.extendTransformations({
  // Convert to title case
  titleCase: (val) => {
    return String(val).replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },
  
  // Format phone number
  formatPhone: (val, countryCode = '+1') => {
    const digits = String(val).replace(/\D/g, '');
    if (digits.length === 10) {
      return `${countryCode} (${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return val;
  }
});
```

### Caching Behavior

The transformer caches results for performance. If you modify the source data after transformation, clear the cache:

```javascript
const data = { name: 'John' };
const schema = { name: 'string' };

// First transformation (cached)
const result1 = transformer.transform(data, schema);

// Modify source data
data.name = 'Jane';

// This will return the cached result (still 'John')
const result2 = transformer.transform(data, schema);

// Clear cache and transform again
transformer.clearCache();
const result3 = transformer.transform(data, schema);
// Now result3.name will be 'Jane'
```

## Error Handling

The transformer throws errors in these cases:

1. Invalid date format:
```javascript
// Will throw: Error: Invalid date: invalid-date
transformer.transform({ date: 'invalid-date' }, { date: 'date' });
```

2. Unknown transformation:
```javascript
// Will throw: Error: Unknown transformation: unknown
transformer.transform({ field: 'value' }, { field: 'unknown' });
```

3. Invalid transformation type:
```javascript
// Will throw: Error: Invalid transformation type: object
transformer.transform({ field: 'value' }, { field: {} });
```

## Performance Considerations

- The transformer uses caching to improve performance for repeated transformations
- For large datasets, consider transforming only the necessary fields
- Clear the cache periodically if memory usage is a concern
- For very large arrays, consider processing in batches

## API Design Improvements

Potential improvements to consider:

1. Add a `strict` mode option that throws errors for schema fields not present in the data
2. Implement a `validate` method to check data against a schema without transforming
3. Add support for asynchronous transformations
4. Implement a `transformStream` method for processing large datasets
5. Add built-in support for common formats like phone numbers, URLs, and currency

## Conclusion

The `DataTransformer` utility provides a flexible and powerful way to transform data structures in your application. By defining transformation schemas, you can ensure consistent data formatting, protect sensitive information, and simplify data processing throughout your codebase.
