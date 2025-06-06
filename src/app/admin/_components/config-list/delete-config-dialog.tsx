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
import type { PeerConfigWithUser } from "@/types"

interface DeleteConfigDialogProps {
  config: PeerConfigWithUser
  configToDelete: string | null
  setConfigToDelete: (configId: string | null) => void
  isDeleting: boolean
  handleDeleteConfig: () => Promise<void>
}

export function DeleteConfigDialog({
  config,
  configToDelete,
  setConfigToDelete,
  isDeleting,
  handleDeleteConfig,
}: DeleteConfigDialogProps) {
  return (
    <AlertDialog
      open={!!configToDelete}
      onOpenChange={(open) => !open && setConfigToDelete(null)}
    >
      <AlertDialogTrigger asChild>
        <Hint label="Delete Config" asChild>
          <Button
            disabled={isDeleting}
            onClick={() => {
              setConfigToDelete(config.id)
              handleDeleteConfig()
            }}
            size="icon"
            variant="destructive"
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete Config</span>
          </Button>
        </Hint>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the peer config and all its data. This
            action cannot be undone.
            <br />
            Are you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <div className="flex w-full justify-between">
            <AlertDialogAction
              disabled={isDeleting}
              onClick={handleDeleteConfig}
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
