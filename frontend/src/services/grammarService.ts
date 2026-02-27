import type { GrammarQuestion, TenseConfig } from '../models/grammar';
import tensesData from '../data/grammar/tenses.json';

class GrammarService {
    private tenses: TenseConfig[] = tensesData;

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
            console.log(`Loading questions for: ${tenseId} from ${config.file}`);

            // Use import.meta.glob for better Vite support with dynamic paths
            const modules = import.meta.glob('../data/grammar/*.json');
            const path = `../data/grammar/${config.file}`;

            if (modules[path]) {
                const module: any = await modules[path]();
                const allQuestions = module.default || module;

                if (!Array.isArray(allQuestions)) {
                    console.error('Data is not an array:', allQuestions);
                    return [];
                }

                console.log(`Successfully loaded ${allQuestions.length} questions`);
                return this.shuffleAndLimit(allQuestions, 30);
            } else {
                console.error(`Module not found for path: ${path}`);
                return [];
            }
        } catch (error) {
            console.error('Error loading questions:', error);
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
