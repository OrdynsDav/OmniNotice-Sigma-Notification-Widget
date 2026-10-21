import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    plugins: [react()],
    define: {
      __E2E__: mode === 'test',
    },
    build: {
      // Указываем, что собирать в production-режиме
      rollupOptions: {
        input: {
          main: 'index.html', // Главная демо-страница
        },
      },
    },
    // В режиме dev/test Vite видит все папки, но при сборке (npm run build) 
    // он возьмет только то, что указано в rollupOptions.input.
  };
});