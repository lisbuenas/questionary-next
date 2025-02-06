import { checkAuth } from '@/helpers/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

interface RequestParams {
    params: Promise<{
        id: string;
    }>;
}


export async function GET(request: Request, props: RequestParams) {
    const authHeader = request.headers.get('authorization');
    const authResult = checkAuth(authHeader);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    const { userId } = authResult;
    const questionnaires = await prisma.questionnaire.findMany();


    const userQuestionnaires = await Promise.all(
        questionnaires.map(async (questionnaire) => {
            const userQuestionnaire = await prisma.userQuestionnaire.findMany({
                where: {
                    userId: parseInt(userId),

                    questionnaireId: questionnaire.id
                }
            });
            return { ...questionnaire, userQuestionnaire };
        })
    );

    return NextResponse.json({ questionnaires: userQuestionnaires });
}

