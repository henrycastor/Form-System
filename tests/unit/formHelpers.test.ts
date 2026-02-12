import { describe, it, expect } from 'vitest';
import {
    createBoolQuestion,
    DiagnForm,
    createBoolSection,
    createTextQuestion,
    ONEDRIVE_BASE_URL
} from '$lib/form/helpers';

describe('Form Helpers', () => {
    describe('ONEDRIVE_BASE_URL', () => {
        it('should be a valid URL string', () => {
            expect(ONEDRIVE_BASE_URL).toBeDefined();
            expect(typeof ONEDRIVE_BASE_URL).toBe('string');
            expect(ONEDRIVE_BASE_URL).toContain('https://');
        });
    });

    describe('createBoolQuestion', () => {
        it('should create a basic boolean question', () => {
            const q = createBoolQuestion('q1', 'Is this a test?');

            expect(q).toEqual({
                id: 'q1',
                text: 'Is this a test?',
                type: 'bool',
                required: true
            });
        });

        it('should include link_attachment when provided', () => {
            const q = createBoolQuestion('q2', 'Has attachment?', 'https://example.com/doc');

            expect(q).toEqual({
                id: 'q2',
                text: 'Has attachment?',
                type: 'bool',
                required: true,
                link_attachment: 'https://example.com/doc'
            });
        });

        it('should NOT include link_attachment when undefined', () => {
            const q = createBoolQuestion('q3', 'No link');

            expect(q).not.toHaveProperty('link_attachment');
        });

        it('should NOT include link_attachment when empty string', () => {
            const q = createBoolQuestion('q4', 'Empty link', '');

            // Empty string is falsy, so spread won't add it
            expect(q).not.toHaveProperty('link_attachment');
        });

        it('should always set required to true', () => {
            const q = createBoolQuestion('q5', 'Required?');
            expect(q.required).toBe(true);
        });

        it('should always set type to "bool"', () => {
            const q = createBoolQuestion('q6', 'Type check');
            expect(q.type).toBe('bool');
        });
    });

    describe('DiagnForm', () => {
        it('should convert an array of question objects to bool questions', () => {
            const input = [
                { id: 'q1', text: 'Question 1' },
                { id: 'q2', text: 'Question 2', link_attachment: 'https://link.com' }
            ];

            const result = DiagnForm(input);

            expect(result).toHaveLength(2);
            expect(result[0]).toEqual({
                id: 'q1',
                text: 'Question 1',
                type: 'bool',
                required: true
            });
            expect(result[1]).toEqual({
                id: 'q2',
                text: 'Question 2',
                type: 'bool',
                required: true,
                link_attachment: 'https://link.com'
            });
        });

        it('should return empty array when given no arguments', () => {
            const result = DiagnForm();
            expect(result).toEqual([]);
        });

        it('should return empty array when given empty array', () => {
            const result = DiagnForm([]);
            expect(result).toEqual([]);
        });

        it('should handle large arrays', () => {
            const input = Array.from({ length: 50 }, (_, i) => ({
                id: `q${i + 1}`,
                text: `Question ${i + 1}`
            }));

            const result = DiagnForm(input);
            expect(result).toHaveLength(50);
            result.forEach((q, i) => {
                expect(q.id).toBe(`q${i + 1}`);
                expect(q.type).toBe('bool');
                expect(q.required).toBe(true);
            });
        });
    });

    describe('createBoolSection', () => {
        it('should create a section with category, icon, and questions', () => {
            const questions = [
                { id: 'q1', text: 'Test Q1' }
            ];
            const section = createBoolSection('Test Category', null, questions);

            expect(section.category).toBe('Test Category');
            expect(section.questions).toHaveLength(1);
            expect(section.questions[0].type).toBe('bool');
            expect(section.questions[0].required).toBe(true);
        });

        it('should use default category when not provided', () => {
            const section = createBoolSection();

            expect(section.category).toBe('Formulário de Diagnóstico');
        });

        it('should use default icon (FileCheck) when not provided', () => {
            const section = createBoolSection();

            expect(section.icon).toBeDefined();
        });

        it('should use empty questions array when not provided', () => {
            const section = createBoolSection();

            expect(section.questions).toEqual([]);
        });

        it('should convert questions to bool format', () => {
            const questions = [
                { id: 'a', text: 'Alpha', link_attachment: 'https://link.com' },
                { id: 'b', text: 'Beta' }
            ];
            const section = createBoolSection('Cat', null, questions);

            expect(section.questions).toHaveLength(2);
            expect(section.questions[0].link_attachment).toBe('https://link.com');
            expect(section.questions[1]).not.toHaveProperty('link_attachment');
        });
    });

    describe('createTextQuestion', () => {
        it('should create a basic text question', () => {
            const q = createTextQuestion('name', 'Your name');

            expect(q).toEqual({
                id: 'name',
                text: 'Your name',
                required: true
            });
        });

        it('should include link_attachment when provided', () => {
            const q = createTextQuestion('email', 'Your email', 'https://help.com');

            expect(q).toEqual({
                id: 'email',
                text: 'Your email',
                required: true,
                link_attachment: 'https://help.com'
            });
        });

        it('should NOT include link_attachment when empty', () => {
            const q = createTextQuestion('phone', 'Your phone', '');
            expect(q).not.toHaveProperty('link_attachment');
        });

        it('should NOT set a type property', () => {
            const q = createTextQuestion('addr', 'Address');
            expect(q).not.toHaveProperty('type');
        });

        it('should always be required', () => {
            const q = createTextQuestion('x', 'X');
            expect(q.required).toBe(true);
        });
    });
});
