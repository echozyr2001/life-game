import { Main } from "@/components/Main";
import { Header } from "@/components/Header";
import "./globals.css";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-14">
      <div className="max-w-5xl w-full items-center justify-center font-mono text-sm">
        <Header />
        <Main />
      </div>
    </main>
  );
}
