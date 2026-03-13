import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleApiError, ApiError } from "@/lib/api-utils";

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) throw new ApiError("Unauthorized", 401);

        const users = await prisma.users.findMany({
            select: {
                UserID: true,
                UserName: true,
                Email: true
            },
            orderBy: { UserName: "asc" }
        });

        return NextResponse.json(users);
    } catch (error) {
        return handleApiError(error);
    }
}
