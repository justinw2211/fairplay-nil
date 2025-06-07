import React, { useState } from "react";
import {
  Box, Button, Flex, Heading, Text, Stack, useDisclosure, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, Input, useToast
} from "@chakra-ui/react";

// To make this dynamic, pass FMV and details as props or use context/global state
export default function FMVResult({ fmv = "$8,750", details = [] }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [shareEmail, setShareEmail] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const toast = useToast();

  // Example fallback for static details
  const fmvDetails = details.length
    ? details
    : [
        { label: "Sport", value: "Track & Field" },
        { label: "Division", value: "I" },
        { label: "Social Followers", value: "14,000" },
        { label: "Achievements", value: "All-American" },
        { label: "Deliverables", value: "2 Instagram posts, 1 TikTok video" }
      ];

  const handleShare = () => {
    // Future: Trigger backend email
    setShowSuccess(true);
    onClose();
    toast({
      title: "Result shared!",
      description: `Sent to ${shareEmail}`,
      status: "success",
      duration: 2200,
      isClosable: true
    });
    setShareEmail("");
  };

  return (
    <Flex minH="100vh" align="center" justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)" color="white" py={10}
    >
      <Box w={["95vw", "600px"]} bg="gray.900" boxShadow="2xl" borderRadius="2xl" p={[4, 8]} mx="auto">
        <Heading size="lg" mb={4}>Your NIL FMV Estimate</Heading>
        <Text color="green.300" fontSize="3xl" fontWeight="bold" mb={3}>
          {fmv}
        </Text>
        <Stack spacing={2} mb={5}>
          {fmvDetails.map((d, idx) => (
            <Text key={idx}><b>{d.label}:</b> {d.value}</Text>
          ))}
        </Stack>
        <Flex gap={3} justify="center" mt={6}>
          <Button colorScheme="green" onClick={onOpen}>Share Result</Button>
          <Button colorScheme="gray" variant="outline" onClick={() => window.location.href = "/"}>Return Home</Button>
        </Flex>

        {/* Share Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent bg="gray.900" color="white">
            <ModalHeader>Share Your Result</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Recipient email"
                value={shareEmail}
                onChange={e => setShareEmail(e.target.value)}
                mb={3}
                bg="gray.800"
                color="white"
                type="email"
              />
              <Text fontSize="sm" color="gray.400">
                We'll send a secure link to view your FMV result.<br />
                (Feature is in test mode.)
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3} onClick={handleShare} disabled={!shareEmail}>
                Send
              </Button>
              <Button onClick={onClose} variant="ghost">Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Success Modal */}
        <Modal isOpen={showSuccess} onClose={() => setShowSuccess(false)} isCentered>
          <ModalOverlay />
          <ModalContent bg="gray.900" color="white">
            <ModalHeader>Success!</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Your FMV result has been shared.</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="green" mr={3} onClick={() => setShowSuccess(false)}>
                Done
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Flex>
  );
}
