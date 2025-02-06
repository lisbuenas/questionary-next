import { decodeTokenAndGetUserId } from '@/helpers/auth';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";


const prisma = new PrismaClient();


interface RequestParams {
    params: Promise<{
        id: string;
    }>;
}

export async function GET(request: Request, props: RequestParams) {
    const params = await props.params;
    const id = params?.id; // this is what will grab the string - use an UUID

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


export async function POST(request: Request) {

    const data = await request.json();
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }
    const token = authHeader.substring(7);

    const userId = decodeTokenAndGetUserId(token);

    if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }


    return NextResponse.json({ questionnaire: [] }, { status: 201 });

}
