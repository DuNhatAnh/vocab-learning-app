import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { api } from '../api/api';
import type { EvaluationResult } from '../types';

export default function Result() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [results, setResults] = useState<EvaluationResult[]>(location.state?.results || []);
    const [loading, setLoading] = useState(!location.state?.results);

    useEffect(() => {
        if (location.state?.results) {
            setResults(location.state.results);
            setLoading(false);
        } else {
            fetchResults();
        }
    }, [id, location.state]);

    const fetchResults = async () => {
        try {
            const resp = await api.getResults(id!);
            setResults(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleRetry = async () => {
        try {
            await api.updateSessionStatus(id!, 'LEARNING');
            navigate(`/session/${id}/learning`);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    const correctCount = results.filter(r => r.correct).length;

    return (
        <div className="container">
            <header className="flex justify-between items-center" style={{ marginBottom: '2.5rem' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Kết quả</h1>
                    <p className="text-muted">Chi tiết bài làm của bạn</p>
                </div>
                <div style={{ padding: '1rem 2rem', background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                    <div className="text-muted text-sm font-bold">ĐÚNG</div>
                    <div style={{ fontSize: '2rem', fontWeight: 700 }}>
                        <span style={{ color: 'var(--success)' }}>{correctCount}</span>
                        <span className="text-muted">/</span>
                        <span>{results.length}</span>
                    </div>
                </div>
            </header>

            <div className="grid">
                {results.map((result, idx) => (
                    <div key={idx} className="card" style={{ cursor: 'default' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: '1rem' }}>
                            <div className="font-bold" style={{ fontSize: '1.1rem' }}>{result.vietnamese}</div>
                            {result.correct ? (
                                <div className="flex items-center" style={{ color: 'var(--success)', fontWeight: 600 }}>
                                    <CheckCircle2 size={18} /> Chính xác
                                </div>
                            ) : (
                                <div className="flex items-center" style={{ color: 'var(--error)', fontWeight: 600 }}>
                                    <XCircle size={18} /> Chưa đúng
                                </div>
                            )}
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg)', padding: '1rem', borderRadius: '4px' }}>
                            <div>
                                <div className="text-muted text-sm">Câu trả lời của bạn:</div>
                                <div style={{ color: result.correct ? 'var(--text)' : 'var(--error)', fontWeight: 600 }}>
                                    {result.userAnswer || <span style={{ opacity: 0.5 }}>(Trống)</span>}
                                </div>
                            </div>
                            {!result.correct && (
                                <div>
                                    <div className="text-muted text-sm">Đáp án đúng:</div>
                                    <div style={{ color: 'var(--success)', fontWeight: 700 }}>
                                        {result.english}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex" style={{ marginTop: '3rem', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} /> Quay về
                </button>
                <button className="btn btn-primary" onClick={handleRetry} style={{ minWidth: '180px' }}>
                    <RefreshCw size={18} /> Thử lại
                </button>
            </div>
        </div>
    );
}
