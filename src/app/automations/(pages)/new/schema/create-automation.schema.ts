import { z } from 'zod';

export const automationPortSchema = z.object({
  description: z.string().trim().max(500),
  name: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  required: z.boolean(),
  type: z.enum(['boolean', 'file', 'number', 'text']),
});

export const automationOutputSchema = automationPortSchema.omit({ required: true });

export const automationLibrarySchema = z.object({
  name: z.string().trim().min(1).max(200),
  version: z.string().trim().min(1).max(100),
});

export const createAutomationSchema = z
  .object({
    description: z.string().trim().max(500),
    inputs: z.array(automationPortSchema),
    libraries: z.array(automationLibrarySchema).max(50),
    name: z.string().trim().min(1).max(100),
    outputs: z.array(automationOutputSchema),
    script: z.string(),
    scriptMode: z.enum(['file', 'inline']),
    scriptPath: z.string().nullable(),
  })
  .superRefine((automation, context) => {
    for (const kind of ['inputs', 'outputs'] as const) {
      const names = new Set<string>();

      automation[kind].forEach((port, index) => {
        if (names.has(port.name)) {
          context.addIssue({
            code: 'custom',
            message: 'Port names must be unique.',
            path: [kind, index, 'name'],
          });
        }

        names.add(port.name);
      });
    }

    if (automation.scriptMode === 'file') {
      if (!automation.scriptPath?.trim()) {
        context.addIssue({
          code: 'custom',
          message: 'Choose a Python file.',
          path: ['scriptPath'],
        });
      }

      return;
    }

    const script = automation.script.trim();
    const mainFunctions = script.match(/\bdef\s+main\s*\([^)]*\)/g) ?? [];

    if (!script) {
      context.addIssue({
        code: 'custom',
        message: 'Enter the automation script.',
        path: ['script'],
      });
    } else if (mainFunctions.length === 0) {
      context.addIssue({ code: 'custom', message: 'Define a main function.', path: ['script'] });
    } else if (mainFunctions.length > 1) {
      context.addIssue({
        code: 'custom',
        message: 'Define only one main function.',
        path: ['script'],
      });
    } else if (automation.inputs.length > 0 && !/\bdef\s+main\s*\(\s*inputs\b/.test(script)) {
      context.addIssue({
        code: 'custom',
        message: 'Define main(inputs) when this automation has inputs.',
        path: ['script'],
      });
    } else if (/\binput\s*\(/.test(script)) {
      context.addIssue({
        code: 'custom',
        message: 'input() is not supported. Define an automation input instead.',
        path: ['script'],
      });
    }
  });
