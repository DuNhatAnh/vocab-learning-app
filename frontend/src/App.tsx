import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard.tsx';
import AddWords from './screens/AddWords.tsx';
import Learning from './screens/Learning.tsx';
import Result from './screens/Result.tsx';
import Summary from './screens/Summary.tsx';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/session/:id/add" element={<AddWords />} />
          <Route path="/session/:id/learning" element={<Learning />} />
          <Route path="/session/:id/summary" element={<Summary />} />
          <Route path="/session/:id/result" element={<Result />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
