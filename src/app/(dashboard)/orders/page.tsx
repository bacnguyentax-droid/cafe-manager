"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, RefreshCw } from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/lib/utils";
import toast from "react-hot-toast";

interface Order {
  id: string;
  orderNumber: number;
  tableNumber?: string;
  status: string;
  totalAmount: number;
  notes?: string;
  createdAt: string;
  staff: { name: string };
  orderItems: { menuItem: { name: string }; quantity: number; price: number }[];
}

const STATUS_OPTIONS = ["ALL", "PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus !== "ALL") params.set("status", filterStatus);
    if (filterDate) params.set("date", filterDate);
    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    setOrders(data);
    setLoading(false);
  }, [filterStatus, filterDate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast.success("Cập nhật trạng thái thành công");
      fetchOrders();
    } else {
      toast.error("Lỗi cập nhật trạng thái");
    }
  }

  const filtered = orders.filter((o) =>
    search ? `#${o.orderNumber}`.includes(search) || o.staff.name.toLowerCase().includes(search.toLowerCase()) : true
  );

  const todayRevenue = orders
    .filter((o) => o.status === "COMPLETED")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-500 text-sm mt-1">
            {filtered.length} đơn · Doanh thu: {formatCurrency(todayRevenue)}
          </p>
        </div>
        <Link href="/orders/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Tạo đơn mới
        </Link>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm mã đơn, nhân viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input flex-1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input w-auto"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "ALL" ? "Tất cả trạng thái" : ORDER_STATUS[s as keyof typeof ORDER_STATUS]?.label}
                </option>
              ))}
            </select>
          </div>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="input w-auto"
          />
          <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const).map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const info = ORDER_STATUS[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`card text-center cursor-pointer hover:shadow-md transition-shadow ${filterStatus === s ? "ring-2 ring-brand-500" : ""}`}
            >
              <p className="text-2xl font-bold text-gray-900">{count}</p>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${info.color}`}>{info.label}</span>
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="card">
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-gray-500">Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 text-gray-500 font-medium">Mã đơn</th>
                  <th className="pb-3 text-gray-500 font-medium">Bàn</th>
                  <th className="pb-3 text-gray-500 font-medium">Món đặt</th>
                  <th className="pb-3 text-gray-500 font-medium">Nhân viên</th>
                  <th className="pb-3 text-gray-500 font-medium">Tổng tiền</th>
                  <th className="pb-3 text-gray-500 font-medium">Trạng thái</th>
                  <th className="pb-3 text-gray-500 font-medium">Thời gian</th>
                  <th className="pb-3 text-gray-500 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((order) => {
                  const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono font-bold text-brand-600">#{order.orderNumber}</td>
                      <td className="py-3 text-gray-600">{order.tableNumber || "—"}</td>
                      <td className="py-3 text-gray-600 max-w-[200px]">
                        <div className="truncate">
                          {order.orderItems.map((i) => `${i.menuItem.name}×${i.quantity}`).join(", ")}
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{order.staff.name}</td>
                      <td className="py-3 font-semibold">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                      <td className="py-3">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          <option value="PENDING">Chờ xử lý</option>
                          <option value="IN_PROGRESS">Đang làm</option>
                          <option value="COMPLETED">Hoàn thành</option>
                          <option value="CANCELLED">Hủy</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
