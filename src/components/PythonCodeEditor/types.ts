export type PythonCodeEditorProps = Readonly<{
  ariaLabel: string;
  height?: string;
  id: string;
  minHeight?: string;
  value: string;
  onChange: (value: string) => void;
}>;
