import { checkAuth } from '@/helpers/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Prisma middleware to close the database connection
prisma.$use(async (params, next) => {
    const result = await next(params);
    await prisma.$disconnect(); // Ensure connection is disconnected after each query
    return result;
});

interface RequestParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: Request, props: RequestParams) {
    const params = await props.params;
    const data = await request.json();
    const id = params?.id;
    const authHeader = request.headers.get('authorization');

    const authResult = checkAuth(authHeader);
    if (authResult instanceof NextResponse) {
        return authResult;
    }

    const { userId } = authResult;

    const answers: { questionId: number; answer: string; userId: number; questionnaireId: number }[] = Object.entries(data).map(
        ([questionId, answer]) => ({
            questionId: parseInt(questionId),
            answer: Array.isArray(answer) ? answer.join(', ') : String(answer),
            userId: parseInt(userId),
            questionnaireId: parseInt(id)
        })
    );


    const allNonEmpty = Object.values(data).every(value => {
        if (typeof value === 'string' || Array.isArray(value)) {
            return value.length > 0;
        }
        return false;
    });

    if (!allNonEmpty) {
        return NextResponse.json({ error: 'Empty responses are not allowed' }, { status: 400 });
    }

    const createdAnswers = answers.filter(answer => answer != null && answer.answer.trim() !== ''); // Filter out any null, undefined, or empty answers
    for (const answer of createdAnswers) {
        await prisma.answer.upsert({
            where: {
                userId_questionId_questionnaireId: {
                    userId: answer.userId,
                    questionId: answer.questionId,
                    questionnaireId: answer.questionnaireId
                }
            },
            update: {
                answer: answer.answer
            },
            create: answer
        });
    }

    await prisma.userQuestionnaire.upsert({
        where: {
            userId_questionnaireId: {
                userId: parseInt(userId),
                questionnaireId: parseInt(id)
            }
        },
        update: {},
        create: {
            userId: parseInt(userId),
            questionnaireId: parseInt(id)
        }
    });


    return NextResponse.json({ status: 201 });
}


export async function GET(request: Request, props: RequestParams) {
    const params = await props.params;
    const id = params?.id;

    const authHeader = request.headers.get('authorization');

    const authResult = checkAuth(authHeader);
    if (authResult instanceof NextResponse) {
        return authResult;
    }


    const answers = await prisma.answer.findMany({
        where: {
            questionnaireId: parseInt(id),
            userId: parseInt(authResult.userId)
        }
    });

    return NextResponse.json(answers, { status: 200 });
}