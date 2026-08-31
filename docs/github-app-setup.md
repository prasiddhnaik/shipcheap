# ShipCheap GitHub App setup

The Projects workspace supports public repository URLs immediately. Private repositories use a GitHub App so users can grant read-only access to selected repositories instead of granting broad OAuth scopes.

## Clerk

1. Create or claim the ShipCheap Clerk application.
2. Enable GitHub as a social connection for sign-up and sign-in.
3. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` locally and in Vercel.

## GitHub App

Create a public GitHub App with:

- Homepage URL: the deployed ShipCheap URL.
- Setup URL: `https://YOUR_DOMAIN/api/github/install/callback`.
- Redirect on update: enabled.
- Webhooks: disabled for this MVP.
- Repository permissions: Contents `Read-only` and Metadata `Read-only`.
- Account and organization permissions: none.
- Installation target: any account, with users encouraged to select only the repositories they want analyzed.

Generate a private key, then configure:

- `NEXT_PUBLIC_GITHUB_APP_SLUG`: the GitHub App URL slug.
- `GITHUB_APP_ID`: the numeric GitHub App ID.
- `GITHUB_APP_PRIVATE_KEY`: the PEM private key, with line breaks represented as `\n` when stored as one line.
- `GITHUB_APP_STATE_SECRET`: at least 32 random bytes, encoded as a string.

The current MVP accepts personal-account installations only. Organization installations require an additional GitHub user-authorization check before they can be safely associated with a Clerk user.
