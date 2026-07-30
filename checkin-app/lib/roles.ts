// Role constants shared between server code and client components.
export const ROLES = ["OWNER", "STAFF", "FRONT_DESK", "READ_ONLY"] as const;
export type Role = (typeof ROLES)[number];
