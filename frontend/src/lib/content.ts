type DatedEntry = {
  data: {
    pubDate: Date;
  };
};

type ContentEntry = DatedEntry & {
  id: string;
  data: DatedEntry['data'] & {
    featured: boolean;
    pinned: boolean;
    tags: string[];
  };
};

export function sortPosts<T extends DatedEntry>(posts: T[]): T[] {
  return [...posts].sort((left, right) => right.data.pubDate.getTime() - left.data.pubDate.getTime());
}

export function estimateReadingMinutes(body: string): number {
  const characterCount = body.replace(/\s/g, '').length;

  return Math.max(1, Math.ceil(characterCount / 300));
}

export function getFeaturedPosts<T extends ContentEntry>(posts: T[]): T[] {
  return posts
    .filter((post) => post.data.pinned || post.data.featured)
    .sort((left, right) => {
      if (left.data.pinned !== right.data.pinned) {
        return Number(right.data.pinned) - Number(left.data.pinned);
      }

      if (left.data.featured !== right.data.featured) {
        return Number(right.data.featured) - Number(left.data.featured);
      }

      return right.data.pubDate.getTime() - left.data.pubDate.getTime();
    });
}

export function getRelatedPosts<T extends ContentEntry>(posts: T[], currentId: string, tags: string[]): T[] {
  const tagSet = new Set(tags);
  const sharedTagCount = (post: T) => post.data.tags.filter((tag) => tagSet.has(tag)).length;

  return posts
    .filter((post) => post.id !== currentId && sharedTagCount(post) > 0)
    .sort((left, right) => {
      const countDifference = sharedTagCount(right) - sharedTagCount(left);

      return countDifference || right.data.pubDate.getTime() - left.data.pubDate.getTime();
    });
}
