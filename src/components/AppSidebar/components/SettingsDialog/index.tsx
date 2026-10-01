'use client';

import { SettingsIcon } from 'lucide-react';
import { useState } from 'react';

import { useTheme } from '@/contexts/ThemeProvider';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { SidebarMenuButton } from '@/ui/sidebar';

import { type SettingsDialogProps } from './types';

const THEME_ITEMS = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

export function SettingsDialog(props: SettingsDialogProps) {
  void props;
  const [isOpen, setIsOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<SidebarMenuButton tooltip="Settings" />}>
        <SettingsIcon />
        <span>Settings</span>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage how EVA Labs works on this device.</DialogDescription>
        </DialogHeader>
        <div className="shrink-0 border-b px-6">
          <span className="inline-flex border-b-2 border-primary px-3 py-3 text-sm font-medium">
            General
          </span>
        </div>
        <div className="min-h-0 flex-1 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-medium">Appearance</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose how EVA Labs appears on this device.
              </p>
            </div>
            <Select
              items={THEME_ITEMS}
              value={theme}
              onValueChange={(value) => {
                if (value === 'dark' || value === 'light' || value === 'system') setTheme(value);
              }}
            >
              <SelectTrigger className="w-36 shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Appearance</SelectLabel>
                  {THEME_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
