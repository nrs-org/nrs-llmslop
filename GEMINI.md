# Project Overview

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/). The project is configured with [Tailwind CSS](https://tailwindcss.com/) for styling and [Prisma](https://www.prisma.io/) as an ORM for database management. It also includes [ESLint](https://eslint.org/) for linting.

## Building and Running

To build and run this project, you can use the following commands:

*   **Development:** `bun dev`
*   **Build:** `bun build`
*   **Start:** `bun start`
*   **Test:** `bun test` (using Bun's native test runner)

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. You can find the configuration in `postcss.config.mjs` and the main CSS file in `src/app/globals.css`.
*   **Database:** The project uses Prisma for database management. The schema is defined in `prisma/schema.prisma`. The database models include `Entry`, `Impact`, `Relation`, `NRSContext`, and their associated join tables. A high-level API for database interactions is provided in `src/lib/db_api.ts`, with corresponding data structures defined in `src/lib/db_types.ts`.
*   **Linting:** The project uses ESLint for linting. The configuration is in `eslint.config.mjs`.
*   **Components:** The main application component is `src/app/page.tsx`, and the layout is defined in `src/app/layout.tsx`.
*   **Dependencies:** The project uses `bun` as the package manager. The dependencies are listed in `package.json`.
*   **Testing:** Database tests are located in `tests/model.test.ts` and utilize a `TestDB` helper class (`tests/lib/db.ts`). The project is transitioning from `vitest` to `bun test` for running tests.

## Pre-commit Checks

Before committing any changes, ensure the following checks pass:

*   **Run Tests:** `bun test`
*   **Typecheck:** `bunx tsc --noEmit`
