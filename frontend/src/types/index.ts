export type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
};

export type CategoryNode = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  parentId: string | null;
  count: number;
  children: CategoryNode[];
};

export type CategoryDetail = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  order: number;
  related: { id: string; latex: string; order: number }[];
};

export type Formula = {
  id: string;
  title: string;
  group: string;
  lines: string[];
  note?: string | null;
  condition?: string | null;
  example?: string | null;
  order: number;
  published: boolean;
  category: { slug: string; name: string; icon: string; color: string };
};

export type FavoriteItem = Formula & { favoritedAt: string };
export type HistoryItem = Formula & { viewedAt: string };

export type CategoryInput = {
  name?: string;
  slug?: string;
  icon?: string;
  color?: string;
  description?: string;
  order?: number;
  parentId?: string | null;
  related?: string[];
};

export type FormulaInput = {
  categoryId?: string;
  title?: string;
  group?: string;
  lines?: string[];
  note?: string | null;
  condition?: string | null;
  example?: string | null;
  order?: number;
  published?: boolean;
};
