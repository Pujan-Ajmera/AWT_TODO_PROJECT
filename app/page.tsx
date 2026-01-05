import { cookies } from "next/headers";
import { LandingView } from "@/components/landing-view";
import { DashboardView } from "@/components/dashboard-view";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function RootPage() {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const session = cookieStore.get("user_session");

  if (user) {
    // If logged in, show dashboard with its layout
    const projects = await prisma.projects.findMany({
      orderBy: { ProjectName: "asc" },
    });

    return (
      <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-background via-background to-muted/20">
        <Navbar />
        <div className="flex">
          <Sidebar projects={JSON.parse(JSON.stringify(projects))} />
          <main className="flex-1 ml-64 p-8 md:p-12 transition-all">
            <div className="mx-auto max-w-[1400px]">
              <DashboardView user={user} />
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Otherwise show landing page
  return <LandingView session={session} />;
}
