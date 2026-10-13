const PYODIDE_RUNNERS = {
  'pyodide-022': { pyodideVersion: '0.22.1', pythonVersion: '3.10' },
  'pyodide-025': { pyodideVersion: '0.25.1', pythonVersion: '3.11' },
  'pyodide-026': { pyodideVersion: '0.26.4', pythonVersion: '3.12' },
  'pyodide-029': { pyodideVersion: '0.29.3', pythonVersion: '3.13' },
  'pyodide-314': { pyodideVersion: '314.0.7', pythonVersion: '3.14' },
};
const pyodidePromises = new Map();
const SILENT_PACKAGE_LOAD_OPTIONS = {
  errorCallback: () => {},
  messageCallback: () => {},
};

function getRequirement(library) {
  return library.version === 'latest' ? library.name : `${library.name}==${library.version}`;
}

function getInputFilePath(inputName, file) {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `/tmp/${inputName}-${safeFileName}`;
}

function getArtifactDescriptor(value) {
  if (typeof value === 'string') {
    return { path: value };
  }

  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    typeof value.path !== 'string'
  ) {
    throw new TypeError('File outputs must be a file path or an object with a path property.');
  }

  return value;
}

function getMimeType(fileName) {
  const extension = fileName.split('.').at(-1)?.toLowerCase();
  const mimeTypes = {
    csv: 'text/csv',
    json: 'application/json',
    pdf: 'application/pdf',
    txt: 'text/plain',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };

  return mimeTypes[extension] ?? 'application/octet-stream';
}

function normalizeOutputs(pyodide, outputs, outputSchema) {
  if (!outputs || typeof outputs !== 'object' || Array.isArray(outputs)) {
    throw new TypeError('main must return an Outputs instance or a dictionary.');
  }

  const configuredOutputs = new Map(outputSchema.map((output) => [output.name, output]));
  const normalizedOutputs = {};
  const artifacts = [];

  for (const [name, value] of Object.entries(outputs)) {
    const output = configuredOutputs.get(name);
    if (!output) {
      throw new TypeError(`Output "${name}" is not configured for this automation.`);
    }

    if (output.type === 'boolean' && typeof value !== 'boolean') {
      throw new TypeError(`Output "${name}" must be a boolean.`);
    }
    if (output.type === 'number' && (typeof value !== 'number' || !Number.isFinite(value))) {
      throw new TypeError(`Output "${name}" must be a finite number.`);
    }
    if (output.type === 'text' && typeof value !== 'string') {
      throw new TypeError(`Output "${name}" must be text.`);
    }
    if (output.type === 'file') {
      const descriptor = getArtifactDescriptor(value);
      const content = pyodide.FS.readFile(descriptor.path);
      const fileName = descriptor.name ?? descriptor.path.split('/').filter(Boolean).at(-1);

      if (!fileName) {
        throw new TypeError(`Output "${name}" must reference a file name.`);
      }

      artifacts.push({
        content: content.buffer.slice(content.byteOffset, content.byteOffset + content.byteLength),
        mimeType: descriptor.mimeType ?? getMimeType(fileName),
        name: fileName,
        outputName: name,
      });
      continue;
    }

    normalizedOutputs[name] = value;
  }

  return { artifacts, outputs: normalizedOutputs };
}

function getPyodide(runnerId) {
  const runner = PYODIDE_RUNNERS[runnerId];
  if (!runner) {
    throw new Error(`Unsupported Pyodide runner: ${runnerId}`);
  }

  const pyodide = pyodidePromises.get(runnerId);
  if (pyodide) {
    return pyodide;
  }

  const packageBaseUrl = `https://cdn.jsdelivr.net/pyodide/v${runner.pyodideVersion}/full/`;
  const promise = import(`${packageBaseUrl}pyodide.mjs`).then(({ loadPyodide }) =>
    loadPyodide({
      indexURL: packageBaseUrl,
      stderr: () => {},
      stdout: () => {},
    })
  );
  pyodidePromises.set(runnerId, promise);

  return promise;
}

async function executeAutomation(message) {
  const { files, inputs, libraries, outputSchema, runnerId, script } = message;
  const logs = [];
  const runner = PYODIDE_RUNNERS[runnerId];
  const pyodide = await getPyodide(runnerId);

  pyodide.setStdout({ batched: () => {} });
  pyodide.setStderr({ batched: () => {} });

  try {
    if (libraries.length > 0) {
      await pyodide.loadPackage('micropip', SILENT_PACKAGE_LOAD_OPTIONS);
      await pyodide.runPythonAsync(
        `import micropip\nawait micropip.install(${JSON.stringify(libraries.map(getRequirement))})`,
        { filename: '<automation-libraries>' }
      );
    }

    await pyodide.loadPackagesFromImports(script, SILENT_PACKAGE_LOAD_OPTIONS);

    pyodide.setStdout({ batched: (output) => logs.push(output) });
    pyodide.setStderr({ batched: (output) => logs.push(output) });

    const executionInputs = { ...inputs };
    const inputFiles = {};
    for (const [inputName, file] of Object.entries(files)) {
      const filePath = getInputFilePath(inputName, file);
      pyodide.FS.writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
      executionInputs[inputName] = filePath;
      inputFiles[inputName] = { mimeType: file.type, name: file.name, path: filePath };
    }

    const serializedInputs = JSON.stringify(executionInputs);
    const serializedInputFiles = JSON.stringify(inputFiles);
    const serializedOutputs = await pyodide.runPythonAsync(
      `import inspect
import json
import sys
import types

class InputFile:
    def __init__(self, path, name, mime_type):
        self.path = path
        self.name = name
        self.mime_type = mime_type

    def read_bytes(self):
        with open(self.path, "rb") as file:
            return file.read()

    def read_text(self, encoding="utf-8"):
        with open(self.path, "r", encoding=encoding) as file:
            return file.read()

class Inputs(dict):
    def __init__(self, values, files):
        super().__init__(values)
        for name, file in files.items():
            self[name] = InputFile(file["path"], file["name"], file["mimeType"])

class Outputs(dict):
    def add(self, name, value):
        self[name] = value
        return self

__eva_module = types.ModuleType("eva")
__eva_module.InputFile = InputFile
__eva_module.Inputs = Inputs
__eva_module.Outputs = Outputs
sys.modules["eva"] = __eva_module

${script}

__eva_inputs = Inputs(json.loads(${JSON.stringify(serializedInputs)}), json.loads(${JSON.stringify(serializedInputFiles)}))
__eva_outputs = main(__eva_inputs) if len(inspect.signature(main).parameters) else main()
json.dumps(__eva_outputs if __eva_outputs is not None else {})`,
      { filename: '<automation-script>' }
    );

    const normalizedOutputs = normalizeOutputs(
      pyodide,
      JSON.parse(String(serializedOutputs)),
      outputSchema
    );

    return {
      artifacts: normalizedOutputs.artifacts,
      logs: logs.join('\n'),
      outputs: normalizedOutputs.outputs,
      runnerVersion: `Pyodide ${runner.pyodideVersion} (Python ${runner.pythonVersion})`,
    };
  } catch (error) {
    throw {
      logs: logs.join('\n'),
      message: error instanceof Error ? error.message : String(error),
    };
  }
}

addEventListener('message', (event) => {
  void executeAutomation(event.data).then(
    (result) => postMessage({ requestId: event.data.requestId, result, type: 'succeeded' }),
    (error) =>
      postMessage({
        logs: error.logs ?? '',
        message: error.message ?? 'The automation could not be executed.',
        requestId: event.data.requestId,
        type: 'failed',
      })
  );
});
