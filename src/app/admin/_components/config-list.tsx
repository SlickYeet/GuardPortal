"use client"

import { Edit, Loader2, RefreshCcw, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { deletePeerConfig, getPeerConfigsFromDB } from "@/actions/wireguard"
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
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import type { PeerConfigWithUser } from "@/types"

export function ConfigList() {
  const [configs, setConfigs] = useState<PeerConfigWithUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [configToDelete, setConfigToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadConfigs()
  }, [])

  async function loadConfigs() {
    setIsLoading(true)
    try {
      const fetchedConfigs = await getPeerConfigsFromDB()
      setConfigs(fetchedConfigs as PeerConfigWithUser[])
    } catch (error) {
      console.error("Failed to load configs:", error)
      toast.error("Error", {
        description: `Failed to load configs: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteConfig() {
    if (!configToDelete) return
    setIsDeleting(true)

    try {
      await deletePeerConfig(configToDelete)
      toast.success("Config deleted successfully")
      loadConfigs()
    } catch (error) {
      console.error("Failed to delete config:", error)
      toast.error("Error", {
        description: `Failed to delete config: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsDeleting(false)
      setConfigToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Peer Configs</h2>
        <Button disabled={isLoading} onClick={loadConfigs} variant="outline">
          <RefreshCcw
            className={cn("size-4", isLoading ? "animate-spin" : "")}
          />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : configs.length === 0 ? (
        <div className="text-muted-foreground p-8 text-center">
          <p>No peer configs found.</p>
          <p className="text-sm">Create a new config to get started.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Peer Name</TableHead>
                <TableHead>Server</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>DNS</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="truncate font-medium">
                    {config.name || "Unnamed Peer"}
                  </TableCell>
                  <TableCell>
                    {`${config.endpoint}:${config.configuration.listenPort}` ||
                      "N/A"}
                  </TableCell>
                  <TableCell>{config.allowedIPs || "N/A"}</TableCell>
                  <TableCell>{config.dns || "N/A"}</TableCell>
                  {config.user ? (
                    <TableCell>
                      <HoverCard openDelay={100}>
                        <HoverCardTrigger asChild>
                          <Avatar>
                            <AvatarImage src={config.user.image} />
                            <AvatarFallback>
                              {config.user.name
                                ? config.user.name.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                        </HoverCardTrigger>
                        <HoverCardContent className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={config.user.image} />
                            <AvatarFallback>
                              {config.user.name
                                ? config.user.name.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="font-medium">
                              {config.user.name || "Unknown User"}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {config.user.email || "No email provided"}
                            </p>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </TableCell>
                  ) : (
                    <TableCell className="text-muted-foreground">
                      No user assigned
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex justify-end space-x-2">
                      <Hint label="Edit Config" asChild>
                        <Button
                          disabled={isEditing}
                          onClick={() => setIsEditing(true)}
                          size="icon"
                          variant="outline"
                        >
                          <span className="sr-only">View Config</span>
                          <Edit className="size-4" />
                        </Button>
                      </Hint>
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
                          {isDeleting && configToDelete === config.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </Hint>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog
        open={!!configToDelete}
        onOpenChange={(open) => !open && setConfigToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the peer config and all its data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <div className="flex w-full justify-between">
              <AlertDialogAction
                disabled={isDeleting}
                onClick={handleDeleteConfig}
                className="bg-destructive hover:bg-destructive/80"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Config</DialogTitle>
            <DialogDescription>
              This functionality is not implemented yet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex w-full justify-between">
              <DialogClose asChild>
                <Button onClick={() => setIsEditing(false)} variant="outline">
                  Close
                </Button>
              </DialogClose>
              <Button>Save Changes</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
