import { apiFetch } from "./client";

export async function login(loginData) {
  return apiFetch(
    "/auth/login",
    {
      method: "POST",
    },
    loginData,
    false
  );
}

export async function getMe() {
  return apiFetch(
    "/auth/me",
  );
}
