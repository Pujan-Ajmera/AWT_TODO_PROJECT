import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import prisma from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const projects = await prisma.projects.findMany({
        orderBy: { ProjectName: 'asc' }
    });

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-background via-background to-muted/20">
            <Navbar />
            <div className="flex">
                <Sidebar projects={JSON.parse(JSON.stringify(projects))} />
                <main className="flex-1 ml-64 p-8 md:p-12 transition-all">
                    <div className="mx-auto max-w-[1400px]">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
