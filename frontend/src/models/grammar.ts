export interface GrammarQuestion {
    sentence: string;
    options: string[];
    correctIndex: number;
}

export interface TenseConfig {
    id: string;
    name: string;
    file: string;
    note?: string;
}

export interface UserAnswer {
    questionIndex: number;
    selectedOption: number;
    isCorrect: boolean;
}

export interface QuizSession {
    tenseId: string;
    tenseName: string;
    questions: GrammarQuestion[];
    currentQuestionIndex: number;
    userAnswers: UserAnswer[];
    isCompleted: boolean;
}
