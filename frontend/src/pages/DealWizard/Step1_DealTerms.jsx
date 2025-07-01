// frontend/src/pages/DealWizard/Step1_DealTerms.jsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeal } from '../../context/DealContext';
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
} from '@chakra-ui/react';
import { Upload, ChevronRight } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { v4 as uuidv4 } from 'uuid';

const Step1_DealTerms = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const { deal, updateDeal } = useDeal();
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
      toast({
        title: 'File too large',
        description: 'File size must be less than 10MB.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setUploading(true);
    try {
      // Generate a unique filename with original extension
      const timestamp = new Date().getTime();
      const uniqueFileName = `${timestamp}-${uuidv4()}.${fileExtension}`;
      const filePath = `public/deal-terms/${deal.user_id}/${uniqueFileName}`;

      // Set content type based on file extension
      const contentType = file.type;
      
      const { error: uploadError } = await supabase.storage
        .from('contracts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: contentType // Explicitly set the content type
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('contracts')
        .getPublicUrl(filePath);

      // Store additional file metadata
      await updateDeal(dealId, {
        deal_terms_url: urlData.publicUrl,
        deal_terms_file_name: file.name,
        deal_terms_file_type: fileExtension,
        deal_terms_file_size: file.size
      });

      setUploadedFile(file);

      toast({
        title: 'File Uploaded',
        description: 'Your deal terms have been successfully attached.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'There was an error uploading your file. Please try again.',
        status: 'error',
        duration: 9000,
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
      toast({
        title: 'Deal nickname required',
        description: 'Please provide a nickname for this deal.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    await updateDeal(dealId, { deal_nickname: dealNickname });
    navigate(`/add/deal/payor/${dealId}`);
  };

  return (
    <Container maxW="2xl" py={6}>
      <Card borderColor="brand.accentSecondary" shadow="lg" bg="white">
        <CardHeader pb={6}>
          {/* Progress Indicator */}
          <VStack spacing={3} mb={6}>
            <Flex justify="space-between" w="full" fontSize="sm">
              <Text color="brand.textSecondary" fontWeight="medium">Step 1 of 8</Text>
              <Text color="brand.textSecondary">12.5% Complete</Text>
            </Flex>
            <Box w="full" bg="brand.accentSecondary" h="2" rounded="full">
              <Box
                bg="brand.accentPrimary"
                h="2"
                w="12.5%"
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

            {/* Navigation Button */}
            <Flex justify="end" pt={8} w="full">
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
  );
};

export default Step1_DealTerms;