# Database Model Conventions

When creating or editing database tables, SQL migrations, or Prisma models, order columns using the following groups. Keep a blank line between each group that is present.

1. `id` is always the first column.
2. Text columns: `VARCHAR`, `CHAR`, `TEXT`, equivalent string fields, and enums. Enums must be declared after regular string fields in this group.
3. Special columns: JSON and other domain-specific special types.
4. Numeric columns: `DECIMAL`, `NUMERIC`, integer types, `FLOAT`, and equivalent numeric fields.
5. Boolean columns.
6. Date and time columns: `DATE`, `DATETIME`, `TIME`, timezone-aware types, `TIMESTAMP`, and equivalent fields. Within this group, `created_at`, `updated_at`, and `deleted_at` always come first, in that order when present.
7. Foreign key columns are always last and kept in their own group.

For Prisma models, each relation field must be declared immediately after its foreign key column in the final foreign key group. Keep all foreign key and relation pairs together without blank lines between them. Inverse relation fields without a local foreign key must be declared after that group.

Database table names must always be plural and use `snake_case`. Database column names must always use `snake_case`.

Prisma field names may use `camelCase`, but must use `@map("snake_case_column")` whenever the Prisma name differs from the database column. Prisma models must use `@@map("plural_snake_case_table")` whenever the Prisma model name differs from the database table.

## Browser migrations

Prisma migrations are the single source of truth and belong in `prisma/migrations`.

The `predev` and `prebuild` lifecycle scripts copy their SQL files to `public/prisma` so the browser's SQLite worker can apply pending migrations to its OPFS database. Those generated public files are not committed, but their source migrations are accessible to everyone who uses the application.

Never include secrets, private endpoints, credentials, personal data, or other sensitive values in a migration. Treat every migration SQL file as public application code.
