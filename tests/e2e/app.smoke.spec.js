import { test, expect } from '@playwright/test';

test('home renders with hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText(/club/i);
});

test('api: agent-chat require JWT', async ({ request }) => {
  const r = await request.post('/api/agent-chat', { data: { agentType: 'x', question: 'q', answer: 'a' } });
  expect(r.status()).toBe(401);
});

test('api: check-status validates session id format', async ({ request }) => {
  const r = await request.get('/api/check-status?id=xx');
  expect(r.status()).toBe(400);
});
