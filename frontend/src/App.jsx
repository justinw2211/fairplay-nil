// frontend/src/App.jsx
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";

// Import all the page components that will be used in the routes.
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import EditProfile from './pages/EditProfile';
import AboutUs from './pages/AboutUs';
import Security from './pages/Security';
import Careers from './pages/Careers';
import Athletes from "./pages/Athletes.jsx";
import Universities from "./pages/Universities.jsx";
import Collectives from "./pages/Collectives.jsx";
import Brands from "./pages/Brands.jsx";

// *** Import the new DealWizard components ***
import DealWizardLayout from './pages/DealWizard/DealWizardLayout';
import Step1_DealTerms from './pages/DealWizard/Step1_DealTerms';
import Step2_PayorInfo from './pages/DealWizard/Step2_PayorInfo';
import Step3_SelectActivities from './pages/DealWizard/Step3_SelectActivities';

// Import the layout and steps for the OLD deal wizard. We will remove these later.
import DealWizardLayout_OLD from './pages/DealWizard/DealWizardLayout';
import DealStep1 from './pages/DealWizard/DealStep1';
import DealStep2 from './pages/DealWizard/DealStep2';
import DealStep3 from './pages/DealWizard/DealStep3';
import DealStep4 from './pages/DealWizard/DealStep4';
import DealReviewStep from './pages/DealWizard/DealReviewStep';
import DealResultPage from './pages/DealWizard/DealResultPage';

function App() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [companyOpen, setCompanyOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const centerLinks = [
    { path: "/athletes", label: "Athletes" },
    { path: "/universities", label: "Universities" },
    { path: "/collectives", label: "Collectives" },
    { path: "/brands",label: "Brands" },
  ];

  const companyMenu = [
    { path: "/aboutus", label: "About Us" },
    { path: "/security", label: "Security" },
    { path: "/careers", label: "Careers" },
  ];
  
  const isCompanyActive = companyMenu.some(item => location.pathname === item.path);

  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Box fontFamily="body">
       <Box h="1.2rem" bg="brand.accentPrimary" />
      <Flex
        as="nav"
        justify="space-between"
        align="center"
        bg="brand.background"
        p="1.4rem 2rem"
        fontSize="1.1rem"
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="brand.accentSecondary"
        position="relative"
        color="brand.textPrimary"
      >
        <NavLink to="/">
          <Heading as="span" size="md" letterSpacing="0.5px" fontWeight="800">
            FAIR PLAY NIL
          </Heading>
        </NavLink>
        <Flex gap="32px" align="center" ml="-60px">
          {centerLinks.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredIndex === index;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Text
                  fontWeight="600"
                  color={isHovered || isActive ? "brand.textSecondary" : "brand.textPrimary"}
                  borderBottom={isActive ? "2px solid" : "2px solid transparent"}
                  borderColor={isActive ? "brand.accentPrimary" : "transparent"}
                  pb="4px"
                  transition="color 0.2s"
                >
                  {item.label}
                </Text>
              </NavLink>
            );
          })}
          {/* Company dropdown remains the same */}
        </Flex>
        {/* Right side links remain the same */}
        <Flex gap="24px" align="center">
            {user ? (
              <>
                <NavLink to="/dashboard">
                  <Text fontWeight="600" color="brand.textPrimary">Dashboard</Text>
                </NavLink>
                <Button onClick={handleSignOut} variant="outline" size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <NavLink to="/login">
                  <Text fontWeight="600" color="brand.textPrimary">Log In</Text>
                </NavLink>
                <NavLink to="/signup">
                  <Button colorScheme="pink" bg="brand.accentPrimary" color="white" size="sm" _hover={{ bg: '#c8aeb0' }}>
                    Sign Up
                  </Button>
                </NavLink>
              </>
            )}
        </Flex>
      </Flex>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/aboutus" element={<AboutUs />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/collectives" element={<Collectives />} />
        <Route path="/brands" element={<Brands />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* *** NEW DEAL WIZARD ROUTES *** */}
        <Route path="/add/deal/terms/:dealId" element={<ProtectedRoute><Step1_DealTerms /></ProtectedRoute>} />
        <Route path="/add/deal/payor/:dealId" element={<ProtectedRoute><Step2_PayorInfo /></ProtectedRoute>} />
        <Route path="/add/deal/activities/select/:dealId" element={<ProtectedRoute><Step3_SelectActivities /></ProtectedRoute>} />
        {/* We will add more routes here for the specific activity forms */}


        {/* OLD Deal Wizard Routes - Untouched for now */}
        <Route path="/deal-wizard" element={<ProtectedRoute><DealWizardLayout_OLD /></ProtectedRoute>}>
          <Route index element={<Navigate to="step-1" replace />} />
          <Route path="step-1" element={<DealStep1 />} />
          <Route path="step-2" element={<DealStep2 />} />
          <Route path="step-3" element={<DealStep3 />} />
          <Route path="step-4" element={<DealStep4 />} />
          <Route path="review" element={<DealReviewStep />} />
        </Route>
        <Route path="/deal-result" element={<ProtectedRoute><DealResultPage /></ProtectedRoute>} />
      </Routes>
    </Box>
  );
}

export default App;