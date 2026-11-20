import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 bg-transparent text-[15px] transition-[color,border-color,box-shadow] outline-none selection:bg-amber selection:text-background placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        boxed:
          "h-11 rounded-lg border border-input bg-background px-3.5 focus-visible:border-amber aria-invalid:border-danger",
        underline:
          "h-11 rounded-none border-b border-foreground/40 px-0 focus-visible:border-amber aria-invalid:border-danger",
      },
    },
    defaultVariants: {
      variant: "boxed",
    },
  }
)

function Input({
  className,
  type,
  variant,
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Input }
