<div align="center">
  <img src="./public/logo.svg" alt="EVA Labs" width="72" />
  <h1>EVA Labs</h1>
  <p>Build, run, and connect Python automations in your browser.</p>
  <br />
  <a href="#getting-started">Quickstart</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#how-it-works">How it works</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#development">Development</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#architecture">Architecture</a>
  <br />
  <hr />
</div>

EVA Labs is a local-first workspace for Python automations. Create a script, define its typed inputs and outputs, run it in the browser, and combine automations into visual workflows.

## Features

- Write and edit Python automations with a syntax-highlighted editor.
- Define text, number, boolean, and file inputs and outputs.
- Run Python with Pyodide in a dedicated Web Worker, keeping the UI responsive.
- Build workflows on a visual board and pass values or generated files between nodes.
- Inspect runs, logs, errors, outputs, and downloadable artifacts.
- Keep automations, workflows, runs, and artifacts in the browser with SQLite WASM, OPFS, and IndexedDB.
- Choose the appearance, language, Python runner, and anonymous telemetry preference during onboarding.

## Getting Started

### Requirements

- Node.js `24.21.0`
- Yarn Classic `1.x`

### Install

```bash
yarn install
cp .env.example .env
```

Set `DATABASE_URL` in `.env`. Prisma uses it to generate the server client during development and builds.

### Run locally

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000). On first access, configure your preferences and follow the in-app tutorial.

## How It Works

### Automations

An automation is a focused Python script. It has typed inputs and outputs, so its result can be reused directly or connected to a workflow.

Scripts expose a `main` function. EVA Labs provides `Inputs` and `Outputs` through the `eva` module:

```python
from eva import Inputs, Outputs

def main(inputs: Inputs):
    search = inputs.get("search")
    report = create_report(search)

    outputs = Outputs()
    outputs.add("report", report)
    return outputs
```

Input types map to Python values:

| Type    | Value received by the script                                               |
| ------- | -------------------------------------------------------------------------- |
| Text    | `str`                                                                      |
| Number  | finite `int` or `float`                                                    |
| Boolean | `bool`                                                                     |
| File    | an `InputFile` with `name`, `mime_type`, `read_bytes()`, and `read_text()` |

Output types map to the values added through `Outputs`:

| Type    | Value added to `Outputs`                                                                        |
| ------- | ----------------------------------------------------------------------------------------------- |
| Text    | `str`                                                                                           |
| Number  | finite `int` or `float`                                                                         |
| Boolean | `bool`                                                                                          |
| File    | a browser-accessible file path or a descriptor with `path`, plus optional `name` and `mimeType` |

Generated file outputs are saved as artifacts and can be downloaded from run details.

### Workflows

Workflows connect automations and other workflows on a board. Connect ports with matching types, configure fixed values where needed, and run the board from its details page or editor.

Each run records the workflow result and every node run. Files produced by one node are available as files to connected downstream nodes.

### Local-first storage

Application data remains in the browser:

- SQLite WASM stores automations, workflows, and run history in OPFS.
- IndexedDB stores binary artifacts such as generated reports.
- Prisma migrations are copied to the public build assets and applied by the browser database worker.

Migrations are public application code. Never add secrets, credentials, private endpoints, or personal data to files in `prisma/migrations`.

## Development

| Command                | Description                                                     |
| ---------------------- | --------------------------------------------------------------- |
| `yarn dev`             | Prepare generated assets and start Next.js in development mode. |
| `yarn build`           | Build the standalone production application.                    |
| `yarn start`           | Run the production build.                                       |
| `yarn format`          | Format the repository with Prettier.                            |
| `yarn format:check`    | Check formatting without changing files.                        |
| `yarn lint`            | Fix lint issues where possible.                                 |
| `yarn lint:check`      | Run ESLint without changes.                                     |
| `yarn type-check`      | Run TypeScript without emitting files.                          |
| `yarn prisma:format`   | Format the Prisma schema.                                       |
| `yarn prisma:generate` | Generate Prisma clients.                                        |

Before opening a pull request, run:

```bash
yarn format:check
yarn lint:check
yarn type-check
yarn build
```

## Architecture

The application uses Next.js App Router and TypeScript.

- `src/app` contains routes and App Router files.
- `src/components` contains shared application components.
- `src/services` contains domain services with separate `client` and `server` implementations.
- `src/lib/prisma` contains Prisma clients and the browser SQLite adapter.
- `src/ui` contains shared shadcn/Base UI primitives.
- `prisma` contains the schema and the only source of truth for migrations.

Read the repository guides before contributing:

- [Architecture](./docs/architecture.md)
- [Conventions](./docs/conventions.md)
- [Database](./docs/database.md)

## Technology

- [Next.js](https://nextjs.org/) and [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Prisma](https://www.prisma.io/) with SQLite WASM
- [Pyodide](https://pyodide.org/) in a Web Worker
- [React Flow](https://reactflow.dev/) for workflow boards
- [TanStack Query](https://tanstack.com/query/latest) for client data synchronization
- [shadcn/ui](https://ui.shadcn.com/) with Base UI primitives
- [i18next](https://www.i18next.com/) for localization

## Contributing

Keep code, identifiers, comments, documentation, and commit messages in English. User-facing text must go through the internationalization layer.

Follow the project conventions for component structure, page routes, services, Prisma models, and migrations. Commit messages follow Conventional Commits and are validated with commitlint.
