// frontend/src/App.jsx
import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import {
  Box,
  Button,
  Flex,
  Text,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  useBreakpointValue
} from "@chakra-ui/react";
import { HamburgerIcon } from '@chakra-ui/icons';
import { useState } from "react";
import ErrorBoundary from './components/ErrorBoundary';
import * as Sentry from "@sentry/react";

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
import BlogList from './pages/Blog/BlogList';
import BlogArticle from './pages/Blog/BlogArticle';
import HowItWorks from './pages/HowItWorks';

// Import ONLY the new DealWizard components
import Step0_SocialMedia from './pages/DealWizard/Step0_SocialMedia';
import Step1_DealTerms from './pages/DealWizard/Step1_DealTerms';
import Step2_PayorInfo from './pages/DealWizard/Step2_PayorInfo';
import Step3_SelectActivities from './pages/DealWizard/Step3_SelectActivities';
import ActivityRouter from './pages/DealWizard/ActivityRouter';
import Step5_Compliance from './pages/DealWizard/Step5_Compliance';
import Step6_Compensation from './pages/DealWizard/Step6_Compensation';
import Step7_DealType from './pages/DealWizard/Step7_DealType';
import Step8_Review from './pages/DealWizard/Step8_Review';
import SubmissionSuccess from './pages/DealWizard/SubmissionSuccess';
import ClearinghouseWizard from './pages/DealWizard/ClearinghouseWizard';
import ClearinghouseResult from './pages/ClearinghouseResult';
import ValuationWizard from './pages/DealWizard/ValuationWizard';
import ValuationResult from './pages/ValuationResult';
import WebhookTest from './pages/WebhookTest';

// Import route protection components
import DealWizardRoute from './components/DealWizardRoute';
import { ProtectedRoute } from './components/ProtectedRoute';

