import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function main() {
  const { db } = await import("@/lib/db/client");
  const { seeds } = await import("@/db/seeds");

  if (seeds.length === 0) {
    console.log("No seeds registered yet.");
    return;
  }

  for (const seed of seeds) {
    await db.transaction(async (tx) => {
      console.log(`Seeding: ${seed.name}`);
      await seed.run(tx);
    });
  }

  console.log(`Ran ${seeds.length} seed(s).`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
