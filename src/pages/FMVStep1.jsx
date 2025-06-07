import React, { useState } from "react";
import {
  Box, Button, Flex, Heading, Progress, Stack, FormControl, FormLabel,
  Input, Select, CheckboxGroup, Checkbox, NumberInput, NumberInputField,
  useToast, Textarea, RadioGroup, Radio, Text, SimpleGrid
} from "@chakra-ui/react";

const DIVISIONS = ["I", "II", "III"];
const CONFERENCES = [
  "SEC", "ACC", "Big Ten", "Big 12", "Pac-12", "Ivy League", "AAC", "Sun Belt", "C-USA", "MWC", "WAC", "Other"
];
const GENDERS = ["Men's", "Women's", "Co-ed"];
const SPORTS = {
  "Men's": [
    "Basketball", "Football", "Baseball", "Soccer", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Women's": [
    "Basketball", "Soccer", "Volleyball", "Softball", "Track & Field", "Cross Country", "Lacrosse", "Golf", "Swimming", "Tennis", "Other"
  ],
  "Co-ed": [
    "Esports", "Cheerleading", "Other"
  ]
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
  name: "",
  email: "",
  school: "",
  division: "",
  conference: "",
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

export default function FMVStep1({ formData, setFormData, ...props }) {
  const [step, setStep] = useState(0);
  const [localForm, setLocalForm] = useState(formData || initialFormData);
  const [touched, setTouched] = useState({});
  const toast = useToast();

  const progress = ((step + 1) / STEPS.length) * 100;

  const validateStep = () => {
    switch (step) {
      case 0:
        return (
          localForm.name.trim() &&
          localForm.email.trim() &&
          localForm.school.trim()
        );
      case 1:
        return (
          localForm.gender &&
          localForm.sport &&
          localForm.graduation_year
        );
      case 2:
        if ((localForm.social_platforms || []).length === 0) return false;
        for (const platform of localForm.social_platforms || []) {
          if (
            (platform === "Instagram" && !localForm.followers_instagram.toString().trim()) ||
            (platform === "TikTok" && !localForm.followers_tiktok.toString().trim()) ||
            ((platform === "Twitter/X" || platform === "Twitter") && !localForm.followers_twitter.toString().trim()) ||
            (platform === "YouTube" && !localForm.followers_youtube.toString().trim())
          ) {
            return false;
          }
        }
        return true;
      case 3:
        return (
          (localForm.achievements || []).length > 0 &&
          (!((localForm.achievements || []).includes("Other")) || localForm.achievement_other.trim())
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (!validateStep()) {
      toast({
        title: "Please complete all required fields.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top"
      });
      setTouched((prev) => ({ ...prev, [step]: true }));
      return;
    }
    if (step === STEPS.length - 1) {
      if (typeof setFormData === "function") {
        setFormData(localForm);
      }
      if (props.navigate) props.navigate("/fmvcalculator/step2");
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const updateField = (field, value) => setLocalForm((prev) => ({ ...prev, [field]: value }));

  const handlePlatformChange = (platforms) => {
    updateField("social_platforms", platforms);
    if (!platforms.includes("Instagram")) updateField("followers_instagram", "");
    if (!platforms.includes("TikTok")) updateField("followers_tiktok", "");
    if (!platforms.includes("Twitter/X") && !platforms.includes("Twitter")) updateField("followers_twitter", "");
    if (!platforms.includes("YouTube")) updateField("followers_youtube", "");
  };

  // Section layouts (unchanged from previous version, but with safer array logic)
  const aboutYou = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">About You</Heading>
      <FormControl isRequired>
        <FormLabel color="gray.200">Full Name</FormLabel>
        <Input
          value={localForm.name}
          onChange={e => updateField("name", e.target.value)}
          placeholder="Your Name"
          bg="gray.800" color="white"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Email</FormLabel>
        <Input
          type="email"
          value={localForm.email}
          onChange={e => updateField("email", e.target.value)}
          placeholder="you@email.com"
          bg="gray.800" color="white"
        />
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">School</FormLabel>
        <Input
          value={localForm.school}
          onChange={e => updateField("school", e.target.value)}
          placeholder="University of Virginia"
          bg="gray.800" color="white"
        />
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Division (optional)</FormLabel>
        <Select
          value={localForm.division}
          onChange={e => updateField("division", e.target.value)}
          placeholder="Select division"
          bg="gray.800" color="white"
        >
          {DIVISIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </Select>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Conference (optional)</FormLabel>
        <Select
          value={localForm.conference}
          onChange={e => updateField("conference", e.target.value)}
          placeholder="Select conference"
          bg="gray.800" color="white"
        >
          {CONFERENCES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
      </FormControl>
    </Stack>
  );

  const academicsAthletics = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Academics & Athletics</Heading>
      <FormControl isRequired>
        <FormLabel color="gray.200">Gender</FormLabel>
        <Select
          value={localForm.gender}
          onChange={e => {
            updateField("gender", e.target.value);
            updateField("sport", "");
          }}
          placeholder="Select gender"
          bg="gray.800" color="white"
        >
          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Sport</FormLabel>
        <Select
          value={localForm.sport}
          onChange={e => updateField("sport", e.target.value)}
          placeholder="Select sport"
          bg="gray.800" color="white"
          isDisabled={!localForm.gender}
        >
          {localForm.gender && SPORTS[localForm.gender].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </FormControl>
      <FormControl isRequired>
        <FormLabel color="gray.200">Graduation Year</FormLabel>
        <NumberInput
          value={localForm.graduation_year}
          onChange={(_, v) => updateField("graduation_year", v)}
          min={2024} max={2030}
        >
          <NumberInputField placeholder="2026" bg="gray.800" color="white" />
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Age (optional)</FormLabel>
        <NumberInput
          value={localForm.age}
          onChange={(_, v) => updateField("age", v)}
          min={15} max={30}
        >
          <NumberInputField placeholder="e.g., 20" bg="gray.800" color="white" />
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">GPA (optional)</FormLabel>
        <NumberInput
          value={localForm.gpa}
          onChange={(_, v) => updateField("gpa", v)}
          precision={2}
          min={0} max={4.3} step={0.01}
        >
          <NumberInputField placeholder="e.g., 3.78" bg="gray.800" color="white" />
        </NumberInput>
      </FormControl>
      <FormControl>
        <FormLabel color="gray.200">Prior NIL Deals (optional)</FormLabel>
        <NumberInput
          value={localForm.prior_nil_deals}
          onChange={(_, v) => updateField("prior_nil_deals", v)}
          min={0}
        >
          <NumberInputField placeholder="e.g., 2" bg="gray.800" color="white" />
        </NumberInput>
      </FormControl>
    </Stack>
  );

  const socials = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Social Media</Heading>
      <FormControl isRequired>
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
        <FormControl isRequired>
          <FormLabel color="gray.200">Instagram Followers</FormLabel>
          <NumberInput
            value={localForm.followers_instagram}
            onChange={(_, v) => updateField("followers_instagram", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 5000" bg="gray.800" color="white" />
          </NumberInput>
        </FormControl>
      )}
      {(localForm.social_platforms || []).includes("TikTok") && (
        <FormControl isRequired>
          <FormLabel color="gray.200">TikTok Followers</FormLabel>
          <NumberInput
            value={localForm.followers_tiktok}
            onChange={(_, v) => updateField("followers_tiktok", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 2500" bg="gray.800" color="white" />
          </NumberInput>
        </FormControl>
      )}
      {((localForm.social_platforms || []).includes("Twitter/X") || (localForm.social_platforms || []).includes("Twitter")) && (
        <FormControl isRequired>
          <FormLabel color="gray.200">Twitter/X Followers</FormLabel>
          <NumberInput
            value={localForm.followers_twitter}
            onChange={(_, v) => updateField("followers_twitter", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 1200" bg="gray.800" color="white" />
          </NumberInput>
        </FormControl>
      )}
      {(localForm.social_platforms || []).includes("YouTube") && (
        <FormControl isRequired>
          <FormLabel color="gray.200">YouTube Followers</FormLabel>
          <NumberInput
            value={localForm.followers_youtube}
            onChange={(_, v) => updateField("followers_youtube", v)}
            min={0}
          >
            <NumberInputField placeholder="e.g., 1000" bg="gray.800" color="white" />
          </NumberInput>
        </FormControl>
      )}
    </Stack>
  );

  const achievements = (
    <Stack spacing={6}>
      <Heading fontSize="2xl" color="white">Athletic Achievements</Heading>
      <FormControl isRequired>
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
        <FormControl isRequired>
          <FormLabel color="gray.200">Please specify other achievement(s)</FormLabel>
          <Textarea
            value={localForm.achievement_other}
            onChange={e => updateField("achievement_other", e.target.value)}
            placeholder="Describe your other achievements"
            bg="gray.800" color="white"
          />
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
        <form
          onSubmit={e => {
            e.preventDefault();
            handleNext();
          }}
        >
          {renderSection()}

          <Flex mt={8} justify="space-between">
            <Button
              onClick={handleBack}
              isDisabled={step === 0}
              colorScheme="gray"
              variant="ghost"
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
