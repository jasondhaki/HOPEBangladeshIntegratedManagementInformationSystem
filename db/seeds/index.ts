import type { db } from "@/lib/db/client";

export type SeedTransaction = Parameters<Parameters<(typeof db)["transaction"]>[0]>[0];

export interface Seed {
  name: string;
  run: (tx: SeedTransaction) => Promise<void>;
}

// Master data seeds (Appendix C) land here starting with P1-07. Empty today — P0-03 only wires
// the runner.
export const seeds: Seed[] = [];
