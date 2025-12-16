import { notFound } from "next/navigation";

const ENABLE_TEST_ENTRY = process.env.NEXT_PUBLIC_ENABLE_TEST_ENTRY === "true";

export default function TestLayout({ children }: { children: React.ReactNode }) {
  if (!ENABLE_TEST_ENTRY) {
    notFound();
  }

  return <>{children}</>;
}

