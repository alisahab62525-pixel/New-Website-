import React, { useEffect, useState } from 'react';
import { Edit2, Layers, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { categoryService } from '../../services/categoryService';
import { dbStore } from '../../services/store';
import { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchCategories = () => {
    categoryService.getCategories(true).then((cats) => {
      setCategories(cats);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchCategories();
    const unsub = dbStore.subscribe(fetchCategories);
    return unsub;
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setImage('https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80');
    setIsActive(true);
    setModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setIsActive(cat.isActive);
    setModalOpen(true);
  };

  const handleDelete = async (id: string, catName: string) => {
    if (window.confirm(`Delete category "${catName}"?`)) {
      try {
        await categoryService.deleteCategory(id);
        success(`Category "${catName}" deleted.`);
      } catch (err: any) {
        error(err.message || 'Failed to delete category');
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await categoryService.updateCategory(editingId, {
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
          isActive,
        });
        success(`Category "${name}" updated.`);
      } else {
        await categoryService.createCategory({
          name: name.trim(),
          description: description.trim(),
          image: image.trim(),
          isActive,
        });
        success(`Category "${name}" created.`);
      }
      setModalOpen(false);
    } catch (err: any) {
      error(err.message || 'Failed to save category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Department Categories</h1>
          <p className="text-xs text-stone-400 mt-1">
            Organize products into customer-facing departments and navigational groups.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="bg-stone-900 border border-stone-800 rounded-3xl overflow-hidden flex flex-col justify-between"
          >
            <div className="relative aspect-16/9 bg-stone-800">
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    cat.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {cat.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3 flex-1 flex flex-col justify-between text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-heading font-bold text-base text-white">{cat.name}</h2>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    {cat.productCount} Products
                  </span>
                </div>
                <p className="text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-800 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-xl font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cat.id, cat.name)}
                  className="p-1.5 text-stone-500 hover:text-rose-400 rounded-xl hover:bg-stone-800 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="font-heading font-bold text-base text-white pb-2 border-b border-stone-800">
              {editingId ? 'Edit Department Category' : 'Create New Category'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-semibold block text-stone-300 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-300 mb-1">Image URL</label>
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="font-semibold block text-stone-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-amber-500"
                />
                <label htmlFor="catActive" className="text-stone-300 cursor-pointer">
                  Category is Active and visible in storefront
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-stone-800 rounded-xl text-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 text-stone-950 font-bold rounded-xl"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
