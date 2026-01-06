import api from "./axios";

export interface AuthUser {
  id: number;
  username: string;
  rank: number;
  avatarUrl: string | null;
}

export async function whoAmI(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>("/auth/me");
  return data;
}
