import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Book, Layers, History } from 'lucide-react';
import type { Session, QuizHistory } from '../types';

export default function Profile() {
    const [stats, setStats] = useState({ sessionCount: 0, totalWords: 0 });
    const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sessionsResp, historyResp] = await Promise.all([
                    api.getSessions(),
                    api.getQuizHistory()
                ]);

                const sessions: Session[] = sessionsResp.data;
                const totalWords = sessions.reduce((acc, s) => acc + s.wordCount, 0);
                setStats({
                    sessionCount: sessions.length,
                    totalWords
                });
                setQuizHistory(historyResp.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatTime = (dateStr: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Ho_Chi_Minh'
        }).format(new Date(dateStr));
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="container">
            <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                <h1 style={{ margin: 0 }}>Cá nhân</h1>
                <p className="text-muted">Tiến trình học tập của bạn</p>
            </header>

            <div className="profile-grid">
                <div className="stats-column">
                    <div className="card stat-card">
                        <div className="stat-icon session-icon">
                            <Layers size={40} />
                        </div>
                        <div className="stat-label">Số phiên học</div>
                        <div className="stat-value">{stats.sessionCount}</div>
                    </div>

                    <div className="card stat-card">
                        <div className="stat-icon word-icon">
                            <Book size={40} />
                        </div>
                        <div className="stat-label">Từ vựng đã học</div>
                        <div className="stat-value">{stats.totalWords}</div>
                    </div>
                </div>

                <div className="history-column">
                    <div className="card history-card">
                        <div className="flex items-center gap-2 mb-6">
                            <History className="text-primary" />
                            <h2 className="history-title" style={{ margin: 0 }}>Lịch sử luyện tập (10 bài gần nhất)</h2>
                        </div>
                        <div className="history-list">
                            {quizHistory.length > 0 ? (
                                quizHistory.map((item) => (
                                    <div key={item.id} className="history-item">
                                        <div className="history-info">
                                            <div className="flex items-center gap-2 mb-1">
                                                {item.type === 'RANDOM' && <Layers size={14} className="text-primary" />}
                                                {item.type === 'GRAMMAR_MCQ' && <History size={14} className="text-primary" />}
                                                {item.type === 'GRAMMAR_FITB' && <Book size={14} className="text-primary" />}
                                                <span className="history-type-badge">{item.type === 'RANDOM' ? 'Từ vựng' : 'Ngữ pháp'}</span>
                                            </div>
                                            <div className="history-topic">{item.topic}</div>
                                            <div className="history-date text-sm text-muted">{formatTime(item.timestamp)}</div>
                                        </div>
                                        <div className="history-score-container text-right">
                                            <div className="history-score">{item.score}/{item.total}</div>
                                            <div className="text-xs text-muted">đúng</div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted text-center py-8">
                                    <History size={48} className="mx-auto mb-2 opacity-20" />
                                    <p>Chưa có lịch sử làm bài.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 2rem;
                    max-width: 1000px;
                    margin: 0 auto;
                }
                @media (max-width: 768px) {
                    .profile-grid {
                        grid-template-columns: 1fr;
                    }
                }
                .stats-column {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                .stat-card {
                    padding: 2.5rem 2rem;
                    text-align: center;
                    background: white;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    transition: transform 0.2s;
                }
                .stat-card:hover {
                    transform: translateY(-5px);
                }
                .stat-icon {
                    margin-bottom: 1.5rem;
                    display: flex;
                    justify-content: center;
                }
                .session-icon { color: var(--primary); }
                .word-icon { color: #10b981; }
                .stat-label {
                    color: var(--text-muted);
                    font-size: 0.875rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 3.5rem;
                    font-weight: 800;
                    color: var(--text-main);
                    line-height: 1;
                }
                .history-card {
                    padding: 2rem;
                    background: white;
                    border: 1px solid #e2e8f0;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    height: fit-content;
                }
                .history-title {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .history-type-badge {
                    font-size: 10px;
                    font-weight: 800;
                    text-transform: uppercase;
                    background: var(--primary-light);
                    color: var(--primary);
                    padding: 2px 8px;
                    border-radius: 4px;
                }
                .history-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                .history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 1.25rem;
                    background: #f8fafc;
                    border-radius: 16px;
                    border: 1px solid #e2e8f0;
                    transition: all 0.2s;
                }
                .history-item:hover {
                    background: white;
                    border-color: var(--primary);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.1);
                    transform: translateX(5px);
                }
                .history-topic {
                    font-weight: 700;
                    color: var(--text-main);
                    margin-bottom: 0.25rem;
                }
                .history-score {
                    font-weight: 800;
                    color: var(--primary);
                    font-size: 1.5rem;
                    line-height: 1;
                }
                .history-score-container {
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
            `}</style>
            <div style={{ height: '100px' }}></div>
        </div>
    );
}
