import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Edit2, Check, X, Layers, Image as ImageIcon } from 'lucide-react';
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
            setResults(prev => prev.map(r =>
                r.id === editingId ? { ...r, ...editValues } : r
            ));
            setEditingId(null);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi cập nhật từ vựng!");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container" style={{ maxWidth: '650px' }}>
            <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
                <div style={{ textAlign: 'left' }}>
                    <h1 style={{ margin: 0 }}>{session?.topic || "Chi tiết từ vựng"}</h1>
                    <p className="text-muted">Danh sách từ vựng trong phiên học</p>
                </div>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate(`/session/${id}/flashcards`, { state: { results } })}
                >
                    <Layers size={16} /> Flashcard
                </button>
            </div>

            <div className="flex" style={{ marginBottom: '2rem', gap: '1rem' }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')} style={{ flex: 1 }}>
                    <ArrowLeft size={18} /> Quay về Dashboard
                </button>
                <button className="btn btn-primary" onClick={handleRetry} style={{ flex: 1 }}>
                    <RefreshCw size={18} /> Luyện tập
                </button>
            </div>

            <div className="grid">
                {results.map((result, idx) => (
                    <div key={idx} className="card" style={{ cursor: 'default', padding: '1.25rem' }}>
                        {editingId === result.id ? (
                            <div className="flex flex-col gap-4">
                                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="flex flex-col gap-4" style={{ gridColumn: 'span 2' }}>
                                        <label className="text-muted text-xs font-bold uppercase">Link Hình ảnh (URL)</label>
                                        <input
                                            className="input"
                                            placeholder="https://example.com/image.jpg"
                                            value={editValues.imageUrl}
                                            onChange={e => setEditValues({ ...editValues, imageUrl: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted text-xs font-bold uppercase">Tiếng Việt</label>
                                        <input
                                            className="input"
                                            value={editValues.vietnamese}
                                            onChange={e => setEditValues({ ...editValues, vietnamese: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-muted text-xs font-bold uppercase">Tiếng Anh</label>
                                        <input
                                            className="input"
                                            value={editValues.english}
                                            onChange={e => setEditValues({ ...editValues, english: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button className="btn btn-ghost btn-sm" onClick={cancelEditing}>
                                        <X size={16} /> Hủy
                                    </button>
                                    <button className="btn btn-primary btn-sm" onClick={saveEdit}>
                                        <Check size={16} /> Lưu
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center group">
                                <div style={{ flex: 1 }}>
                                    <div className="text-muted text-sm">Tiếng Việt</div>
                                    <div className="font-bold" style={{ fontSize: '1.1rem' }}>
                                        <span className="text-muted" style={{ marginRight: '0.5rem' }}>{idx + 1}.</span>
                                        {result.vietnamese}
                                    </div>
                                </div>

                                <div style={{ flex: 0.5, display: 'flex', justifyContent: 'center' }}>
                                    <div className="word-image-thumbnail">
                                        {result.imageUrl ? (
                                            <img src={result.imageUrl} alt={result.english} />
                                        ) : (
                                            <div className="no-image">
                                                <ImageIcon size={16} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <div className="text-muted text-sm">Tiếng Anh</div>
                                    <div className="font-bold text-primary" style={{ fontSize: '1.1rem' }}>{result.english}</div>
                                </div>
                                <div style={{ width: '40px', textAlign: 'right' }}>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => startEditing(result)}
                                        title="Chỉnh sửa"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div >
    );
}