import { test, expect } from '@playwright/test';

test.describe('Form Navigation', () => {
    test('homepage should show forms list', async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Wait for page to load
        await expect(page).toHaveTitle(/Form/);

        // Check that forms section is visible
        await expect(page.locator('text=Formulários')).toBeVisible();
    });

    test('should navigate to formularios page', async ({ page }) => {
        await page.goto('http://localhost:5173/formularios');

        await expect(page.locator('h1')).toContainText(/Formulários/i);
    });

    test('should navigate to form1', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        // Check form title is visible
        await expect(page.locator('text=Formulário Administração')).toBeVisible();
    });

    test('should navigate to form2', async ({ page }) => {
        await page.goto('http://localhost:5173/form2');

        // Check form title is visible
        await expect(page.locator('text=Formulário de Comunicação')).toBeVisible();
    });

    test('should navigate to form3', async ({ page }) => {
        await page.goto('http://localhost:5173/form3');

        // Check form title is visible
        await expect(page.locator('text=Default')).toBeVisible();
    });

    test('should have working back button', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        // Click back button if present
        const backButton = page.locator('button:has-text("Voltar")');
        if (await backButton.isVisible()) {
            await backButton.click();
            await expect(page).toHaveURL(/formularios/);
        }
    });
});

test.describe('Form Questions', () => {
    test('form1 should have multiple questions', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        // Check that questions are present (boolean questions)
        const questionContainers = page.locator('[data-testid^="question-"]');
        await expect(questionContainers.first()).toBeVisible();
    });

    test('form1 should contain diversity-related text', async ({ page }) => {
        await page.goto('http://localhost:5173/form1');

        // Check for content about diversity
        await expect(page.locator('text=Diversidade')).toBeVisible();
    });
});

test.describe('Responsive Design', () => {
    test('should render on mobile viewport', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('http://localhost:5173/');

        await expect(page).toHaveTitle(/Form/);
    });

    test('should render on tablet viewport', async ({ page }) => {
        await page.setViewportSize({ width: 768, height: 1024 });
        await page.goto('http://localhost:5173/');

        await expect(page).toHaveTitle(/Form/);
    });
});
