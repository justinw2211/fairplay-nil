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
  Heading,
  Icon,
  Input,
  Progress,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Upload, ChevronRight, Clock } from 'lucide-react';
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

    try {
      await updateDeal(dealId, { deal_nickname: dealNickname });

      logger.info('Deal nickname updated successfully', {
        dealId,
        dealType,
        step: 'Step1_DealTerms',
        operation: 'onContinue',
        dealNickname: dealNickname
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

  // Get progress information - all deal types use same 9-step flow
  const getProgressInfo = () => {
    return {
      stepNumber: '2 of 9',
      percentage: 22.2
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
                <Button
                  rightIcon={<Icon as={ChevronRight} />}
                  bg={dealNickname.trim() ? "brand.accentPrimary" : "brand.accentSecondary"}
                  color="white"
                  px={8}
                  py={3}
                  h={12}
                  fontSize="base"
                  fontWeight="semibold"
                  transition="all 0.2s"
                  _hover={
                    dealNickname.trim()
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
                  isDisabled={!dealNickname.trim()}
                  onClick={onContinue}
                >
                  Next
                </Button>
              </Flex>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </DealWizardStepWrapper>
  );
};

export default Step1_DealTerms;