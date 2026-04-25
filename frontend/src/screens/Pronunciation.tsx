import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, Square, Volume2, ChevronLeft, ChevronRight, Home, AlertCircle, PlayCircle } from 'lucide-react';
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
    const [isAutoStop, setIsAutoStop] = useState(false);
    const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);

    // Audio recording refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const audioDataRef = useRef<Float32Array[]>([]);
    const autoStopTimerRef = useRef<any>(null);
    const isRecordingRef = useRef(false);

    useEffect(() => {
        fetchWords();
        return () => {
            stopRecording();
            if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current);
            if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        };
    }, [id]);

    useEffect(() => {
        // Clear recording when changing words
        setResult(null);
        setError(null);
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
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
        // Clear previous recording URL if any
        if (recordedAudioUrl) {
            URL.revokeObjectURL(recordedAudioUrl);
            setRecordedAudioUrl(null);
        }
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
            isRecordingRef.current = true;

            if (isAutoStop) {
                autoStopTimerRef.current = setTimeout(() => {
                    stopRecording();
                }, 5000);
            }
        } catch (err) {
            console.error(err);
            setError("Không thể truy cập Microphone. Vui lòng cấp quyền sử dụng microphone.");
        }
    };

    const stopRecording = async () => {
        if (!isRecordingRef.current) return;

        setIsRecording(false);
        isRecordingRef.current = false;
        
        if (autoStopTimerRef.current) {
            clearTimeout(autoStopTimerRef.current);
            autoStopTimerRef.current = null;
        }

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
        
        // Create temporary URL for playback
        const url = URL.createObjectURL(wavBlob);
        setRecordedAudioUrl(url);

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

    const playRecordedAudio = () => {
        if (recordedAudioUrl) {
            const audio = new Audio(recordedAudioUrl);
            audio.play();
        }
    };

    if (loading && words.length === 0) return <div className="p-8 text-center">Đang tải...</div>;

    const currentWord = words[currentIndex];

    return (
        <div className="container">
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

                <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                    <label className="switch">
                        <input 
                            type="checkbox" 
                            checked={isAutoStop} 
                            onChange={(e) => setIsAutoStop(e.target.checked)} 
                        />
                        <span className="slider round"></span>
                    </label>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Tự động dừng (5s)</span>
                </div>

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

                    {recordedAudioUrl && !isRecording && (
                        <button 
                            className="btn btn-ghost" 
                            onClick={playRecordedAudio}
                            title="Nghe lại giọng của mình"
                            style={{ 
                                width: '60px', 
                                height: '60px', 
                                borderRadius: '50%', 
                                padding: 0,
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)'
                            }}
                        >
                            <PlayCircle size={32} />
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

                /* Switch styles */
                .switch {
                    position: relative;
                    display: inline-block;
                    width: 44px;
                    height: 24px;
                }
                .switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 24px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 18px;
                    width: 18px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: var(--primary);
                }
                input:focus + .slider {
                    box-shadow: 0 0 1px var(--primary);
                }
                input:checked + .slider:before {
                    transform: translateX(20px);
                }
            `}</style>
        </div>
    );
}
