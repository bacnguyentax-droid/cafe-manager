"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, BookOpen, ChevronDown, ChevronRight, X } from "lucide-react";
import toast from "react-hot-toast";

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: { name: string; color: string };
}

interface RecipeGroup {
  menuItem: MenuItem;
  ingredients: { id: string; ingredient: Ingredient; quantity: number }[];
}

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<RecipeGroup[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ menuItemId: "", ingredientId: "", quantity: "" });
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    const [r, m, i] = await Promise.all([
      fetch("/api/recipes").then((x) => x.json()),
      fetch("/api/menu").then((x) => x.json()),
      fetch("/api/inventory").then((x) => x.json()),
    ]);
    setRecipes(r);
    setMenuItems(m);
    setIngredients(i);
  }

  useEffect(() => { fetchData(); }, []);

  function toggleExpand(id: string) {
    setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }

  async function addRecipe() {
    if (!form.menuItemId || !form.ingredientId || !form.quantity) {
      toast.error("Điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Đã thêm nguyên liệu vào công thức");
      setShowModal(false);
      fetchData();
    } else {
      toast.error("Lỗi thêm công thức");
    }
  }

  async function deleteRecipeItem(id: string) {
    if (!confirm("Xóa nguyên liệu này khỏi công thức?")) return;
    const res = await fetch("/api/recipes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast.success("Đã xóa");
      fetchData();
    }
  }

  // Menu items that don't have any recipe yet
  const menuItemsWithoutRecipe = menuItems.filter(
    (m) => !recipes.find((r) => r.menuItem.id === m.id)
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý công thức</h1>
          <p className="text-gray-500 text-sm mt-1">Định nghĩa nguyên liệu cho từng món — kho tự trừ khi có đơn</p>
        </div>
        <button onClick={() => { setForm({ menuItemId: menuItems[0]?.id ?? "", ingredientId: ingredients[0]?.id ?? "", quantity: "" }); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm công thức
        </button>
      </div>

      {recipes.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">Chưa có công thức nào. Thêm công thức để hệ thống tự trừ kho.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Thêm công thức đầu tiên
          </button>
        </div>
      )}

      <div className="space-y-3">
        {recipes.map((group) => {
          const isExpanded = expanded.includes(group.menuItem.id);
          return (
            <div key={group.menuItem.id} className="card p-0 overflow-hidden">
              <button
                onClick={() => toggleExpand(group.menuItem.id)}
                className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: group.menuItem.category.color }}
                >
                  {group.menuItem.category.name[0]}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900">{group.menuItem.name}</p>
                  <p className="text-sm text-gray-500">{group.ingredients.length} nguyên liệu</p>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
              </button>

              {isExpanded && (
                <div className="border-t border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Nguyên liệu</th>
                        <th className="text-left px-4 py-2 text-gray-500 font-medium">Số lượng / 1 phần</th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {group.ingredients.map((ri) => (
                        <tr key={ri.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{ri.ingredient.name}</td>
                          <td className="px-4 py-3 text-gray-600">{ri.quantity} {ri.ingredient.unit}</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteRecipeItem(ri.id)}
                              className="w-7 h-7 rounded bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center ml-auto"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-4 py-3 border-t border-gray-100">
                    <button
                      onClick={() => {
                        setForm({ menuItemId: group.menuItem.id, ingredientId: ingredients[0]?.id ?? "", quantity: "" });
                        setShowModal(true);
                      }}
                      className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Thêm nguyên liệu
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Thêm công thức</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Món ăn/uống</label>
                <select className="input" value={form.menuItemId} onChange={(e) => setForm({ ...form, menuItemId: e.target.value })}>
                  {menuItems.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.category.name})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nguyên liệu</label>
                <select className="input" value={form.ingredientId} onChange={(e) => setForm({ ...form, ingredientId: e.target.value })}>
                  {ingredients.map((i) => <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Số lượng cần / 1 phần</label>
                <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="30" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={addRecipe} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
