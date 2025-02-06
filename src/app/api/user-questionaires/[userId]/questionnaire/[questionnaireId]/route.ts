import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Prisma middleware to close the database connection
prisma.$use(async (params, next) => {
    const result = await next(params);
    await prisma.$disconnect(); // Ensure connection is disconnected after each query
    return result;
});

interface RequestParams {
    params: Promise<{ userId: string; questionnaireId: string }>;
}

export async function GET(req: Request, props: RequestParams) {
    const params = await props.params;
    const id = params?.userId;
    const questionnaireId = params?.questionnaireId;

    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    try {

        const questions = await prisma.questionnaireJunction.findMany({
            where: { questionnaireId: parseInt(questionnaireId) },
            include: {
                question: true
            },
            orderBy: { priority: 'asc' }
        });

        const answers = await prisma.answer.findMany({
            where: {
                questionnaireId: parseInt(questionnaireId),
                userId: parseInt(id)
            }
        });

        return NextResponse.json({ questions, answers }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user questionnaires' }, { status: 500 });
    }
}
