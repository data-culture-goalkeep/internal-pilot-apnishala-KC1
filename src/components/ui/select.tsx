"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

// Radix's Select.Item forbids an empty-string value (it's reserved to mean
// "no selection"), but several call sites use `<option value="">—</option>`
// as a real, selectable "blank" choice — remap it to a sentinel internally
// so those call sites don't need to change.
const EMPTY_SENTINEL = "__select_empty__";

/**
 * Drop-in replacement for a native `<select>` with the same external API
 * (`value`, `onChange` receiving a `{ target: { value } }`-shaped object,
 * `<option>` children) but built on `radix-ui`'s `Select` primitive — a
 * native `<select>`'s open popup can't be styled at all (always native OS
 * chrome), unlike Radix's, which renders real DOM matching the rest of the
 * design system. See `dialog.tsx` for the sibling pattern.
 */
function Select({
  className,
  value,
  onChange,
  children,
  disabled,
}: {
  className?: string;
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const options = React.Children.toArray(children) as React.ReactElement<React.ComponentProps<"option">>[];

  return (
    <SelectPrimitive.Root
      value={value === "" ? EMPTY_SENTINEL : value}
      onValueChange={(v) => onChange({ target: { value: v === EMPTY_SENTINEL ? "" : v } })}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      >
        <SelectPrimitive.Value />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={4}
          className="z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((opt) => {
              const optValue = opt.props.value === "" ? EMPTY_SENTINEL : String(opt.props.value ?? "");
              return (
                <SelectPrimitive.Item
                  key={optValue}
                  value={optValue}
                  disabled={opt.props.disabled}
                  className="relative flex w-full cursor-pointer select-none items-center rounded-md px-2 py-1.5 pr-7 text-sm outline-none data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 data-[highlighted]:bg-muted"
                >
                  <SelectPrimitive.ItemText>{opt.props.children}</SelectPrimitive.ItemText>
                  <SelectPrimitive.ItemIndicator className="absolute right-2 flex items-center">
                    <Check className="size-3.5" />
                  </SelectPrimitive.ItemIndicator>
                </SelectPrimitive.Item>
              );
            })}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

export { Select };
