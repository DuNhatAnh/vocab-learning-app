import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { RotateCw, ChevronRight, ChevronLeft, CheckCircle2, RefreshCw, LogOut } from 'lucide-react';
import { api } from '../api/api';
import type { EvaluationResult, Session } from '../types';

export default function Flashcard() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const [words, setWords] = useState<EvaluationResult[]>(location.state?.results || []);
    const [session, setSession] = useState<Session | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [wordsResp, sessionResp] = await Promise.all([
                    location.state?.results ? Promise.resolve({ data: location.state.results }) : api.getResults(id!),
                    api.getSession(id!)
                ]);
                setWords(wordsResp.data);
                setSession(sessionResp.data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [id, location.state]);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
            }, 150); // Small delay to sync with flip back
        } else {
            setIsFinished(true);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setTimeout(() => {
                setCurrentIndex(currentIndex - 1);
            }, 150);
        }
    };

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
    };

    const handleExit = () => {
        navigate(`/session/${id}/result`);
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Đang tải...</div>;

    if (isFinished) {
        return (
            <div className="container" style={{ maxWidth: '500px', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <CheckCircle2 size={80} strokeWidth={1.5} />
                </div>
                <h1 style={{ marginBottom: '1rem' }}>Tuyệt vời!</h1>
                <p className="text-muted" style={{ marginBottom: '3rem' }}>Bạn đã hoàn thành tất cả các thẻ Flashcard trong phiên học này.</p>

                <div className="flex flex-col gap-4">
                    <button className="btn btn-primary" onClick={handleRestart} style={{ width: '100%' }}>
                        <RefreshCw size={18} /> Học lại từ đầu
                    </button>
                    <button className="btn btn-ghost" onClick={handleExit} style={{ width: '100%' }}>
                        <LogOut size={18} /> Thoát ra màn hình chi tiết
                    </button>
                </div>
            </div>
        );
    }

    if (words.length === 0) return (
        <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>
            <p>Không có từ vựng nào để hiển thị Flashcard.</p>
            <button className="btn btn-ghost" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
    );

    const currentWord = words[currentIndex];

    return (
        <div className="container" style={{ maxWidth: '500px' }}>
            <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ margin: 0 }}>{session?.topic || "Flashcard"}</h1>
                <p className="text-muted">Thẻ {currentIndex + 1} trên {words.length}</p>
            </header>

            <div className={`flashcard-container ${isFlipped ? 'is-flipped' : ''}`} onClick={handleFlip}>
                <div className="flashcard-inner">
                    {/* Front Face: English */}
                    <div className="flashcard-face flashcard-front">
                        <div className="flashcard-label">Tiếng Anh</div>
                        <div className="flashcard-content">{currentWord.english}</div>
                        <div className="text-muted text-xs" style={{ marginTop: '2rem', opacity: 0.6 }}>Bấm để lật thẻ</div>
                    </div>
                    {/* Back Face: Vietnamese */}
                    <div className="flashcard-face flashcard-back">
                        <div className="flashcard-label">Tiếng Việt</div>
                        <div className="flashcard-content" style={{ color: 'var(--text)' }}>{currentWord.vietnamese}</div>
                        <div className="text-muted text-xs" style={{ marginTop: '2rem', opacity: 0.6 }}>Bấm để lật lại</div>
                    </div>
                </div>
            </div>

            <div className="flashcard-actions">
                <button
                    className="btn btn-light-blue"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    style={{ opacity: currentIndex === 0 ? 0.3 : 1, width: '100%' }}
                >
                    <ChevronLeft size={18} /> Trước đó
                </button>

                <button
                    className="btn btn-light-blue"
                    onClick={handleNext}
                    style={{ width: '100%' }}
                >
                    {currentIndex < words.length - 1 ? (
                        <>Kế tiếp <ChevronRight size={18} /></>
                    ) : (
                        <>Hoàn thành <CheckCircle2 size={18} /></>
                    )}
                </button>

                <button
                    className="btn btn-light-blue"
                    onClick={handleFlip}
                    style={{ width: '100%' }}
                >
                    <RotateCw size={18} /> Lật thẻ
                </button>

                <button
                    className="btn btn-light-blue"
                    onClick={handleExit}
                    style={{ width: '100%' }}
                >
                    <LogOut size={18} /> Thoát
                </button>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                        height: '100%',
                        background: 'var(--primary)',
                        width: `${((currentIndex + 1) / words.length) * 100}%`,
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}></div>
                </div>
            </div>
        </div>
    );
}
