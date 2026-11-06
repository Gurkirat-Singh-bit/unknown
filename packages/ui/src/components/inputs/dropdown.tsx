"use client";

import * as Select from "@radix-ui/react-select";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";

export type DropdownOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function Dropdown({
  value,
  onValueChange,
  options,
  label,
  className = "",
  disabled = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: readonly DropdownOption[];
  label: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <Select.Root
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <Select.Trigger
        aria-label={label}
        className={`group inline-flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-3 text-left text-xs font-medium text-ink outline-none transition-colors hover:border-muted/50 focus-visible:border-primary-strong focus-visible:ring-2 focus-visible:ring-primary-strong/15 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-primary-strong ${className}`}
      >
        <Select.Value className="min-w-0 flex-1 truncate">{options.find((option) => option.value === value)?.label ?? "Select an option"}</Select.Value>
        <Select.Icon asChild>
          <CaretDownIcon
            size={14}
            className="shrink-0 text-muted transition-transform group-data-[state=open]:rotate-180 motion-reduce:transition-none"
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className="z-[100] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] max-w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-line bg-surface p-1.5 text-ink shadow-[0_8px_30px_-8px_rgba(15,23,42,0.18)] outline-none"
        >
          <Select.ScrollUpButton className="flex h-6 items-center justify-center text-muted">
            <CaretUpIcon size={14} />
          </Select.ScrollUpButton>
          <Select.Viewport className="quiet-scrollbar">
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pr-9 pl-3 text-xs leading-5 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-lime-soft data-[state=checked]:bg-brand-soft data-[state=checked]:font-semibold"
              >
                <Select.ItemText className="min-w-0"><span className="break-words">{option.label}</span></Select.ItemText>
                <Select.ItemIndicator className="absolute right-3 flex items-center">
                  <CheckIcon size={14} weight="bold" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
          <Select.ScrollDownButton className="flex h-6 items-center justify-center text-muted">
            <CaretDownIcon size={14} />
          </Select.ScrollDownButton>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
