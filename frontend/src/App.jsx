// frontend/src/App.jsx
import { Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";

// Import Pages
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

// Import New Deal Wizard Components
import DealWizardLayout from './pages/DealWizard/DealWizardLayout';
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
    { path: "/brands", label: "Brands" },
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
                  transition="color 0.3s ease"
                >
                  {item.label}
                </Text>
              </NavLink>
            );
          })}
          <Box onMouseEnter={() => setCompanyOpen(true)} onMouseLeave={() => setCompanyOpen(false)} position="relative">
            <Text
                fontWeight="600"
                cursor="pointer"
                color={companyOpen || isCompanyActive ? "brand.textSecondary" : "brand.textPrimary"}
                borderBottom={isCompanyActive ? "2px solid" : "2px solid transparent"}
                borderColor={isCompanyActive ? "brand.accentPrimary" : "transparent"}
                pb="4px"
            >
              Company
            </Text>
            {companyOpen && (
              <Box
                position="absolute"
                top="calc(100% + 4px)"
                left="0"
                bg="brand.background"
                borderRadius="md"
                boxShadow="lg"
                p="0.5rem 0"
                zIndex="1000"
                border="1px solid"
                borderColor="brand.accentSecondary"
              >
                {companyMenu.map(item => (
                  <Text
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    p="0.5rem 1.5rem"
                    color={location.pathname === item.path ? "brand.textSecondary" : "brand.textPrimary"}
                    cursor="pointer"
                    _hover={{ bg: "brand.backgroundLight" }}
                  >
                    {item.label}
                  </Text>
                ))}
              </Box>
            )}
          </Box>
        </Flex>

        <Flex gap="20px" align="center">
          <NavLink to="/contact"><Text fontWeight="600">Contact</Text></NavLink>
          {user ? (
            <>
              <NavLink to="/dashboard"><Text fontWeight="600">Dashboard</Text></NavLink>
              <Button variant="outline" onClick={handleSignOut} size="sm">Sign Out</Button>
            </>
          ) : (
            <>
              <NavLink to="/login"><Text fontWeight="600">Sign In</Text></NavLink>
              <Button onClick={() => navigate("/signup")}>
                Sign Up
              </Button>
            </>
          )}
           <Button onClick={() => navigate('/dashboard/new-deal')}>
            Try Now
          </Button>
        </Flex>
      </Flex>

      <Routes>
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
        <Route path="/contact" element={<Box p="2rem">Contact Page Placeholder</Box>} />

        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        
        <Route path="/dashboard/new-deal" element={<ProtectedRoute><DealWizardLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="step-1" replace />} />
          <Route path="step-1" element={<DealStep1 />} />
          <Route path="step-2" element={<DealStep2 />} />
          <Route path="step-3" element={<DealStep3 />} />
          <Route path="step-4" element={<DealStep4 />} />
          <Route path="review" element={<DealReviewStep />} />
        </Route>

        <Route path="/dashboard/new-deal/result" element={<ProtectedRoute><DealResultPage /></ProtectedRoute>} />
      </Routes>
    </Box>
  );
}

export default App;