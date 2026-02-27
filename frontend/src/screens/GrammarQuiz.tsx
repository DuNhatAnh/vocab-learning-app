import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, X, Lightbulb } from 'lucide-react';
import { grammarService } from '../services/grammarService';
import type { GrammarQuestion, UserAnswer } from '../models/grammar';

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
            const tenses = grammarService.getTenses();
            const currentTense = tenses.find(t => t.id === tenseId);
            setTenseNote(currentTense?.note);
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
            const score = userAnswers.filter(a => a.isCorrect).length;
            navigate('/grammar/result', {
                state: {
                    tenseId,
                    score,
                    total: questions.length,
                    userAnswers,
                    questions
                }
            });
        }
    };

    if (loading) return <div className="quiz-loading">Đang tải câu hỏi...</div>;
    if (questions.length === 0) return <div className="quiz-error">Không tìm thấy câu hỏi cho thì này.</div>;

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
                .grammar-quiz-screen {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 70px);
                    background: #f9fafb;
                    overflow: hidden;
                }
                .quiz-header {
                    padding: 12px 20px;
                    background: white;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    border-bottom: 1px solid #eee;
                    flex-shrink: 0;
                }
                .progress-container {
                    flex: 1;
                    height: 6px;
                    background: #e5e7eb;
                    border-radius: 3px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    background: #10b981;
                    transition: width 0.3s ease;
                }
                .progress-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6b7280;
                    min-width: 40px;
                    margin-right: 8px;
                }
                .tip-container {
                    position: relative;
                }
                .tip-btn {
                    background: none;
                    border: none;
                    color: #6b7280;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                    padding: 8px;
                    border-radius: 50%;
                }
                .tip-btn:hover {
                    background: #f3f4f6;
                    color: #10b981;
                }
                .tip-btn .active {
                    color: #10b981;
                    fill: #10b981;
                }
                .tip-popup {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    width: 280px;
                    max-height: 80vh;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    z-index: 100;
                    padding: 16px;
                    margin-top: 10px;
                    overflow-y: auto;
                }
                .tip-content {
                    font-size: 14px;
                    color: #374151;
                    line-height: 1.6;
                }
                .tip-close {
                    display: block;
                    width: 100%;
                    padding: 8px;
                    background: #f3f4f6;
                    border: none;
                    border-radius: 8px;
                    margin-top: 12px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #4b5563;
                    cursor: pointer;
                }
                .tip-close:hover {
                    background: #e5e7eb;
                }
                .quiz-content {
                    flex: 1;
                    padding: 16px 20px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                }
                .question-card {
                    background: white;
                    padding: 20px;
                    border-radius: 16px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    flex-shrink: 0;
                }
                .question-text {
                    font-size: 18px;
                    line-height: 1.4;
                    color: #1f2937;
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .options-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .option-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border: 2px solid #e5e7eb;
                    border-radius: 12px;
                    background: white;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: left;
                    width: 100%;
                    position: relative;
                }
                .option-label {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #f3f4f6;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    margin-right: 12px;
                    color: #6b7280;
                    flex-shrink: 0;
                }
                .option-text {
                    font-size: 15px;
                    font-weight: 500;
                    color: #374151;
                    flex: 1;
                }
                .option-item.selected {
                    border-color: #10b981;
                    background: #f0fdf4;
                }
                .option-item.correct {
                    border-color: #10b981;
                    background: #ecfdf5;
                }
                .option-item.wrong {
                    border-color: #ef4444;
                    background: #fef2f2;
                }
                .option-item.disabled {
                    opacity: 0.6;
                    cursor: default;
                }
                .status-icon {
                    margin-left: 10px;
                    flex-shrink: 0;
                }
                .option-item.correct .status-icon { color: #10b981; }
                .option-item.wrong .status-icon { color: #ef4444; }

                .quiz-footer {
                    padding: 16px 20px;
                    background: white;
                    border-top: 1px solid #eee;
                    flex-shrink: 0;
                }
                .action-btn {
                    width: 100%;
                    padding: 14px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .check-btn {
                    background: #10b981;
                    color: white;
                }
                .check-btn:disabled {
                    background: #a7f3d0;
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
