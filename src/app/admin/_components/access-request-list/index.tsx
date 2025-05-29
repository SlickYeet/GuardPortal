"use client"

import { AccessRequest } from "@prisma/client"
import { Loader2, RefreshCcw } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { getAccessRequests } from "@/actions/access-requests"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import { DetailsModal, formatStatusLabel } from "./details-modal"

export function AccessRequestList() {
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadAccessRequests()
  }, [])

  async function loadAccessRequests() {
    setIsLoading(true)
    try {
      const fetchedRequests = await getAccessRequests()
      setAccessRequests(fetchedRequests)
    } catch (error) {
      console.error("Failed to load access requests:", error)
      toast.error("Error", {
        description: `Failed to load access requests: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Access Requests</h2>
        <Button
          disabled={isLoading}
          onClick={loadAccessRequests}
          variant="outline"
        >
          <RefreshCcw className={cn("size-4", isLoading && "animate-spin")} />
          <span>Refresh</span>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="text-muted-foreground size-8 animate-spin" />
        </div>
      ) : accessRequests.length === 0 ? (
        <div className="text-muted-foreground p-8 text-center">
          <p>No access requests found.</p>
          <p className="text-sm">
            Users can request access to the VPN through the user portal.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested At</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.name}</TableCell>
                  <TableCell>{request.email}</TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {request.reason}
                  </TableCell>
                  <TableCell className="capitalize">
                    {formatStatusLabel(request.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(request.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DetailsModal
                      request={request}
                      loadAccessRequests={loadAccessRequests}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
