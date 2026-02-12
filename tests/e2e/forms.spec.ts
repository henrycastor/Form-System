import { test, expect } from '@playwright/test';

test.describe('Form Navigation', () => {
    test('homepage should show forms list', async ({ page }) => {
        await page.goto('http://localhost:5173/');

        // Wait for page to load
        await expect(page).toHaveTitle(/Form/);

        // Check that forms section is visible
        // Check that forms section is visible - using a more specific selector
        await expect(page.locator('h3:has-text("Formulários")').or(page.locator('a:has-text("Formulários")')).first()).toBeVisible();
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
        // Check for content about diversity
        await expect(page.locator('text=diversidade').first()).toBeVisible();
    });
});

test.describe('Full Form Submission', () => {
    test('should fill and submit form1 successfully', async ({ page }) => {
        // Go to form1
        await page.goto('http://localhost:5173/form1');

        // Fill Intro Section
        await page.fill('textarea[name="companyName"]', 'Test Company E2E');
        await page.fill('textarea[name="email"]', 'e2e@test.com');
        await page.fill('textarea[name="name"]', 'E2E Tester');

        // Select LGPD option (it's a choice)
        await page.click('label:has-text("Sim, autorizo")');

        // Answer some questions specifically
        await page.click('label[for="1-true"]');
        await page.fill('textarea[id="1-cmt"]', 'This is an E2E test comment');

        // Loop through the rest of the questions and click "Sim" (true)
        // form1 has questions 1 to 55
        for (let i = 2; i <= 55; i++) {
            await page.click(`label[for="${i}-true"]`);
        }

        // The submit button should now be enabled
        const submitButton = page.locator('button[type="submit"]');
        await expect(submitButton).toBeEnabled();

        // Click submit
        await submitButton.click();

        // Check for success message in toast
        await expect(page.locator('text=enviado com sucesso')).toBeVisible();

        // Should eventually redirect back to /formularios
        await expect(page).toHaveURL(/formularios/, { timeout: 10000 });
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
