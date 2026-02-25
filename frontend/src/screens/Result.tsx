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
            // Fallback for refresh
            const resp = await api.submitLearning(id!, {});
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
        <div>
            <div className="flex justify-between" style={{ marginBottom: '2rem' }}>
                <h1>Results</h1>
                <div className="flex font-bold" style={{ fontSize: '1.25rem' }}>
                    <span style={{ color: 'var(--success)' }}>{correctCount}</span>
                    <span className="text-muted">/</span>
                    <span>{results.length}</span>
                </div>
            </div>

            <div className="grid">
                {results.map((result, idx) => (
                    <div key={idx} className="card" style={{ cursor: 'default' }}>
                        <div className="flex justify-between">
                            <div>
                                <div className="text-muted text-sm">Meaning</div>
                                <div className="font-bold">{result.vietnamese}</div>
                            </div>
                            {result.correct ? (
                                <CheckCircle2 className="text-success" />
                            ) : (
                                <XCircle className="text-error" />
                            )}
                        </div>
                        <div style={{ marginTop: '1rem' }} className="grid">
                            <div>
                                <div className="text-muted text-sm">Your answer</div>
                                <div style={{ color: result.correct ? 'var(--text)' : 'var(--error)' }}>
                                    {result.userAnswer || '(empty)'}
                                </div>
                            </div>
                            {!result.correct && (
                                <div>
                                    <div className="text-muted text-sm">Correct answer</div>
                                    <div style={{ color: 'var(--success)', fontWeight: 600 }}>
                                        {result.english}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <ArrowLeft size={18} style={{ marginRight: '0.5rem' }} /> Dashboard
                </button>
                <button className="btn btn-primary" onClick={handleRetry}>
                    <RefreshCw size={18} style={{ marginRight: '0.5rem' }} /> Retry
                </button>
            </div>
        </div>
    );
}
