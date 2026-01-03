import { cookies } from "next/headers";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("user_session");

    if (!session) return null;

    try {
        return JSON.parse(session.value) as {
            userId: number;
            email: string;
            name: string;
        };
    } catch (error) {
        return null;
    }
}
