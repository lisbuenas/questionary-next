import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();


export async function GET(req: Request) {

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    const users = await prisma.user.findMany();

    const usersWithQuestionaries = await Promise.all(users.map(async (user) => {
        const userQuestionaries = await prisma.userQuestionnaire.findMany({
            where: { userId: user.id },
            include: {
                questionnaire: {
                    select: {
                        name: true
                    }
                }
            }
        });
        return { ...user, userQuestionaries };
    }));

    return NextResponse.json({ users: usersWithQuestionaries });
}
