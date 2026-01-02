import prisma from "@/lib/prisma";
async function page() {
  console.log({
    db: process.env.DB_NAME,
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  });

  const data = await prisma.users.findFirst({});
  console.log(data);
  return (
    <>
      <h1>hehehheheh</h1>
    </>
  );
}

export default page;
