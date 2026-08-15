import { test, expect } from '@playwright/test';

test.describe('Login smoke', () => {
    test('muestra el formulario de login', async ({ page }) => {
        await page.goto('/login');

        await expect(page.locator('#auth-page')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.getByRole('button', { name: /log in|iniciar|entrar|login/i })).toBeVisible();
    });
});
