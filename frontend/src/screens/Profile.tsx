import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Book, Layers } from 'lucide-react';
import type { Session } from '../types';

export default function Profile() {
    const [stats, setStats] = useState({ sessionCount: 0, totalWords: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const resp = await api.getSessions();
                const sessions: Session[] = resp.data;
                const totalWords = sessions.reduce((acc, s) => acc + s.wordCount, 0);
                setStats({
                    sessionCount: sessions.length,
                    totalWords
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div>Đang tải...</div>;

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
                        <h2 className="history-title">Lịch sử làm bài</h2>
                        <div className="history-list">
                            {JSON.parse(localStorage.getItem('grammar_history') || '[]').length > 0 ? (
                                JSON.parse(localStorage.getItem('grammar_history') || '[]').map((item: any, idx: number) => (
                                    <div key={idx} className="history-item">
                                        <div className="history-info">
                                            <div className="history-topic">{item.topic}</div>
                                            <div className="history-date text-sm text-muted">{new Date(item.date).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                        <div className="history-score">{item.score.toFixed(1)}/10</div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-muted text-center py-4">Chưa có lịch sử làm bài.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .profile-grid {
                    display: grid;
                    grid-template-columns: 1fr 1.5fr;
                    gap: 1.5rem;
                    max-width: 900px;
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
                    padding: 2rem;
                    text-align: center;
                }
                .stat-icon {
                    margin-bottom: 1rem;
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
                    margin-bottom: 0.5rem;
                }
                .stat-value {
                    font-size: 3rem;
                    font-weight: 700;
                }
                .history-card {
                    padding: 1.5rem;
                    height: 100%;
                }
                .history-title {
                    font-size: 1.25rem;
                    margin-bottom: 1.5rem;
                    color: var(--text-main);
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
                    padding: 1rem;
                    background: #f8fafc;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                .history-topic {
                    font-weight: 600;
                    color: var(--text-main);
                }
                .history-score {
                    font-weight: 700;
                    color: var(--primary);
                    font-size: 1.125rem;
                }
            `}</style>
            <div style={{ height: '100px' }}></div> {/* Spacer for bottom nav */}
        </div>
    );
}
