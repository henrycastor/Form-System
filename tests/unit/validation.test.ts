import { describe, it, expect } from 'vitest';
import { validateEmail } from '../../src/lib/validation';

describe('validation', () => {
  it('validateEmail should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('validateEmail should reject invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
  });
});
