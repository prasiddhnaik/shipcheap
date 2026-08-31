"use client";

import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="brutal-button px-3 py-2 text-sm">Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="brutal-button brutal-button-primary hidden px-3 py-2 text-sm sm:inline-flex">Create account</button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <Link href="/projects" className="brutal-button px-3 py-2 text-sm">Projects</Link>
        <UserButton showName />
      </Show>
    </div>
  );
}
