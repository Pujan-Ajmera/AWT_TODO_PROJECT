import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail, Calendar, Shield, LogOut } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import prisma from "@/lib/prisma";

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/");
    }

    const userData = await prisma.users.findUnique({
        where: { UserID: user.userId },
        include: {
            userroles: {
                include: {
                    roles: true
                }
            }
        }
    });

    if (!userData) {
        redirect("/");
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">Manage your account information and preferences.</p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1">
                    <div className="rounded-2xl border bg-card p-6 text-center shadow-xl">
                        <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="h-12 w-12" />
                        </div>
                        <h2 className="text-xl font-bold">{userData.UserName}</h2>
                        <p className="text-sm text-muted-foreground mb-4">{userData.Email}</p>
                        <div className="flex flex-wrap justify-center gap-2">
                            {userData.userroles.map((ur, i) => (
                                <span key={i} className="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                    {ur.roles?.RoleName}
                                </span>
                            ))}
                            {userData.userroles.length === 0 && (
                                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                                    User
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <div className="rounded-2xl border bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm text-muted-foreground">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Full Name</p>
                                    <p className="text-sm font-semibold">{userData.UserName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm text-muted-foreground">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Email Address</p>
                                    <p className="text-sm font-semibold">{userData.Email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-muted/30">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background shadow-sm text-muted-foreground">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground">Member Since</p>
                                    <p className="text-sm font-semibold">
                                        {userData.CreatedAt ? new Date(userData.CreatedAt).toLocaleDateString() : "Recently"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border bg-card p-6 shadow-lg">
                        <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>
                        <div className="p-4 rounded-xl border border-red-100 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900/50 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-red-600">Sign Out</p>
                                <p className="text-xs text-muted-foreground">Securely log out of your current session.</p>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
