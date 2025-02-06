import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";


const users = [
    { username: "admin", password: "admin123", role: "admin", userId: 1 },
    { username: "user", password: "user123", role: "user", userId: 2 },
    { username: "user2", password: "user123", role: "user", userId: 3 },
];

export async function POST(req: Request) {
    const { username, password } = await req.json();
    const user = users.find((u) => u.username === username && u.password === password);

    if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
        return NextResponse.json({ error: "JWT secret is not defined" }, { status: 500 });
    }

    const token = jwt.sign(
        { username: "admin", role: user.role, userId: user.userId },
        process.env.JWT_SECRET, // Store JWT secret in .env file
        { expiresIn: "1h" }
    );

    return NextResponse.json({ token });
}

