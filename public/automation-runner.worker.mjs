const PYODIDE_RUNNERS = {
  'pyodide-022': { pyodideVersion: '0.22.1', pythonVersion: '3.10' },
  'pyodide-025': { pyodideVersion: '0.25.1', pythonVersion: '3.11' },
  'pyodide-026': { pyodideVersion: '0.26.4', pythonVersion: '3.12' },
  'pyodide-029': { pyodideVersion: '0.29.3', pythonVersion: '3.13' },
  'pyodide-314': { pyodideVersion: '314.0.7', pythonVersion: '3.14' },
};
const pyodidePromises = new Map();

function getRequirement(library) {
  return library.version === 'latest' ? library.name : `${library.name}==${library.version}`;
}

function getInputFilePath(inputName, file) {
  const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

  return `/tmp/${inputName}-${safeFileName}`;
}

function getPyodide(runnerId) {
  const runner = PYODIDE_RUNNERS[runnerId];
  if (!runner) throw new Error(`Unsupported Pyodide runner: ${runnerId}`);

  const pyodide = pyodidePromises.get(runnerId);
  if (pyodide) return pyodide;

  const packageBaseUrl = `https://cdn.jsdelivr.net/pyodide/v${runner.pyodideVersion}/full/`;
  const promise = import(`${packageBaseUrl}pyodide.mjs`).then(({ loadPyodide }) =>
    loadPyodide({ indexURL: packageBaseUrl })
  );
  pyodidePromises.set(runnerId, promise);

  return promise;
}

async function executeAutomation(message) {
  const { expectsOutputs, files, inputs, libraries, runnerId, script } = message;
  const logs = [];
  const runner = PYODIDE_RUNNERS[runnerId];
  const pyodide = await getPyodide(runnerId);

  pyodide.setStdout({ batched: (output) => logs.push(output) });
  pyodide.setStderr({ batched: (output) => logs.push(output) });

  try {
    if (libraries.length > 0) {
      await pyodide.loadPackage('micropip');
      await pyodide.runPythonAsync(
        `import micropip\nawait micropip.install(${JSON.stringify(libraries.map(getRequirement))})`,
        { filename: '<automation-libraries>' }
      );
    }

    await pyodide.loadPackagesFromImports(script);

    const executionInputs = { ...inputs };
    for (const [inputName, file] of Object.entries(files)) {
      const filePath = getInputFilePath(inputName, file);
      pyodide.FS.writeFile(filePath, new Uint8Array(await file.arrayBuffer()));
      executionInputs[inputName] = filePath;
    }

    const serializedInputs = JSON.stringify(executionInputs);
    const invocation = Object.keys(executionInputs).length > 0 ? 'main(__eva_inputs)' : 'main()';
    const serializedOutputs = await pyodide.runPythonAsync(
      `${script}\n\nimport json\n__eva_inputs = json.loads(${JSON.stringify(serializedInputs)})\n__eva_outputs = ${invocation}\nif ${expectsOutputs ? 'not isinstance(__eva_outputs, dict)' : 'False'}:\n    raise TypeError('main must return a dict.')\njson.dumps(__eva_outputs if ${expectsOutputs ? 'True' : 'False'} else {})`,
      { filename: '<automation-script>' }
    );

    return {
      logs: logs.join('\n'),
      outputs: JSON.parse(String(serializedOutputs)),
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
