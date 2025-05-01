/**
 * Simple test to verify bcrypt can be imported and used correctly
 */

import { jest } from '@jest/globals';
import bcrypt from 'bcrypt';

describe('Bcrypt', () => {
  it('should be able to hash a password', async () => {
    const password = 'test123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash.length).toBeGreaterThan(0);
  });
  
  it('should be able to compare a password with its hash', async () => {
    const password = 'test123';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    
    const isMatch = await bcrypt.compare(password, hash);
    expect(isMatch).toBe(true);
    
    const isNotMatch = await bcrypt.compare('wrong', hash);
    expect(isNotMatch).toBe(false);
  });
});
