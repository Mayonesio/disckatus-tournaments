"\"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type UserRole, ROLE_PERMISSIONS } from "@/types/roles"
import { toast } from "sonner"

interface User {
  _id: string
  name: string
  email: string
  role: UserRole
}

export function UserRoleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Simular la obtención de usuarios desde una API
        const mockUsers: User[] = [
          { _id: "1", name: "John Doe", email: "john.doe@example.com", role: "player" },
          { _id: "2", name: "Jane Smith", email: "jane.smith@example.com", role: "admin" },
          { _id: "3", name: "Peter Jones", email: "peter.jones@example.com", role: "player" },
        ]
        setUsers(mockUsers)
        setIsLoading(false)
      } catch (err) {
        console.error("Error al cargar usuarios:", err)
        setError("No se pudieron cargar los usuarios")
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      // Simular la actualización del rol del usuario en una API
      toast.success(`Rol de usuario ${userId} actualizado a ${newRole}`)
    } catch (err) {
      console.error("Error al actualizar rol:", err)
      toast.error("No se pudo actualizar el rol del usuario")
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>Administrar roles y permisos de usuarios</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={user.role}
                      onValueChange={(newRole: UserRole) => handleRoleChange(user._id, newRole)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(ROLE_PERMISSIONS).map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Ver detalles
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
