import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, BookOpen } from 'lucide-react';
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

    const handleSessionClick = (session: Session) => {
        if (session.status === 'NEW') navigate(`/session/${session.id}/add`);
        else if (session.status === 'LEARNING') navigate(`/session/${session.id}/learning`);
        else navigate(`/session/${session.id}/result`);
    };

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Vocabulary Learning</h1>

            <div className="grid">
                {sessions.map(session => (
                    <div key={session.id} className="card" onClick={() => handleSessionClick(session)}>
                        <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
                            <div className="flex text-muted text-sm">
                                <Calendar size={14} />
                                {new Date(session.createdAt).toLocaleString()}
                            </div>
                            <span className={`badge badge-${session.status.toLowerCase()}`}>
                                {session.status}
                            </span>
                        </div>
                        <div className="flex">
                            <BookOpen size={18} className="text-muted" />
                            <span className="font-bold">{session.wordCount} Words</span>
                        </div>
                    </div>
                ))}
                {sessions.length === 0 && (
                    <div className="text-muted" style={{ textAlign: 'center', marginTop: '2rem' }}>
                        No sessions yet. Click the + button to start.
                    </div>
                )}
            </div>

            <button className="btn btn-primary floating-btn" onClick={createSession}>
                <Plus size={24} />
            </button>
        </div>
    );
}
