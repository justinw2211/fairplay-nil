import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  HStack,
  Icon,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import {
  FileText,
  Shield,
  TrendingUp,
  BarChart3,
  Users,
  Database,
  Lock,
  Eye,
  Zap,
  CheckCircle,
} from 'lucide-react';
import { CheckCircleIcon } from '@chakra-ui/icons';

const FeatureCard = ({ icon, title, description, color = 'brand.accentPrimary' }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg="white"
      rounded="lg"
      shadow="md"
      border="1px solid"
      borderColor="brand.accentSecondary"
      spacing={4}
      h="full"
    >
      <Flex align="center" justify="center" bg={color} w="12" h="12" rounded="lg">
        <Icon as={icon} boxSize={6} color="white" />
      </Flex>
      <VStack align="start" spacing={2}>
        <Heading as="h3" size="md" color="brand.textPrimary">
          {title}
        </Heading>
        <Text color="brand.textSecondary" fontSize="sm">
          {description}
        </Text>
      </VStack>
    </VStack>
  );
};

const HowItWorks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box bg="white">
      {/* Hero Section */}
      <Box bg="brand.backgroundLight" py={20}>
        <Container maxW="6xl">
          <VStack spacing={8} textAlign="center">
            <Heading as="h1" size="2xl" color="brand.textPrimary" maxW="4xl">
              Make NIL decisions with confidence
            </Heading>
            <Text fontSize="xl" color="brand.textSecondary" maxW="3xl">
              Data-driven predictions for Clearinghouse outcomes and fair market value (FMV) powered by machine learning and proprietary deal data.
            </Text>
            <Button
              size="lg"
              bg="brand.accentPrimary"
              color="white"
              px={8}
              onClick={() => navigate('/signup')}
              _hover={{ opacity: 0.9 }}
            >
              Try the Deal Wizard
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* What the Platform Does */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                What the Platform Does
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                FairPlay NIL provides comprehensive tools for managing NIL deals from creation to completion.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={8}>
              <FeatureCard
                icon={FileText}
                title="Deal Wizard"
                description="End-to-end deal intake, compliance checks, and review with guided step-by-step process."
              />
              <FeatureCard
                icon={Shield}
                title="Clearinghouse Predictor"
                description="Likelihood of approval with detailed reasons and risk flags for NCAA compliance."
              />
              <FeatureCard
                icon={TrendingUp}
                title="FMV Estimator"
                description="Market-consistent valuation ranges for NIL activities with comparable data."
              />
              <FeatureCard
                icon={CheckCircle}
                title="Compliance & Reporting"
                description="Documentation and audit-ready exports for regulatory requirements."
              />
              <FeatureCard
                icon={BarChart3}
                title="Analytics"
                description="Portfolio insights, performance trends, and benchmarks for strategic decisions."
              />
              <FeatureCard
                icon={Users}
                title="Multi-User Platform"
                description="Support for athletes, brands, collectives, and universities with role-based access."
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* How Predictions Work */}
      <Box bg="brand.backgroundLight" py={20}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                How Predictions Work
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                We combine machine learning models with proprietary NIL deal data and public signals to provide accurate, explainable predictions.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12} alignItems="center">
              <VStack align="start" spacing={6}>
                <Heading as="h3" size="lg" color="brand.textPrimary">
                  Input Features
                </Heading>
                <List spacing={3}>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="brand.accentPrimary" />
                    <Text>Athlete profile (sport, school, division, social metrics)</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="brand.accentPrimary" />
                    <Text>Geography and market factors</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="brand.accentPrimary" />
                    <Text>Activity type and deal structure</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="brand.accentPrimary" />
                    <Text>Historical comparables and market signals</Text>
                  </ListItem>
                </List>
              </VStack>

              <VStack align="start" spacing={6}>
                <Heading as="h3" size="lg" color="brand.textPrimary">
                  Output Predictions
                </Heading>
                <List spacing={3}>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={Zap} color="brand.accentPrimary" />
                    <Text>Probability of Clearinghouse approval with risk bands</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={Zap} color="brand.accentPrimary" />
                    <Text>FMV ranges with uncertainty bands and comparables</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={Zap} color="brand.accentPrimary" />
                    <Text>Human-readable rationale and key drivers</Text>
                  </ListItem>
                  <ListItem display="flex" alignItems="center">
                    <ListIcon as={Zap} color="brand.accentPrimary" />
                    <Text>Confidence scores and reliability metrics</Text>
                  </ListItem>
                </List>
              </VStack>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Our Technology */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Our Technology
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                Advanced machine learning models trained on proprietary data with transparent, explainable outputs.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={12}>
              <VStack align="start" spacing={6}>
                <Heading as="h3" size="lg" color="brand.textPrimary">
                  Clearinghouse Predictions
                </Heading>
                <VStack align="start" spacing={4}>
                  <Text color="brand.textSecondary">
                    <strong>Models:</strong> Ensemble of gradient-boosted decision trees and lightweight transformers for text analysis
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Training:</strong> Historical approval outcomes and rule-based interpretations aligned with NCAA guidance
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Calibration:</strong> Probability calibration for reliable risk bands and confidence intervals
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Output:</strong> Approved/Needs Review/High Risk with detailed rationale and confidence scores
                  </Text>
                </VStack>
              </VStack>

              <VStack align="start" spacing={6}>
                <Heading as="h3" size="lg" color="brand.textPrimary">
                  FMV Estimation
                </Heading>
                <VStack align="start" spacing={4}>
                  <Text color="brand.textSecondary">
                    <strong>Models:</strong> Quantile regression with boosted trees for non-linear effects and heteroskedasticity
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Data:</strong> Proprietary NIL deal comps blended with public sponsorship signals and social analytics
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Controls:</strong> Sport/seasonality, market size, activity mix, content quality, exclusivity, term length
                  </Text>
                  <Text color="brand.textSecondary">
                    <strong>Output:</strong> FMV range (P25–P75) with point estimate, uncertainty band, and comparable drivers
                  </Text>
                </VStack>
              </VStack>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Data & Model Pipeline */}
      <Box bg="brand.backgroundLight" py={20}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Data & Model Pipeline
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                Secure, scalable infrastructure for processing proprietary data and delivering real-time predictions.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={8}>
              <FeatureCard
                icon={Database}
                title="Proprietary Data"
                description="Curated NIL deal terms, outcomes, and negotiated rates collected through platform usage."
                color="brand.accentSecondary"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Public Signals"
                description="Social metrics, team performance, geography, seasonality, and macro market trends."
                color="brand.accentSecondary"
              />
              <FeatureCard
                icon={Shield}
                title="Governance"
                description="Anonymization, PII minimization, access controls, and versioned datasets and models."
                color="brand.accentSecondary"
              />
              <FeatureCard
                icon={Zap}
                title="MLOps"
                description="Offline training, evaluation on holdout sets, drift monitoring, and periodic retraining."
                color="brand.accentSecondary"
              />
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* Privacy & Compliance */}
      <Box py={20}>
        <Container maxW="6xl">
          <VStack spacing={16}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Privacy & Compliance
              </Heading>
              <Text fontSize="lg" color="brand.textSecondary" maxW="3xl">
                We prioritize data security, privacy, and regulatory compliance in everything we do.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={8}>
              <VStack align="start" spacing={4}>
                <HStack spacing={3}>
                  <Icon as={Lock} color="brand.accentPrimary" boxSize={5} />
                  <Heading as="h3" size="md" color="brand.textPrimary">
                    Data Protection
                  </Heading>
                </HStack>
                <List spacing={2}>
                  <ListItem color="brand.textSecondary">No sale of personal data</ListItem>
                  <ListItem color="brand.textSecondary">Only aggregated insights exposed</ListItem>
                  <ListItem color="brand.textSecondary">Access control by role</ListItem>
                  <ListItem color="brand.textSecondary">Audit logs maintained</ListItem>
                </List>
              </VStack>

              <VStack align="start" spacing={4}>
                <HStack spacing={3}>
                  <Icon as={Eye} color="brand.accentPrimary" boxSize={5} />
                  <Heading as="h3" size="md" color="brand.textPrimary">
                    Transparency
                  </Heading>
                </HStack>
                <List spacing={2}>
                  <ListItem color="brand.textSecondary">Data retention policies</ListItem>
                  <ListItem color="brand.textSecondary">Deletion upon request</ListItem>
                  <ListItem color="brand.textSecondary">Clear privacy policies</ListItem>
                  <ListItem color="brand.textSecondary">Regular compliance audits</ListItem>
                </List>
              </VStack>
            </Grid>
          </VStack>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box bg="brand.backgroundLight" py={20}>
        <Container maxW="4xl">
          <VStack spacing={12}>
            <VStack spacing={6} textAlign="center">
              <Heading as="h2" size="xl" color="brand.textPrimary">
                Frequently Asked Questions
              </Heading>
            </VStack>

            <Accordion allowToggle w="full">
              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Do you really use machine learning?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text color="brand.textSecondary">
                    Yes—we use ensemble models trained on proprietary and public data. Our models combine gradient-boosted decision trees with transformers for text analysis, providing calibrated probabilities and explainable outputs.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Are the outputs guarantees?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text color="brand.textSecondary">
                    No—outputs are calibrated predictions with uncertainty bands. We provide confidence scores and risk levels to help you make informed decisions, but we don't guarantee specific outcomes.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      How often are models updated?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text color="brand.textSecondary">
                    Periodically, with drift detection. We continuously monitor model performance and retrain when we detect significant changes in the underlying data patterns or when we accumulate sufficient new training data.
                  </Text>
                </AccordionPanel>
              </AccordionItem>

              <AccordionItem>
                <AccordionButton>
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="semibold" color="brand.textPrimary">
                      Can I see why a prediction was made?
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Text color="brand.textSecondary">
                    Yes—we provide human-readable rationale and key drivers for all predictions. You can see which factors most influenced the outcome and understand the reasoning behind our recommendations.
                  </Text>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </Container>
      </Box>

      {/* Final CTA */}
      <Box bg="brand.accentPrimary" py={20}>
        <Container maxW="4xl" textAlign="center">
          <VStack spacing={8}>
            <Heading as="h2" size="xl" color="white">
              Ready to experience the power of data-driven NIL decisions?
            </Heading>
            <Button
              size="lg"
              bg="white"
              color="brand.textPrimary"
              px={8}
              fontSize="lg"
              fontWeight="semibold"
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/signup')}
            >
              Try the Deal Wizard
            </Button>
          </VStack>
        </Container>
      </Box>
      {!user && <Footer />}
    </Box>
  );
};

export default HowItWorks;


