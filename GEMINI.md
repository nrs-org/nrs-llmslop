# Project Overview

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). It uses [React](https://react.dev/) and [TypeScript](https://www.typescriptlang.org/). The project is configured with [Tailwind CSS](https://tailwindcss.com/) for styling and [Prisma](https://www.prisma.io/) as an ORM for database management. It also includes [ESLint](https://eslint.org/) for linting.

## Building and Running

To build and run this project, you can use the following commands:

*   **Development:** `bun dev`
*   **Build:** `bun build`
*   **Start:** `bun start`
*   **Test:** `bun run test` (using Jest)
*   **Typecheck:** `bun run typecheck` (to check TypeScript for errors)
*   **Linting:** `bun run lint` (to check and fix code style and potential issues)
*   **Markdownlint:** `bun run markdownlint` (to check and fix Markdown files)

## Development Conventions

*   **Styling:** The project uses Tailwind CSS for styling. You can find the configuration in `postcss.config.mjs` and the main CSS file in `src/app/globals.css`.
*   **Database:** The project uses Prisma for database management. The schema is defined in `prisma/schema.prisma`. The database models include `Entry`, `Impact`, `Relation`, `NRSContext`, and their associated join tables. A high-level API for database interactions is provided in `src/lib/db_api.ts`, with corresponding data structures defined in `src/lib/db_types.ts`.
*   **Linting:** The project uses ESLint for linting, which now includes typechecking and automatic fixing where possible. The configuration is in `eslint.config.mjs`.
*   **Components:** The main application component is `src/app/page.tsx`, and the layout is defined in `src/app/layout.tsx`.
*   **Dependencies:** The project uses `bun` as the package manager. The dependencies are listed in `package.json`.
*   **Testing:** The project uses Jest for unit testing. The tests are located in the `tests` directory. The project uses `jest-mock-extended` to mock the Prisma client.
*   **Documentation:** When editing documentation files (e.g., `README.md`), **NEVER** modify sections that are explicitly marked or clearly identifiable as human-written. These sections are sacrosanct and must remain untouched by automated processes. Markdown files are linted using Markdownlint.
*   **Git Workflow:** Always push changes to the remote repository immediately after each commit.

## Pre-commit Checks

Before committing any changes, ensure the following checks pass:

*   **Run Tests:** `bun run test`
*   **Typecheck:** `bun run typecheck`
*   **Linting (with Fix):** `bun run lint`
*   **Markdownlint:** `bun run markdownlint`
