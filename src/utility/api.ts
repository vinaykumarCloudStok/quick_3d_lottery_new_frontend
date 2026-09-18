export const getCaller = async (url: string): Promise<any> => {
  const dataURL = import.meta.env.VITE_APP_BASE_SOCKET_URL as string;
 
  try {
    const response = await fetch(`${dataURL}/${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        token: localStorage.getItem("token") || "",
      },
    });
 
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
 
 