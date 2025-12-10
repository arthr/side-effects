import * as React from "react";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import "./styles/retro.css";

export const inputVariants = cva("", {
  variants: {
    font: {
      normal: "",
      retro: "retro",
    },
  },
  defaultVariants: {
    font: "retro",
  },
});

export interface BitInputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  asChild?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, BitInputProps>(
  ({ className, font, ...props }, ref) => {
    return (
      <div
        className={cn(
          "relative border-y-6 border-foreground dark:border-ring p-0! flex items-center",
          className
        )}
      >
        <input
          ref={ref}
          {...props}
          className={cn(
            "flex h-10 w-full border-2 border-border bg-background px-3 py-2 text-sm",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "rounded-none ring-0 w-full!",
            font !== "normal" && "retro",
          )}
        />

        <div
          className="absolute inset-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
          aria-hidden="true"
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
