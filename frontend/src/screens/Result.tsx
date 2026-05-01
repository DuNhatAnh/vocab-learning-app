import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Edit2, Check, X, Layers, Image as ImageIcon, Mic, Trash2 } from 'lucide-react';
import { api } from '../api/api';
import type { EvaluationResult, Session } from '../types';

export default function Result() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [results, setResults] = useState<EvaluationResult[]>(location.state?.results || []);
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<Session | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValues, setEditValues] = useState({ english: '', vietnamese: '', imageUrl: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultsResp, sessionResp] = await Promise.all([
                    location.state?.results ? Promise.resolve({ data: location.state.results }) : api.getResults(id!),
                    api.getSession(id!)
                ]);
                setResults(resultsResp.data);
                setSession(sessionResp.data);

                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id, location.state]);

    const handleRetry = async () => {
        try {
            await api.updateSessionStatus(id!, 'LEARNING');
            navigate(`/session/${id}/learning`);
        } catch (err) {
            console.error(err);
        }
    };

    const startEditing = (result: EvaluationResult) => {
        setEditingId(result.id);
        setEditValues({ english: result.english, vietnamese: result.vietnamese, imageUrl: result.imageUrl || '' });
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEdit = async () => {
        if (!editingId) return;
        try {
            await api.updateWord(id!, editingId, editValues);
            setResults((prev: EvaluationResult[]) => prev.map((r: EvaluationResult) =>
                r.id === editingId ? { ...r, ...editValues } : r
            ));
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi cập nhật từ vựng!");
        }
    };

    const handleDelete = async (wordId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa từ vựng này không?")) return;
        try {
            await api.deleteWord(id!, wordId);
            setResults(results.filter(r => r.id !== wordId));
        } catch (err) {
            console.error(err);
            alert("Lỗi khi xóa từ vựng!");
        }
    };

    if (loading) return <div className="p-8 text-center">Đang tải kết quả...</div>;

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 100%)',
            padding: '2rem 1rem 6rem 1rem'
        }}>
            <div className="container" style={{ maxWidth: '100%', margin: '0 auto', padding: '0 1rem' }}>
                {/* Header Title */}
                <h1 style={{ 
                    textAlign: 'center', 
                    fontSize: '2.5rem', 
                    color: '#075985', 
                    marginBottom: '2.5rem',
                    fontWeight: 800,
                    letterSpacing: '-0.02em'
                }}>
                    {session?.topic || "Chi tiết từ vựng"}
                </h1>

                {/* Navigation Pill Bar */}
                <div style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    padding: '0.6rem',
                    borderRadius: '9999px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                    marginBottom: '3rem',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}>
                    <button 
                        onClick={() => navigate('/')} 
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: '#dcfce7',
                            color: '#166534',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        <ArrowLeft size={18} />
                        <span>Dashboard</span>
                    </button>
                    <button 
                        onClick={handleRetry} 
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: '#f3e8ff',
                            color: '#6b21a8',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        <RefreshCw size={18} />
                        <span>Luyện tập</span>
                    </button>
                    <button 
                        onClick={() => navigate(`/session/${id}/flashcards`, { state: { results } })}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: '#ffedd5',
                            color: '#9a3412',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Layers size={18} />
                        <span>Flashcard</span>
                    </button>
                    <button 
                        onClick={() => navigate(`/session/${id}/pronunciation`)}
                        style={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            borderRadius: '9999px',
                            border: 'none',
                            background: '#e0f2fe',
                            color: '#075985',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontSize: '0.95rem'
                        }}
                    >
                        <Mic size={18} />
                        <span>Phát âm</span>
                    </button>
                </div>

                <div style={{ marginBottom: '1.5rem', paddingLeft: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Vocabulary List</h2>
                </div>

                {/* Vocabulary Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
                    {results.map((result: EvaluationResult, idx: number) => (
                        <div key={idx} style={{ 
                            background: 'white',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
                            border: '1px solid #f1f5f9',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                        }}>
                            {editingId === result.id ? (
                                <div style={{ padding: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Link Hình ảnh (URL)</label>
                                            <input
                                                className="input"
                                                style={{ marginTop: '0.25rem' }}
                                                placeholder="https://example.com/image.jpg"
                                                value={editValues.imageUrl}
                                                onChange={(e: any) => setEditValues({ ...editValues, imageUrl: e.target.value })}
                                            />
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tiếng Việt</label>
                                                <input
                                                    className="input"
                                                    style={{ marginTop: '0.25rem' }}
                                                    value={editValues.vietnamese}
                                                    onChange={(e: any) => setEditValues({ ...editValues, vietnamese: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Tiếng Anh</label>
                                                <input
                                                    className="input"
                                                    style={{ marginTop: '0.25rem' }}
                                                    value={editValues.english}
                                                    onChange={(e: any) => setEditValues({ ...editValues, english: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'end', gap: '0.5rem', marginTop: '1rem' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={cancelEditing} style={{ borderRadius: '9999px' }}>
                                            <X size={16} /> Hủy
                                        </button>
                                        <button className="btn btn-primary btn-sm" onClick={saveEdit} style={{ borderRadius: '9999px' }}>
                                            <Check size={16} /> Lưu
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div style={{ padding: '1.75rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>{result.vietnamese}</h3>
                                        </div>
                                        
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '100px' }}>
                                            <div style={{ 
                                                width: '70px', 
                                                height: '70px', 
                                                borderRadius: '16px', 
                                                background: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                overflow: 'hidden'
                                            }}>
                                                {result.imageUrl ? (
                                                    <img src={result.imageUrl} alt={result.english} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    <ImageIcon size={28} color="#94a3b8" />
                                                )}
                                            </div>
                                            <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>{result.english}</span>
                                        </div>
                                    </div>

                                    {/* Action bar at bottom */}
                                    <div style={{ 
                                        background: '#f8fafc', 
                                        padding: '0.75rem 1.5rem', 
                                        display: 'flex', 
                                        justifyContent: 'flex-end', 
                                        gap: '1.25rem',
                                        borderTop: '1px solid #f1f5f9'
                                    }}>
                                        <button
                                            onClick={() => startEditing(result)}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                color: '#0369a1', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.35rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <Edit2 size={16} />
                                            <span>Edit</span>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(result.id)}
                                            style={{ 
                                                background: 'transparent', 
                                                border: 'none', 
                                                color: '#ef4444', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                gap: '0.35rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                padding: '4px'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>

        </div >
    );
}