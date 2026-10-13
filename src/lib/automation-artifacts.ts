import 'client-only';

const DATABASE_NAME = 'eva-labs';
const DATABASE_VERSION = 1;
const STORE_NAME = 'automation-artifacts';

export type AutomationArtifact = Readonly<{
  content: ArrayBuffer;
  mimeType: string;
  name: string;
  outputName: string;
}>;

export type AutomationArtifactReference = Readonly<{
  artifactId: string;
  mimeType: string;
  name: string;
  size: number;
}>;

type StoredAutomationArtifact = Readonly<{
  blob: Blob;
  id: string;
}>;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () => resolve(request.result));
    request.addEventListener('upgradeneeded', () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    });
  });
}

function createArtifactId(): string {
  return crypto.randomUUID();
}

export function isAutomationArtifactReference(
  value: unknown
): value is AutomationArtifactReference {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const artifact = value as Partial<AutomationArtifactReference>;

  return (
    typeof artifact.artifactId === 'string' &&
    typeof artifact.mimeType === 'string' &&
    typeof artifact.name === 'string' &&
    typeof artifact.size === 'number'
  );
}

export async function persistAutomationArtifact(
  artifact: AutomationArtifact
): Promise<AutomationArtifactReference> {
  const database = await openDatabase();
  const id = createArtifactId();
  const blob = new Blob([artifact.content], { type: artifact.mimeType });
  const transaction = database.transaction(STORE_NAME, 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  const record: StoredAutomationArtifact = { blob, id };

  await new Promise<void>((resolve, reject) => {
    const request = store.add(record);

    request.addEventListener('error', () => reject(request.error));
    transaction.addEventListener('abort', () => reject(transaction.error));
    transaction.addEventListener('complete', () => resolve());
  });
  database.close();

  return { artifactId: id, mimeType: artifact.mimeType, name: artifact.name, size: blob.size };
}

export async function getAutomationArtifactFile(
  artifact: AutomationArtifactReference
): Promise<File> {
  const database = await openDatabase();
  const transaction = database.transaction(STORE_NAME, 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  const record = await new Promise<StoredAutomationArtifact | undefined>((resolve, reject) => {
    const request = store.get(artifact.artifactId);

    request.addEventListener('error', () => reject(request.error));
    request.addEventListener('success', () =>
      resolve(request.result as StoredAutomationArtifact | undefined)
    );
  });
  database.close();

  if (!record) {
    throw new Error(`The artifact \"${artifact.name}\" is no longer available.`);
  }

  return new File([record.blob], artifact.name, { type: artifact.mimeType });
}
