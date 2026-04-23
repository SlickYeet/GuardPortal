import type * as React from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type HintProps = React.ComponentProps<typeof TooltipTrigger> &
  React.ComponentProps<typeof TooltipContent> & {
    label: string
  }

export function Hint(props: HintProps) {
  const { label, children, render, ...rest } = props

  return (
    <TooltipProvider>
      <Tooltip>
        {render ? (
          <TooltipTrigger render={render} />
        ) : (
          <TooltipTrigger>{children}</TooltipTrigger>
        )}
        <TooltipContent {...rest}>
          <p className="font-semibold">{label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
