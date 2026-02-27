import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { grammarService } from '../services/grammarService';

export default function GrammarSelection() {
    const navigate = useNavigate();
    const tenses = grammarService.getTenses();

    return (
        <div className="grammar-selection-screen">
            <header className="header-section">
                <h1>Ngữ pháp</h1>
                <p>Chọn một thì để bắt đầu luyện tập</p>
            </header>

            <div className="tense-list">
                {tenses.map((tense) => (
                    <button
                        key={tense.id}
                        className="tense-item"
                        onClick={() => navigate(`/grammar/quiz/${tense.id}`)}
                    >
                        <div className="tense-info">
                            <span className="tense-name">{tense.name}</span>
                        </div>
                        <ChevronRight size={20} />
                    </button>
                ))}
            </div>

            <style>{`
                .grammar-selection-screen {
                    padding: 20px;
                    max-width: 600px;
                    margin: 0 auto;
                }
                .header-section {
                    margin-bottom: 30px;
                }
                .header-section h1 {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 8px;
                    color: #1a1a1a;
                }
                .header-section p {
                    color: #666;
                }
                .tense-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                .tense-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: left;
                    width: 100%;
                }
                .tense-item:hover {
                    border-color: #10b981;
                    background: #f0fdf4;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
                }
                .tense-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #1f2937;
                }
            `}</style>
        </div>
    );
}
