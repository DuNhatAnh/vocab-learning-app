import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard.tsx';
import AddWords from './screens/AddWords.tsx';
import Learning from './screens/Learning.tsx';
import Result from './screens/Result.tsx';
import Summary from './screens/Summary.tsx';
import Profile from './screens/Profile.tsx';
import Flashcard from './screens/Flashcard.tsx';
import BottomNav from './components/BottomNav.tsx';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <main className="app-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session/:id/add" element={<AddWords />} />
            <Route path="/session/:id/learning" element={<Learning />} />
            <Route path="/session/:id/summary" element={<Summary />} />
            <Route path="/session/:id/result" element={<Result />} />
            <Route path="/session/:id/flashcards" element={<Flashcard />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
