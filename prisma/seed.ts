import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const password = await hash("Pass1234!", 12)
  const user = await prisma.user.create({
    data: {
      id: "1",
      name: "Test User",
      email: "test@famlam.ca",
      emailVerified: true,
      image: "https://gravatar.com/avatar/HASH",
      createdAt: new Date(),
      updatedAt: new Date(),
      accounts: {
        create: {
          id: "1",
          accountId: "1",
          providerId: "email",
          password,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    },
  })

  console.log({
    user,
  })
}
main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
