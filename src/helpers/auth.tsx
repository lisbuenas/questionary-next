import { NextResponse } from "next/server";

export const checkAuth = (authHeader?: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  const userId = decodeTokenAndGetUserId(token);

  if (!userId) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  return { userId };
};

function decodeTokenAndGetUserId(token: string): string | null {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return decoded.userId || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};
