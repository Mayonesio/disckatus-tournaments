export type UserRole =
  | "admin" // Administrador del sistema
  | "player" // Jugador regular
  | "captain" // Capitán de equipo
  | "coach" // Entrenador
  | "director" // Director deportivo
  | "guest" // Usuario invitado

export interface RolePermission {
  role: UserRole
  permissions: string[]
  description: string
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermission> = {
  admin: {
    role: "admin",
    permissions: [
      "manage_users",
      "manage_tournaments",
      "manage_teams",
      "manage_players",
      "manage_trainings",
      "manage_equipment",
      "manage_finances",
      "view_all_data",
    ],
    description: "Acceso completo a todas las funcionalidades del sistema",
  },
  director: {
    role: "director",
    permissions: [
      "manage_tournaments",
      "manage_teams",
      "manage_trainings",
      "manage_equipment",
      "manage_finances",
      "view_all_data",
    ],
    description: "Gestión global del club, presupuestos y planificación",
  },
  coach: {
    role: "coach",
    permissions: ["manage_trainings", "manage_teams", "view_player_stats", "create_training_plans"],
    description: "Gestión de entrenamientos y desarrollo de jugadores",
  },
  captain: {
    role: "captain",
    permissions: ["manage_team_members", "approve_registrations", "create_strategies", "view_team_stats"],
    description: "Gestión de equipos y aprobación de inscripciones",
  },
  player: {
    role: "player",
    permissions: ["view_own_data", "register_tournaments", "view_trainings"],
    description: "Participación en torneos y entrenamientos",
  },
  guest: {
    role: "guest",
    permissions: ["view_public_data"],
    description: "Acceso limitado a información pública",
  },
}

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.permissions.includes(permission) || false
}
