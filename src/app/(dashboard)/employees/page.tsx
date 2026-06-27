"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, User, Phone, Mail, X, Shield, ShieldCheck } from "lucide-react";
import { formatDate, ROLES } from "@/lib/utils";
import toast from "react-hot-toast";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
}

const EMPTY_FORM = { name: "", email: "", phone: "", role: "STAFF", isActive: true, password: "" };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);

  async function fetchData() {
    const res = await fetch("/api/employees");
    if (res.ok) setEmployees(await res.json());
  }

  useEffect(() => { fetchData(); }, []);

  function openCreate() {
    setEditEmp(null);
    setForm({ ...EMPTY_FORM });
    setShowModal(true);
  }

  function openEdit(emp: Employee) {
    setEditEmp(emp);
    setForm({ name: emp.name, email: emp.email, phone: emp.phone ?? "", role: emp.role, isActive: emp.isActive, password: "" });
    setShowModal(true);
  }

  async function save() {
    if (!form.name || !form.email) { toast.error("Điền đầy đủ thông tin"); return; }
    if (!editEmp && !form.password) { toast.error("Nhập mật khẩu cho nhân viên mới"); return; }
    setSaving(true);
    const url = editEmp ? `/api/employees/${editEmp.id}` : "/api/employees";
    const method = editEmp ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      toast.success(editEmp ? "Cập nhật thành công" : "Thêm nhân viên thành công");
      setShowModal(false);
      fetchData();
    } else {
      const err = await res.json();
      toast.error(err.error || "Lỗi lưu nhân viên");
    }
  }

  const activeCount = employees.filter((e) => e.isActive).length;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý nhân viên</h1>
          <p className="text-gray-500 text-sm mt-1">{employees.length} nhân viên · {activeCount} đang hoạt động</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Thêm nhân viên
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp) => (
          <div key={emp.id} className={`card ${!emp.isActive ? "opacity-60" : ""}`}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg flex-shrink-0">
                {emp.name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900 truncate">{emp.name}</h3>
                  {emp.role === "ADMIN" && <ShieldCheck className="w-4 h-4 text-brand-600 flex-shrink-0" />}
                  {emp.role === "MANAGER" && <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  emp.role === "ADMIN" ? "bg-brand-100 text-brand-700" :
                  emp.role === "MANAGER" ? "bg-blue-100 text-blue-700" :
                  "bg-gray-100 text-gray-600"
                }`}>
                  {ROLES[emp.role as keyof typeof ROLES] || emp.role}
                </span>
              </div>
              <button onClick={() => openEdit(emp)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Edit2 className="w-3.5 h-3.5 text-gray-600" />
              </button>
            </div>

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{emp.email}</span>
              </div>
              {emp.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{emp.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span>{emp._count.orders} đơn đã xử lý</span>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs text-gray-400">
              <span>Tham gia: {formatDate(emp.createdAt)}</span>
              <span className={`px-2 py-1 rounded-full font-medium ${emp.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                {emp.isActive ? "Đang làm" : "Nghỉ việc"}
              </span>
            </div>
          </div>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Chưa có nhân viên nào</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">{editEmp ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}</h2>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Họ tên *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nguyễn Văn A" />
              </div>
              <div>
                <label className="label">Email *</label>
                <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="staff@cafe.com" disabled={!!editEmp} />
              </div>
              <div>
                <label className="label">Số điện thoại</label>
                <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0901234567" />
              </div>
              <div>
                <label className="label">Chức vụ</label>
                <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="STAFF">Nhân viên</option>
                  <option value="MANAGER">Quản lý</option>
                  <option value="ADMIN">Quản trị viên</option>
                </select>
              </div>
              <div>
                <label className="label">{editEmp ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu *"}</label>
                <input className="input" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
              </div>
              {editEmp && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Đang làm việc</span>
                </label>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">Hủy</button>
              <button onClick={save} disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
