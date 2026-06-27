"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { formatCurrency, formatDate, ORDER_STATUS } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  lowStockCount: number;
  lowStockItems: { id: string; name: string; quantity: number; minQuantity: number; unit: string }[];
  recentOrders: {
    id: string;
    orderNumber: number;
    totalAmount: number;
    status: string;
    createdAt: string;
    staff: { name: string };
    orderItems: { menuItem: { name: string }; quantity: number }[];
  }[];
  weeklyRevenue: { date: string; revenue: number; orders: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    const res = await fetch("/api/dashboard");
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-brand-600 mx-auto mb-3" />
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Đơn hôm nay",
      value: data?.todayOrders ?? 0,
      icon: ShoppingCart,
      color: "bg-blue-50 text-blue-600",
      bg: "bg-blue-600",
    },
    {
      label: "Doanh thu hôm nay",
      value: formatCurrency(data?.todayRevenue ?? 0),
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      bg: "bg-green-600",
    },
    {
      label: "Đơn chờ xử lý",
      value: data?.pendingOrders ?? 0,
      icon: Clock,
      color: "bg-yellow-50 text-yellow-600",
      bg: "bg-yellow-500",
    },
    {
      label: "Cảnh báo kho",
      value: data?.lowStockCount ?? 0,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-600",
      bg: "bg-red-600",
    },
  ];

  const chartData = (data?.weeklyRevenue ?? []).map((d) => ({
    date: new Date(d.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" }),
    "Doanh thu": d.revenue,
    "Đơn hàng": d.orders,
  }));

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
          </p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="card lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 7 ngày qua</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="Doanh thu" fill="#c96118" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-400">
              Chưa có dữ liệu doanh thu
            </div>
          )}
        </div>

        {/* Low stock alerts */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Cảnh báo kho
          </h2>
          {(data?.lowStockItems ?? []).length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">Tất cả nguyên liệu đủ hàng ✓</p>
          ) : (
            <div className="space-y-3">
              {data?.lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-red-600">
                      Còn {item.quantity} {item.unit} (min: {item.minQuantity})
                    </p>
                  </div>
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="card mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Đơn hàng gần đây</h2>
        {(data?.recentOrders ?? []).length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">Chưa có đơn hàng nào hôm nay</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200">
                  <th className="pb-3 text-gray-500 font-medium">Mã đơn</th>
                  <th className="pb-3 text-gray-500 font-medium">Món</th>
                  <th className="pb-3 text-gray-500 font-medium">Nhân viên</th>
                  <th className="pb-3 text-gray-500 font-medium">Tổng tiền</th>
                  <th className="pb-3 text-gray-500 font-medium">Trạng thái</th>
                  <th className="pb-3 text-gray-500 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data?.recentOrders.map((order) => {
                  const statusInfo = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="py-3 font-mono font-medium">#{order.orderNumber}</td>
                      <td className="py-3 text-gray-600 max-w-[200px] truncate">
                        {order.orderItems.map((i) => `${i.menuItem.name}×${i.quantity}`).join(", ")}
                      </td>
                      <td className="py-3 text-gray-600">{order.staff.name}</td>
                      <td className="py-3 font-medium">{formatCurrency(order.totalAmount)}</td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo?.color}`}>
                          {statusInfo?.label}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500">{formatDate(order.createdAt)}</td>
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
