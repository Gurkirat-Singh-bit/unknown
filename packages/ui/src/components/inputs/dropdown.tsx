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
        className={`group inline-flex min-h-11 items-center justify-between gap-3 rounded-lg border border-ink/15 bg-white px-3 text-left text-xs font-semibold text-ink outline-none transition-colors hover:border-ink/40 focus-visible:ring-2 focus-visible:ring-lime-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:border-ink ${className}`}
      >
        <Select.Value />
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
          className="z-[100] max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-ink/15 bg-white p-1.5 text-ink shadow-xl outline-none"
        >
          <Select.ScrollUpButton className="flex h-6 items-center justify-center text-muted">
            <CaretUpIcon size={14} />
          </Select.ScrollUpButton>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="relative flex min-h-10 cursor-pointer select-none items-center rounded-lg py-2 pr-9 pl-3 text-xs outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-lime-soft data-[state=checked]:font-semibold"
              >
                <Select.ItemText>{option.label}</Select.ItemText>
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
