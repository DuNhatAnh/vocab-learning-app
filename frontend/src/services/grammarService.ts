import type { GrammarQuestion, TenseConfig } from '../models/grammar';
import tensesData from '../data/grammar/tenses.json';

class GrammarService {
    private tenses: TenseConfig[] = tensesData as TenseConfig[];

    getTenses(): TenseConfig[] {
        return this.tenses;
    }

    async getQuestions(tenseId: string): Promise<GrammarQuestion[]> {
        const config = this.tenses.find(t => t.id === tenseId);
        if (!config) {
            console.error(`Tense not found: ${tenseId}`);
            return [];
        }

        try {
            const modules = import.meta.glob('../data/grammar/*.json');
            const path = `../data/grammar/${config.file}`;

            if (modules[path]) {
                const module: any = await modules[path]();
                const allQuestions = module.default || module;
                return this.shuffleAndLimit(allQuestions, 20); // Limit to 20 as per user request
            } else {
                return [];
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            return [];
        }
    }

    async getFitbQuestions(tenseId: string): Promise<any[]> {
        try {
            const modules = import.meta.glob('../data/grammar/*.json');
            const path = `../data/grammar/${tenseId.replace(/-/g, '_')}_fitb.json`;

            if (modules[path]) {
                const module: any = await modules[path]();
                const allQuestions = module.default || module;
                return this.shuffleAndLimit(allQuestions, 10);
            } else {
                console.error(`FITB module not found for path: ${path}`);
                return [];
            }
        } catch (error) {
            console.error('Error loading FITB questions:', error);
            return [];
        }
    }

    private shuffleAndLimit(allQuestions: GrammarQuestion[], limit: number): GrammarQuestion[] {
        const shuffled = [...allQuestions];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled.slice(0, Math.min(limit, shuffled.length));
    }
}

export const grammarService = new GrammarService();
