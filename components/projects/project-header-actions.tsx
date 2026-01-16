"use client";

import { useState } from "react";
import { Users, Settings as SettingsIcon } from "lucide-react";
import { ProjectInviteModal } from "./project-invite-modal";
import { ProjectSettingsModal } from "./project-settings-modal";

interface ProjectHeaderActionsProps {
    project: {
        ProjectID: number;
        ProjectName: string;
        Description: string | null;
    };
    members: any[];
}

export function ProjectHeaderActions({ project, members }: ProjectHeaderActionsProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-3">
                <div className="flex -space-x-3 mr-4">
                    {members.slice(0, 4).map((member) => (
                        <div key={member.MemberID} className="h-10 w-10 rounded-full border-4 border-background bg-primary/10 flex items-center justify-center text-xs font-bold shadow-sm text-primary" title={member.users.UserName}>
                            {member.users.UserName[0]}
                        </div>
                    ))}
                    {members.length > 4 && (
                        <div className="h-10 w-10 rounded-full border-4 border-background bg-muted flex items-center justify-center text-[10px] font-black shadow-sm text-muted-foreground">
                            +{members.length - 4}
                        </div>
                    )}
                </div>
                <div className="h-8 w-[1px] bg-border mx-2" />
                <button
                    onClick={() => setIsInviteOpen(true)}
                    className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted transition-all active:scale-95 shadow-sm"
                >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    Invite
                </button>
                <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-all active:scale-95 shadow-sm"
                >
                    <SettingsIcon className="h-5 w-5 text-muted-foreground" />
                </button>
            </div>

            <ProjectInviteModal
                isOpen={isInviteOpen}
                onClose={() => setIsInviteOpen(false)}
                projectId={project.ProjectID}
            />

            <ProjectSettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                project={project}
            />
        </>
    );
}
