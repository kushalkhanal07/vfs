const BASE_URL = "http://localhost:4000";

export const loginWithGoogle = async (idToken) => {
  try {
    const response = await fetch(`${BASE_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      credentials: "include",
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        error: data.error || "Google login failed.",
      };
    }

    return data;
  } catch (error) {
    return {
      error: "Google login is currently unavailable.",
    };
  }
};
