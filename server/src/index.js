import { createApp } from "./app.js";
import { prisma } from "./prisma.js";

const port = Number(process.env.PORT || 4000);
const app = createApp();

async function start() {
  await prisma.$connect();
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API server listening on http://localhost:${port}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
