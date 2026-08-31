import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import { ShipCheapLogo } from "@/components/ShipCheapLogo";

export default function SignUpPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[var(--background)] px-4 py-10">
      <div className="flex w-full max-w-md flex-col items-center">
        <Link href="/" className="mb-6"><ShipCheapLogo /></Link>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" forceRedirectUrl="/projects" />
        <Link href="/" className="mt-5 text-sm font-black text-[var(--accent)] underline-offset-4 hover:underline">Continue without an account</Link>
      </div>
    </main>
  );
}
