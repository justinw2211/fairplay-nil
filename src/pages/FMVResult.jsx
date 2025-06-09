import React, { useState } from "react";
import {
  Box, Button, Flex, Heading, Text, Stack, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
  ModalCloseButton, Input, useToast
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";

export default function FMVResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareEmail, setShareEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  // ✅ Try to load formData from router state or localStorage
  const fallbackData = typeof window !== "undefined" ? localStorage.getItem("fmvFormData") : null;
  const formData = location.state?.formData || (fallbackData && JSON.parse(fallbackData));

  if (!formData) {
    return (
      <Box p={10}>
        <Heading size="md" mb={4}>No result data found.</Heading>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Box>
    );
  }

  const fmvValue = formData?.fmv ? `$${formData.fmv}` : "FMV unavailable";

  const fmvDetails = [
    { label: "Sport", value: formData?.sport || "-" },
    { label: "Division", value: formData?.division?.toString() || "-" },
    {
      label: "Social Followers",
      value: (
        formData?.followers_instagram +
        formData?.followers_tiktok +
        formData?.followers_twitter +
        formData?.followers_youtube
      )?.toLocaleString() || "0"
    },
    { label: "Achievements", value: formData?.achievements?.join(", ") || "-" },
    {
      label: "Deliverables",
      value: [
        formData?.deliverables_instagram && `${formData.deliverables_instagram} IG posts`,
        formData?.deliverables_tiktok && `${formData.deliverables_tiktok} TikToks`,
        formData?.deliverables_twitter && `${formData.deliverables_twitter} Tweets`,
        formData?.deliverables_youtube && `${formData.deliverables_youtube} YouTube videos`,
        formData?.deliverable_other
      ].filter(Boolean).join(", ") || "-"
    }
  ];

  const handleShare = () => {
    setShowSuccess(true);
    onClose();
    toast({
      title: "Success!",
      description: `Result emailed to ${shareEmail} (simulation)`,
      status: "success",
      duration: 3000,
      isClosable: true
    });
  };

  return (
    <Box maxW="2xl" mx="auto" py={10} px={6}>
      <Heading size="lg" mb={4}>Your Fair Market Value</Heading>
      <Text fontSize="4xl" fontWeight="bold" color="green.300">{fmvValue}</Text>
      <Stack spacing={4} my={6}>
        {fmvDetails.map((item, idx) => (
          <Flex key={idx} justify="space-between">
            <Text color="gray.400">{item.label}:</Text>
            <Text fontWeight="medium">{item.value}</Text>
          </Flex>
        ))}
      </Stack>
      <Flex mt={10} justify="space-between">
        <Button onClick={onOpen} colorScheme="blue">Email This Result</Button>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send FMV Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter recipient's email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleShare}>
              Send
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
