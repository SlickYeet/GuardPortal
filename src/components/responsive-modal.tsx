"use client"

import * as React from "react"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

interface ResponsiveModalProps {
  mediaQuery?: string
  open: boolean
  onOpenChange: (open: boolean) => void
  trigger?: React.ComponentProps<typeof Button> | React.ReactElement
  children: React.ReactNode
  className?: string
  alert?: boolean
  modal?: boolean
}

const defaultTrigger: React.ComponentProps<typeof Button> = {
  size: "default",
  variant: "outline",
}

function isTriggerElement(
  trigger: ResponsiveModalProps["trigger"],
): trigger is React.ReactElement {
  return React.isValidElement(trigger)
}

export function ResponsiveModal({
  mediaQuery = "(min-width: 768px)",
  open,
  onOpenChange,
  trigger = defaultTrigger,
  children,
  className,
  alert = false,
  modal = true,
}: ResponsiveModalProps) {
  const isDesktop = useMediaQuery(mediaQuery)
  const resolvedTrigger = isTriggerElement(trigger)
    ? { children: undefined, element: trigger, nativeButton: false as const }
    : {
        children: trigger.children,
        element: <Button {...trigger} className={cn(trigger.className)} />,
        nativeButton: true as const,
      }

  if (isDesktop) {
    if (!alert) {
      return (
        <Dialog onOpenChange={onOpenChange} open={open}>
          <DialogTrigger
            nativeButton={resolvedTrigger.nativeButton}
            render={resolvedTrigger.element}
          >
            {resolvedTrigger.children}
          </DialogTrigger>
          <DialogContent className={cn("md:max-w-lg", className)}>
            {children}
          </DialogContent>
        </Dialog>
      )
    } else {
      return (
        <AlertDialog onOpenChange={onOpenChange} open={open}>
          <AlertDialogTrigger
            nativeButton={resolvedTrigger.nativeButton}
            render={resolvedTrigger.element}
          >
            {resolvedTrigger.children}
          </AlertDialogTrigger>
          <AlertDialogContent className={cn("md:max-w-lg", className)}>
            {children}
          </AlertDialogContent>
        </AlertDialog>
      )
    }
  }

  return (
    <Drawer
      dismissible={!alert}
      modal={modal}
      onOpenChange={onOpenChange}
      open={open}
    >
      <DrawerTrigger asChild>{resolvedTrigger.element}</DrawerTrigger>
      <DrawerContent className={cn("min-h-[50svh]", className)}>
        <DrawerHeader hidden>
          <DrawerTitle hidden />
        </DrawerHeader>
        <div className="mx-auto w-full max-w-[calc(var(--container-lg)+1rem)] overflow-y-auto px-2 py-8">
          {children}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
