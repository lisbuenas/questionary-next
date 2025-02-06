import { PrismaClient } from '@prisma/client';
import { NextResponse } from "next/server";


const prisma = new PrismaClient();

export async function GET(req: Request) {

    console.log("GET /api/questionnaires");

    console.log("req", req);
    const questionnaires = await prisma.questionnaire.findMany();
    //  res.status(200).json(questionnaires);

    return NextResponse.json({ questionnaires });
}

