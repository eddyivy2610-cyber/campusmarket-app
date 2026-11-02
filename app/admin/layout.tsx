"use client";

import AdminLayout from "@/components/admin/AdminLayout";
import { usePathname } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isAdminAuthRoute = pathname?.startsWith("/admin/auth");

	return (
		<div
			style={{
				fontFamily:
					"var(--font-plus-jakarta), var(--font-poppins), system-ui, -apple-system, sans-serif",
			}}
			className="min-h-screen bg-[#F7F8FA] dark:bg-[#0E1015] text-[#171717] dark:text-white antialiased"
		>
			{isAdminAuthRoute ? children : <AdminLayout>{children}</AdminLayout>}
		</div>
	);
}
