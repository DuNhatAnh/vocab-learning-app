import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronDown, List, Edit3, Shuffle, X } from 'lucide-react';
import { grammarService } from '../services/grammarService';
import { useState, useRef, useEffect } from 'react';

export default function GrammarSelection() {
    const navigate = useNavigate();
    const tenses = grammarService.getTenses();
    const [expandedTense, setExpandedTense] = useState<string | null>('present-simple');
    const [showRandomMenu, setShowRandomMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleExpand = (id: string) => {
        setExpandedTense(expandedTense === id ? null : id);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowRandomMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuRef]);

    return (
        <div className="grammar-selection-screen">
            <header className="header-section">
                <h1>Grammar</h1>

                <div className="random-fab-container" ref={menuRef}>
                    <button
                        className={`fab-button ${showRandomMenu ? 'active' : ''}`}
                        onClick={() => setShowRandomMenu(!showRandomMenu)}
                        title="Random luyện tập"
                    >
                        {showRandomMenu ? <X size={24} /> : <Shuffle size={24} />}
                    </button>

                    {showRandomMenu && (
                        <div className="random-menu">
                            <button
                                className="random-menu-item"
                                onClick={() => {
                                    navigate('/grammar/quiz/all-random');
                                    setShowRandomMenu(false);
                                }}
                            >
                                <div className="menu-icon quiz">
                                    <List size={18} />
                                </div>
                                <span>Random Trắc nghiệm</span>
                            </button>
                            <button
                                className="random-menu-item"
                                onClick={() => {
                                    navigate('/grammar/fitb/all-random');
                                    setShowRandomMenu(false);
                                }}
                            >
                                <div className="menu-icon fitb">
                                    <Edit3 size={18} />
                                </div>
                                <span>Random Điền từ</span>
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {['Present', 'Past', 'Future'].map(category => {
                const categoryTenses = tenses.filter(t => t.category === category);
                if (categoryTenses.length === 0) return null;

                return (
                    <section key={category} className="category-group">
                        <h2 className="category-title">{category}</h2>

                        <div className="tense-list">
                            {categoryTenses.map((tense) => (
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
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}

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

                .random-fab-container {
                    position: absolute;
                    top: 32px;
                    right: 24px;
                    z-index: 100;
                }

                .fab-button {
                    width: 56px;
                    height: 56px;
                    border-radius: 28px;
                    background: #10b981;
                    color: white;
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }

                .fab-button:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
                }

                .fab-button.active {
                    background: #ef4444;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
                }

                .random-menu {
                    position: absolute;
                    top: 68px;
                    right: 0;
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
                    border: 1px solid #f3f4f6;
                    padding: 8px;
                    min-width: 200px;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                    animation: slideUp 0.3s ease-out;
                }

                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .random-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: transparent;
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    width: 100%;
                    text-align: left;
                    transition: all 0.2s;
                }

                .random-menu-item:hover {
                    background: #f9fafb;
                }

                .random-menu-item span {
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }

                .menu-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .menu-icon.quiz { background: #ecfdf5; color: #10b981; }
                .menu-icon.fitb { background: #eff6ff; color: #3b82f6; }

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
