import React from 'react';
import { Box, Flex, HStack, Text, Button } from '@chakra-ui/react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';

// Import Pages
import Home from './Home';
import Athletes from './Athletes';
import Universities from './Universities';
import Collectives from './Collectives';
import Brands from './Brands';
import AboutUs from './AboutUs';
import Security from './Security';
import Careers from './Careers';
import FMVCalculator from './FMVCalculator';
import FMVResult from './components/calculator/FMVResult';
import NotFound from './pages/NotFound'; // A new page for handling invalid URLs

const NavItem = ({ to, children }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <NavLink to={to}>
      <Text
        fontWeight="600"
        color={isActive ? 'brand.textPrimary' : 'brand.textSecondary'}
        _hover={{ color: 'brand.textPrimary' }}
        transition="color 0.2s"
      >
        {children}
      </Text>
    </NavLink>
  );
};

function App() {
  return (
    <Box>
      <Box as="header" bg="brand.secondary" shadow="sm">
        <Flex
          as="nav"
          maxW="7xl"
          mx="auto"
          px={{ base: 4, md: 8 }}
          py={4}
          justify="space-between"
          align="center"
        >
          <NavLink to="/">
            <Text fontSize="xl" fontWeight="800" color="brand.textPrimary">
              FAIRPLAY NIL
            </Text>
          </NavLink>
          <HStack spacing={8} display={{ base: 'none', md: 'flex' }}>
            <NavItem to="/athletes">Athletes</NavItem>
            <NavItem to="/universities">Universities</NavItem>
            <NavItem to="/collectives">Collectives</NavItem>
            <NavItem to="/brands">Brands</NavItem>
            <NavItem to="/aboutus">About Us</NavItem>
          </HStack>
          <NavLink to="/fmvcalculator">
            <Button size="md">Estimate Your FMV</Button>
          </NavLink>
        </Flex>
      </Box>

      <Box as="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/athletes" element={<Athletes />} />
          <Route path="/universities" element={<Universities />} />
          <Route path="/collectives" element={<Collectives />} />
          <Route path="/brands" element={<Brands />} />
          <Route path="/aboutus" element={<AboutUs />} />
          <Route path="/security" element={<Security />} />
          <Route path="/careers" element={<Careers />} />

          {/* Calculator Routes */}
          <Route path="/fmvcalculator/*" element={<FMVCalculator />} />
          <Route path="/result" element={<FMVResult />} />
          
          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
