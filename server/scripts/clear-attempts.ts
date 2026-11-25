import { prisma } from "../src/config/prisma.js";

async function main() {
  const result = await prisma.attempt.deleteMany();

}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
