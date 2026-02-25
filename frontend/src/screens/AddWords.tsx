import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save } from 'lucide-react';
import { api } from '../api/api';

export default function AddWords() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [words, setWords] = useState([{ english: '', vietnamese: '' }]);

    const addRow = () => setWords([...words, { english: '', vietnamese: '' }]);
    const removeRow = (index: number) => setWords(words.filter((_, i) => i !== index));

    const handleChange = (index: number, field: 'english' | 'vietnamese', value: string) => {
        const newWords = [...words];
        newWords[index][field] = value;
        setWords(newWords);
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

    return (
        <div>
            <h1 style={{ marginBottom: '2rem' }}>Add Words</h1>
            <div className="grid">
                {words.map((word, index) => (
                    <div key={index} className="flex" style={{ marginBottom: '0.5rem' }}>
                        <input
                            className="input"
                            placeholder="English"
                            value={word.english}
                            onChange={e => handleChange(index, 'english', e.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Tiếng Việt"
                            value={word.vietnamese}
                            onChange={e => handleChange(index, 'vietnamese', e.target.value)}
                        />
                        <button className="btn btn-ghost" onClick={() => removeRow(index)} disabled={words.length === 1}>
                            <Trash2 size={18} className="text-error" />
                        </button>
                    </div>
                ))}
            </div>

            <div className="flex" style={{ marginTop: '2rem', justifyContent: 'center' }}>
                <button className="btn btn-ghost" onClick={addRow}>
                    <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Row
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    <Save size={18} style={{ marginRight: '0.5rem' }} /> Save & Start
                </button>
            </div>
        </div>
    );
}
