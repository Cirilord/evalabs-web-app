export type PythonCodeEditorProps = Readonly<{
  ariaLabel: string;
  id: string;
  minHeight?: string;
  value: string;
  onChange: (value: string) => void;
}>;
