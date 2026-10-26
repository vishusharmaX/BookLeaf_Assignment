import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/Navbar";
import { AuthorSidebar } from "@/components/layout/AuthorSidebar";

export default async function AuthorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "AUTHOR") {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#FBF9F5]">
      <Navbar user={session} />
      <div className="flex">
        <AuthorSidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
