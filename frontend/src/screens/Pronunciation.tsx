import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Volume2, ChevronLeft, ChevronRight, Home, AlertCircle } from 'lucide-react';
import { api } from '../api/api';
import { encodeWAV } from '../utils/wavAudioEncoder';
import type { Word } from '../types';

export default function Pronunciation() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [result, setResult] = useState<{ score: number; recognized_text: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Audio recording refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioDataRef = useRef<Float32Array[]>([]);

    useEffect(() => {
        fetchWords();
        return () => {
            stopRecording();
        };
    }, [id]);

    const fetchWords = async () => {
        try {
            const resp = await api.getWords(id!);
            if (resp.data.length === 0) {
                alert("Phiên học này hiện chưa có từ vựng nào!");
                navigate('/');
                return;
            }
            setWords(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setError("Lỗi khi tải danh sách từ vựng.");
            setLoading(false);
        }
    };

    const startRecording = async () => {
        setResult(null);
        setError(null);
        audioDataRef.current = [];

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass({ sampleRate: 16000 });
            audioContextRef.current = audioContext;

            const source = audioContext.createMediaStreamSource(stream);
            const processor = audioContext.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;

            processor.onaudioprocess = (e: any) => {
                const inputData = e.inputBuffer.getChannelData(0);
                audioDataRef.current.push(new Float32Array(inputData));
            };

            source.connect(processor);
            processor.connect(audioContext.destination);

            setIsRecording(true);
        } catch (err) {
            console.error(err);
            setError("Không thể truy cập Microphone. Vui lòng cấp quyền sử dụng microphone.");
        }
    };

    const stopRecording = async () => {
        if (!isRecording) return;

        setIsRecording(false);

        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track: any) => track.stop());
            streamRef.current = null;
        }

        if (audioContextRef.current) {
            await audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Merge audio chunks
        const totalLength = audioDataRef.current.reduce((acc: number, chunk: Float32Array) => acc + chunk.length, 0);
        const mergedBuffer = new Float32Array(totalLength);
        let offset = 0;
        for (const chunk of audioDataRef.current) {
            mergedBuffer.set(chunk, offset);
            offset += chunk.length;
        }

        if (totalLength === 0) return;

        // Encode to WAV and send to backend
        const wavBlob = encodeWAV(mergedBuffer, 16000);
        handleCheckPronunciation(wavBlob);
    };

    const handleCheckPronunciation = async (blob: Blob) => {
        setLoading(true);
        try {
            const targetWord = words[currentIndex].english;
            const resp = await api.checkPronunciation(blob, targetWord);
            setResult(resp.data);
            setLoading(false);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Lỗi khi kiểm tra giọng nói. Hãy chắc chắn bạn đã tải model Vosk ở backend.");
            setLoading(false);
        }
    };

    const handleSpeak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            window.speechSynthesis.speak(utterance);
        }
    };

    if (loading && words.length === 0) return <div className="p-8 text-center">Đang tải...</div>;

    const currentWord = words[currentIndex];

    return (
        <div className="container" style={{ maxWidth: '600px' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ margin: 0 }}>Luyện phát âm</h1>
                    <p className="text-muted">Nói vào mic để kiểm tra độ chính xác</p>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    <Home size={20} />
                </button>
            </header>

            <div className="card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{ marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                    TỪ {currentIndex + 1} / {words.length}
                </div>

                <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {currentWord?.english}
                </div>
                <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                    {currentWord?.vietnamese}
                </div>

                <button 
                    className="btn btn-ghost" 
                    onClick={() => handleSpeak(currentWord?.english)}
                    style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, margin: '0 auto 2rem' }}
                >
                    <Volume2 size={24} />
                </button>

                <div className="flex justify-center items-center gap-6">
                    {!isRecording ? (
                        <button 
                            className="btn btn-primary" 
                            onClick={startRecording}
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                padding: 0,
                                boxShadow: '0 0 20px rgba(0, 102, 204, 0.4)'
                            }}
                        >
                            <Mic size={32} />
                        </button>
                    ) : (
                        <button 
                            className="btn btn-error" 
                            onClick={stopRecording}
                            style={{ 
                                width: '80px', 
                                height: '80px', 
                                borderRadius: '50%', 
                                padding: 0,
                                background: '#ef4444',
                                animation: 'pulse-red 1.5s infinite'
                            }}
                        >
                            <Square size={32} />
                        </button>
                    )}
                </div>

                {isRecording && (
                    <div style={{ marginTop: '1.5rem', color: '#ef4444', fontWeight: 'bold' }}>
                        Đang ghi âm... Hãy nói to rõ ràng
                    </div>
                )}
            </div>

            {error && (
                <div className="card" style={{ borderColor: '#ef4444', background: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', marginBottom: '1.5rem' }}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

            {result && (
                <div className="card" style={{ 
                    padding: '1.5rem', 
                    textAlign: 'center', 
                    marginBottom: '1.5rem',
                    border: '2px solid',
                    borderColor: result.score > 70 ? '#10b981' : result.score > 40 ? '#f59e0b' : '#ef4444',
                    background: result.score > 70 ? '#f0fdf4' : result.score > 40 ? '#fffbeb' : '#fef2f2'
                }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Kết quả</div>
                    <div style={{ fontSize: '3rem', fontWeight: '800', color: result.score > 70 ? '#10b981' : '#f59e0b' }}>
                        {result.score}%
                    </div>
                    <div className="text-muted" style={{ marginTop: '0.5rem' }}>
                        Bạn đã đọc: <span style={{ fontWeight: 'bold', color: 'var(--text)' }}>"{result.recognized_text || "..."}"</span>
                    </div>
                    {result.score > 80 && <div style={{ color: '#10b981', marginTop: '1rem', fontWeight: 'bold' }}>Phát âm rất tốt! 🌟</div>}
                </div>
            )}

            <div className="flex justify-between gap-4">
                <button 
                    className="btn btn-ghost" 
                    onClick={() => {
                        setCurrentIndex(prev => Math.max(0, prev - 1));
                        setResult(null);
                        setError(null);
                    }}
                    disabled={currentIndex === 0}
                    style={{ flex: 1 }}
                >
                    <ChevronLeft size={20} /> Câu trước
                </button>
                <button 
                    className="btn btn-ghost" 
                    onClick={() => {
                        setCurrentIndex(prev => Math.min(words.length - 1, prev + 1));
                        setResult(null);
                        setError(null);
                    }}
                    disabled={currentIndex === words.length - 1}
                    style={{ flex: 1 }}
                >
                    Câu tiếp theo <ChevronRight size={20} />
                </button>
            </div>

            <style>{`
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(239, 68, 68, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
                }
            `}</style>
        </div>
    );
}
