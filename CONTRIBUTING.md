# Contributing to GuardPortal

First off, thanks for your interest in contributing to GuardPortal!

This project is designed to be self-hosted and open-source, and contributions of
all kinds are welcome — code, bug reports, docs, ideas, and more.

---

## Getting Started

1. Fork the repo and clone it locally.
2. Run `pnpm install` to install dependencies.
3. Run `pnpm dev` to start the app, or `pnpm dev:email` if you want to make/edit
   an email templates.
4. Check out to a new branch (`git checkout -b YOUR_FEATUREOR_CHANGE`)
5. Make your changes in that new branch.

---

## Local Development

- This project uses **Next.js 15** and **Tailwind CSS 4**.
- Use **BetterAuth**, **Prisma**, and **PostgreSQL** for auth and DB.
- Interface with the **WireGuard Dashboard API** under the hood
  - If you do not have a WireGuard Dasboard set up for local development, you
    can use `https://vpn-demo.famlam.ca`.
  - Do keep in mind this demo resets every hour.
- Make sure to run `pnpm lint` and `pnpm format` before submitting a PR.

---

## Pull Requests

- Open PRs against the `main` branch.
- Follow the existing code style.
- Keep PRs focused and small — one change per PR is ideal.
- Add screenshots if it’s a UI change.
- Add tests where reasonable (especially for backend logic).

---

## Discussions & Support

Have questions, feature ideas, or want to help shape GuardPortal’s future? Use
[GitHub Discussions](../../discussions) to chat, brainstorm, or get help!

---

Thanks again for helping make GuardPortal better 🙏
