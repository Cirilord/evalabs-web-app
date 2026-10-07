-- CreateTable
CREATE TABLE "automations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "script" TEXT NOT NULL DEFAULT '',
    "script_source" TEXT NOT NULL DEFAULT 'inline',
    "script_path" TEXT,
    "inputs_json" JSONB NOT NULL,
    "libraries_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "logs" TEXT NOT NULL DEFAULT '',
    "error" TEXT NOT NULL DEFAULT '',
    "runner_version" TEXT NOT NULL DEFAULT '',
    "inputs_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "started_at" DATETIME NOT NULL,
    "finished_at" DATETIME,
    "automation_id" TEXT NOT NULL,
    CONSTRAINT "runs_automation_id_fkey" FOREIGN KEY ("automation_id") REFERENCES "automations" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflows" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "inputs_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "output_bindings_json" JSONB NOT NULL,
    "start_json" JSONB NOT NULL,
    "output_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "workflow_nodes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "runnable_id" TEXT NOT NULL,
    "runnable_type" TEXT NOT NULL,
    "fixed_inputs_json" JSONB NOT NULL,
    "input_bindings_json" JSONB NOT NULL,
    "position_x" REAL NOT NULL,
    "position_y" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "workflow_id" TEXT NOT NULL,
    CONSTRAINT "workflow_nodes_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_connections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "source_output_name" TEXT NOT NULL,
    "target_input_name" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "source_node_id" TEXT NOT NULL,
    "target_node_id" TEXT NOT NULL,
    CONSTRAINT "workflow_connections_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workflow_connections_source_node_id_fkey" FOREIGN KEY ("source_node_id") REFERENCES "workflow_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "workflow_connections_target_node_id_fkey" FOREIGN KEY ("target_node_id") REFERENCES "workflow_nodes" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "logs" TEXT NOT NULL DEFAULT '',
    "error" TEXT NOT NULL DEFAULT '',
    "inputs_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "started_at" DATETIME NOT NULL,
    "finished_at" DATETIME,
    "workflow_id" TEXT NOT NULL,
    CONSTRAINT "workflow_runs_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "workflows" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "workflow_node_runs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL,
    "logs" TEXT NOT NULL DEFAULT '',
    "error" TEXT NOT NULL DEFAULT '',
    "node_name" TEXT NOT NULL DEFAULT '',
    "nested_run_id" TEXT,
    "inputs_json" JSONB NOT NULL,
    "outputs_json" JSONB NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "started_at" DATETIME NOT NULL,
    "finished_at" DATETIME,
    "workflow_run_id" TEXT NOT NULL,
    "workflow_node_id" TEXT NOT NULL,
    CONSTRAINT "workflow_node_runs_workflow_run_id_fkey" FOREIGN KEY ("workflow_run_id") REFERENCES "workflow_runs" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
