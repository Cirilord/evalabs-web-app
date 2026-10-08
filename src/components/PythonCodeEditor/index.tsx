'use client';

import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import CodeMirror from '@uiw/react-codemirror';

import { type PythonCodeEditorProps } from './types';

export function PythonCodeEditor(props: PythonCodeEditorProps) {
  const { ariaLabel, height, id, minHeight, onChange, value } = props;
  const editorMinHeight = minHeight ?? (height ? undefined : '20rem');

  return (
    <CodeMirror
      aria-label={ariaLabel}
      className="h-full overflow-hidden rounded-md border"
      extensions={[
        python(),
        indentationMarkers({
          activeThickness: 1,
          colors: { activeDark: '#5c6370', dark: '#3e4451' },
          markerType: 'fullScope',
          thickness: 1,
        }),
      ]}
      {...(height ? { height } : {})}
      id={id}
      {...(editorMinHeight ? { minHeight: editorMinHeight } : {})}
      theme={oneDark}
      value={value}
      onChange={onChange}
    />
  );
}
