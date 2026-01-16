"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, X, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

interface Member {
    MemberID: number;
    UserID: number;
    users: {
        UserName: string;
        Email: string;
    };
}

interface ProjectInviteModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: number;
}

export function ProjectInviteModal({ isOpen, onClose, projectId }: ProjectInviteModalProps) {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [members, setMembers] = useState<Member[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchMembers();
        }
    }, [isOpen]);

    const fetchMembers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/projects/${projectId}/members`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data);
            }
        } catch (err) {
            console.error("Fetch members error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsInviting(true);
        setError(null);

        try {
            const response = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to invite user");
            }

            setMembers([...members, data]);
            setEmail("");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsInviting(false);
        }
    };

    const handleRemoveMember = async (userId: number) => {
        try {
            const response = await fetch(`/api/projects/${projectId}/members?userId=${userId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setMembers(members.filter(m => m.UserID !== userId));
            }
        } catch (err) {
            console.error("Remove member error:", err);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Project Members">
            <div className="space-y-6 pt-4">
                <form onSubmit={handleInvite} className="flex gap-2">
                    <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Enter user email..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 rounded-xl"
                            type="email"
                            required
                        />
                    </div>
                    <Button type="submit" disabled={isInviting} className="rounded-xl">
                        {isInviting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
                    </Button>
                </form>

                {error && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 italic">
                        {error}
                    </p>
                )}

                <div className="space-y-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Team Members</h4>
                    <div className="grid gap-2">
                        {isLoading ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : members.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground border-2 border-dashed rounded-2xl">
                                No members added yet.
                            </div>
                        ) : (
                            members.map((member) => (
                                <div key={member.MemberID} className="flex items-center justify-between p-3 rounded-2xl bg-muted/50 border hover:bg-muted transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary border border-primary/20">
                                            {member.users.UserName[0]}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold">{member.users.UserName}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">{member.users.Email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.UserID)}
                                        className="p-1.5 rounded-lg hover:bg-background text-muted-foreground hover:text-red-500 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
