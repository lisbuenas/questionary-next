import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';



const prisma = new PrismaClient();

interface RequestParams {
    params: {
        id: string;
    };
}

export async function GET(req: Request, { params }: RequestParams) {

    const id = params?.id; // this is what will grab the string - use an UUID

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }


    try {
        const userQuestionnaires = await prisma.userQuestionnaire.findMany({
            where: {
                userId: parseInt(id)
            },
            include: {
                questionnaire: true
            }
        });

        return NextResponse.json({ userQuestionnaires });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user questionnaires' }, { status: 500 });
    }
}
