import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center text-foreground">
      <h1 className="text-2xl font-semibold">HB-IMIS</h1>
      <p className="text-muted-foreground">Scaffold in progress.</p>
      <Button>Get started</Button>
    </main>
  );
}
