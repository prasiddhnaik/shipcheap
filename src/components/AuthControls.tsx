import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="rounded-md border border-white/10 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06]">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-md bg-cyan-300 px-3 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">
            Sign up
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
