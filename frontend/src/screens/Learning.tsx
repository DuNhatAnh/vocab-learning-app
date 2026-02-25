import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/api';
import type { Word } from '../types';

export default function Learning() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [words, setWords] = useState<Word[]>([]);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWords();
    }, [id]);

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
            navigate(`/session/${id}/result`, { state: { results: resp.data } });
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
                <button className="btn btn-primary" onClick={handleSubmit} style={{ minWidth: '250px' }}>
                    Hoàn thành bài tập
                </button>
            </div>
        </div>
    );
}
