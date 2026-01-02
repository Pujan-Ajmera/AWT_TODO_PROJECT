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
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="flex">
                <Sidebar projects={JSON.parse(JSON.stringify(projects))} />
                <main className="ml-64 w-full p-8 transition-all">
                    <div className="mx-auto max-w-6xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
