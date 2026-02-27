import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, User, PenTool } from 'lucide-react';

export default function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="bottom-nav">
            <button
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
                onClick={() => navigate('/')}
            >
                <BookOpen size={24} />
                <span>Học từ vựng</span>
            </button>
            <button
                className={`nav-item ${isActive('/grammar') ? 'active' : ''}`}
                onClick={() => navigate('/grammar')}
            >
                <PenTool size={24} />
                <span>Ngữ pháp</span>
            </button>
            <button
                className={`nav-item ${isActive('/profile') ? 'active' : ''}`}
                onClick={() => navigate('/profile')}
            >
                <User size={24} />
                <span>Cá nhân</span>
            </button>
        </nav>
    );
}
