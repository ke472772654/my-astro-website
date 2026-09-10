import { z } from 'zod';

export const channelSchema = z.enum(['ai', 'trading']);

const validCategories = {
  ai: ['learning', 'cases'],
  trading: ['principles', 'risk', 'review'],
} as const;

const basePostFrontmatterSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  channel: channelSchema,
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  cover: z.url().optional(),
  riskDisclosure: z.boolean().default(true),
});

function validateCategory(
  value: { channel: z.infer<typeof channelSchema>; category: string },
  context: z.RefinementCtx,
) {
  if (!validCategories[value.channel].includes(value.category as never)) {
    context.addIssue({
      code: 'custom',
      path: ['category'],
      message: '栏目不属于当前频道',
    });
  }
}

export const articleFrontmatterSchema = basePostFrontmatterSchema
  .extend({ type: z.literal('article') })
  .superRefine(validateCategory);

export const noteFrontmatterSchema = basePostFrontmatterSchema
  .extend({ type: z.literal('note') })
  .superRefine(validateCategory);
