/*
  Warnings:

  - You are about to drop the column `script_path` on the `automations` table. All the data in the column will be lost.
  - You are about to drop the column `script_source` on the `automations` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_automations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "script" TEXT NOT NULL DEFAULT '',
    "inputs_json" JSONB NOT NULL,
    "libraries_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_automations" ("created_at", "description", "id", "inputs_json", "libraries_json", "name", "outputs_json", "script", "updated_at") SELECT "created_at", "description", "id", "inputs_json", "libraries_json", "name", "outputs_json", "script", "updated_at" FROM "automations";
DROP TABLE "automations";
ALTER TABLE "new_automations" RENAME TO "automations";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
