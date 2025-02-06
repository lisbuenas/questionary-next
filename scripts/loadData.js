/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const csvParser = require("csv-parser");

const prisma = new PrismaClient();


async function loadCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on("data", (data) => results.push(data))
            .on("end", () => resolve(results))
            .on("error", (error) => reject(error));
    });
}

async function main() {
    // Load Users
    const users = await loadCSV("./data/users.csv");
    await prisma.user.createMany({ data: users });

    // Load Questionnaires
    const questionnaires = await loadCSV("./data/questionnaire_questionnaires.csv");

    const processedQuestionnaires = questionnaires.map((q) => {
        return {
            ...q,
            id: parseInt(q.id, 10), // if `id` is a number in the CSV

        };
    });
    await prisma.questionnaire.createMany({ data: processedQuestionnaires });

    // Load Questions
    const questions = await loadCSV("./data/questionnaire_questions.csv");
    const processedQuestions = questions.map((q) => {
        return {
            ...q,
            id: parseInt(q.id, 10), // if `id` is a number in the CSV

        };
    });
    await prisma.question.createMany({ data: processedQuestions });

    // Load Junction Table (mapping questions to questionnaires)
    const junctions = await loadCSV("./data/questionnaire_junction.csv");

    console.log({ junctions })
    for (const j of junctions) {
        await prisma.questionnaireJunction.create({
            data: {
                questionnaire: {  // Pass the relation object
                    connect: { id: parseInt(j.questionnaire_id) }  // Use connect to reference the existing questionnaire
                },
                question: {     // Assuming `questionId` is a valid relation to the `Question` model
                    connect: { id: parseInt(j.question_id) }
                },
                priority: parseInt(j.priority),  // Integer for priority
            },
        });
    }

    console.log("Data imported successfully!");
}

main()
    .catch((error) => console.error(error))
    .finally(() => prisma.$disconnect());