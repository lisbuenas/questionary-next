import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();


export async function GET(req: Request) {

    // check if is admin
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    const users = await prisma.user.findMany();

    return NextResponse.json({ users });
}
