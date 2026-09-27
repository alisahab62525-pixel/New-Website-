import { Category } from '../types';
import { slugify } from '../utils/formatters';
import { dbStore } from './store';

export const categoryService = {
  async getCategories(includeInactive = false): Promise<Category[]> {
    await new Promise((r) => setTimeout(r, 80));
    const categories = dbStore.getState().categories;
    return includeInactive ? [...categories] : categories.filter((c) => c.isActive);
  },

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    await new Promise((r) => setTimeout(r, 80));
    const c = dbStore.getState().categories.find((cat) => cat.slug === slug);
    return c || null;
  },

  async getCategoryById(id: string): Promise<Category | null> {
    const c = dbStore.getState().categories.find((cat) => cat.id === id);
    return c || null;
  },

  async createCategory(data: {
    name: string;
    description: string;
    image: string;
    isActive: boolean;
  }): Promise<Category> {
    const id = `cat-${Date.now()}`;
    const slug = slugify(data.name);

    const newCategory: Category = {
      id,
      name: data.name.trim(),
      slug,
      description: data.description.trim(),
      image: data.image.trim() || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80',
      productCount: 0,
      isActive: data.isActive,
    };

    dbStore.setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  },

  async updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
    let updatedCat: Category | null = null;

    dbStore.setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          updatedCat = {
            ...c,
            ...updates,
            slug: updates.name ? slugify(updates.name) : c.slug,
          };
          return updatedCat;
        }
        return c;
      })
    );

    if (!updatedCat) throw new Error('Category not found.');
    return updatedCat;
  },

  async deleteCategory(id: string): Promise<void> {
    dbStore.setCategories((prev) => prev.filter((c) => c.id !== id));
  },
};
