import { test, expect } from '@playwright/test';

test.describe('Admin Panel E2E', () => {
    test.beforeEach(async ({ context }) => {
        // Set admin session cookie to bypass login
        await context.addCookies([
            {
                name: 'admin_session',
                value: 'true',
                domain: 'localhost',
                path: '/',
            },
        ]);
    });

    test('should load admin panel stats', async ({ page }) => {
        await page.goto('http://localhost:5173/painel_administracao');

        // Check for stat cards
        await expect(page.locator('.stat-card.total')).toBeVisible();
        await expect(page.locator('.stat-card.pending')).toBeVisible();

        const pageTitle = page.locator('h1');
        await expect(pageTitle).toContainText('Painel Administrador');
    });

    test('should show empty state when filtering non-existent item', async ({ page }) => {
        await page.goto('http://localhost:5173/painel_administracao');

        const searchInput = page.locator('input[placeholder*="Buscar"]');
        await expect(searchInput).toBeVisible();

        await searchInput.fill('ThisShouldNotMatchAnythingXYZ123');

        // Check for empty state message defined in SubmissionTable.svelte
        await expect(page.locator('.empty-state')).toBeVisible();
        await expect(page.locator('.empty-state')).toContainText('Nenhum formulário encontrado');
    });

    test('should have working logout', async ({ page }) => {
        await page.goto('http://localhost:5173/painel_administracao');

        const logoutButton = page.locator('button:has-text("Sair"), a:has-text("Sair")');
        if (await logoutButton.count() > 0) {
            await logoutButton.click();
            await expect(page).toHaveURL(/\/login/);
        }
    });
});
