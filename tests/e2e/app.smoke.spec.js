import { test, expect } from '@playwright/test';

test('home renders with hero and a visible h1', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1').first();
  await expect(h1).toBeVisible({ timeout: 10000 });
  await expect(h1).toContainText(/club|TORNEOS|ORGANIZERS/i);
});

test('api: agent-chat require JWT', async ({ request }) => {
  const r = await request.post('https://padelorganizers.vercel.app/api/agent-chat', { data: { agentType: 'x', question: 'q', answer: 'a' } });
  expect(r.status()).toBe(401);
});

test('api: check-status validates session id format', async ({ request }) => {
  const r = await request.get('https://padelorganizers.vercel.app/api/check-status?id=xx');
  expect(r.status()).toBe(400);
});
