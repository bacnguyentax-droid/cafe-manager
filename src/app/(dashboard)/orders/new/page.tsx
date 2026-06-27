"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, ShoppingCart, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";
import Link from "next/link";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  isAvailable: boolean;
  category: { name: string; color: string };
}

interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export default function NewOrderPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/menu?available=true")
      .then((r) => r.json())
      .then((data: MenuItem[]) => {
        setMenuItems(data);
        const cats = [...new Set(data.map((m) => m.category.name))];
        setCategories(cats);
      });
  }, []);

  function addToCart(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  }

  function updateQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => (c.menuItem.id === id ? { ...c, quantity: c.quantity + delta } : c))
        .filter((c) => c.quantity > 0)
    );
  }

  function removeFromCart(id: string) {
    setCart((prev) => prev.filter((c) => c.menuItem.id !== id));
  }

  const total = cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0);

  const filtered =
    activeCategory === "ALL"
      ? menuItems
      : menuItems.filter((m) => m.category.name === activeCategory);

  async function submitOrder() {
    if (cart.length === 0) {
      toast.error("Chưa chọn món nào!");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableNumber: tableNumber || undefined,
        notes: orderNotes || undefined,
        items: cart.map((c) => ({
          menuItemId: c.menuItem.id,
          quantity: c.quantity,
          price: c.menuItem.price,
        })),
      }),
    });
    setLoading(false);
    if (res.ok) {
      const order = await res.json();
      toast.success(`Đặt đơn #${order.orderNumber} thành công!`);
      router.push("/orders");
    } else {
      const err = await res.json();
      toast.error(err.error || "Lỗi tạo đơn hàng");
    }
  }

  return (
    <div className="h-full flex">
      {/* Left: Menu */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/orders" className="btn-secondary flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Tạo đơn mới</h1>
          </div>
          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === "ALL"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((item) => {
              const inCart = cart.find((c) => c.menuItem.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={!item.isAvailable}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    inCart
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200 bg-white hover:border-brand-300 hover:shadow-md"
                  } ${!item.isAvailable ? "opacity-40 cursor-not-allowed" : ""}`}
                >
                  {inCart && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-brand-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {inCart.quantity}
                    </div>
                  )}
                  <div
                    className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: item.category.color }}
                  >
                    {item.category.name[0]}
                  </div>
                  <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                  <p className="text-brand-600 font-semibold text-sm mt-1">{formatCurrency(item.price)}</p>
                  {!item.isAvailable && (
                    <p className="text-red-500 text-xs mt-1">Hết hàng</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand-600" />
            Giỏ hàng ({cart.length} món)
          </h2>
        </div>

        {/* Table & notes */}
        <div className="p-4 border-b border-gray-100 space-y-3">
          <div>
            <label className="label">Số bàn (không bắt buộc)</label>
            <input
              type="text"
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              className="input"
              placeholder="Bàn 1, 2, Take away..."
            />
          </div>
          <div>
            <label className="label">Ghi chú đơn</label>
            <input
              type="text"
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              className="input"
              placeholder="Ít đường, không đá..."
            />
          </div>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Chưa có món nào</p>
          ) : (
            cart.map((item) => (
              <div key={item.menuItem.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.menuItem.name}</p>
                  <p className="text-xs text-brand-600">{formatCurrency(item.menuItem.price * item.quantity)}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => updateQty(item.menuItem.id, -1)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.menuItem.id, 1)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => removeFromCart(item.menuItem.id)}
                    className="w-6 h-6 rounded bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center ml-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & submit */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Tổng cộng:</span>
            <span className="text-xl font-bold text-brand-600">{formatCurrency(total)}</span>
          </div>
          <button
            onClick={submitOrder}
            disabled={loading || cart.length === 0}
            className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Đặt đơn"}
          </button>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="btn-secondary w-full text-sm">
              Xóa giỏ hàng
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
