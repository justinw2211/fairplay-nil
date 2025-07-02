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
import Athletes from "./pages/Athletes";
import Universities from "./pages/Universities";
import Collectives from "./pages/Collectives";
import Brands from "./pages/Brands";
import NotFound from './pages/NotFound';

// Import ONLY the new DealWizard components
import Step1_DealTerms from './pages/DealWizard/Step1_DealTerms';
import Step2_PayorInfo from './pages/DealWizard/Step2_PayorInfo';
import Step3_SelectActivities from './pages/DealWizard/Step3_SelectActivities';
import ActivityRouter from './pages/DealWizard/ActivityRouter';
import Step5_Compliance from './pages/DealWizard/Step5_Compliance';
import Step6_Compensation from './pages/DealWizard/Step6_Compensation';
import Step7_Confirmation from './pages/DealWizard/Step7_Confirmation';
import Step8_Review from './pages/DealWizard/Step8_Review';
import SubmissionSuccess from './pages/DealWizard/SubmissionSuccess';

// Import route protection components
import DealWizardRoute from './components/DealWizardRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

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
        </Flex>
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
        <Route path="/about" element={<AboutUs />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/collectives" element={<Collectives />} />
        <Route path="/brands" element={<Brands />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/* --- NEW DEAL WIZARD ROUTES --- */}
        <Route path="/add/deal/terms/:dealId" element={<DealWizardRoute><Step1_DealTerms /></DealWizardRoute>} />
        <Route path="/add/deal/payor/:dealId" element={<DealWizardRoute><Step2_PayorInfo /></DealWizardRoute>} />
        <Route path="/add/deal/activities/select/:dealId" element={<DealWizardRoute><Step3_SelectActivities /></DealWizardRoute>} />
        <Route path="/add/deal/activity/:activityType/:dealId" element={<DealWizardRoute><ActivityRouter /></DealWizardRoute>} />
        <Route path="/add/deal/compliance/:dealId" element={<DealWizardRoute><Step5_Compliance /></DealWizardRoute>} />
        <Route path="/add/deal/compensation/:dealId" element={<DealWizardRoute><Step6_Compensation /></DealWizardRoute>} />
        <Route path="/add/deal/review/:dealId" element={<DealWizardRoute><Step8_Review /></DealWizardRoute>} />
        <Route path="/add/deal/confirmation/:dealId" element={<DealWizardRoute><Step7_Confirmation /></DealWizardRoute>} />
        <Route path="/add/deal/submission-success/:dealId" element={<DealWizardRoute><SubmissionSuccess /></DealWizardRoute>} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Box>
  );
}

export default App;