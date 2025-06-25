// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import AboutUs from './pages/AboutUs';
import Security from './pages/Security';
import Careers from './pages/Careers';

// Import New Deal Wizard Components
import DealWizardLayout from './pages/DealWizard/DealWizardLayout';
import DealStep1 from './pages/DealWizard/DealStep1';
import DealStep2 from './pages/DealWizard/DealStep2';
import DealStep3 from './pages/DealWizard/DealStep3';
import DealStep4 from './pages/DealWizard/DealStep4';
import DealReviewStep from './pages/DealWizard/DealReviewStep';
import DealResultPage from './pages/DealWizard/DealResultPage';


function App() {
  const { user } = useAuth();

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />

        {/* --- PROTECTED ROUTES --- */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/edit-profile" 
          element={<ProtectedRoute><EditProfile /></ProtectedRoute>} 
        />
        
        {/* --- NEW DEAL WIZARD ROUTING --- */}
        <Route 
          path="/dashboard/new-deal" 
          element={<ProtectedRoute><DealWizardLayout /></ProtectedRoute>}
        >
          <Route index element={<Navigate to="step-1" replace />} /> 
          <Route path="step-1" element={<DealStep1 />} />
          <Route path="step-2" element={<DealStep2 />} />
          <Route path="step-3" element={<DealStep3 />} />
          <Route path="step-4" element={<DealStep4 />} />
          <Route path="review" element={<DealReviewStep />} />
        </Route>

        {/* The result page is outside the main wizard layout */}
        <Route 
            path="/dashboard/new-deal/result"
            element={<ProtectedRoute><DealResultPage /></ProtectedRoute>}
        />
        
      </Routes>
    </Router>
  );
}

export default App;