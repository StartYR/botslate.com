import { expect, test, type Page } from '@playwright/test';

async function useTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((value) => {
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', value);
  }, theme);
}

test.describe('theme and navigation', () => {
  test('theme toggle updates the interface and persists across routes', async ({ page }) => {
    await useTheme(page, 'dark');
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/dark/);

    await page.locator('[data-theme-toggle]:visible').first().click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    await page.goto('/about/');
    await expect(page.locator('html')).not.toHaveClass(/dark/);
    await expect(page.getByRole('heading', { name: /Build things/ })).toBeVisible();
  });

  test('desktop navigation contains only the public site sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop navigation is hidden at the mobile breakpoint.');
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Main navigation' });
    await expect(nav.getByRole('link')).toHaveText(['Home', 'Notes', 'Changelog', 'About']);
    await expect(page.getByRole('link', { name: 'View Botslate repository on GitHub' })).toHaveAttribute('href', 'https://github.com/StartYR/botslate.com');
  });

  test('mobile navigation opens and exposes the same sections', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile navigation is hidden above the mobile breakpoint.');
    await page.goto('/');

    const button = page.getByRole('button', { name: 'Open main menu' });
    await button.click();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link')).toHaveText(['Home', 'Notes', 'Changelog', 'About']);
  });
});

test.describe('content and removed template routes', () => {
  test('core public pages render', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Ideas, tools, and experiments.' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /A place to make/ })).toBeVisible();

    await page.goto('/blog/');
    await expect(page.getByRole('heading', { name: 'Notes', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Welcome to Botslate' })).toBeVisible();

    await page.goto('/changelog/');
    await expect(page.getByRole('heading', { name: 'Initial Launch' })).toBeVisible();
  });

  test('removed demo routes return not found', async ({ request }) => {
    for (const path of ['/login/', '/signup/', '/pricing/', '/privacy/', '/terms/']) {
      const response = await request.get(path);
      expect(response.status(), path).toBe(404);
    }
  });

  test('note detail carries Botslate metadata without template author links', async ({ page }) => {
    await page.goto('/blog/welcome-to-botslate/');

    await expect(page.getByRole('heading', { name: 'Welcome to Botslate' })).toBeVisible();
    await expect(page.locator('article').getByText('Botslate', { exact: true }).first()).toBeVisible();
    await expect(page.locator('article a[href*="farros"]')).toHaveCount(0);

    const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
    expect(structuredData).toContain('"@type":"BlogPosting"');
    expect(structuredData).toContain('"name":"Botslate"');
  });
});

test.describe('search and SEO', () => {
  test('command palette finds Botslate pages and notes', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[onclick="window.toggleCommandPalette()"]:visible').first().click();
    await page.locator('#search-input').fill('Botslate');

    const results = page.locator('#search-results');
    await expect(results).toContainText('About Botslate');
    await expect(results).toContainText('Welcome to Botslate');
    await expect(results).not.toContainText(/pricing|sign in|sign up/i);
  });

  test('homepage exposes Botslate canonical and social metadata', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://botslate.com/');
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Home | Botslate');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://botslate.com/');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://botslate.com/og-image.png');
    await expect(page.locator('meta[name="twitter:site"]')).toHaveCount(0);
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', 'https://botslate.com/og-image.png');
  });

  test('sitemap and search index exclude removed routes', async ({ request }) => {
    const sitemap = await (await request.get('/sitemap.xml')).text();
    expect(sitemap).toContain('https://botslate.com/about/');
    expect(sitemap).toContain('https://botslate.com/blog/welcome-to-botslate/');
    expect(sitemap).not.toMatch(/login|signup|pricing|privacy|terms/);

    const searchIndex = await (await request.get('/search-index.json')).text();
    expect(searchIndex).toContain('About Botslate');
    expect(searchIndex).toContain('Welcome to Botslate');
    expect(searchIndex).not.toMatch(/login|signup|pricing/i);
  });
});

test.describe('responsive layout', () => {
  test('feature cards do not overlap at tablet and desktop widths', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Card overlap check targets tablet and desktop grids.');
    await page.goto('/');

    const cards = await page.locator('#features .glass-panel').all();
    const boxes = [];
    for (const card of cards) {
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      boxes.push(box!);
    }

    for (let i = 0; i < boxes.length; i += 1) {
      for (let j = i + 1; j < boxes.length; j += 1) {
        const a = boxes[i];
        const b = boxes[j];
        const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
        const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
        expect(overlapX * overlapY).toBe(0);
      }
    }
  });

  test('footer contains real navigation and no subscription form', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer');
    await expect(footer.getByText('Built with Astro.')).toBeVisible();
    await expect(footer.locator('form')).toHaveCount(0);
    await expect(footer.locator('a[href="#"]')).toHaveCount(0);
  });
});
