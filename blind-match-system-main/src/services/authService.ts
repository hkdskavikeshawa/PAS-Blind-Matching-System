const API_URL = import.meta.env.VITE_API_URL;

const TOKEN_KEY = "blindmatch_token";
const USER_KEY = "blindmatch_user";

const apiCall = async (
  endpoint: string,
  method: string = "GET",
  body?: object,
  token?: string
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Read response as text first
  const text = await response.text();

  // Try to parse as JSON
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!response.ok) {
    // Handle array of errors from ASP.NET Identity
    if (Array.isArray(data)) {
      throw new Error(
        (data as {description: string}[]).map((e) => e.description).join(", ")
      );
    }
    // Handle string errors
    if (typeof data === "string") {
      throw new Error(data);
    }
    throw new Error(JSON.stringify(data));
  }

  return data;
};

export const authService = {
  async register(fullName: string, email: string, password: string, role: string) {
    return await apiCall("/api/auth/register", "POST", {
      fullName,
      email,
      password,
      role,
    });
  },

  async login(email: string, password: string) {
    const data = await apiCall("/api/auth/login", "POST", {
      email,
      password,
    }) as {token: string; fullName: string; email: string; role: string};

    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify({
      fullName: data.fullName,
      email: data.email,
      role: data.role,
    }));

    return data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.location.href = "/";
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};