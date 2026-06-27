"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Coffee,
  LayoutDashboard,
  ShoppingCart,
  UtensilsCrossed,
  Package,
  BookOpen,
  Users,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/orders", label: "Đặt hàng / Order", icon: ShoppingCart },
  { href: "/menu", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "/inventory", label: "Kho nguyên liệu", icon: Package },
  { href: "/recipes", label: "Công thức", icon: BookOpen },
  { href: "/employees", label: "Nhân viên", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-brand-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-brand-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Cafe Manager</h1>
            <p className="text-brand-300 text-xs">Quản lý quán cafe</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-600 text-white"
                  : "text-brand-200 hover:bg-brand-800 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-4 border-t border-brand-800">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {session?.user?.name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{session?.user?.name}</p>
            <p className="text-brand-300 text-xs">{session?.user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-brand-200 hover:bg-brand-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}
