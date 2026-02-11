import { describe, it, expect } from 'vitest';
import { forms } from '../../src/lib/form/forms';

describe('forms', () => {
    it('should be an array', () => {
        expect(Array.isArray(forms)).toBe(true);
    });

    it('should contain form objects', () => {
        if (forms.length > 0) {
            const form = forms[0];
            expect(form).toHaveProperty('id');
            expect(form).toHaveProperty('title');
            expect(form).toHaveProperty('description');
            expect(form).toHaveProperty('href');
            expect(form).toHaveProperty('questions');
        }
    });

    it('should have forms sorted by id', () => {
        if (forms.length > 1) {
            for (let i = 1; i < forms.length; i++) {
                expect(forms[i].id).toBeGreaterThanOrEqual(forms[i - 1].id);
            }
        }
    });

    it('each form should have valid href', () => {
        forms.forEach(form => {
            expect(form.href).toMatch(/^\/form\d+$/);
        });
    });

    it('each form should have questions array', () => {
        forms.forEach(form => {
            expect(Array.isArray(form.questions)).toBe(true);
        });
    });

    it('should have at least one form', () => {
        expect(forms.length).toBeGreaterThan(0);
    });

    it('each question should have id and text', () => {
        forms.forEach(form => {
            form.questions.forEach(question => {
                expect(question).toHaveProperty('id');
                expect(question).toHaveProperty('text');
                expect(question).toHaveProperty('type', 'bool');
            });
        });
    });
});
