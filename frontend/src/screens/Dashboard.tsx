import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Calendar, BookOpen, Trash2, Edit2, Dices, CheckCircle2, Search, ChevronRight } from 'lucide-react';
import { api } from '../api/api';
import type { Session } from '../types';

export default function Dashboard() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const studyDaysCount = useMemo(() => {
        const uniqueDays = new Set(
            sessions.map(session => {
                return new Intl.DateTimeFormat('vi-VN', {
                    dateStyle: 'short',
                    timeZone: 'Asia/Ho_Chi_Minh'
                }).format(new Date(session.createdAt));
            })
        );
        return uniqueDays.size;
    }, [sessions]);

    const filteredSessions = useMemo(() => {
        return sessions.filter(session => {
            const topic = session.topic || "Chưa thêm chủ đề";
            return topic.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [sessions, searchQuery]);
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

    const handleEditTopic = async (e: any, session: Session) => {
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

    const handleDelete = async (e: any, id: string) => {
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



    return (
        <div className="container">
            <header className="dashboard-header">
                <h1 className="text-2xl font-bold" style={{ margin: 0, color: 'var(--text)' }}>Chào mừng trở lại!</h1>
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input 
                        type="text" 
                        className="search-input"
                        placeholder="Tìm kiếm chủ đề..." 
                        value={searchQuery}
                        onChange={(e: any) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Streak Card */}
            <div className="streak-card">
                <div>
                    <h2>Chuỗi học tập</h2>
                    <div className="streak-value">{studyDaysCount} Ngày</div>
                </div>
                <div className="streak-icon">
                    <Calendar size={32} />
                </div>
            </div>

            <h2 className="section-title">Chủ đề từ vựng của tôi</h2>

            <div className="topic-grid">
                {filteredSessions.map((session) => {
                    const isCompleted = session.status === 'DONE';
                    // Mock progress for now, in real app it would be calculated from words learned
                    const progress = isCompleted ? 100 : session.status === 'LEARNING' ? 60 : 10;
                    
                    return (
                        <div key={session.id} className="topic-card" onClick={() => handleSessionClick(session)}>
                            <div className="flex justify-between items-center" style={{ width: '100%' }}>
                                <h3 className="topic-title">{session.topic || "Chưa thêm chủ đề"}</h3>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '4px', border: 'none', display: 'flex', alignItems: 'center' }}
                                        onClick={(e) => handleEditTopic(e, session)}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '4px', border: 'none' }}
                                        onClick={(e) => handleDelete(e, session.id)}
                                    >
                                        <Trash2 size={16} className="text-error" />
                                    </button>
                                </div>
                            </div>

                            <div className="progress-container">
                                <div className="progress-bar-bg">
                                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                                </div>
                            </div>

                            <div>
                                <span className={`status-badge ${isCompleted ? 'status-completed' : 'status-in-progress'}`}>
                                    {isCompleted ? 'Hoàn thành' : 'Đang học'}
                                </span>
                            </div>

                            <div className="topic-footer">
                                <div className="word-count">
                                    <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                        <BookOpen size={16} className="text-primary" />
                                    </div>
                                    <span className="font-semibold">{session.wordCount} từ vựng</span>
                                </div>
                                <button className="action-btn">
                                    {isCompleted ? 'Ôn tập' : 'Tiếp tục'} <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredSessions.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    {sessions.length === 0 
                        ? "Chưa có chủ đề nào. Nhấn + để bắt đầu!" 
                        : "Không tìm thấy chủ đề phù hợp."}
                </div>
            )}

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
                            Đồng ý
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
