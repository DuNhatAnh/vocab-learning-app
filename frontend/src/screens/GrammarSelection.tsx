import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, List, Edit3 } from 'lucide-react';
import { grammarService } from '../services/grammarService';
import { useState } from 'react';

export default function GrammarSelection() {
    const navigate = useNavigate();
    const tenses = grammarService.getTenses();
    const [expandedTense, setExpandedTense] = useState<string | null>('present-simple');

    const toggleExpand = (id: string) => {
        setExpandedTense(expandedTense === id ? null : id);
    };

    return (
        <div className="grammar-selection-screen">
            <header className="header-section">
                <h1>Grammar</h1>
            </header>

            <section className="category-group">
                <h2 className="category-title">Present</h2>

                <div className="tense-list">
                    {tenses.filter(t => t.category === 'Present').map((tense) => (
                        <div key={tense.id} className="tense-container">
                            <button
                                className={`tense-item ${expandedTense === tense.id ? 'active' : ''}`}
                                onClick={() => toggleExpand(tense.id)}
                            >
                                <span className="tense-name">{tense.name}</span>
                                {expandedTense === tense.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </button>

                            {expandedTense === tense.id && (
                                <div className="sub-options">
                                    <button
                                        className="sub-option"
                                        onClick={() => navigate(`/grammar/quiz/${tense.id}`)}
                                    >
                                        <div className="sub-option-icon quiz">
                                            <List size={18} />
                                        </div>
                                        <div className="sub-option-info">
                                            <span className="sub-name">{tense.name} (trắc nghiệm)</span>
                                            <span className="sub-desc">Chọn đáp án đúng từ các lựa chọn</span>
                                        </div>
                                        <ChevronRight size={16} />
                                    </button>

                                    {tense.id === 'present-simple' && (
                                        <button
                                            className="sub-option"
                                            onClick={() => navigate(`/grammar/fitb/${tense.id}`)}
                                        >
                                            <div className="sub-option-icon fitb">
                                                <Edit3 size={18} />
                                            </div>
                                            <div className="sub-option-info">
                                                <span className="sub-name">{tense.name} (điền từ)</span>
                                                <span className="sub-desc">Tự nhập câu trả lời vào chỗ trống</span>
                                            </div>
                                            <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

                .grammar-selection-screen {
                    padding: 32px 24px;
                    max-width: 600px;
                    margin: 0 auto;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                    color: #1f2937;
                }

                .header-section {
                    margin-bottom: 40px;
                }

                .header-section h1 {
                    font-size: 42px;
                    font-weight: 800;
                    margin: 0;
                    color: #111827;
                    letter-spacing: -1px;
                }

                .category-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #111827;
                    margin-bottom: 20px;
                    margin-top: 20px;
                }

                .tense-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .tense-container {
                    background: white;
                    border: 1px solid #eee;
                    border-radius: 16px;
                    overflow: hidden;
                    transition: all 0.3s;
                }

                .tense-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                }

                .tense-item:hover {
                    background: #f9fafb;
                }

                .tense-item.active {
                    background: #f0fdf4;
                }

                .tense-name {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111827;
                }

                .sub-options {
                    padding: 0 12px 12px 12px;
                    background: #fcfcfc;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .sub-option {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 14px;
                    background: white;
                    border: 1px solid #f3f4f6;
                    border-radius: 12px;
                    cursor: pointer;
                    width: 100%;
                    transition: all 0.2s;
                    text-align: left;
                }

                .sub-option:hover {
                    border-color: #10b981;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transform: translateY(-1px);
                }

                .sub-option-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .sub-option-icon.quiz { background: #ecfdf5; color: #10b981; }
                .sub-option-icon.fitb { background: #eff6ff; color: #3b82f6; }

                .sub-option-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .sub-name {
                    font-size: 15px;
                    font-weight: 700;
                    color: #111827;
                }

                .sub-desc {
                    font-size: 12px;
                    color: #6b7280;
                }

                @media (max-width: 640px) {
                    .header-section h1 { font-size: 32px; }
                    .tense-item { padding: 16px 20px; }
                }
            `}</style>
        </div>
    );
}
