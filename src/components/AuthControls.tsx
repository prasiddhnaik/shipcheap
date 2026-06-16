import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function AuthControls() {
  return (
    <div className="flex items-center gap-2">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="brutal-button px-3 py-2 text-sm">
            Sign in
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="brutal-button brutal-button-primary px-3 py-2 text-sm">
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
