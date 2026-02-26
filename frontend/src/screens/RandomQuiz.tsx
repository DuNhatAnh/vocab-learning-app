import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import type { Word } from '../types';

export default function RandomQuiz() {
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWords();
    }, []);

    const fetchWords = async () => {
        try {
            const resp = await api.getRandomQuiz();
            if (resp.data.length === 0) {
                alert("Hệ thống chưa có đủ từ vựng để tạo bài kiểm tra!");
                navigate('/');
                return;
            }
            setWords(resp.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleAnswerChange = (wordId: string, value: string) => {
        setAnswers({ ...answers, [wordId]: value });
    };

    const handleSubmit = async () => {
        const answeredCount = Object.keys(answers).filter(id => answers[id].trim()).length;
        if (answeredCount < words.length && !window.confirm("Bạn chưa hoàn thành hết các câu. Vẫn muốn nộp bài?")) {
            return;
        }

        try {
            const resp = await api.submitRandomQuiz(answers);
            navigate(`/quiz/result`, { state: { results: resp.data } });
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center', padding: '3rem' }}>Đang tạo bộ đề ngẫu nhiên...</div>;

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ margin: 0 }}>Trắc nghiệm Ngẫu nhiên</h1>
                <p className="text-muted">Thử thách bản thân với 10 câu hỏi từ tất cả các chủ đề</p>
            </header>

            <div className="grid">
                {words.map((word, index) => (
                    <div key={word.id} className="card" style={{ cursor: 'default' }}>
                        <div className="text-muted text-sm font-bold" style={{ marginBottom: '0.5rem' }}>CÂU {index + 1}</div>
                        <div className="font-bold" style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>
                            {word.vietnamese}
                        </div>
                        <input
                            className="input"
                            placeholder="Nhập từ tiếng Anh..."
                            value={answers[word.id!] || ''}
                            onChange={e => handleAnswerChange(word.id!, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={handleSubmit} style={{ minWidth: '250px', background: '#8b5cf6' }}>
                    Nộp bài trắc nghiệm
                </button>
            </div>
        </div>
    );
}
