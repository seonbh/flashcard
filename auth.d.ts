declare module "#auth-utils" {
  interface User {
    id: string;
    name: string;
    role: string;
  }

  interface UserSession {
    user: User;
  }
}
