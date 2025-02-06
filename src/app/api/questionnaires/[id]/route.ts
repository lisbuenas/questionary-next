import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";


const prisma = new PrismaClient();


interface RequestParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RequestParams) {
    const id = params?.id; // this is what will grab the string - use an UUID
    console.log("SELECTED ID", id);

    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Authorization header is missing or invalid' }, { status: 401 });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const userId = decodeTokenAndGetUserId(token);


    console.log({ userId })


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
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Assuming you have a function to decode the token and extract the userId
    const userId = decodeTokenAndGetUserId(token);
    console.log({ userId })

    if (!userId) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log("POST /api/questionnaires/", data);

    return NextResponse.json({ questionnaire: [] }, { status: 201 });

    // return NextResponse.json({ questionnaire: newQuestionnaire }, { status: 201 });

}



function decodeTokenAndGetUserId(token: string): string | null {
    try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        return decoded.userId || null;
    } catch (error) {
        console.error('Error decoding token:', error);
        return null;
    }
}