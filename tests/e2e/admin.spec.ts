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

    test('should delete a submission', async ({ page, request }) => {
        const uniqueName = `Delete Me ${Date.now()}`;
        // Create a test submission first
        const newSubmission = await request.post('http://localhost:5000/api/submissions', {
            data: {
                title: 'E2E Deletion Test',
                companyName: 'DeleteMe Corp',
                email: 'delete@me.com',
                name: uniqueName,
                status: 'pending'
            }
        });
        expect(newSubmission.ok()).toBe(true);
        const submissionData = await newSubmission.json();
        const submissionId = submissionData.id;

        await page.goto('http://localhost:5000/painel_administracao');

        // Wait for the table to load and find our specific row
        const rowSelector = `tr:has-text("${uniqueName}")`;
        await page.waitForSelector(rowSelector, { timeout: 10000 });

        const row = page.locator(rowSelector).first();
        await expect(row).toBeVisible();

        // Click delete on our specific row
        await row.locator('button.delete').click();

        // Modal should appear
        const modal = page.locator('.modal-content');
        await expect(modal).toBeVisible();

        // Click confirm delete
        await modal.locator('button.btn-danger:has-text("Excluir Permanentemente")').click();

        // Toast should appear
        await expect(page.locator('text=/sucesso|excluído/i')).toBeVisible();

        // Row should be removed
        await expect(row).not.toBeVisible({ timeout: 10000 });
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
