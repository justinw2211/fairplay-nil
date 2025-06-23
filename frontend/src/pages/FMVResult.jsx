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
  const toast = useToast();

  const fallbackData = typeof window !== "undefined" ? localStorage.getItem("fmvFormData") : null;
  const formData = location.state?.formData || (fallbackData && JSON.parse(fallbackData));

  if (!formData) {
    return (
      <Box p={10} textAlign="center" bg="#f4f4f4">
        <Heading size="md" mb={4} color="#282f3d">No result data found.</Heading>
        <Button onClick={() => navigate("/")} bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }}>Return Home</Button>
      </Box>
    );
  }

  const fmvValue = formData?.fmv ? `$${formData.fmv.toLocaleString()}` : "FMV unavailable";

  const totalFollowers = (
    (formData?.followers_instagram || 0) +
    (formData?.followers_tiktok || 0) +
    (formData?.followers_twitter || 0) +
    (formData?.followers_youtube || 0)
  ).toLocaleString();

  const fmvDetails = [
    { label: "Sport", value: formData?.sport || "-" },
    { label: "Division", value: formData?.division?.toString() || "-" },
    { label: "Social Followers", value: totalFollowers },
    { label: "Achievements", value: formData?.achievements?.join(", ") || "Not Provided" },
    {
      label: "Deliverables",
      value: formData.deliverables?.join(", ") || "Not Provided"
    }
  ];

  const handleShare = () => {
    onClose();
    toast({
      title: "Success!",
      description: `Result emailed to ${shareEmail} (simulation)`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top-right"
    });
    setShareEmail("");
  };

  return (
    <Flex minH="90vh" align="center" justify="center" bg="#f4f4f4" color="#282f3d" py={10}>
      <Box maxW="2xl" w="full" mx="auto" py={10} px={6} bg="#ffffff" borderRadius="xl" boxShadow="xl" border="1px solid #d6dce4">
        <Heading size="lg" mb={2} textAlign="center" color="#282f3d">Your Fair Market Value</Heading>
        <Text fontSize="5xl" fontWeight="bold" color="#4e6a7b" textAlign="center">{fmvValue}</Text>
        <Stack spacing={4} my={8} p={6} bg="#f4f4f4" borderRadius="lg">
          {fmvDetails.map((item, idx) => (
            <Flex key={idx} justify="space-between" align="center">
              <Text color="#4e6a7b">{item.label}:</Text>
              <Text fontWeight="600" color="#282f3d">{item.value}</Text>
            </Flex>
          ))}
        </Stack>
        <Flex mt={8} justify="center" gap={4}>
          <Button onClick={onOpen} variant="outline" borderColor="#d6dce4" color="#4e6a7b" _hover={{ bg: "#f4f4f4" }}>Email This Result</Button>
          <Button onClick={() => navigate("/")} bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }}>Return Home</Button>
        </Flex>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="#ffffff" color="#282f3d">
          <ModalHeader>Send FMV Result</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Enter recipient's email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              bg="#f4f4f4"
              borderColor="#d6dce4"
             _hover={{ borderColor: "#d0bdb5" }}
             _focus={{ borderColor: "#d0bdb5", boxShadow: "0 0 0 1px #d0bdb5" }}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button bg="#d0bdb5" color="#ffffff" _hover={{ bg: "#c9b2a9" }} onClick={handleShare}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}