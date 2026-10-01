import { type z } from 'zod';

import { type createAutomationSchema } from '../../schema/create-automation.schema';

export type CreateAutomationViewValues = z.infer<typeof createAutomationSchema>;

export type CreateAutomationViewProps = Readonly<Record<string, never>>;
