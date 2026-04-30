"use client"

import { CheckCircleIcon, XCircleIcon } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { api } from "@/lib/api/client"
import { DeleteUserModal } from "@/modules/admin/ui/delete-user-modal"
import { EditUserModal } from "@/modules/admin/ui/edit-user-modal"

export function UserTable({ currentUserId }: { currentUserId: string }) {
  const [siteSettings] = api.siteSettings.get.useSuspenseQuery()
  const [users] = api.admin.users.list.useSuspenseInfiniteQuery(
    { limit: siteSettings.defaultFetchLimit },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  // TODO: pagination

  return (
    <Table className="even:bg-muted">
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-center">Verified Email</TableHead>
          <TableHead className="text-center">Banned</TableHead>
          <TableHead className="text-right">Created At</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.pages
          .flatMap((page) => page.items)
          .map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {user.emailVerified ? (
                    <CheckCircleIcon className="size-5 text-green-600 dark:text-green-500" />
                  ) : (
                    <XCircleIcon className="size-5 text-destructive" />
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  {user.banned ? (
                    <CheckCircleIcon className="size-5 text-destructive" />
                  ) : (
                    <XCircleIcon className="size-5 text-green-600 dark:text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {new Date(user.createdAt).toDateString()}
              </TableCell>
              <TableCell className="flex justify-end gap-x-2">
                {/* // TODO: consume peer config in EditUserModal */}
                <EditUserModal currentUserId={currentUserId} user={user} />
                <DeleteUserModal currentUserId={currentUserId} user={user} />
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
