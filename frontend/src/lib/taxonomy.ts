export const CHANNELS = {
  ai: 'AI 应用技术分享',
  trading: '交易系统分享',
} as const;

export const CATEGORIES = {
  ai: {
    learning: '个人学习与总结',
    cases: '案例分享',
  },
  trading: {
    principles: '交易理念与规则',
    risk: '风控与仓位管理',
    review: '交易系统复盘',
  },
} as const;

export type Channel = keyof typeof CATEGORIES;

export function getCategoryLabel(channel: Channel, category: string): string {
  const label = (CATEGORIES[channel] as Record<string, string>)[category];

  if (!label) {
    throw new Error('无效栏目');
  }

  return label;
}
