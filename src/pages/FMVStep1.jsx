import React, { useState, useEffect } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, Select, CheckboxGroup, Checkbox, NumberInput, NumberInputField,
  useToast, Textarea, Text, SimpleGrid, FormErrorMessage
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { NCAA_SCHOOLS } from "../data/ncaaSchools.js";

const DIVISIONS = ["I", "II", "III"];
const GENDERS = [
  "Male", "Female", "Nonbinary", "Prefer not to say", "Other"
];
const SPORTS = {
  "Male": [
    "Basketball", "Football", "Baseball", "Soccer", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Female": [
    "Basketball", "Soccer", "Volleyball", "Softball", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Nonbinary": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
  "Prefer not to say": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
  "Other": [
    "Basketball", "Soccer", "Track & Field", "Cross Country", "Other"
  ],
};
const SOCIAL_PLATFORMS = ["Instagram", "TikTok", "Twitter/X", "YouTube"];
const ACHIEVEMENTS = [
  "All-American", "Conference Champion", "Team Captain", "National Team", "Starter", "Other"
];
const STEPS = [
  "About You",
  "Academics & Athletics",
  "Social Media",
  "Achievements"
];

const initialFormData = {
  division: "",
  school: "",
  name: "",
  email: "",
  gender: "",
  sport: "",
  graduation_year: "",
  age: "",
  gpa: "",
  prior_nil_deals: "",
  social_platforms: [],
  followers_instagram: "",
  followers_tiktok: "",
  followers_twitter: "",
  followers_youtube: "",
  achievements: [],
  achievement_other: ""
};

function isGPAValid(val) {
  if (val === "") return true;
  const num = parseFloat(val);
  return !isNaN(num) && num >= 0 && num <= 4 && /^\d(\.\d{1,2})?$|^4(\.00?)?$/.test(val);
}

export default function FMVStep1({ formData, setFormData }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(formData || initialFormData);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [filteredSchools, setFilteredSchools] = useState([]);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (Object.values(localForm).some(x => x)) {
        e.preventDefault();
        e.returnValue = "Your data will be lost. Are you sure?";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [localForm]);

  useEffect(() => {
    if (localForm.division) {
      setFilteredSchools(NCAA_SCHOOLS[localForm.division] || []);
      setLocalForm(f => ({ ...f, school: "" }));
    } else {
      setFilteredSchools([]);
      setLocalForm(f => ({ ...f, school: "" }));
    }
    // eslint-disable-next-line
  }, [localForm.division]);

  // School blur logic: force user to pick from list, else blank
  const handleSchoolBlur = () => {
    if (
      localForm.school &&
      !filteredSchools.includes(localForm.school)
    ) {
      setLocalForm(f => ({ ...f, school: "" }));
      setErrors(e => ({ ...e, school: "Please select a valid school from the list." }));
    }
  };

  const handleGpaBlur = () => {
    let val = localForm.gpa;
    if (val === "" || !isGPAValid(val)) return;
    let num = parseFloat(val);
    setLocalForm(f => ({ ...f, gpa: num.toFixed(2) }));
  };

  const validateStep = () => {
    let stepErrors = {};
    if (step === 0) {
      if (!localForm.division) stepErrors.division = "Division is required.";
      if (!localForm.school) {
        stepErrors.school = "School is required.";
      } else if (
        filteredSchools.length > 0 &&
        !filteredSchools.includes(localForm.school)
      ) {
        stepErrors.school = "Please select a valid school from the list.";
      }
      if (!localForm.name.trim()) stepErrors.name = "Full name is required.";
      if (!localForm.email.trim()) stepErrors.email = "Email is required.";
    }
    if (step === 1) {
      if (!localForm.gender) stepErrors.gender = "Gender is required.";
      if (!localForm.sport) stepErrors.sport = "Sport is required.";
      if (!localForm.graduation_year) stepErrors.graduation_year = "Graduation year is required.";
      if (localForm.gpa !== "" && !isGPAValid(localForm.gpa))
        stepErrors.gpa = "GPA must be a number between 0.00 and 4.00 (two decimals).";
    }
    if (step === 2) {
      for (const platform of localForm.social_platforms || []) {
        if (
          (platform === "Instagram" && !localForm.followers_instagram.toString().trim()) ||
          (platform === "TikTok" && !localForm.followers_tiktok.toString().trim()) ||
          ((platform === "Twitter/X" || platform === "Twitter") && !localForm.followers_twitter.toString().trim()) ||
          (platform === "YouTube" && !localForm.followers_youtube.toString().trim())
        ) {
          stepErrors[`followers_${platform.toLowerCase().replace(/[^a-z]/g, "")}`] = `Follower count required for ${platform}.`;
        }
      }
    }
    if (step === 3) {
      if ((localForm.achievements || []).includes("Other") && !localForm.achievement_other.trim()) {
        stepErrors.achievement_other = "Please describe your other achievements.";
      }
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      setTouched(t => ({ ...t, [step]: true }));
      return;
    }
    if (step === STEPS.length - 1) {
      setFormData(localForm);
      navigate("/fmvcalculator/review");
    } else {
      setStep(s => s + 1);
    }
  };

  const handleBack = () => setStep(s => Math.max(0, s - 1));

  const updateField = (field, value) => {
    if (field === "school") {
      // If they clear the field, remove the error
      if (!value) setErrors(e => ({ ...e, school: undefined }));
    }
    if (field.startsWith("followers_") && isNaN(value) && value !== "") return;
    setLocalForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: undefined }));
  };

  const handlePlatformChange = (platforms) => {
    updateField("social_platforms", platforms);
    if (!platforms.includes("Instagram")) updateField("followers_instagram", "");
    if (!platforms.includes("TikTok")) updateField("followers_tiktok", "");
    if (!platforms.includes("Twitter/X") && !platforms.includes("Twitter")) updateField("followers_twitter", "");
    if (!platforms.includes("YouTube")) updateField("followers_youtube", "");
  };

  const aboutYou = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">About You</Heading>
      <FormControl isRequired isInvalid={!!errors.division}>
        <FormLabel color="gray.200">Division</FormLabel>
        <Select
          value={localForm.division}
          onChange={e => updateField("division", e.target.value)}
          placeholder="Select division"
          bg="gray.800"
          style={{ color: "white" }}
        >
          {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
        <FormErrorMessage>{errors.division}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.school}>
        <FormLabel color="gray.200">School</FormLabel>
        <Input
          value={localForm.school}
          onChange={e => updateField("school", e.target.value)}
          onBlur={handleSchoolBlur}
          placeholder="Start typing your school..."
          bg="gray.800"
          style={{ color: "white" }}
          list="school-list"
          autoComplete="off"
        />
        <datalist id="school-list">
          {filteredSchools.map((school) => (
            <option key={school} value={school} />
          ))}
        </datalist>
        <FormErrorMessage>{errors.school}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.name}>
        <FormLabel color="gray.200">Full Name</FormLabel>
        <Input
          value={localForm.name}
          onChange={e => updateField("name", e.target.value)}
          placeholder="Your Name"
          bg="gray.800"
          style={{ color: "white" }}
        />
        <FormErrorMessage>{errors.name}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.email}>
        <FormLabel color="gray.200">Email</FormLabel>
        <Input
          type="email"
          value={localForm.email}
          onChange={e => updateField("email", e.target.value)}
          placeholder="you@email.com"
          bg="gray.800"
          style={{ color: "white" }}
        />
        <FormErrorMessage>{errors.email}</FormErrorMessage>
      </FormControl>
    </Stack>
  );

  const academicsAthletics = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Academics & Athletics</Heading>
      <FormControl isRequired isInvalid={!!errors.gender}>
        <FormLabel color="gray.200">Gender</FormLabel>
        <Select
          value={localForm.gender}
          onChange={e => {
            updateField("gender", e.target.value);
            updateField("sport", "");
          }}
          placeholder="Select gender"
          bg="gray.800"
          style={{ color: "white" }}
        >
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
        <FormErrorMessage>{errors.gender}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.sport}>
        <FormLabel color="gray.200">Sport</FormLabel>
        <Select
          value={localForm.sport}
          onChange={e => updateField("sport", e.target.value)}
          placeholder="Select sport"
          bg="gray.800"
          style={{ color: "white" }}
          isDisabled={!localForm.gender}
        >
          {localForm.gender && SPORTS[localForm.gender].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
        <FormErrorMessage>{errors.sport}</FormErrorMessage>
      </FormControl>
      <FormControl isRequired isInvalid={!!errors.graduation_year}>
        <FormLabel color="gray.200">Graduation Year</FormLabel>
        <NumberInput
          value={localForm.graduation_year}
          onChange={(_, v) => updateField("graduation_year", v)}
          min={2024} max={2030}
        >
          <NumberInputField placeholder="2026" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
        <FormErrorMessage>{errors.graduation_year}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!errors.gpa}>
        <FormLabel color="gray.200">GPA (optional)</FormLabel>
        <NumberInput
          value={localForm.gpa}
          onChange={(_, v) => updateField("gpa", v)}
          precision={2}
          min={0} max={4.0} step={0.01}
          onBlur={handleGpaBlur}
        >
          <NumberInputField placeholder="e.g., 3.78" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
        <FormErrorMessage>{errors.gpa}</FormErrorMessage>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Age (optional)</FormLabel>
        <NumberInput
          value={localForm.age}
          onChange={(_, v) => updateField("age", v)}
          min={15} max={30}
        >
          <NumberInputField placeholder="e.g., 20" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Prior NIL Deals (optional)</FormLabel>
        <NumberInput
          value={localForm.prior_nil_deals}
          onChange={(_, v) => updateField("prior_nil_deals", v)}
          min={0}
        >
          <NumberInputField placeholder="e.g., 2" bg="gray.800" style={{ color: "white" }} />
        </NumberInput>
      </FormControl>
    </Stack>
  );

  const socials = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Social Media</Heading>
      <FormControl>
        <FormLabel color="gray.200">Which social platforms do you use?</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={localForm.social_platforms || []}
          onChange={handlePlatformChange}
        >
          <SimpleGrid columns={[1, 2]} spacing={2}>
            {SOCIAL_PLATFORMS.map(platform => (
              <Checkbox key={platform} value={platform}>
                {platform}
              </Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </FormControl>
      {(localForm.social_platforms || []).includes("Instagram") && (
        <FormControl isRequired isInvalid={!!errors.followers_instagram}>
          <FormLabel color="gray.200">Instagram Followers</FormLabel>
          <NumberInput
            value={localForm.followers_instagram}
            onChange={(_, v) => updateField("followers_instagram", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 5000" bg="gray.800" style={{ color: "white" }} />
          </NumberInput>
          <FormErrorMessage>{errors.followers_instagram}</FormErrorMessage>
        </FormControl>
      )}
      {(localForm.social_platforms || []).includes("TikTok") && (
        <FormControl isRequired isInvalid={!!errors.followers_tiktok}>
          <FormLabel color="gray.200">TikTok Followers</FormLabel>
          <NumberInput
            value={localForm.followers_tiktok}
            onChange={(_, v) => updateField("followers_tiktok", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 2500" bg="gray.800" style={{ color: "white" }} />
          </NumberInput>
          <FormErrorMessage>{errors.followers_tiktok}</FormErrorMessage>
        </FormControl>
      )}
      {((localForm.social_platforms || []).includes("Twitter/X") || (localForm.social_platforms || []).includes("Twitter")) && (
        <FormControl isRequired isInvalid={!!errors.followers_twitter}>
          <FormLabel color="gray.200">Twitter/X Followers</FormLabel>
          <NumberInput
            value={localForm.followers_twitter}
            onChange={(_, v) => updateField("followers_twitter", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 1200" bg="gray.800" style={{ color: "white" }} />
          </NumberInput>
          <FormErrorMessage>{errors.followers_twitter}</FormErrorMessage>
        </FormControl>
      )}
      {(localForm.social_platforms || []).includes("YouTube") && (
        <FormControl isRequired isInvalid={!!errors.followers_youtube}>
          <FormLabel color="gray.200">YouTube Followers</FormLabel>
          <NumberInput
            value={localForm.followers_youtube}
            onChange={(_, v) => updateField("followers_youtube", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 1000" bg="gray.800" style={{ color: "white" }} />
          </NumberInput>
          <FormErrorMessage>{errors.followers_youtube}</FormErrorMessage>
        </FormControl>
      )}
    </Stack>
  );

  const achievements = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Athletic Achievements</Heading>
      <FormControl>
        <FormLabel color="gray.200">What are your top achievements?</FormLabel>
        <CheckboxGroup
          colorScheme="green"
          value={localForm.achievements || []}
          onChange={v => {
            updateField("achievements", v);
            if (!(v || []).includes("Other")) updateField("achievement_other", "");
          }}
        >
          <SimpleGrid columns={[1, 2]} spacing={2}>
            {ACHIEVEMENTS.map(a => (
              <Checkbox key={a} value={a}>{a}</Checkbox>
            ))}
          </SimpleGrid>
        </CheckboxGroup>
      </FormControl>
      {(localForm.achievements || []).includes("Other") && (
        <FormControl isRequired isInvalid={!!errors.achievement_other}>
          <FormLabel color="gray.200">Please specify other achievement(s)</FormLabel>
          <Textarea
            value={localForm.achievement_other}
            onChange={e => updateField("achievement_other", e.target.value)}
            placeholder="Describe your other achievements"
            bg="gray.800"
            style={{ color: "white" }}
          />
          <FormErrorMessage>{errors.achievement_other}</FormErrorMessage>
        </FormControl>
      )}
    </Stack>
  );

  const renderSection = () => {
    switch (step) {
      case 0: return aboutYou;
      case 1: return academicsAthletics;
      case 2: return socials;
      case 3: return achievements;
      default: return aboutYou;
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bg="linear-gradient(to bottom,#181a20 60%,#23272f 100%)"
      color="white"
      py={10}
    >
      <Box
        w={["95vw", "600px"]}
        bg="gray.900"
        boxShadow="2xl"
        borderRadius="2xl"
        p={[4, 8]}
        mx="auto"
      >
        <Box mb={6}>
          <Text color="gray.300" fontWeight="bold" fontSize="md" mb={2} letterSpacing="wide">
            Step {step + 1} of {STEPS.length}: {STEPS[step]}
          </Text>
          <Progress value={progress} size="sm" colorScheme="green" borderRadius="lg" />
        </Box>
        <form onSubmit={handleNext}>
          {renderSection()}
          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0}
              colorScheme="gray"
              variant="outline"
            >
              Back
            </Button>
            <Button
              type="submit"
              colorScheme="green"
              px={8}
              fontWeight="bold"
            >
              {step === STEPS.length - 1 ? "Continue" : "Next"}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
