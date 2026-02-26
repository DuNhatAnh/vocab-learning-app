import { useEffect, useState } from 'react';
import { api } from '../api/api';
import { Book, Layers, Rocket } from 'lucide-react';
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

            <div className="grid" style={{ gridTemplateColumns: '1fr', gap: '1.5rem', maxWidth: '500px', margin: '0 auto' }}>
                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Layers size={40} />
                    </div>
                    <div className="text-muted text-sm font-bold uppercase" style={{ marginBottom: '0.5rem' }}>Số phiên học</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.sessionCount}</div>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <div style={{ color: '#10b981', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Book size={40} />
                    </div>
                    <div className="text-muted text-sm font-bold uppercase" style={{ marginBottom: '0.5rem' }}>Từ vựng đã học</div>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{stats.totalWords}</div>
                </div>

                <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', color: 'white', border: 'none' }}>
                    <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                        <Rocket size={40} />
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Tiếp tục cố gắng!</div>
                    <div style={{ opacity: 0.9 }}>Mỗi ngày thêm một chút kiến thức.</div>
                </div>
            </div>

            <div style={{ height: '100px' }}></div> {/* Spacer for bottom nav */}
        </div>
    );
}
