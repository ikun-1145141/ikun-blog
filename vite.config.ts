import { defineConfig } from 'vite';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

function getPostsInput(): Record<string, string> {
  const postsDir = join(process.cwd(), 'posts');
  if (!existsSync(postsDir)) return {};
  return Object.fromEntries(
    readdirSync(postsDir)
      .filter(f => f.endsWith('.html'))
      .map(f => [f.replace('.html', ''), join(postsDir, f)]),
  );
}

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:     'index.html',
        blog:     'blog.html',
        services: 'services.html',
        ...getPostsInput(),
      },
    },
  },
});
