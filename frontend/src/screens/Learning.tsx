import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CornerDownLeft } from 'lucide-react';
import { api } from '../api/api';
import type { Word } from '../types';

export default function Learning() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        fetchWords();
    }, [id]);

    useEffect(() => {
        if (inputRefs.current[currentIndex]) {
            inputRefs.current[currentIndex]?.focus();
            inputRefs.current[currentIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [currentIndex]);

    const fetchWords = async () => {
        try {
            const resp = await api.getWords(id!);
            if (resp.data.length === 0) {
                alert("Phiên học này hiện chưa có từ vựng nào!");
                navigate('/');
                return;
            }
            // Shuffle words
            const shuffled = [...resp.data].sort(() => Math.random() - 0.5);
            setWords(shuffled);
            setLoading(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAnswerChange = (wordId: string, value: string) => {
        setAnswers({ ...answers, [wordId]: value });
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(answers).filter(id => answers[id].trim()).length;
        if (answeredCount < words.length) {
            alert("Vui lòng điền đầy đủ tất cả các câu trả lời!");
            return;
        }

        try {
            const resp = await api.submitLearning(id!, answers);
            navigate(`/session/${id}/summary`, { state: { results: resp.data } });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Luyện tập</h1>
                <p className="text-muted">Nhập nghĩa tiếng Anh chính xác cho các từ dưới đây</p>
            </header>

            <div className="grid">
                {words.map((word, index) => {
                    const isActive = index === currentIndex;
                    const isLocked = index > currentIndex;
                    const isCompleted = index < currentIndex;

                    return (
                        <div 
                            key={word.id} 
                            className="card" 
                            style={{ 
                                cursor: isLocked ? 'default' : 'pointer',
                                position: 'relative',
                                borderColor: isActive ? 'var(--primary)' : 'var(--border)',
                                boxShadow: isActive ? '0 4px 12px rgba(0, 102, 204, 0.15)' : 'var(--shadow)',
                                opacity: isLocked ? 0.6 : 1,
                                pointerEvents: isLocked ? 'none' : 'auto',
                                transition: 'all 0.3s ease',
                                padding: '1.5rem',
                                paddingTop: isActive ? '2rem' : '1.5rem'
                            }}
                            onClick={() => {
                                if (isCompleted) setCurrentIndex(index);
                            }}
                        >
                            {isActive && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: '-12px', 
                                    left: '1.5rem', 
                                    background: 'var(--primary)', 
                                    color: 'white', 
                                    padding: '4px 12px', 
                                    borderRadius: '12px', 
                                    fontSize: '0.75rem', 
                                    fontWeight: 'bold',
                                    zIndex: 10
                                }}>
                                    ĐANG LÀM
                                </div>
                            )}

                            <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
                                <div className="font-bold" style={{ fontSize: '1.5rem', color: isLocked ? 'var(--text-muted)' : 'var(--text)' }}>
                                    {word.vietnamese}
                                </div>
                                <div className="text-muted text-sm font-bold uppercase" style={{ letterSpacing: '0.05em' }}>
                                    CÂU {index + 1}
                                </div>
                            </div>

                            {isLocked ? (
                                <div style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius)',
                                    border: '1px dashed #cbd5e1',
                                    color: '#94a3b8',
                                    background: 'transparent',
                                    fontSize: '1rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    Chưa mở khóa...
                                </div>
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        ref={el => { inputRefs.current[index] = el; }}
                                        className="input"
                                        placeholder="Type the English word..."
                                        value={answers[word.id!] || ''}
                                        onChange={e => handleAnswerChange(word.id!, e.target.value)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                if (answers[word.id!]?.trim()) {
                                                    if (index < words.length - 1) {
                                                        setCurrentIndex(index + 1);
                                                    }
                                                }
                                            }
                                        }}
                                        onFocus={() => {
                                            if (!isActive) setCurrentIndex(index);
                                        }}
                                        style={{
                                            borderColor: isActive ? '#e2e8f0' : 'var(--border)',
                                            boxShadow: isActive ? '0 0 0 3px rgba(0, 102, 204, 0.05)' : 'none',
                                            paddingRight: '3rem',
                                            backgroundColor: 'white'
                                        }}
                                    />
                                    {isActive && (
                                        <div style={{
                                            position: 'absolute',
                                            right: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#cbd5e1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            pointerEvents: 'none'
                                        }}>
                                            <CornerDownLeft size={18} strokeWidth={2.5} />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ minWidth: '250px' }}>
                    Hoàn thành bài tập
                </button>
            </div>
        </div>
    );
}
