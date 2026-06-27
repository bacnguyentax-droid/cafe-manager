"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, ToggleLeft, ToggleRight, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  isAvailable: boolean;
  category: Category;
}

type FormData = {
  name: string;
  description: string;
  price: string;
  categoryId: string;
  isAvailable: boolean;
};

const EMPTY_FORM: FormData = {
  name: "",
  description: "",
  price: "",
  categoryId: "",
  isAvailable: true,
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    const [itemsRes, catsRes] = await Promise.all([
      fetch("/api/menu").then((r) => r.json()),
      fetch("/api/menu/categories").then((r) => r.json()),
    ]);
    setItems(itemsRes);
    setCategories(catsRes);
  }

  useEffect(() => { fetchData(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? "" });
    setShowModal(true);
  }

  function openEdit(item: MenuItem) {
    setEditItem(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price.toString(),
      categoryId: item.category.id,
      isAvailable: item.isAvailable,
    });
    setShowModal(true);
  }

  async function saveItem() {
    if (!form.name || !form.price || !form.categoryId) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setSaving(true);
    const url = editItem ? `/api/menu/${editItem.id}` : "/api/menu";
    const method = editItem ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editItem ? "Cập nhật thành công" : "Thêm món thành công");
      setShowModal(false);
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Lỗi lưu món");
    }
  }

  async function deleteItem(item: MenuItem) {
    if (!confirm(`Xóa "${item.name}"?`)) return;
    const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Đã xóa món");
      fetchData();
    } else {
      toast.error("Lỗi xóa món");
    }
  }

  async function toggleAvailable(item: MenuItem) {
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, categoryId: item.category.id, isAvailable: !item.isAvailable }),
    });
    if (res.ok) fetchData();
  }

  const filtered = items
    .filter((i) => activeCategory === "ALL" || i.category.id === activeCategory)
    .filter((i) => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý thực đơn</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} món · {items.filter((i) => i.isAvailable).length} đang bán</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm món
        </button>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("ALL")}
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === "ALL" ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
        >
          Tất cả ({items.length})
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category.id === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat.id ? "bg-brand-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="card mb-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tên món..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input flex-1"
          />
        </div>
      </div>

      {/* Menu items grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className={`card relative ${!item.isAvailable ? "opacity-60" : ""}`}>
            <div className="flex items-start justify-between mb-3">
              <div
                className="px-2 py-1 rounded text-xs font-medium text-white"
                style={{ backgroundColor: item.category.color }}
              >
                {item.category.name}
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="w-7 h-7 rounded bg-gray-100 hover:bg-blue-50 hover:text-blue-600 flex items-center justify-center">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteItem(item)} className="w-7 h-7 rounded bg-gray-100 hover:bg-red-50 hover:text-red-600 flex items-center justify-center">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
            {item.description && <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description}</p>}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-brand-600 font-bold">{formatCurrency(item.price)}</span>
              <button
                onClick={() => toggleAvailable(item)}
                className={`flex items-center gap-1 text-xs font-medium ${item.isAvailable ? "text-green-600" : "text-gray-400"}`}
              >
                {item.isAvailable ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                {item.isAvailable ? "Đang bán" : "Hết hàng"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p>Không có món nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{editItem ? "Chỉnh sửa món" : "Thêm món mới"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Tên món *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cà phê đen..." />
              </div>
              <div>
                <label className="label">Mô tả</label>
                <input className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả ngắn..." />
              </div>
              <div>
                <label className="label">Giá (VND) *</label>
                <input className="input" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="25000" />
              </div>
              <div>
                <label className="label">Danh mục *</label>
                <select className="input" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 text-brand-600" />
                <span className="text-sm text-gray-700">Đang bán</span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveItem} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
