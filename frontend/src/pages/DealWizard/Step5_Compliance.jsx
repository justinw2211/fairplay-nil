import React, { useContext } from "react";
import {
  Box,
  Button,
  Heading,
  Stack,
  Switch,
  FormControl,
  FormLabel,
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { DealContext } from "../../context/DealContext";

const Step5_Compliance = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { dealId } = useParams();
  const { formData, setFormData, updateDeal } = useContext(DealContext);

  const handleNext = async () => {
    try {
      const update = {
        licenses_nil: formData.licenses_nil,
        grant_exclusivity: formData.grant_exclusivity === true ? "Yes" : "No",
        compliance_confirmed: true,
      };

      const result = await updateDeal(dealId, update);

      if (result.error) {
        throw new Error(result.error.message || "Unknown error");
      }

      navigate(`/add/deal/confirmation/success/${dealId}`);
    } catch (error) {
      console.error("[Step5_Compliance] Failed to update deal:", error);
      toast({
        title: "Submission failed",
        description: "We could not save your compliance info. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="2xl" mx="auto" mt={10} p={6} borderWidth={1} borderRadius="xl">
      <Heading mb={6} size="lg">
        Compliance Check
      </Heading>
      <Stack spacing={5}>
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="licenses-nil" mb="0">
            Does the deal require NIL licensing?
          </FormLabel>
          <Switch
            id="licenses-nil"
            isChecked={formData.licenses_nil || false}
            onChange={(e) =>
              setFormData({ ...formData, licenses_nil: e.target.checked })
            }
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="grant-exclusivity" mb="0">
            Does this grant the brand exclusivity?
          </FormLabel>
          <Switch
            id="grant-exclusivity"
            isChecked={formData.grant_exclusivity || false}
            onChange={(e) =>
              setFormData({ ...formData, grant_exclusivity: e.target.checked })
            }
          />
        </FormControl>

        <Button colorScheme="green" onClick={handleNext}>
          Submit for Review
        </Button>
      </Stack>
    </Box>
  );
};

export default Step5_Compliance;
