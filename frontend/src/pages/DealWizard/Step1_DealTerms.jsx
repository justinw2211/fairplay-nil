// frontend/src/pages/DealWizard/Step1_DealTerms.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
import { useAuth } from '../../context/AuthContext';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Icon,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Progress,
  Text,
  VStack,
  HStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Upload, ChevronRight, ChevronLeft, Clock } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import DealWizardStepWrapper from '../../components/DealWizardStepWrapper';
import { createLogger } from '../../utils/logger';

const logger = createLogger('Step1_DealTerms');

const Step1_DealTerms = () => {
  const { dealId } = useParams();
  const [searchParams] = useSearchParams();
  const dealType = searchParams.get('type') || 'standard';
  const navigate = useNavigate();
  const { currentDeal, updateDeal } = useDeal();
  const { user } = useAuth();
  const toast = useToast();

  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [dealNickname, setDealNickname] = useState('');
  const [uploading, setUploading] = useState(false);
  
  // Duration state variables
  const [durationYears, setDurationYears] = useState(0);
  const [durationMonths, setDurationMonths] = useState(0);
  const [durationError, setDurationError] = useState('');

  useEffect(() => {
    if (currentDeal) {
      setDealNickname(currentDeal.deal_nickname || '');
      setDurationYears(currentDeal.deal_duration_years || 0);
      setDurationMonths(currentDeal.deal_duration_months || 0);

      logger.info('Deal data loaded from deal', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'useEffect',
        hasDealNickname: !!currentDeal.deal_nickname,
        durationYears: currentDeal.deal_duration_years || 0,
        durationMonths: currentDeal.deal_duration_months || 0
      });

      // Restore uploaded file if it exists
      if (currentDeal?.contract_file) {
        setUploadedFile(currentDeal.contract_file);

        logger.info('Uploaded file restored from deal', {
          dealId,
          dealType,
          step: 'Step1_DealTerms',
          operation: 'useEffect',
          fileName: currentDeal.contract_file.name,
          fileSize: currentDeal.contract_file.size
        });
      }
    }
  }, [currentDeal]);

  // Debounced autosave for duration fields to ensure persistence even if user navigates away
  useEffect(() => {
    // Avoid autosaving invalid/empty duration
    const totalMonths = (Number(durationYears) || 0) * 12 + (Number(durationMonths) || 0);
    if (!dealId) return;
    if (totalMonths <= 0 || totalMonths > 120) {
      return; // skip autosave until valid
    }

    const timeoutId = setTimeout(async () => {
      try {
        await updateDeal(dealId, {
          deal_duration_years: Number.isFinite(Number(durationYears)) ? Number(durationYears) : 0,
          deal_duration_months: Number.isFinite(Number(durationMonths)) ? Number(durationMonths) : 0,
        });
        logger.info('Autosaved contract duration', {
          dealId,
          step: 'Step1_DealTerms',
          operation: 'autosaveDuration',
          durationYears,
          durationMonths,
          totalMonths
        });
      } catch (e) {
        logger.error('Failed to autosave duration', { error: e?.message, dealId });
      }
    }, 600); // debounce

    return () => clearTimeout(timeoutId);
  }, [durationYears, durationMonths, dealId, updateDeal]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await handleFileUpload(file);
    }
  };

  const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
  };

  const handleFileUpload = async (file) => {
    if (!user) {
      logger.error('File upload attempted without authentication', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'handleFileUpload',
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      toast({
        title: 'Authentication Required',
        description: 'Please log in to upload files.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Enhanced file type validation
    const validExtensions = ['pdf', 'docx', 'png', 'jpg', 'jpeg'];
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    const fileExtension = getFileExtension(file.name);

    if (!validExtensions.includes(fileExtension) || !validTypes.includes(file.type)) {
      logger.error('Invalid file type uploaded', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'handleFileUpload',
        fileName: file.name,
        fileExtension,
        fileType: file.type,
        validExtensions,
        validTypes
      });

      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, DOCX, PNG, or JPG file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    if (file.size > maxSize) {
      logger.error('File size exceeds limit', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'handleFileUpload',
        fileName: file.name,
        fileSize: file.size,
        maxSize
      });

      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 10MB.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    try {
      const fileId = uuidv4();
      const fileName = `${fileId}_${file.name}`;
      const filePath = `deals/${dealId}/contracts/${fileName}`;

      const { data, error } = await supabase.storage
        .from('contracts')
        .upload(filePath, file);

      if (error) {
        logger.error('Failed to upload file to storage', {
          error: error.message,
          dealId,
          dealType,
          step: 'Step1_DealTerms',
          operation: 'handleFileUpload',
          fileName: file.name,
          fileSize: file.size,
          filePath
        });

        throw error;
      }

      logger.info('File uploaded successfully', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'handleFileUpload',
        fileName: file.name,
        fileSize: file.size,
        filePath,
        fileId
      });

      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        path: filePath,
        id: fileId
      });

      toast({
        title: 'File uploaded successfully',
        description: 'Your contract has been uploaded and saved.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      logger.error('File upload failed', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'handleFileUpload',
        fileName: file.name,
        fileSize: file.size
      });

      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload file. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0]);
    }
  };

  // Duration validation and handlers
  const validateDuration = () => {
    const totalMonths = durationYears * 12 + durationMonths;
    
    if (totalMonths === 0) {
      setDurationError('Duration must be at least 1 month');
      return false;
    }
    
    if (totalMonths > 120) {
      setDurationError('Total duration cannot exceed 10 years');
      return false;
    }
    
    setDurationError('');
    return true;
  };

  const handleYearsChange = (value) => {
    const years = parseInt(value) || 0;
    setDurationYears(years);
    setDurationError('');
  };

  const handleMonthsChange = (value) => {
    const months = parseInt(value) || 0;
    setDurationMonths(months);
    setDurationError('');
  };

  const onContinue = async () => {
    if (!dealNickname.trim()) {
      logger.warn('Deal nickname validation failed', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'onContinue',
        dealNickname: dealNickname
      });

      toast({
        title: 'Deal nickname required',
        description: 'Please provide a nickname for this deal.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    // Validate duration when proceeding to next step
    if (!validateDuration()) {
      toast({
        title: 'Duration required',
        description: durationError,
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const updateData = { 
        deal_nickname: dealNickname,
        deal_duration_years: durationYears,
        deal_duration_months: durationMonths,
        deal_duration_total_months: durationYears * 12 + durationMonths
      };

      // Add contract file data if uploaded
      if (uploadedFile) {
        updateData.contract_file = uploadedFile;
      }

      await updateDeal(dealId, updateData);

      logger.info('Deal data updated successfully', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'onContinue',
        dealNickname: dealNickname,
        hasContractFile: !!uploadedFile,
        durationYears: durationYears,
        durationMonths: durationMonths,
        totalMonths: durationYears * 12 + durationMonths
      });

      // Conditional navigation based on deal type
      const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
      navigate(`/add/deal/payor/${dealId}${typeParam}`);
    } catch (error) {
      logger.error('Failed to update deal nickname', {
        error: error.message,
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'onContinue',
        dealNickname: dealNickname
      });

      toast({
        title: 'Error updating deal',
        description: error.message || 'Failed to update deal nickname. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleFinishLater = () => {
    logger.info('User chose to finish later', {
      dealId,
      dealType,
      step: 'Step1_DealTerms',
      operation: 'handleFinishLater'
    });
    navigate('/dashboard');
  };

  const handleBack = () => {
    logger.info('User navigated back', {
      dealId,
      dealType,
      step: 'Step1_DealTerms',
      operation: 'handleBack'
    });

    const typeParam = dealType !== 'standard' ? `?type=${dealType}` : '';
    navigate(`/add/deal/social-media/${dealId}${typeParam}`);
  };

  // Get progress information - all deal types use same 10-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '2 of 10',
      percentage: 20
    };
  };

  const progressInfo = getProgressInfo();

  return (
    <DealWizardStepWrapper stepNumber={1} stepName="Deal Terms" dealId={dealId}>
      <Container maxW="2xl" py={6}>
        <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
          <CardHeader pb={6}>
            {/* Progress Indicator */}
            <VStack spacing={3} mb={6}>
              <Flex justify="space-between" w="full" fontSize="sm">
                <Text color="brand.textSecondary" fontWeight="medium">{progressInfo.stepNumber}</Text>
                <Text color="brand.textSecondary">{progressInfo.percentage}% Complete</Text>
              </Flex>
              <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
                <Box
                  bg="brand.accentPrimary"
                  h="2"
                  w={`${progressInfo.percentage}%`}
                  rounded="full"
                  transition="width 0.5s ease-out"
                />
              </Box>
            </VStack>

            {/* Header */}
            <VStack spacing={3} align="start">
              <Heading size="lg" color="brand.textPrimary">Deal Terms</Heading>
              <Text color="brand.textSecondary" fontSize="lg">
                Let's start with the basics. Upload the agreement and tell us the essentials of your deal.
              </Text>
            </VStack>
          </CardHeader>

          <CardBody pt={0}>
            <VStack spacing={8}>
              {/* File Upload Area */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Contract Upload (optional)
                </FormLabel>
                <Box
                  position="relative"
                  borderWidth={2}
                  borderStyle="dashed"
                  rounded="xl"
                  p={12}
                  textAlign="center"
                  cursor="pointer"
                  transition="all 0.2s"
                  borderColor={dragActive ? "brand.accentPrimary" : "brand.accentSecondary"}
                  bg={dragActive ? "brand.accentPrimary" : "transparent"}
                  _hover={{
                    borderColor: "brand.accentPrimary",
                    bg: "brand.backgroundLight",
                  }}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    style={{ display: 'none' }}
                  />

                  {uploadedFile ? (
                    <VStack spacing={4}>
                      <Flex
                        w="16"
                        h="16"
                        bg="green.100"
                        rounded="full"
                        align="center"
                        justify="center"
                      >
                        <Icon as={Upload} boxSize={8} color="green.600" />
                      </Flex>
                      <VStack spacing={2}>
                        <Text color="brand.textPrimary" fontWeight="semibold" fontSize="lg">
                          {uploadedFile.name}
                        </Text>
                        <Text color="brand.textSecondary">
                          {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Uploaded successfully
                        </Text>
                      </VStack>
                      <Button
                        variant="ghost"
                        size="sm"
                        color="brand.accentPrimary"
                        _hover={{ bg: "brand.backgroundLight" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                      >
                        Remove file
                      </Button>
                    </VStack>
                  ) : (
                    <VStack spacing={6}>
                      <Flex
                        w="20"
                        h="20"
                        bg="brand.accentSecondary"
                        rounded="full"
                        align="center"
                        justify="center"
                        transition="all 0.2s"
                        _groupHover={{ bg: "brand.backgroundLight" }}
                      >
                        <Icon
                          as={Upload}
                          boxSize={10}
                          color="brand.textSecondary"
                          _groupHover={{ color: "brand.accentPrimary" }}
                        />
                      </Flex>
                      <VStack spacing={3}>
                        <Text color="brand.textPrimary" fontWeight="semibold" fontSize="lg">
                          Drag & drop your contract here, or click to upload
                        </Text>
                        <Text color="brand.textSecondary">
                          Accepted file types: PDF, DOCX, PNG, JPG. Max size: 10MB
                        </Text>
                      </VStack>
                    </VStack>
                  )}
                </Box>
              </FormControl>

              {/* Deal Nickname Input */}
              <FormControl>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Deal Nickname *
                </FormLabel>
                <Input
                  value={dealNickname}
                  onChange={(e) => setDealNickname(e.target.value)}
                  placeholder="e.g., 'Nike Fall Photoshoot'"
                  size="lg"
                  borderColor="brand.accentSecondary"
                  _focus={{
                    borderColor: "brand.accentPrimary",
                    boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                  }}
                />
              </FormControl>

              {/* Deal Duration Input */}
              <FormControl isInvalid={!!durationError}>
                <FormLabel color="brand.textPrimary" fontWeight="semibold">
                  Contract Duration *
                </FormLabel>
                <Text color="brand.textSecondary" fontSize="sm" mb={3}>
                  How long is this contract/deal for?
                </Text>
                <HStack spacing={4} align="flex-start">
                  <Box flex={1}>
                    <FormLabel color="brand.textSecondary" fontSize="sm" mb={2}>
                      Years
                    </FormLabel>
                    <NumberInput
                      value={durationYears}
                      onChange={handleYearsChange}
                      min={0}
                      max={10}
                      size="lg"
                    >
                      <NumberInputField
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                        }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper 
                          borderColor="brand.accentSecondary"
                          color="brand.textSecondary"
                          _hover={{ bg: "brand.backgroundLight" }}
                        />
                        <NumberDecrementStepper 
                          borderColor="brand.accentSecondary"
                          color="brand.textSecondary"
                          _hover={{ bg: "brand.backgroundLight" }}
                        />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                  <Box flex={1}>
                    <FormLabel color="brand.textSecondary" fontSize="sm" mb={2}>
                      Months
                    </FormLabel>
                    <NumberInput
                      value={durationMonths}
                      onChange={handleMonthsChange}
                      min={0}
                      max={11}
                      size="lg"
                    >
                      <NumberInputField
                        borderColor="brand.accentSecondary"
                        _focus={{
                          borderColor: "brand.accentPrimary",
                          boxShadow: "0 0 0 1px var(--chakra-colors-brand-accentPrimary)",
                        }}
                      />
                      <NumberInputStepper>
                        <NumberIncrementStepper 
                          borderColor="brand.accentSecondary"
                          color="brand.textSecondary"
                          _hover={{ bg: "brand.backgroundLight" }}
                        />
                        <NumberDecrementStepper 
                          borderColor="brand.accentSecondary"
                          color="brand.textSecondary"
                          _hover={{ bg: "brand.backgroundLight" }}
                        />
                      </NumberInputStepper>
                    </NumberInput>
                  </Box>
                </HStack>
                {(durationYears > 0 || durationMonths > 0) && (
                  <Text color="brand.textSecondary" fontSize="sm" mt={2}>
                    Total: {durationYears * 12 + durationMonths} months
                    {durationYears > 0 && durationMonths > 0 && 
                      ` (${durationYears} ${durationYears === 1 ? 'year' : 'years'}, ${durationMonths} ${durationMonths === 1 ? 'month' : 'months'})`
                    }
                  </Text>
                )}
                <FormErrorMessage>{durationError}</FormErrorMessage>
              </FormControl>

              {/* Navigation Buttons */}
              <Flex justify="space-between" pt={8} w="full">
                <Button
                  leftIcon={<Icon as={Clock} />}
                  variant="ghost"
                  color="brand.textSecondary"
                  px={8}
                  py={3}
                  h={12}
                  fontSize="base"
                  fontWeight="semibold"
                  onClick={handleFinishLater}
                  _hover={{
                    bg: "brand.backgroundLight",
                    color: "brand.textPrimary",
                  }}
                >
                  Finish Later
                </Button>
                <Flex gap={4}>
                  <Button
                    leftIcon={<Icon as={ChevronLeft} />}
                    variant="outline"
                    px={6}
                    py={3}
                    h={12}
                    fontSize="base"
                    fontWeight="medium"
                    borderColor="brand.accentSecondary"
                    color="brand.textSecondary"
                    onClick={handleBack}
                    _hover={{
                      bg: "brand.backgroundLight",
                      borderColor: "brand.accentPrimary",
                      color: "brand.textPrimary",
                    }}
                  >
                    Back
                  </Button>
                  <Button
                    rightIcon={<Icon as={ChevronRight} />}
                    bg={dealNickname.trim() && (durationYears > 0 || durationMonths > 0) ? "brand.accentPrimary" : "brand.accentSecondary"}
                    color="white"
                    px={8}
                    py={3}
                    h={12}
                    fontSize="base"
                    fontWeight="semibold"
                    transition="all 0.2s"
                    _hover={
                      dealNickname.trim() && (durationYears > 0 || durationMonths > 0)
                        ? {
                            transform: "scale(1.05)",
                            bg: "brand.accentPrimary",
                            shadow: "xl",
                          }
                        : {}
                    }
                    _disabled={{
                      opacity: 0.6,
                      cursor: "not-allowed",
                    }}
                    isDisabled={!dealNickname.trim() || (durationYears === 0 && durationMonths === 0)}
                    onClick={onContinue}
                  >
                    Next
                  </Button>
                </Flex>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step1_DealTerms;