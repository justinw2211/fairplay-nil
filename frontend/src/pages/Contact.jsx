import React from "react";
import { Box, Container, VStack, Heading, Text, Button, useToast } from "@chakra-ui/react";
import { useForm } from "react-hook-form";
import FormField from "../components/forms/FormField";
import PhoneField from "../components/forms/PhoneField";
import Footer from "../components/Footer";

const Contact = () => {
  const toast = useToast();
  
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
    reset,
  } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      message: ''
    },
    mode: 'onBlur'
  });

  const submitHandler = async (data) => {
    try {
      // TODO: wire to backend/email; for now noop
      await Promise.resolve();
      
      // Show success message
      toast({
        title: "Message sent successfully!",
        description: "We'll get back to you soon.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      reset();
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bgGradient="linear(to-b, gray.50, white)" minH="100vh" display="flex" flexDirection="column">
      <Box as="main" flex="1" pt={{ base: 16, md: 24 }} pb={{ base: 12, md: 16 }}>
        <Container maxW="2xl">
          <VStack spacing={8} align="center" textAlign="center">
            <VStack spacing={4} align="center">
              <Heading size={{ base: "xl", md: "2xl" }} color="brand.textPrimary">
                Contact Us
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="brand.textSecondary" maxW="xl">
                Have questions about FairPlay NIL? We'd love to hear from you. 
                Send us a message and we'll respond as soon as possible.
              </Text>
            </VStack>

            <Box 
              w="full" 
              maxW="lg" 
              p={8} 
              bg="white" 
              borderRadius="lg" 
              boxShadow="md"
              border="1px solid"
              borderColor="gray.200"
            >
              <form onSubmit={handleSubmit(submitHandler)}>
                <VStack spacing={6} align="stretch">
                  <FormField
                    name="fullName"
                    control={control}
                    label="Full Name"
                    placeholder="Your full name"
                    isRequired
                    rules={{ required: 'Full name is required' }}
                  />

                  <FormField
                    name="email"
                    control={control}
                    label="Work Email"
                    placeholder="name@company.com"
                    type="email"
                    isRequired
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /[^@\s]+@[^@\s]+\.[^@\s]+/,
                        message: 'Enter a valid email address'
                      }
                    }}
                  />

                  <PhoneField
                    name="phone"
                    control={control}
                    label="Phone (optional)"
                    placeholder="(555) 555-5555"
                    isRequired={false}
                  />

                  <FormField
                    name="message"
                    control={control}
                    label="Message (optional)"
                    placeholder="How can we help?"
                    type="textarea"
                    maxLength={1000}
                  />

                  <Button
                    type="submit"
                    bg="brand.accentPrimary"
                    color="white"
                    size="lg"
                    isLoading={isSubmitting}
                    loadingText="Sending..."
                    _hover={{ bg: '#c8aeb0' }}
                  >
                    Send Message
                  </Button>
                </VStack>
              </form>
            </Box>
          </VStack>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
};

export default Contact;
