export enum QuestionType {
    mcq = 'mcq',
    input = 'input',
}

export interface User {
    id: string;
    username: string;
    role: string;
    userQuestionaries: any[];
}

export type Questionnaire = {
    id: string;
    name: string;
    userQuestionnaire: any[];
};


export interface QuestionOption {
    id: string;
    label: string;
}

export interface Question {
    id: string;
    text: string;
    type: "input" | "mcq";
    options?: QuestionOption[];
}

export type FormData = {
    [key: string]: string | string[];
};


export interface QuestionData {
    id: string;
    question: any;
    questionId: number;
    questionnaireId: number;
}