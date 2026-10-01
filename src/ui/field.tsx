import { cn } from 'cn';
import { type ComponentProps } from 'react';

import { Label } from '@/ui/label';

function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      className={cn(
        'flex flex-col gap-4 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3',
        className
      )}
      data-slot="field-set"
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'group/field-group @container/field-group flex w-full flex-col gap-5 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4',
        className
      )}
      data-slot="field-group"
      {...props}
    />
  );
}

function Field({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('group/field flex w-full flex-col gap-2', className)}
      data-slot="field"
      role="group"
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      className={cn(
        'group/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50',
        className
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn('text-sm leading-normal font-normal text-muted-foreground', className)}
      data-slot="field-description"
      {...props}
    />
  );
}

export { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet };
