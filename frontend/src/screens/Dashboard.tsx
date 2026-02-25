import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BookOpen, Trash2 } from 'lucide-react';
import { api } from '../api/api';
import type { Session } from '../types';

export default function Dashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const resp = await api.getSessions();
            setSessions(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createSession = async () => {
        try {
            const resp = await api.createSession();
            navigate(`/session/${resp.data.id}/add`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xoá phiên học này không?')) {
            try {
                await api.deleteSession(id);
                setSessions(sessions.filter(s => s.id !== id));
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleSessionClick = (session: Session) => {
        if (session.status === 'NEW') navigate(`/session/${session.id}/add`);
        else if (session.status === 'LEARNING') navigate(`/session/${session.id}/learning`);
        else navigate(`/session/${session.id}/result`);
    };

    const formatTime = (dateStr: string) => {
        return new Intl.DateTimeFormat('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short',
            timeZone: 'Asia/Ho_Chi_Minh'
        }).format(new Date(dateStr));
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Học từ vựng</h1>
                <p className="text-muted">Danh sách các phiên học của bạn</p>
            </header>

            <div className="grid">
                {sessions.map(session => (
                    <div key={session.id} className="card" onClick={() => handleSessionClick(session)}>
                        <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
                            <div className="flex text-muted text-sm">
                                <Calendar size={14} />
                                {formatTime(session.createdAt)}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge badge-${session.status.toLowerCase()}`}>
                                    {session.status}
                                </span>
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '4px', border: 'none' }}
                                    onClick={(e) => handleDelete(e, session.id)}
                                >
                                    <Trash2 size={16} className="text-error" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <BookOpen size={18} className="text-primary" />
                                <span className="font-bold">{session.wordCount} từ vựng</span>
                            </div>
                            <span className="text-primary text-sm">Chi tiết →</span>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        Chưa có phiên học nào. Nhấn dấu + để bắt đầu.
                    </div>
                )}
            </div>

            <button className="btn btn-primary floating-btn" onClick={createSession} style={{ padding: 0 }}>
                <Plus size={40} />
            </button>
        </div>
    );
}
