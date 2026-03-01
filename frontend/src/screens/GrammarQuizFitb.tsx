import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { grammarService } from '../services/grammarService';
import { api } from '../api/api';
import { useState, useEffect, useRef } from 'react';

interface FitbQuestion {
    question: string;
    answer: string;
}

export default function GrammarQuizFitb() {
    const { tenseId } = useParams<{ tenseId: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<FitbQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswer, setUserAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<{ isCorrect: boolean; userInput: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (tenseId) {
            grammarService.getFitbQuestions(tenseId).then(data => {
                setQuestions(data);
                setLoading(false);
                setTimeout(() => inputRef.current?.focus(), 100);
            });
        }
    }, [tenseId]);

    const normalizeAnswer = (text: string) => {
        return text.toLowerCase()
            .trim()
            .replace(/n't/g, ' not')
            .replace(/'m/g, ' am')
            .replace(/'re/g, ' are')
            .replace(/'s/g, ' is')
            .replace(/won't/g, 'will not')
            .replace(/can't/g, 'cannot')
            .replace(/\s+/g, ' ');
    };

    const handleCheck = () => {
        if (!userAnswer.trim() || isAnswered) return;

        const normalizedAnswer = normalizeAnswer(questions[currentIndex].answer);
        const normalizedInput = normalizeAnswer(userAnswer);
        const correct = normalizedInput === normalizedAnswer;

        setResults([...results, { isCorrect: correct, userInput: userAnswer }]);
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setUserAnswer('');
            setIsAnswered(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            const correctCount = results.filter(r => r.isCorrect).length;
            const score = (correctCount / questions.length) * 10;
            const tenseName = tenseId === 'all-random'
                ? 'Tổng hợp các thì (Điền từ)'
                : 'Present Simple (Điền từ)';

            // Save history
            api.submitGrammarHistory({
                type: 'GRAMMAR_FITB',
                topic: tenseName,
                score: correctCount,
                total: questions.length
            }).catch(err => console.error('Failed to save grammar history:', err));

            navigate('/grammar/result', {
                state: {
                    tenseId,
                    tenseName,
                    score,
                    total: questions.length,
                    correctCount,
                    isFitb: true,
                    userAnswers: results.map((r, i) => ({
                        questionIndex: i,
                        isCorrect: r.isCorrect,
                        userInput: r.userInput
                    })),
                    questions: questions.map(q => ({
                        sentence: q.question,
                        correctAnswer: q.answer
                    }))
                }
            });
        }
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (isAnswered) handleNext();
                else handleCheck();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, userAnswer, currentIndex, questions]);

    if (loading) return <div className="quiz-loading">Đang tải câu hỏi...</div>;
    if (questions.length === 0) return <div className="quiz-error">Không tìm thấy câu hỏi.</div>;

    const currentQuestion = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="grammar-quiz-screen">
            <header className="quiz-header">
                <button className="back-btn" onClick={() => navigate('/grammar')}>
                    <ChevronLeft size={24} />
                </button>
                <div className="progress-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
                <span className="progress-text">{currentIndex + 1}/{questions.length}</span>
            </header>

            <main className="quiz-content">
                <div className="question-card">
                    <div className="mode-badge">ĐIỀN TỪ VÀO CHỖ TRỐNG</div>
                    <h2 className="question-text" style={{ fontSize: '1.5rem', marginTop: '1rem' }}>
                        {currentQuestion.question}
                    </h2>

                    <div className="input-container" style={{ marginTop: '2rem' }}>
                        <input
                            ref={inputRef}
                            className={`quiz-input ${isAnswered ? (results[currentIndex]?.isCorrect ? 'correct' : 'wrong') : ''}`}
                            placeholder="Nhập câu trả lời..."
                            value={userAnswer}
                            onChange={e => !isAnswered && setUserAnswer(e.target.value)}
                            disabled={isAnswered}
                            autoFocus
                        />
                        {isAnswered && !results[currentIndex]?.isCorrect && (
                            <div className="correct-answer-hint">
                                Đáp án đúng: <strong>{currentQuestion.answer}</strong>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <footer className="quiz-footer">
                {!isAnswered ? (
                    <button
                        className="action-btn check-btn"
                        disabled={!userAnswer.trim()}
                        onClick={handleCheck}
                    >
                        Kiểm tra
                    </button>
                ) : (
                    <button className="action-btn next-btn" onClick={handleNext}>
                        {currentIndex < questions.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
                        <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                    </button>
                )}
            </footer>

            <style>{`
                .grammar-quiz-screen {
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 70px);
                    background: #fdfdfd;
                }
                .quiz-header {
                    padding: 16px 24px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid #eee;
                }
                .progress-container {
                    flex: 1;
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 4px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    transition: width 0.3s ease;
                }
                .progress-text {
                    font-size: 14px;
                    font-weight: 700;
                    color: #6b7280;
                }
                .quiz-content {
                    flex: 1;
                    padding: 24px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }
                .question-card {
                    background: white;
                    width: 100%;
                    max-width: 600px;
                    padding: 32px;
                    border-radius: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    text-align: center;
                }
                .mode-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    background: #f3f4f6;
                    color: #6b7280;
                    border-radius: 100px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 1px;
                }
                .quiz-input {
                    width: 100%;
                    padding: 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 16px;
                    font-size: 18px;
                    font-weight: 600;
                    text-align: center;
                    transition: all 0.2s;
                }
                .quiz-input:focus {
                    outline: none;
                    border-color: #10b981;
                    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
                }
                .quiz-input.correct {
                    border-color: #10b981;
                    background: #ecfdf5;
                }
                .quiz-input.wrong {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .correct-answer-hint {
                    margin-top: 12px;
                    color: #ef4444;
                    font-size: 14px;
                }
                .quiz-footer {
                    padding: 24px;
                    background: white;
                    border-top: 1px solid #eee;
                    display: flex;
                    justify-content: center;
                }
                .action-btn {
                    width: 100%;
                    max-width: 400px;
                    padding: 16px;
                    border-radius: 16px;
                    font-size: 16px;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .check-btn {
                    background: #10b981;
                    color: white;
                }
                .check-btn:disabled {
                    background: #e5e7eb;
                    cursor: not-allowed;
                }
                .next-btn {
                    background: #1f2937;
                    color: white;
                }
            `}</style>
        </div>
    );
}
