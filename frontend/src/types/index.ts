export type SessionStatus = 'NEW' | 'LEARNING' | 'DONE';

export interface Session {
    id: string;
    createdAt: string;
    status: SessionStatus;
    topic?: string;
    wordCount: number;
}

export interface Word {
    id?: string;
    sessionId: string;
    english: string;
    vietnamese: string;
    orderIndex: number;
    imageUrl?: string;
}

export interface EvaluationResult {
    id: string;
    english: string;
    vietnamese: string;
    userAnswer: string;
    correct: boolean;
    imageUrl?: string;
}
