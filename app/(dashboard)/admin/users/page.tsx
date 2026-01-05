import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
    Users,
    Shield,
    Mail,
    Calendar,
    MoreHorizontal,
    UserPlus,
    Search,
    ShieldCheck,
    Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserRoleManager } from "./user-role-manager";
import { deleteUserAction } from "@/app/actions/admin";
import { CreateUserModal } from "./create-user-modal";
import { UpdateUserModal } from "./update-user-modal";

export default async function AdminUsersPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Fetch all users with their roles
    const allUsers = await prisma.users.findMany({
        include: {
            userroles: {
                include: {
                    roles: true
                }
            }
        },
        orderBy: { CreatedAt: "desc" }
    });

    // Fetch all available roles
    const allRoles = await prisma.roles.findMany();

    // Check if the current user is actually an admin
    const isAdmin = allUsers.find(u => u.UserID === user.userId)?.userroles.some(ur => ur.roles?.RoleName === "Admin");

    if (!isAdmin) {
        return (
            <div className="flex h-[70vh] flex-col items-center justify-center p-8 space-y-4">
                <div className="h-20 w-20 rounded-3xl bg-red-100 flex items-center justify-center text-red-600">
                    <Shield className="h-10 w-10" />
                </div>
                <h1 className="text-3xl font-black">Access Prohibited</h1>
                <p className="text-muted-foreground text-center max-w-md">
                    You do not have administrative privileges to access this area. Please contact your system administrator.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-muted-foreground text-lg">Manage user access control and system roles.</p>
                </div>
                <CreateUserModal roles={allRoles} />
            </header>

            <div className="bg-card/30 backdrop-blur-md rounded-[2.5rem] border border-border/50 overflow-hidden card-shadow">
                <div className="p-8 border-b border-border/10 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/20">
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by name or email..."
                            className="w-full h-12 rounded-2xl border bg-background/50 pl-12 pr-4 text-sm outline-none transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                            <ShieldCheck className="h-4 w-4" />
                            <span className="text-xs font-black uppercase tracking-widest">{allUsers.length} Total Users</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/10">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Joined</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/10">
                            {allUsers.map((u) => (
                                <tr key={u.UserID} className="group hover:bg-muted/20 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                                                {u.UserName[0]}
                                            </div>
                                            <span className="font-bold text-base">{u.UserName}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span className="text-sm font-medium">{u.Email}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <UserRoleManager
                                            userId={u.UserID}
                                            currentRoles={u.userroles.map(ur => ur.roles?.RoleName || "")}
                                            availableRoles={allRoles}
                                        />
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span className="text-sm font-medium">
                                                {u.CreatedAt ? new Date(u.CreatedAt).toLocaleDateString() : "Never"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <UpdateUserModal
                                                user={{
                                                    userId: u.UserID,
                                                    name: u.UserName,
                                                    email: u.Email,
                                                    roles: u.userroles.map(ur => ur.roles?.RoleName || "")
                                                }}
                                                availableRoles={allRoles}
                                            />
                                            {u.UserID !== user.userId && (
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm("Are you sure you want to delete this user?")) return;
                                                        const response = await fetch(`/api/admin/users/${u.UserID}`, {
                                                            method: "DELETE"
                                                        });
                                                        if (response.ok) {
                                                            window.location.reload();
                                                        } else {
                                                            const data = await response.json();
                                                            alert(data.error || "Failed to delete user");
                                                        }
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
