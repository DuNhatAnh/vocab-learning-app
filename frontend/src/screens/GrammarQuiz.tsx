import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Lightbulb } from 'lucide-react';
import { grammarService } from '../services/grammarService';
import { api } from '../api/api';
import type { GrammarQuestion, UserAnswer } from '../models/grammar';
import { useState, useEffect } from 'react';

export default function GrammarQuiz() {
    const { tenseId } = useParams<{ tenseId: string }>();
    const navigate = useNavigate();

    const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [tenseNote, setTenseNote] = useState<string | undefined>(undefined);

    useEffect(() => {
        if (tenseId) {
            grammarService.getQuestions(tenseId).then(data => {
                setQuestions(data);
                setLoading(false);
            });

            if (tenseId === 'all-random') {
                setTenseNote("Đây là bài tập tổng hợp từ tất cả các thì. Hãy vận dụng kiến thức đã học để hoàn thành nhé!");
            } else {
                const tenses = grammarService.getTenses();
                const currentTense = tenses.find(t => t.id === tenseId);
                setTenseNote(currentTense?.note);
            }
        }
    }, [tenseId]);

    const handleOptionSelect = (optionIndex: number) => {
        if (isAnswered) return;
        setSelectedOption(optionIndex);
    };

    const handleCheck = () => {
        if (selectedOption === null || isAnswered) return;

        const correct = selectedOption === questions[currentIndex].correctIndex;
        const newAnswer: UserAnswer = {
            questionIndex: currentIndex,
            selectedOption,
            isCorrect: correct
        };

        setUserAnswers([...userAnswers, newAnswer]);
        setIsAnswered(true);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            // Finish quiz - passing state via navigate
            const correctCount = userAnswers.filter(a => a.isCorrect).length;
            const score = (correctCount / questions.length) * 10;
            const tenses = grammarService.getTenses();
            const currentTense = tenses.find(t => t.id === tenseId);
            const tenseName = tenseId === 'all-random'
                ? "Tổng hợp các thì (Trắc nghiệm)"
                : `${currentTense?.name || tenseId} (Trắc nghiệm)`;

            // Save history
            api.submitGrammarHistory({
                type: 'GRAMMAR_MCQ',
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
                    userAnswers,
                    questions
                }
            });
        }
    };

    const currentQuestion = questions[currentIndex];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                if (!isAnswered) {
                    if (selectedOption !== null) handleCheck();
                } else {
                    handleNext();
                }
            } else if (!isAnswered && /^[1-4]$/.test(e.key)) {
                const index = parseInt(e.key) - 1;
                if (currentQuestion && index < currentQuestion.options.length) {
                    handleOptionSelect(index);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isAnswered, selectedOption, currentIndex, questions, currentQuestion, handleCheck, handleNext, handleOptionSelect]);
    const progress = ((currentIndex + 1) / questions.length) * 100;

    if (loading) return <div className="quiz-loading">Đang tải câu hỏi...</div>;
    if (questions.length === 0) return <div className="quiz-error">Không tìm thấy câu hỏi cho thì này.</div>;

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

                {tenseNote && (
                    <div className="tip-container">
                        <button
                            className="tip-btn"
                            onClick={() => setShowTip(!showTip)}
                            title="Mẹo"
                        >
                            <Lightbulb size={20} className={showTip ? 'active' : ''} />
                        </button>
                        {showTip && (
                            <div className="tip-popup">
                                <div className="tip-content">
                                    {tenseNote.split('\n').map((line, i) => (
                                        <div key={i}>{line || <br />}</div>
                                    ))}
                                </div>
                                <button className="tip-close" onClick={() => setShowTip(false)}>Đóng</button>
                            </div>
                        )}
                    </div>
                )}
            </header>

            <main className="quiz-content">
                <div className="question-card">
                    <h2 className="question-text">{currentQuestion.sentence}</h2>

                    <div className="options-list">
                        {currentQuestion.options.map((option, index) => {
                            let optionClass = "option-item";
                            if (selectedOption === index) optionClass += " selected";
                            if (isAnswered) {
                                if (index === currentQuestion.correctIndex) optionClass += " correct";
                                else if (selectedOption === index) optionClass += " wrong";
                                else optionClass += " disabled";
                            }

                            return (
                                <button
                                    key={index}
                                    className={optionClass}
                                    onClick={() => handleOptionSelect(index)}
                                    disabled={isAnswered}
                                >
                                    <span className="option-label">{String.fromCharCode(65 + index)}</span>
                                    <span className="option-text">{option}</span>
                                    {isAnswered && index === currentQuestion.correctIndex && <Check size={20} className="status-icon" />}
                                    {isAnswered && selectedOption === index && index !== currentQuestion.correctIndex && <X size={20} className="status-icon" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            <footer className="quiz-footer">
                {!isAnswered ? (
                    <button
                        className="action-btn check-btn"
                        disabled={selectedOption === null}
                        onClick={handleCheck}
                    >
                        Kiểm tra
                    </button>
                ) : (
                    <button className="action-btn next-btn" onClick={handleNext}>
                        {currentIndex < questions.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
                    </button>
                )}
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                :root {
                    --primary-h: 161;
                    --primary-s: 84%;
                    --primary-l: 39%;
                    --primary: hsl(var(--primary-h), var(--primary-s), var(--primary-l));
                    --primary-light: hsl(var(--primary-h), var(--primary-s), 95%);
                    --primary-hover: hsl(var(--primary-h), var(--primary-s), 30%);
                    
                    --error: #ef4444;
                    --error-light: #fef2f2;
                    --gray-100: #f3f4f6;
                    --gray-200: #e5e7eb;
                    --gray-500: #6b7280;
                    --gray-800: #1f2937;
                    
                    --glass: rgba(255, 255, 255, 0.8);
                    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
                    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
                    --shadow-lg: 0 10px 25px rgba(0,0,0,0.1);
                    
                    --radius-md: 12px;
                    --radius-lg: 20px;
                }

                .grammar-quiz-screen {
                    font-family: 'Plus Jakarta Sans', -apple-system, sans-serif;
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 70px);
                    background: #fdfdfd;
                    overflow: hidden;
                    color: var(--gray-800);
                }

                .quiz-header {
                    padding: 16px 24px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    border-bottom: 1px solid var(--gray-100);
                    flex-shrink: 0;
                    box-shadow: var(--shadow-sm);
                }

                .back-btn {
                    background: none;
                    border: none;
                    color: var(--gray-500);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 50%;
                    transition: all 0.2s;
                }

                .back-btn:hover {
                    background: var(--gray-100);
                    color: var(--primary);
                    transform: translateX(-2px);
                }

                .progress-container {
                    flex: 1;
                    height: 8px;
                    background: var(--gray-100);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), #34d399);
                    border-radius: 4px;
                    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .progress-text {
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--gray-500);
                    min-width: 45px;
                }

                .tip-container {
                    position: relative;
                }

                .tip-btn {
                    background: var(--gray-100);
                    border: none;
                    color: var(--gray-500);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    padding: 10px;
                    border-radius: 50%;
                }

                .tip-btn:hover, .tip-btn.active {
                    background: var(--primary-light);
                    color: var(--primary);
                    transform: rotate(15deg);
                }

                .tip-btn .active {
                    fill: currentColor;
                }

                .tip-popup {
                    position: absolute;
                    top: calc(100% + 12px);
                    right: 0;
                    width: 300px;
                    background: var(--glass);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg);
                    z-index: 1000;
                    padding: 24px;
                    animation: slideUp 0.3s cubic-bezier(0.23, 1, 0.32, 1);
                }

                @keyframes slideUp {
                    from { transform: translateY(10px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .tip-content {
                    font-size: 14px;
                    color: var(--gray-800);
                    line-height: 1.7;
                    font-weight: 500;
                }

                .tip-close {
                    display: block;
                    width: 100%;
                    padding: 10px;
                    background: var(--primary);
                    border: none;
                    border-radius: var(--radius-md);
                    margin-top: 16px;
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .tip-close:hover {
                    background: var(--primary-hover);
                    transform: translateY(-1px);
                }

                .quiz-content {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
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
                    border: 1px solid #f9fafb;
                }

                .question-text {
                    font-size: 22px;
                    line-height: 1.5;
                    color: var(--gray-800);
                    margin-bottom: 32px;
                    font-weight: 700;
                    text-align: center;
                }

                .options-list {
                    display: grid;
                    gap: 14px;
                }

                .option-item {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    border: 2px solid var(--gray-100);
                    border-radius: var(--radius-lg);
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    text-align: left;
                    width: 100%;
                    position: relative;
                }

                .option-item:hover:not(.disabled):not(.selected) {
                    border-color: var(--primary);
                    background: var(--primary-light);
                    transform: translateY(-2px);
                }

                .option-item.selected {
                    border-color: var(--primary);
                    background: var(--primary-light);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
                    transform: scale(1.02);
                }

                .option-label {
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--gray-100);
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 800;
                    margin-right: 16px;
                    color: var(--gray-500);
                    flex-shrink: 0;
                    transition: all 0.2s;
                }

                .option-item.selected .option-label {
                    background: var(--primary);
                    color: white;
                }

                .option-text {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--gray-800);
                    flex: 1;
                }

                .option-item.correct {
                    border-color: var(--primary);
                    background: #ecfdf5;
                    animation: pulseCorrect 0.5s ease;
                }

                .option-item.wrong {
                    border-color: var(--error);
                    background: var(--error-light);
                    animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
                }

                @keyframes pulseCorrect {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1.02); }
                }

                @keyframes shake {
                    10%, 90% { transform: translate3d(-1px, 0, 0); }
                    20%, 80% { transform: translate3d(2px, 0, 0); }
                    30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
                    40%, 60% { transform: translate3d(4px, 0, 0); }
                }

                .option-item.disabled {
                    opacity: 0.5;
                    cursor: default;
                }

                .status-icon {
                    margin-left: 12px;
                    flex-shrink: 0;
                }

                .option-item.correct .status-icon { color: var(--primary); }
                .option-item.wrong .status-icon { color: var(--error); }

                .quiz-footer {
                    padding: 24px;
                    background: white;
                    border-top: 1px solid var(--gray-100);
                    display: flex;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .action-btn {
                    width: 100%;
                    max-width: 400px;
                    padding: 16px;
                    border-radius: var(--radius-lg);
                    font-size: 16px;
                    font-weight: 800;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: none;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .check-btn {
                    background: var(--primary);
                    color: white;
                    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
                }

                .check-btn:hover:not(:disabled) {
                    background: var(--primary-hover);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                }

                .check-btn:active:not(:disabled) {
                    transform: translateY(0);
                }

                .check-btn:disabled {
                    background: var(--gray-200);
                    color: var(--gray-500);
                    box-shadow: none;
                    cursor: not-allowed;
                }

                .next-btn {
                    background: var(--gray-800);
                    color: white;
                    box-shadow: 0 4px 14px rgba(31, 41, 55, 0.2);
                }

                .next-btn:hover {
                    background: #111827;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(31, 41, 55, 0.3);
                }
            `}</style>
        </div>
    );
}
