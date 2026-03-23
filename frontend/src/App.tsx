import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import AddWords from './screens/AddWords';
import Learning from './screens/Learning';
import Result from './screens/Result';
import Summary from './screens/Summary';
import Profile from './screens/Profile';
import Flashcard from './screens/Flashcard';
import Pronunciation from './screens/Pronunciation';
import RandomQuiz from './screens/RandomQuiz';
import QuizResult from './screens/QuizResult';
import GrammarSelection from './screens/GrammarSelection';
import GrammarQuiz from './screens/GrammarQuiz';
import GrammarQuizFitb from './screens/GrammarQuizFitb';
import GrammarResult from './screens/GrammarResult';
import BottomNav from './components/BottomNav';

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
            <Route path="/session/:id/pronunciation" element={<Pronunciation />} />
            <Route path="/quiz/random" element={<RandomQuiz />} />
            <Route path="/quiz/result" element={<QuizResult />} />
            <Route path="/grammar" element={<GrammarSelection />} />
            <Route path="/grammar/quiz/:tenseId" element={<GrammarQuiz />} />
            <Route path="/grammar/fitb/:tenseId" element={<GrammarQuizFitb />} />
            <Route path="/grammar/result" element={<GrammarResult />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
