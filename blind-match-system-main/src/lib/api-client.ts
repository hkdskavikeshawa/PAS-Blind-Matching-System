const API_URL = import.meta.env.VITE_API_URL;

// Helper function for all API calls
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data || "Something went wrong");
  }

  return data;
};

export default apiCall;