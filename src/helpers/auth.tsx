import { NextResponse } from "next/server";

export const checkAuth = (authHeader?: string | null) => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization header is missing or invalid" },
      { status: 401 }
    );
  }
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  const user = decodeTokenAndGetUserId(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  if (!user.userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  return { userId: user.userId, role: user.role };
};

export function decodeTokenAndGetUserId(
  token: string
): { userId: string; role: string } | null {
  try {
    const decoded = JSON.parse(atob(token.split(".")[1]));
    return { userId: decoded.userId, role: decoded.role };
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};
