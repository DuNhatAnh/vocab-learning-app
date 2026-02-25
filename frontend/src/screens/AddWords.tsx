import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { api } from '../api/api';

export default function AddWords() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [words, setWords] = useState<{ english: string; vietnamese: string }[]>([]);
    const [rowCount, setRowCount] = useState('5');
    const [initialized, setInitialized] = useState(false);

    const handleInitialize = () => {
        const count = parseInt(rowCount);
        if (isNaN(count) || count <= 0) {
            alert("Vui lòng nhập số lượng hợp lệ");
            return;
        }
        const initialRows = Array.from({ length: count }, () => ({ english: '', vietnamese: '' }));
        setWords(initialRows);
        setInitialized(true);
    };

    const addRow = () => setWords([...words, { english: '', vietnamese: '' }]);
    const removeRow = (index: number) => setWords(words.filter((_, i) => i !== index));

    const handleChange = (index: number, field: 'english' | 'vietnamese', value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
    };

    const handleBack = async () => {
        if (window.confirm('Bạn có chắc chắn muốn quay lại không? Mọi thay đổi sẽ không được lưu và phiên học này sẽ bị huỷ.')) {
            try {
                await api.deleteSession(id!);
                navigate('/');
            } catch (err) {
                console.error(err);
                navigate('/');
            }
        }
    };

    const handleSubmit = async () => {
        const validWords = words.filter(w => w.english.trim() && w.vietnamese.trim());

        if (validWords.length === 0) {
            alert("Bạn phải nhập ít nhất 1 từ vựng (bao gồm cả tiếng Anh và tiếng Việt)!");
            return;
        }

        if (words.length !== validWords.length) {
            if (!window.confirm("Có một số ô bị trống, chúng sẽ bị bỏ qua. Bạn có muốn tiếp tục không?")) {
                return;
            }
        }

        try {
            await api.saveWords(id!, validWords.map((w, i) => ({ ...w, sessionId: id!, orderIndex: i })));
            navigate(`/session/${id}/learning`);
        } catch (err) {
            console.error(err);
        }
    };

    if (!initialized) {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <h1>Bắt đầu phiên học mới</h1>
                <div className="card" style={{ maxWidth: '400px', margin: '0 auto', padding: '2rem' }}>
                    <label className="text-muted" style={{ display: 'block', marginBottom: '1rem' }}>
                        Bạn muốn thêm bao nhiêu từ vựng?
                    </label>
                    <input
                        type="number"
                        className="input"
                        value={rowCount}
                        onChange={e => setRowCount(e.target.value)}
                        style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.25rem' }}
                    />
                    <div className="flex" style={{ justifyContent: 'center', gap: '1rem' }}>
                        <button className="btn btn-ghost" onClick={() => navigate('/')}>Hủy</button>
                        <button className="btn btn-primary" onClick={handleInitialize}>Tiếp tục</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <div className="flex items-center" style={{ gap: '1rem' }}>
                    <button className="btn btn-ghost" onClick={handleBack} style={{ padding: '8px' }}>
                        <ArrowLeft size={24} />
                    </button>
                    <h1 style={{ margin: 0 }}>Thêm từ vựng</h1>
                </div>
            </header>

            <div className="grid">
                {words.map((word, index) => (
                    <div key={index} className="flex" style={{ gap: '1rem' }}>
                        <input
                            className="input"
                            placeholder="Tiếng Anh"
                            value={word.english}
                            onChange={e => handleChange(index, 'english', e.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Tiếng Việt"
                            value={word.vietnamese}
                            onChange={e => handleChange(index, 'vietnamese', e.target.value)}
                        />
                        <button className="btn btn-ghost" onClick={() => removeRow(index)} disabled={words.length === 1} style={{ border: 'none' }}>
                            <Trash2 size={18} className="text-error" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex" style={{ marginTop: '2rem', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn btn-ghost" onClick={addRow}>
                    <Plus size={18} /> Thêm hàng
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    <Save size={18} /> Lưu & Bắt đầu
                </button>
            </div>
        </div>
    );
}
