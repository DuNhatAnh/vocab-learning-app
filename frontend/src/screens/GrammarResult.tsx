import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RefreshCw, Home, CheckCircle2, XCircle } from 'lucide-react';


interface LocationState {
    tenseId: string;
    tenseName: string;
    score: number;
    total: number;
    correctCount: number;
    userAnswers: any[];
    questions: any[];
    isFitb?: boolean;
}

export default function GrammarResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as LocationState;

    useEffect(() => {
        if (state) {
            const history = JSON.parse(localStorage.getItem('grammar_history') || '[]');
            const newResult = {
                topic: state.tenseName,
                score: state.score,
                date: new Date().toISOString()
            };

            // Check if this result was just added (to prevent double adding on re-render)
            // Use a combination of topic and timestamp to identify uniqueness roughly
            const lastEntry = history[0];
            const isDuplicate = lastEntry &&
                lastEntry.topic === newResult.topic &&
                Math.abs(new Date(lastEntry.date).getTime() - new Date(newResult.date).getTime()) < 1000;

            if (!isDuplicate) {
                const newHistory = [newResult, ...history].slice(0, 5);
                localStorage.setItem('grammar_history', JSON.stringify(newHistory));
            }
        }
    }, [state]);

    if (!state) {
        return (
            <div className="result-error">
                <p>Không tìm thấy dữ liệu kết quả.</p>
                <button onClick={() => navigate('/grammar')}>Quay lại</button>
            </div>
        );
    }

    const { tenseId, tenseName, score, total, correctCount, userAnswers, questions } = state;
    const percentage = Math.round((correctCount / total) * 100);
    const wrongAnswers = userAnswers.filter(a => !a.isCorrect);

    return (
        <div className="grammar-result-screen">
            <header className="result-header">
                <div className="score-circle">
                    <span className="score-value">{score.toFixed(1)}</span>
                    <span className="total-value">/ 10</span>
                </div>
                <h1 className="result-title">
                    {percentage >= 80 ? 'Tuyệt vời!' : percentage >= 50 ? 'Khá tốt!' : 'Cố gắng lên!'}
                </h1>
                <p className="result-info">Bạn đã hoàn thành bài tập thì {tenseName}</p>
            </header>

            <div className="result-actions">
                <button
                    className="action-btn retry-btn"
                    onClick={() => navigate(state.isFitb ? `/grammar/fitb/${tenseId}` : `/grammar/quiz/${tenseId}`)}
                >
                    <RefreshCw size={20} />
                    Làm lại
                </button>
                <button className="action-btn next-btn" onClick={() => navigate('/grammar')}>
                    <Home size={20} />
                    Làm tiếp bài khác
                </button>
                <button className="action-btn back-btn" onClick={() => navigate('/grammar')}>
                    Quay về màn hình ngữ pháp
                </button>
            </div>

            {wrongAnswers.length > 0 && (
                <div className="review-section">
                    <h2 className="section-title">Xem lại các câu sai ({wrongAnswers.length})</h2>
                    <div className="wrong-list">
                        {wrongAnswers.map((answer, index) => {
                            const question = questions[answer.questionIndex];
                            return (
                                <div key={index} className="wrong-item">
                                    <p className="wrong-sentence">{question.sentence}</p>
                                    <div className="wrong-details">
                                        <div className="detail-row wrong">
                                            <XCircle size={16} />
                                            <span>Bạn {state.isFitb ? 'nhập' : 'chọn'}: <strong>{state.isFitb ? answer.userInput : question.options[answer.selectedOption]}</strong></span>
                                        </div>
                                        <div className="detail-row correct">
                                            <CheckCircle2 size={16} />
                                            <span>Đáp án đúng: <strong>{state.isFitb ? question.correctAnswer : question.options[question.correctIndex]}</strong></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <style>{`
                .grammar-result-screen {
                    padding: 30px 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .result-header {
                    text-align: center;
                    margin-bottom: 40px;
                }
                .score-circle {
                    width: 120px;
                    height: 120px;
                    border-radius: 60px;
                    background: #10b981;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
                }
                .score-value {
                    font-size: 36px;
                    font-weight: 800;
                }
                .total-value {
                    font-size: 16px;
                    opacity: 0.8;
                }
                .result-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: #111827;
                }
                .result-info {
                    color: #6b7280;
                    font-size: 16px;
                }
                .result-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    margin-bottom: 40px;
                }
                .action-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    padding: 16px;
                    border-radius: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: none;
                }
                .retry-btn {
                    background: #10b981;
                    color: white;
                }
                .next-btn {
                    background: #1f2937;
                    color: white;
                }
                .back-btn {
                    background: #f3f4f6;
                    color: #4b5563;
                }
                .review-section {
                    background: #f9fafb;
                    padding: 20px;
                    border-radius: 16px;
                }
                .section-title {
                    font-size: 18px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: #374151;
                }
                .wrong-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                .wrong-item {
                    background: white;
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid #fee2e2;
                }
                .wrong-sentence {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #111827;
                    line-height: 1.5;
                }
                .wrong-details {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                .detail-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }
                .detail-row.wrong { color: #ef4444; }
                .detail-row.correct { color: #10b981; }
            `}</style>
        </div>
    );
}
