"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Package, AlertTriangle, ArrowUp, ArrowDown, SlidersHorizontal, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

interface StockMovement {
  id: string;
  type: string;
  quantity: number;
  note?: string;
  createdAt: string;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minQuantity: number;
  costPerUnit: number;
  stockMovements: StockMovement[];
}

type Mode = "create" | "edit" | "adjust" | null;

const UNITS = ["g", "kg", "ml", "L", "pcs", "kg"];

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [mode, setMode] = useState<Mode>(null);
  const [selected, setSelected] = useState<Ingredient | null>(null);
  const [form, setForm] = useState({ name: "", unit: "ml", quantity: "", minQuantity: "10", costPerUnit: "0" });
  const [adjust, setAdjust] = useState({ type: "IN", quantity: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("ALL"); // ALL | LOW | OK

  async function fetchData() {
    const res = await fetch("/api/inventory");
    setIngredients(await res.json());
  }

  useEffect(() => { fetchData(); }, []);

  function openCreate() {
    setSelected(null);
    setForm({ name: "", unit: "ml", quantity: "", minQuantity: "10", costPerUnit: "0" });
    setMode("create");
  }

  function openEdit(item: Ingredient) {
    setSelected(item);
    setForm({ name: item.name, unit: item.unit, quantity: item.quantity.toString(), minQuantity: item.minQuantity.toString(), costPerUnit: item.costPerUnit.toString() });
    setMode("edit");
  }

  function openAdjust(item: Ingredient) {
    setSelected(item);
    setAdjust({ type: "IN", quantity: "", note: "" });
    setMode("adjust");
  }

  async function saveIngredient() {
    if (!form.name || !form.unit) { toast.error("Điền đầy đủ thông tin"); return; }
    setSaving(true);
    const url = mode === "edit" ? `/api/inventory/${selected!.id}` : "/api/inventory";
    const method = mode === "edit" ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(mode === "edit" ? "Cập nhật thành công" : "Thêm nguyên liệu thành công");
      setMode(null);
      fetchData();
    } else {
      toast.error("Lỗi lưu nguyên liệu");
    }
  }

  async function submitAdjust() {
    if (!adjust.quantity) { toast.error("Nhập số lượng"); return; }
    setSaving(true);
    const res = await fetch(`/api/inventory/${selected!.id}/adjust`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adjust),
    });
    setSaving(false);
    if (res.ok) {
      toast.success("Cập nhật kho thành công");
      setMode(null);
      fetchData();
    } else {
      toast.error("Lỗi cập nhật kho");
    }
  }

  const filtered = ingredients.filter((i) => {
    if (filter === "LOW") return i.quantity <= i.minQuantity;
    if (filter === "OK") return i.quantity > i.minQuantity;
    return true;
  });

  const lowCount = ingredients.filter((i) => i.quantity <= i.minQuantity).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý kho nguyên liệu</h1>
          <p className="text-gray-500 text-sm mt-1">
            {ingredients.length} nguyên liệu
            {lowCount > 0 && <span className="ml-2 text-red-600 font-medium">· {lowCount} cần nhập thêm</span>}
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm nguyên liệu
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[["ALL", "Tất cả"], ["LOW", "Sắp hết"], ["OK", "Đủ hàng"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === val ? "bg-brand-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ingredients grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isLow = item.quantity <= item.minQuantity;
          const pct = Math.min(100, (item.quantity / (item.minQuantity * 3)) * 100);
          return (
            <div key={item.id} className={`card relative ${isLow ? "border-red-300 bg-red-50/30" : ""}`}>
              {isLow && (
                <div className="absolute top-3 right-3">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
              )}
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? "bg-red-100" : "bg-brand-100"}`}>
                  <Package className={`w-5 h-5 ${isLow ? "text-red-600" : "text-brand-600"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">Đơn vị: {item.unit}</p>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Tồn kho</span>
                  <span className={`font-semibold ${isLow ? "text-red-600" : "text-gray-900"}`}>
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isLow ? "bg-red-500" : "bg-green-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Ngưỡng cảnh báo: {item.minQuantity} {item.unit}</p>
              </div>

              <div className="text-sm text-gray-500 mb-4">
                Giá nhập: {formatCurrency(item.costPerUnit)}/{item.unit}
              </div>

              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button onClick={() => openAdjust(item)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg transition-colors">
                  <SlidersHorizontal className="w-4 h-4" />
                  Điều chỉnh kho
                </button>
                <button onClick={() => openEdit(item)} className="w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {(mode === "create" || mode === "edit") && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{mode === "edit" ? "Chỉnh sửa nguyên liệu" : "Thêm nguyên liệu"}</h2>
              <button onClick={() => setMode(null)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Tên nguyên liệu *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cà phê robusta..." />
              </div>
              <div>
                <label className="label">Đơn vị *</label>
                <select className="input" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              {mode === "create" && (
                <div>
                  <label className="label">Số lượng ban đầu</label>
                  <input className="input" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
                </div>
              )}
              <div>
                <label className="label">Ngưỡng cảnh báo</label>
                <input className="input" type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} placeholder="10" />
              </div>
              <div>
                <label className="label">Giá nhập/đơn vị (VND)</label>
                <input className="input" type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMode(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={saveIngredient} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {mode === "adjust" && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Điều chỉnh kho: {selected.name}</h2>
              <button onClick={() => setMode(null)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <p className="text-gray-500">Tồn kho hiện tại: <span className="font-bold text-gray-900">{selected.quantity} {selected.unit}</span></p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Loại điều chỉnh</label>
                <div className="grid grid-cols-3 gap-2">
                  {[["IN", "Nhập kho", "bg-green-50 text-green-700 border-green-300"], ["OUT", "Xuất kho", "bg-red-50 text-red-700 border-red-300"], ["ADJUST", "Kiểm kê", "bg-blue-50 text-blue-700 border-blue-300"]].map(([val, label, cls]) => (
                    <button
                      key={val}
                      onClick={() => setAdjust({ ...adjust, type: val })}
                      className={`py-2 text-sm font-medium rounded-lg border-2 transition-colors ${adjust.type === val ? cls : "border-gray-200 text-gray-500"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Số lượng ({selected.unit})</label>
                <input className="input" type="number" value={adjust.quantity} onChange={(e) => setAdjust({ ...adjust, quantity: e.target.value })} placeholder="0" />
              </div>
              <div>
                <label className="label">Ghi chú</label>
                <input className="input" value={adjust.note} onChange={(e) => setAdjust({ ...adjust, note: e.target.value })} placeholder="Nhập hàng từ nhà cung cấp..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setMode(null)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={submitAdjust} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
