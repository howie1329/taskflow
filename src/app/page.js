import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen gap-2 font-[family-name:var(--font-geist-mono)]">
      <h1>TaskFlow</h1>
      <p>TaskFlow... The Ultimate All In One Productivy App.</p>
      <Link
        className="flex bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 rounded-md items-center justify-center"
        href={"/dashboard"}
      >
        Get Started
      </Link>
    </div>
  );
}
