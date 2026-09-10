import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { articleFrontmatterSchema, noteFrontmatterSchema } from './lib/content-schema';

const articles = defineCollection({
  loader: glob({ base: './src/content/articles', pattern: '**/*.{md,mdx}' }),
  schema: articleFrontmatterSchema,
});

const notes = defineCollection({
  loader: glob({ base: './src/content/notes', pattern: '**/*.{md,mdx}' }),
  schema: noteFrontmatterSchema,
});

export const collections = { articles, notes };
