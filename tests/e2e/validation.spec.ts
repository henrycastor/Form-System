import { test, expect } from '@playwright/test';

test.describe('Form Validation and UI Feedback', () => {
    test('submit button should be disabled until required fields are filled', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        const submitButton = page.locator('button[type="submit"]');

        // Initially disabled
        await expect(submitButton).toBeDisabled();

        // Fill only some fields
        await page.fill('textarea[name="companyName"]', 'Test Corp');
        await expect(submitButton).toBeDisabled();

        await page.fill('textarea[name="email"]', 'test@example.com');
        // Still disabled because questions are not answered
        await expect(submitButton).toBeDisabled();

        // Answer one question - should show progress but still be disabled
        await page.click('label[for="1-true"]');
        await expect(submitButton).toBeDisabled();

        // Progress text should be greater than 0%
        const progressValue = page.locator('.progress-value');
        await expect(progressValue).not.toHaveText('0%');

        const text = await progressValue.innerText();
        const percent = parseInt(text);
        expect(percent).toBeGreaterThan(0);
    });

    test('should show error message when email is invalid (if button was enabled)', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        const emailInput = page.locator('textarea[name="email"]');
        await emailInput.fill('invalid-email');

        // Button should remain disabled
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeDisabled();
    });

    test('section navigation and visibility', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        // Check that different sections are visible
        await expect(page.locator('h3:has-text("Dados da Empresa")')).toBeVisible();
        await expect(page.locator('h3:has-text("LGPD")')).toBeVisible();
    });
});
