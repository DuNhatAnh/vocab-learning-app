import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../api/api';
import type { EvaluationResult } from '../types';

export default function Summary() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const results: EvaluationResult[] = location.state?.results || [];

    const correctCount = results.filter(r => r.correct).length;
    const totalCount = results.length;

    const handleRetry = async () => {
        try {
            await api.updateSessionStatus(id!, 'LEARNING');
            navigate(`/session/${id}/learning`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '700px' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ margin: 0 }}>Kết quả kiểm tra</h1>
                <p className="text-muted">Tổng kết bài luyện tập của bạn</p>
            </header>

            <div className="card" style={{ textAlign: 'center', marginBottom: '2rem', padding: '2rem' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    SỐ CÂU ĐÚNG
                </div>
                <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {correctCount}<span style={{ color: 'var(--text-muted)', fontSize: '2rem' }}>/{totalCount}</span>
                </div>
            </div>

            <div className="grid">
                {results.map((result, idx) => (
                    <div key={idx} className="card" style={{
                        borderLeft: `5px solid ${result.correct ? '#10b981' : '#ef4444'}`,
                        padding: '1.25rem'
                    }}>
                        <div className="flex justify-between items-start">
                            <div style={{ flex: 1 }}>
                                <div className="text-muted text-xs font-bold uppercase" style={{ marginBottom: '0.25rem' }}>Tiếng Việt</div>
                                <div className="font-bold">
                                    <span className="text-muted" style={{ marginRight: '0.5rem' }}>{idx + 1}.</span>
                                    {result.vietnamese}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                {result.correct ? (
                                    <div className="flex items-center gap-1" style={{ color: '#10b981', fontWeight: 'bold' }}>
                                        <CheckCircle2 size={16} /> Chính xác
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1" style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                        <XCircle size={16} /> Chưa đúng
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.25rem' }}>
                            <div style={{ background: 'rgba(0,0,0,0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div className="text-muted text-xs">Bạn đã nhập:</div>
                                <div style={{
                                    textDecoration: result.correct ? 'none' : 'line-through',
                                    color: result.correct ? 'inherit' : '#ef4444'
                                }}>
                                    {result.userAnswer || <span className="text-muted italic">(Trống)</span>}
                                </div>
                            </div>
                            <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '0.75rem', borderRadius: '8px' }}>
                                <div className="text-muted text-xs">Đáp án đúng:</div>
                                <div className="font-bold text-primary">{result.english}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex" style={{ marginTop: '3rem', gap: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ flex: 1 }}>
                    <ArrowLeft size={18} /> Quay về Dashboard
                </button>
                <button className="btn btn-primary" onClick={handleRetry} style={{ flex: 1 }}>
                    <RefreshCw size={18} /> Luyện tập lại
                </button>
            </div>
        </div>
    );
}
