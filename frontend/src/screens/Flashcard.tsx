import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, RefreshCw, LogOut, Volume2, XCircle, Check } from 'lucide-react';
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
    const [scratchpadLines, setScratchpadLines] = useState<string[]>(['']);
    
    // Refs for scratchpad inputs to handle auto-focus
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const handleSpeak = useCallback((text: string, lang: 'en-US' | 'vi-VN') => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 0.9;
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.lang === lang && (v.name.includes('Google') || v.name.includes('Premium')));
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }
            window.speechSynthesis.speak(utterance);
        }
    }, []);

    const handleFlip = useCallback(() => {
        setIsFlipped(prev => !prev);
    }, []);

    const handleNext = useCallback(() => {
        if (currentIndex < words.length - 1) {
            setIsFlipped(false);
            setScratchpadLines(['']);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 150);
        } else {
            setIsFinished(true);
        }
    }, [currentIndex, words.length]);

    const handlePrev = useCallback(() => {
        if (currentIndex > 0) {
            setIsFlipped(false);
            setScratchpadLines(['']);
            setTimeout(() => {
                setCurrentIndex(prev => prev - 1);
            }, 150);
        }
    }, [currentIndex]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isFinished || loading) return;
            switch (e.key) {
                case 'ArrowRight': handleNext(); break;
                case 'ArrowLeft': handlePrev(); break;
                case 'Enter': handleFlip(); break;
                case ' ':
                    e.preventDefault();
                    if (words[currentIndex]) {
                        const text = isFlipped ? words[currentIndex].vietnamese : words[currentIndex].english;
                        const lang = isFlipped ? 'vi-VN' : 'en-US';
                        handleSpeak(text, lang as any);
                    }
                    break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleNext, handlePrev, handleFlip, handleSpeak, isFinished, loading, words, currentIndex, isFlipped]);

    const handleRestart = () => {
        setCurrentIndex(0);
        setIsFlipped(false);
        setIsFinished(false);
        setScratchpadLines(['']);
    };

    const handleExit = () => {
        navigate(`/session/${id}/result`);
    };

    const validateLine = useCallback((line: string) => {
        if (!line.trim() || !words[currentIndex]) return null;
        const currentWord = words[currentIndex];
        const normalizedLine = line.trim().toLowerCase();
        const en = currentWord.english.toLowerCase();
        const vi = currentWord.vietnamese.toLowerCase();
        return normalizedLine === en || normalizedLine === vi;
    }, [words, currentIndex]);

    const handleScratchpadChange = (index: number, value: string) => {
        const newLines = [...scratchpadLines];
        newLines[index] = value;
        
        const isValid = validateLine(value);
        
        // If correct, automatically move to next line
        if (isValid === true) {
            if (index === scratchpadLines.length - 1) {
                newLines.push('');
            }
            // Use setTimeout to allow state update before focusing
            setTimeout(() => {
                if (inputRefs.current[index + 1]) {
                    inputRefs.current[index + 1]?.focus();
                }
            }, 10);
        } else if (index === scratchpadLines.length - 1 && value.trim() !== '') {
            // Still add a line if they are typing something new, but don't focus yet
            newLines.push('');
        }
        
        setScratchpadLines(newLines);
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
        <div className="container" style={{ minHeight: '95vh', display: 'flex', flexDirection: 'column', maxWidth: '1200px', alignItems: 'center', margin: '0 auto' }}>
            <header style={{ marginBottom: '1rem', textAlign: 'center' }}>
                <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#1e40af' }}>{session?.topic || "Flashcard"}</h1>
                <p className="text-muted" style={{ fontSize: '1.1rem' }}>Thẻ {currentIndex + 1} trên {words.length}</p>
            </header>

            <div className="flashcard-unified-card">
                <div className={`flashcard-container ${isFlipped ? 'is-flipped' : ''}`} onClick={handleFlip}>
                    <div className="flashcard-inner">
                        <div className="flashcard-face flashcard-front">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0 1.5rem' }}>
                                <div className="flashcard-content" style={{ fontSize: '3rem', color: '#1e40af' }}>{currentWord.english}</div>
                                <button
                                    className="btn btn-ghost"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSpeak(currentWord.english, 'en-US');
                                    }}
                                    style={{ padding: 0, color: '#1e40af' }}
                                >
                                    <Volume2 size={48} />
                                </button>
                            </div>
                        </div>
                        <div className="flashcard-face flashcard-back">
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                {currentWord.imageUrl && (
                                    <img src={currentWord.imageUrl} alt={currentWord.english} style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', marginBottom: '1rem' }} />
                                )}
                                <div className="flashcard-content" style={{ fontSize: '3rem', color: '#1e40af' }}>{currentWord.vietnamese}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="scratchpad-container">
                    <div className="scratchpad-content">
                        {scratchpadLines.map((line, idx) => {
                            const isValid = validateLine(line);
                            return (
                                <div key={idx} className="scratchpad-line">
                                    <input
                                        ref={el => { inputRefs.current[idx] = el; }}
                                        className="scratchpad-input"
                                        placeholder={idx === 0 ? "Type to practice..." : ""}
                                        value={line}
                                        onChange={(e) => handleScratchpadChange(idx, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && idx === scratchpadLines.length - 1 && line.trim() === '') {
                                                handleNext();
                                            }
                                        }}
                                        style={{ fontSize: '1.25rem' }}
                                    />
                                    <div className="scratchpad-indicator">
                                        {isValid === true && <Check size={20} color="#10b981" strokeWidth={3} />}
                                        {isValid === false && <XCircle size={20} color="#ef4444" />}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div style={{ width: '1000px', marginTop: '2rem', margin: '2rem auto 0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button className="btn btn-outline" onClick={handlePrev} disabled={currentIndex === 0} style={{ borderRadius: '24px', height: '56px', fontSize: '1.1rem', color: '#1e40af', borderColor: '#1e40af' }}>
                        Trước đó
                    </button>
                    <button className="btn btn-primary" onClick={handleNext} style={{ borderRadius: '24px', height: '56px', fontSize: '1.1rem', backgroundColor: '#1d4ed8' }}>
                        {currentIndex < words.length - 1 ? "Kế tiếp" : "Hoàn thành"}
                    </button>
                    <button className="btn btn-outline" onClick={handleFlip} style={{ borderRadius: '24px', height: '56px', fontSize: '1.1rem', color: '#1e40af', borderColor: '#1e40af' }}>
                        Lật thẻ
                    </button>
                    <button className="btn btn-outline" onClick={handleExit} style={{ borderRadius: '24px', height: '56px', fontSize: '1.1rem', color: '#1e40af', borderColor: '#1e40af' }}>
                        Thoát
                    </button>
                </div>
            </div>
        </div>
    );
}
