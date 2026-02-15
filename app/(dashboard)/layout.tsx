import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    // Fetch projects for sidebar
    const projects = await prisma.projects.findMany({
        orderBy: { CreatedAt: 'desc' },
        take: 3
    });

    // Check if user is admin
    let isAdmin = false;
    if (user) {
        const userRoles = await prisma.userroles.findMany({
            where: { UserID: user.userId },
            include: { roles: true }
        });
        isAdmin = userRoles.some(ur => ur.roles?.RoleName === "Admin");
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-background via-background to-muted/20">
            <Navbar isAdmin={isAdmin} />
            <div className="flex">
                <Sidebar projects={JSON.parse(JSON.stringify(projects))} />
                <main className="flex-1 ml-64 p-8 md:p-12 transition-all overflow-x-hidden">
                    <div className="w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
