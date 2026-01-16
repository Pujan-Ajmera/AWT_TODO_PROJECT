import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, email } = body;

        const updatedUser = await prisma.users.update({
            where: { UserID: user.userId },
            data: {
                UserName: name,
                Email: email,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("PATCH profile error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