function AppContent() {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const centerLinks = [
    { path: "/athletes", label: "Athletes" },
    { path: "/universities", label: "Universities" },
    { path: "/collectives", label: "Collectives" },
    { path: "/brands",label: "Brands" },
  ];

  return (
    <Box fontFamily="body">
       <Box h="1.2rem" bg="brand.accentPrimary" />
      <Flex
        as="nav"
        justify="space-between"
        align="center"
        bg="brand.background"
        p={{ base: "1rem", md: "1.4rem 2rem" }}
        fontSize={{ base: "0.9rem", md: "1.1rem" }}
        boxShadow="sm"
        borderBottom="1px solid"
        borderColor="brand.accentSecondary"
        position="relative"
        color="brand.textPrimary"
      >
        {/* Logo */}
        <NavLink to="/">
          <Box as="img" src="/logo-full.svg" alt="FairPlay NIL" h={{ base: "1.5rem", md: "2.0rem" }} />
        </NavLink>

        {/* Desktop Navigation Links */}
        <Flex gap={{ base: "16px", md: "32px" }} align="center" display={{ base: "none", md: "flex" }} ml="-60px">
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

        {/* Desktop Auth Section */}
        <Flex gap={{ base: "12px", md: "24px" }} align="center" display={{ base: "none", md: "flex" }}>
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

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Open menu"
          icon={<HamburgerIcon />}
          variant="ghost"
          size="sm"
          onClick={onOpen}
        />
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Box as="img" src="/logo-full.svg" alt="FairPlay NIL" h="1.5rem" />
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch" mt={6}>
              {/* Navigation Links */}
              {centerLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink key={item.path} to={item.path} onClick={onClose}>
                    <Text
                      fontWeight="600"
                      fontSize="lg"
                      color={isActive ? "brand.accentPrimary" : "brand.textPrimary"}
                      borderBottom={isActive ? "2px solid" : "2px solid transparent"}
                      borderColor={isActive ? "brand.accentPrimary" : "transparent"}
                      pb="4px"
                    >
                      {item.label}
                    </Text>
                  </NavLink>
                );
              })}

              {/* Auth Section */}
              <Box pt={4} borderTop="1px solid" borderColor="brand.accentSecondary">
                {user ? (
                  <VStack spacing={4} align="stretch">
                    <NavLink to="/dashboard" onClick={onClose}>
                      <Text fontWeight="600" fontSize="lg" color="brand.textPrimary">
                        Dashboard
                      </Text>
                    </NavLink>
                    <Button onClick={() => { handleSignOut(); onClose(); }} variant="outline" size="md">
                      Sign Out
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={4} align="stretch">
                    <NavLink to="/login" onClick={onClose}>
                      <Text fontWeight="600" fontSize="lg" color="brand.textPrimary">
                        Log In
                      </Text>
                    </NavLink>
                    <NavLink to="/signup" onClick={onClose}>
                      <Button
                        colorScheme="pink"
                        bg="brand.accentPrimary"
                        color="white"
                        size="md"
                        _hover={{ bg: '#c8aeb0' }}
                        w="full"
                      >
                        Sign Up
                      </Button>
                    </NavLink>
                  </VStack>
                )}
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/security" element={<Security />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/athletes" element={<Athletes />} />
        <Route path="/universities" element={<Universities />} />
        <Route path="/collectives" element={<Collectives />} />
        <Route path="/brands" element={<Brands />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<BlogArticle />} />
        <Route path="/webhook-test" element={<WebhookTest />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />

        {/*
        ===== THREE DEAL FORM ROUTING ARCHITECTURE =====

        The FairPlay NIL platform supports three distinct deal types, each with different workflows:

        1. SIMPLE DEAL LOGGING (type=simple)
           - Basic deal tracking without predictive analysis
           - Uses standard wizard flow + submission success

        2. NIL GO CLEARINGHOUSE CHECK (type=clearinghouse)
           - Predicts clearinghouse approval likelihood
           - Uses standard wizard flow + clearinghouse analysis + result

        3. DEAL VALUATION ANALYSIS (type=valuation)
           - Provides fair market value compensation ranges
           - Uses standard wizard flow + valuation analysis + result

        DEAL TYPE SELECTION:
        - Happens on Dashboard page (/dashboard) via deal type cards
        - NOT on a separate /deal-type-selection route
        - Dashboard.jsx handles deal type selection and navigation

        ROUTING PATTERN:
        - All deal types start with: /add/deal/social-media/{dealId}?type={dealType}
        - Deal type is passed via query parameter (?type=simple|clearinghouse|valuation)
        - Same wizard steps are used for all deal types
        - Different end workflows based on deal type

        COMMON WIZARD STEPS (all deal types):
        - Step 0: Social Media (/add/deal/social-media/{dealId})
        - Step 1: Deal Terms (/add/deal/terms/{dealId})
        - Step 2: Payor Info (/add/deal/payor/{dealId})
        - Step 3: Activities (/add/deal/activities/select/{dealId})
        - Step 5: Compliance (/add/deal/compliance/{dealId})
        - Step 6: Compensation (/add/deal/compensation/{dealId})
        - Step 8: Review (/add/deal/review/{dealId})

        DEAL TYPE-SPECIFIC ENDINGS:
        - Simple: /add/deal/submission-success/{dealId}
        - Clearinghouse: /clearinghouse-wizard/{dealId} → /clearinghouse-result/{dealId}
        - Valuation: /valuation-wizard/{dealId} → /valuation-result/{dealId}
        */}

        {/* --- STANDARD DEAL WIZARD ROUTES (Used by all three deal types) --- */}
        <Route path="/add/deal/social-media/:dealId" element={<DealWizardRoute><Step0_SocialMedia /></DealWizardRoute>} />
        <Route path="/add/deal/terms/:dealId" element={<DealWizardRoute><Step1_DealTerms /></DealWizardRoute>} />
        <Route path="/add/deal/payor/:dealId" element={<DealWizardRoute><Step2_PayorInfo /></DealWizardRoute>} />
        <Route path="/add/deal/activities/select/:dealId" element={<DealWizardRoute><Step3_SelectActivities /></DealWizardRoute>} />
        <Route path="/add/deal/activity/:activityType/:dealId" element={<DealWizardRoute><ActivityRouter /></DealWizardRoute>} />
        <Route path="/add/deal/compliance/:dealId" element={<DealWizardRoute><Step5_Compliance /></DealWizardRoute>} />
        <Route path="/add/deal/compensation/:dealId" element={<DealWizardRoute><Step6_Compensation /></DealWizardRoute>} />
        <Route path="/add/deal/deal-type/:dealId" element={<DealWizardRoute><Step7_DealType /></DealWizardRoute>} />
        <Route path="/add/deal/review/:dealId" element={<DealWizardRoute><Step8_Review /></DealWizardRoute>} />
        <Route path="/add/deal/submission-success/:dealId" element={<DealWizardRoute><SubmissionSuccess /></DealWizardRoute>} />

        {/* --- CLEARINGHOUSE WORKFLOW ROUTES (type=clearinghouse only) --- */}
        <Route path="/clearinghouse-wizard/:dealId" element={<DealWizardRoute><ClearinghouseWizard /></DealWizardRoute>} />
        <Route path="/clearinghouse-result/:dealId" element={<DealWizardRoute><ClearinghouseResult /></DealWizardRoute>} />

        {/* --- VALUATION WORKFLOW ROUTES (type=valuation only) --- */}
        <Route path="/valuation-wizard/:dealId" element={<DealWizardRoute><ValuationWizard /></DealWizardRoute>} />
        <Route path="/valuation-result/:dealId" element={<DealWizardRoute><ValuationResult /></DealWizardRoute>} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Box>
  );
}

function App() {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorBoundary context="Application" />}>
      <AppContent />
    </Sentry.ErrorBoundary>
  );
}

export default App;