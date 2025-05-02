// Types
type Action = "view" | "create" | "updated" | "delete";

type Category = "dashboard" | "users";

type RoleName = "admin" | "worker" | "adviser" | "client";

type Permissions = {
  [K in Category]?: Action[];
};

interface Role {
  name: RoleName;
  permissions: Permissions;
}

export type { Action, Category, RoleName, Permissions, Role };

// Permissions
const adminRole: Role = {
  name: "admin",
  permissions: {
    dashboard: ["view", "create", "updated", "delete"],
    users: ["view", "create", "updated", "delete"],
  },
};

const workerRole: Role = {
  name: "worker",
  permissions: {
    dashboard: ["view", "create", "updated"],
    users: ["view"],
  },
};

const adviserRole: Role = {
  name: "adviser",
  permissions: {
    dashboard: ["view"],
  },
};

const clientRole: Role = {
  name: "client",
  permissions: {
    dashboard: ["view"],
  },
};

export { adminRole, workerRole, adviserRole, clientRole };
