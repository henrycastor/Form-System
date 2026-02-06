import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  sanitizeString,
  validatePageNumber,
  validatePerPage,
  validateSearchQuery,
  validateSubmissionData,
  validateIntroFields,
  VALIDATION_CONSTANTS,
} from '../../src/lib/validation';

describe('validation constants', () => {
  it('should have all required constants defined', () => {
    expect(VALIDATION_CONSTANTS.COMPANY_NAME_MIN_LENGTH).toBe(2);
    expect(VALIDATION_CONSTANTS.SEARCH_QUERY_MAX_LENGTH).toBe(100);
    expect(VALIDATION_CONSTANTS.TEXT_FIELD_MAX_LENGTH).toBe(5000);
    expect(VALIDATION_CONSTANTS.SANITIZE_STRING_MAX_LENGTH).toBe(1000);
    expect(VALIDATION_CONSTANTS.PAGINATION_MIN_PAGE).toBe(1);
    expect(VALIDATION_CONSTANTS.PAGINATION_DEFAULT_PER_PAGE).toBe(10);
    expect(VALIDATION_CONSTANTS.PAGINATION_MAX_PER_PAGE).toBe(100);
  });
});

describe('validateEmail', () => {
  it('should accept valid emails', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name@domain.co.uk')).toBe(true);
    expect(validateEmail('user+tag@example.org')).toBe(true);
  });

  it('should reject invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@example.com')).toBe(false);
    expect(validateEmail('test@')).toBe(false);
    expect(validateEmail('test@example')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('   ')).toBe(false);
    expect(validateEmail(null as unknown as string)).toBe(false);
    expect(validateEmail(undefined as unknown as string)).toBe(false);
  });
});

describe('sanitizeString', () => {
  it('should trim and limit string length', () => {
    expect(sanitizeString('  hello world  ')).toBe('hello world');
    expect(sanitizeString('a'.repeat(2000), 100)).toBe('a'.repeat(100));
  });

  it('should return empty string for non-string input', () => {
    expect(sanitizeString(null as unknown as string)).toBe('');
    expect(sanitizeString(undefined as unknown as string)).toBe('');
    expect(sanitizeString(123 as unknown as string)).toBe('');
  });

  it('should use custom max length', () => {
    expect(sanitizeString('test', 2)).toBe('te');
  });
});

describe('validatePageNumber', () => {
  it('should return valid page numbers', () => {
    expect(validatePageNumber(1)).toBe(1);
    expect(validatePageNumber(5)).toBe(5);
    expect(validatePageNumber('10')).toBe(10);
  });

  it('should enforce minimum page', () => {
    expect(validatePageNumber(0)).toBe(1);
    expect(validatePageNumber(-5)).toBe(1);
    expect(validatePageNumber('0')).toBe(1);
  });

  it('should return minimum for invalid input', () => {
    expect(validatePageNumber('invalid')).toBe(1);
    expect(validatePageNumber(NaN)).toBe(1);
  });

  it('should accept custom minimum', () => {
    expect(validatePageNumber(0, 5)).toBe(5);
  });
});

describe('validatePerPage', () => {
  it('should return valid per_page values', () => {
    expect(validatePerPage(10)).toBe(10);
    expect(validatePerPage(25)).toBe(25);
    expect(validatePerPage('50')).toBe(50);
  });

  it('should enforce maximum', () => {
    expect(validatePerPage(200)).toBe(100);
    expect(validatePerPage(1000)).toBe(100);
  });

  it('should return default for invalid or zero values', () => {
    expect(validatePerPage(0)).toBe(10);
    expect(validatePerPage(-5)).toBe(10);
    expect(validatePerPage('invalid')).toBe(10);
  });

  it('should respect custom max and default', () => {
    expect(validatePerPage(200, 50, 20)).toBe(50);
    expect(validatePerPage(0, 50, 20)).toBe(20);
  });
});

describe('validateSearchQuery', () => {
  it('should sanitize and limit search queries', () => {
    expect(validateSearchQuery('test query')).toBe('test query');
    expect(validateSearchQuery('a'.repeat(200), 50)).toBe('a'.repeat(50));
  });

  it('should remove dangerous characters', () => {
    expect(validateSearchQuery("test; DROP TABLE users;")).toBe('test DROP TABLE users');
    expect(validateSearchQuery("test' OR '1'='1")).toBe('test OR 1=1');
    expect(validateSearchQuery('test" AND password="xyz')).toBe('test AND password=xyz');
    expect(validateSearchQuery('test\\')).toBe('test');
  });

  it('should return empty string for non-string input', () => {
    expect(validateSearchQuery(null as unknown as string)).toBe('');
    expect(validateSearchQuery(undefined as unknown as string)).toBe('');
  });
});

describe('validateSubmissionData', () => {
  it('should accept valid submission data', () => {
    const validData = {
      companyName: 'Test Company',
      email: 'test@example.com',
      question1: 'answer',
    };
    const result = validateSubmissionData(validData);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject empty data', () => {
    const result = validateSubmissionData({});
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Submission data cannot be empty');
  });

  it('should reject non-object data', () => {
    expect(validateSubmissionData(null as unknown as Record<string, unknown>).isValid).toBe(false);
    expect(validateSubmissionData('string' as unknown as Record<string, unknown>).isValid).toBe(false);
  });

  it('should reject short company names', () => {
    const result = validateSubmissionData({ companyName: 'A', email: 'test@example.com' });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Company name'))).toBe(true);
  });

  it('should reject invalid emails', () => {
    const result = validateSubmissionData({ companyName: 'Test Company', email: 'invalid' });
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Invalid email address');
  });

  it('should reject fields exceeding max length', () => {
    const longValue = 'a'.repeat(5001);
    const result = validateSubmissionData({ companyName: 'Test', email: 'test@example.com', question1: longValue });
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('exceeds maximum length'))).toBe(true);
  });
});

describe('validateIntroFields', () => {
  it('should accept valid intro fields', () => {
    const result = validateIntroFields({
      companyName: 'Test Company',
      email: 'test@example.com',
    });
    expect(Object.keys(result)).toHaveLength(0);
  });

  it('should reject empty company name', () => {
    const result = validateIntroFields({ companyName: '', email: 'test@example.com' });
    expect(result.companyName).toBeDefined();
  });

  it('should reject short company name', () => {
    const result = validateIntroFields({ companyName: 'A', email: 'test@example.com' });
    expect(result.companyName).toBeDefined();
  });

  it('should reject invalid email', () => {
    const result = validateIntroFields({ companyName: 'Test Company', email: 'invalid' });
    expect(result.email).toBeDefined();
  });

  it('should reject missing email', () => {
    const result = validateIntroFields({ companyName: 'Test Company' });
    expect(result.email).toBeDefined();
  });

  it('should report both errors when both are invalid', () => {
    const result = validateIntroFields({ companyName: '', email: '' });
    expect(Object.keys(result)).toHaveLength(2);
  });

  it('should handle non-string values gracefully', () => {
    // Non-string values should trigger validation errors since they fail type checks
    const result = validateIntroFields({ companyName: 123 as unknown as string, email: undefined as unknown as string });
    // The function should handle these gracefully without crashing
    expect(Object.keys(result).length).toBeGreaterThanOrEqual(1);
  });
});
