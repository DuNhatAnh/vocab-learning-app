import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Calendar, BookOpen, Trash2, Edit2, Dices, CheckCircle2 } from 'lucide-react';
import { api } from '../api/api';
import type { Session } from '../types';

export default function Dashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        fetchSessions();
        if (location.state?.showSuccess) {
            setShowSuccess(true);
            // Clear state to avoid showing again on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const fetchSessions = async () => {
        try {
            const resp = await api.getSessions();
            setSessions(resp.data);
        } catch (err) {
            console.error(err);
        }
    };

    const createSession = async () => {
        const topic = window.prompt("Nhập tên chủ đề cho phiên học mới (để trống nếu chưa chọn):", "Chưa thêm chủ đề");
        if (topic === null) return; // Cancelled

        try {
            const resp = await api.createSession(topic);
            navigate(`/session/${resp.data.id}/add`);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditTopic = async (e: React.MouseEvent, session: Session) => {
        e.stopPropagation();
        const newTopic = window.prompt("Chỉnh sửa tên chủ đề:", session.topic || "Chưa thêm chủ đề");
        if (newTopic === null) return;

        try {
            const resp = await api.updateSessionTopic(session.id, newTopic);
            setSessions(sessions.map(s => s.id === session.id ? resp.data : s));
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
            <div className="grid">
                {sessions.map((session) => (
                    <div key={session.id} className="card" onClick={() => handleSessionClick(session)}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                            <div className="flex items-center gap-2 font-bold text-primary" style={{ fontSize: '1.2rem' }}>
                                <span>{session.topic || "Chưa thêm chủ đề"}</span>
                                <button
                                    className="btn btn-ghost"
                                    style={{ padding: '2px', border: 'none', display: 'flex', alignItems: 'center' }}
                                    onClick={(e) => handleEditTopic(e, session)}
                                    title="Sửa tên chủ đề"
                                >
                                    <Edit2 size={14} />
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`badge badge-${session.status.toLowerCase()}`}>
                                    {session.status === 'DONE' ? 'Hoàn thành' : session.status === 'LEARNING' ? 'Đang học' : 'Mới'}
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

                        <div style={{ marginBottom: '1rem' }}>
                            <div className="flex text-muted text-sm items-center gap-1">
                                <Calendar size={14} />
                                {formatTime(session.createdAt)}
                            </div>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="flex items-center">
                                <BookOpen size={18} className="text-primary" />
                                <span className="font-bold ml-1">{session.wordCount} từ vựng</span>
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

            <button
                className="btn floating-btn"
                onClick={() => navigate('/quiz/random')}
                style={{
                    bottom: '160px',
                    background: '#8b5cf6',
                    color: 'white',
                    padding: 0,
                    boxShadow: '0 8px 25px rgba(139, 92, 246, 0.4)'
                }}
            >
                <Dices size={40} style={{ transform: 'rotate(-45deg)' }} />
            </button>

            {showSuccess && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{ color: 'var(--success)', marginBottom: '1rem' }}>
                            <CheckCircle2 size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Tạo thành công!</h2>
                        <button className="btn-light-blue" onClick={() => setShowSuccess(false)}>
                            Oke
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
