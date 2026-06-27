"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Coffee } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@cafe.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);

    if (result?.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      toast.error("Email hoặc mật khẩu không đúng");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-100 rounded-2xl mb-4">
            <Coffee className="w-8 h-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Cafe Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Hệ thống quản lý quán cafe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="admin@cafe.com"
              required
            />
          </div>
          <div>
            <label className="label">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-1">Tài khoản demo:</p>
          <p>Admin: admin@cafe.com / admin123</p>
          <p>Staff: staff@cafe.com / staff123</p>
        </div>
      </div>
    </div>
  );
}
