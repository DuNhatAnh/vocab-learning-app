import axios from 'axios';
import type { Session, Word, EvaluationResult, SessionStatus } from '../types';

const API_BASE_URL = 'http://localhost:8080/api';

export const api = {
    getSessions: () => axios.get<Session[]>(`${API_BASE_URL}/sessions`),
    getSession: (id: string) => axios.get<Session>(`${API_BASE_URL}/sessions/${id}`),
    createSession: () => axios.post<Session>(`${API_BASE_URL}/sessions`),
    updateSessionStatus: (id: string, status: SessionStatus) =>
        axios.patch<Session>(`${API_BASE_URL}/sessions/${id}/status`, status, {
            headers: { 'Content-Type': 'application/json' }
        }),
    getWords: (sessionId: string) => axios.get<Word[]>(`${API_BASE_URL}/sessions/${sessionId}/words`),
    saveWords: (sessionId: string, words: Omit<Word, 'id'>[]) =>
        axios.post<Word[]>(`${API_BASE_URL}/sessions/${sessionId}/words`, words),
    submitLearning: (sessionId: string, answers: Record<string, string>) =>
        axios.post<EvaluationResult[]>(`${API_BASE_URL}/sessions/${sessionId}/submit`, answers),
    getResults: (sessionId: string) =>
        axios.get<EvaluationResult[]>(`${API_BASE_URL}/sessions/${sessionId}/submit/results`),
    deleteSession: (id: string) => axios.delete(`${API_BASE_URL}/sessions/${id}`),
};
