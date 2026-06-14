const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export type AuthApiResult = {
  message?: string;
  error?: string;
};

async function postJson(path: string, body: unknown): Promise<AuthApiResult> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: data.error || data.message || "Request failed.",
      };
    }

    return data;
  } catch {
    return {
      error: "Service is currently unavailable.",
    };
  }
}

export async function loginWithEmail(email: string, password: string): Promise<AuthApiResult> {
  return postJson("/user/login", { email, password });
}

export async function registerWithEmail(params: {
  name: string;
  email: string;
  password: string;
  otp: string;
}): Promise<AuthApiResult> {
  return postJson("/user/register", params);
}

export async function sendOtp(email: string): Promise<AuthApiResult> {
  return postJson("/auth/send-otp", { email });
}

export async function verifyOtp(email: string, otp: string): Promise<AuthApiResult> {
  return postJson("/auth/verify-otp", { email, otp });
}

export async function loginWithGoogle(idToken: string): Promise<AuthApiResult> {
  return postJson("/auth/google", { idToken });
}