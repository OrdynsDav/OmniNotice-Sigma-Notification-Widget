import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  use: {
    // ⚠️ ВАЖНО: указываем конкретный путь к нашей тестовой странице
    baseURL: 'http://localhost:5173/tests/test-page.html',
    trace: 'on',
    video: 'on',
  },
  webServer: {
    command: 'npm run dev', // Запускает Vite
    url: 'http://localhost:5173/tests/test-page.html', // Ждем, пока эта страница станет доступна
    reuseExistingServer: true,
  },
});