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

export async function GET(request: Request, props: RequestParams) {
    const params = await props.params;
    const id = params?.id;

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    if (id) {
        const questions = await prisma.questionnaireJunction.findMany({
            where: { questionnaireId: parseInt(id) },
            include: {
                question: true // Include full question details
            },
            orderBy: { priority: 'asc' } // Optional: order by priority
        });


        if (questions) {
            return NextResponse.json({ questions });
        } else {
            return NextResponse.json({ error: 'Questionnaire not found' }, { status: 404 });
        }
    }

    return NextResponse.json({ error: 'Invalid questionnaire ID' }, { status: 400 });
}
