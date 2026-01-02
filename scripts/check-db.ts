import prisma from "../lib/prisma";

async function main() {
    try {
        const usersCount = await prisma.users.count();
        const projectsCount = await prisma.projects.count();
        const tasksCount = await prisma.tasks.count();

        console.log({ usersCount, projectsCount, tasksCount });

        const firstUser = await prisma.users.findFirst();
        console.log("First User:", firstUser);

        const projects = await prisma.projects.findMany({ take: 5 });
        console.log("Projects:", projects);
    } catch (error) {
        console.error("Error checking DB:", error);
    }
}

main();
