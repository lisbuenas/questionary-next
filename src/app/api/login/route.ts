import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Prisma middleware to close the database connection
prisma.$use(async (params, next) => {
    const result = await next(params);
    await prisma.$disconnect(); // Ensure connection is disconnected after each query
    return result;
});

export async function POST(req: Request) {
    const { username, password } = await req.json();

    async function login(username: string, password: string) {

        return prisma.user.findUnique({
            where: {
                username,
                password,
            },
        });
    }

    const user = await login(username, password);

    if (!user) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
        return NextResponse.json({ error: "JWT secret is not defined" }, { status: 500 });
    }

    const token = jwt.sign(
        { username: user.username, role: user.role, userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    return NextResponse.json({ token });
}

