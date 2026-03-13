import { cookies } from "next/headers";
import { LandingView } from "@/components/landing-view";
import { DashboardView } from "@/components/dashboard-view";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function RootPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  if (user) {
    // Check if user is admin
    const userRoles = await prisma.userroles.findMany({
      where: { UserID: user.userId },
      include: { roles: true }
    });
    const isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");

    const projects = await prisma.projects.findMany({
      where: isAdmin ? {} : {
        OR: [
          { CreatedBy: user.userId },
          { project_members: { some: { UserID: user.userId } } }
        ]
      },
      orderBy: { CreatedAt: "desc" },
      take: 3
    });

    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-background via-background to-muted/20">
        <Navbar isAdmin={isAdmin} />
        <div className="flex">
          <Sidebar projects={JSON.parse(JSON.stringify(projects))} isAdmin={isAdmin} />
          <main className="flex-1 ml-64 p-8 md:p-12 transition-all">
            <div className="mx-auto max-w-[1400px]">
              <DashboardView user={user} q={q} isAdmin={isAdmin} />
            </div>
          </main>
        </div>
      </div>
    );
  }
  return <LandingView session={session} />;
}
