export const getCaller = async (url: string): Promise<any> => {
  const dataURL = (import.meta.env.VITE_APP_BASE_SOCKET_URL as string).replace(/\/$/, "");
 
  try {
    const response = await fetch(`${dataURL}/${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
    });
 
    const responseText = await response.text();
    let data: any;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch {
      throw new Error(`API returned invalid JSON (${response.status})`);
    }

    if (!response.ok) {
      throw new Error(data?.message || `API request failed (${response.status})`);
    }

    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
 
 