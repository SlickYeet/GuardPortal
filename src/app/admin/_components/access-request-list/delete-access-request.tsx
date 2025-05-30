"use client"

import { Loader2, Trash2 } from "lucide-react"

import { Hint } from "@/components/hint"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

interface DeleteAccessRequestProps {
  isDeleting: boolean
  handleDeleteAccessRequest: () => Promise<void>
}

export function DeleteAccessRequest({
  isDeleting,
  handleDeleteAccessRequest,
}: DeleteAccessRequestProps) {
  return (
    <AlertDialog>
      <Hint label="Delete Access Request" asChild>
        <AlertDialogTrigger asChild>
          <Button size="icon" variant="destructive">
            <Trash2 className="size-4" />
            <span className="sr-only">Delete Access Request</span>
          </Button>
        </AlertDialogTrigger>
      </Hint>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the access request and all its data.
            This action cannot be undone.
            <br />
            Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex w-full justify-between">
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteAccessRequest}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-4" />
                  <span>Delete</span>
                </>
              )}
            </AlertDialogAction>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
