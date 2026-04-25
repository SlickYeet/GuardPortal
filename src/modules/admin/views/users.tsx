import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CreateUserModal } from "@/modules/admin/ui/create-user-modal"
import { UserTable } from "@/modules/admin/ui/user-table"

export function UsersView({ currentUserId }: { currentUserId: string }) {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <div className="flex flex-col gap-y-1">
          <CardTitle>Manage Users</CardTitle>
          <CardDescription>
            View and manage users in the system.
          </CardDescription>
        </div>
        <CreateUserModal />
      </CardHeader>
      <CardContent>
        <UserTable currentUserId={currentUserId} />
      </CardContent>
    </Card>
  )
}
