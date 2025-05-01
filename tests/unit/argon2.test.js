/**
 * Simple test to verify argon2 can be imported and used correctly
 */

import { jest } from '@jest/globals';
import argon2 from 'argon2';

describe('Argon2', () => {
  it('should be able to hash a password', async () => {
    const password = 'test123';
    const hash = await argon2.hash(password);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
  
  it('should be able to verify a password with its hash', async () => {
    const password = 'test123';
    const hash = await argon2.hash(password);
    
    const isMatch = await argon2.verify(hash, password);
    expect(isMatch).toBe(true);
    
    const isNotMatch = await argon2.verify(hash, 'wrong');
    expect(isNotMatch).toBe(false);
  });
});
