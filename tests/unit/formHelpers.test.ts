import { describe, it, expect } from 'vitest';
import { FileCheck } from 'lucide-svelte';
import {
    createBoolQuestion,
    DiagnForm,
    createBoolSection,
    createTextQuestion,
    ONEDRIVE_BASE_URL
} from '../../src/lib/form/helpers';

describe('ONEDRIVE_BASE_URL', () => {
    it('should have correct OneDrive base URL', () => {
        expect(ONEDRIVE_BASE_URL).toBe('https://1drv.ms/f/c/9C83B684F2485602');
    });
});

describe('createBoolQuestion', () => {
    it('should create a boolean question without link', () => {
        const result = createBoolQuestion('q1', 'Is this a test question?');

        expect(result).toEqual({
            id: 'q1',
            text: 'Is this a test question?',
            type: 'bool'
        });
    });

    it('should create a boolean question with link attachment', () => {
        const link = 'https://example.com/document';
        const result = createBoolQuestion('q2', 'Another question?', link);

        expect(result).toEqual({
            id: 'q2',
            text: 'Another question?',
            type: 'bool',
            link_attachment: link
        });
    });

    it('should not include link_attachment when not provided', () => {
        const result = createBoolQuestion('q3', 'Question without link');

        expect(result).not.toHaveProperty('link_attachment');
    });

    it('should handle empty string link as falsy', () => {
        const result = createBoolQuestion('q4', 'Question', '');

        expect(result).not.toHaveProperty('link_attachment');
    });
});

describe('DiagnForm', () => {
    it('should create boolean questions from array', () => {
        const questions = [
            { id: '1', text: 'Question 1' },
            { id: '2', text: 'Question 2' },
            { id: '3', text: 'Question 3' }
        ];

        const result = DiagnForm(questions);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ id: '1', text: 'Question 1', type: 'bool' });
        expect(result[1]).toEqual({ id: '2', text: 'Question 2', type: 'bool' });
        expect(result[2]).toEqual({ id: '3', text: 'Question 3', type: 'bool' });
    });

    it('should handle link attachments', () => {
        const questions = [
            { id: '1', text: 'Question with link', link_attachment: 'https://example.com' }
        ];

        const result = DiagnForm(questions);

        expect(result[0]).toEqual({
            id: '1',
            text: 'Question with link',
            type: 'bool',
            link_attachment: 'https://example.com'
        });
    });

    it('should return empty array for empty input', () => {
        const result = DiagnForm([]);
        expect(result).toEqual([]);
    });

    it('should default to empty array', () => {
        const result = DiagnForm();
        expect(result).toEqual([]);
    });
});

describe('createBoolSection', () => {
    it('should create a section with default category and icon', () => {
        const result = createBoolSection();

        expect(result.category).toBe('Formulário de Diagnóstico');
        expect(result.icon).toBe(FileCheck);
        expect(result.questions).toEqual([]);
    });

    it('should create a section with custom category', () => {
        const result = createBoolSection('Custom Category');

        expect(result.category).toBe('Custom Category');
    });

    it('should create a section with questions', () => {
        const questions = [
            { id: '1', text: 'Question 1' },
            { id: '2', text: 'Question 2' }
        ];

        const result = createBoolSection('Test Section', FileCheck, questions);

        expect(result.category).toBe('Test Section');
        expect(result.icon).toBe(FileCheck);
        expect(result.questions).toHaveLength(2);
    });

    it('should default questions to empty array', () => {
        const result = createBoolSection('Section', FileCheck);

        expect(result.questions).toEqual([]);
    });

    it('should use default category when undefined', () => {
        const result = createBoolSection(undefined, undefined);

        expect(result.category).toBe('Formulário de Diagnóstico');
        expect(result.icon).toBe(FileCheck);
    });
});

describe('createTextQuestion', () => {
    it('should create a text question', () => {
        const result = createTextQuestion('q1', 'What is your name?');

        expect(result).toEqual({
            id: 'q1',
            text: 'What is your name?'
        });
    });

    it('should create a text question with link attachment', () => {
        const link = 'https://example.com/guidelines';
        const result = createTextQuestion('q2', 'Read guidelines', link);

        expect(result).toEqual({
            id: 'q2',
            text: 'Read guidelines',
            link_attachment: link
        });
    });

    it('should not include link_attachment when not provided', () => {
        const result = createTextQuestion('q3', 'Question without link');

        expect(result).not.toHaveProperty('link_attachment');
    });

    it('should not have type property by default', () => {
        const result = createTextQuestion('q4', 'Simple question');

        expect(result.type).toBeUndefined();
    });
});
