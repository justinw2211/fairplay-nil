import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  Stack,
  Heading,
  useToast,
  SimpleGrid,
} from "@chakra-ui/react";

const SOCIAL_OPTIONS = [
  { label: "Instagram", value: "instagram" },
  { label: "TikTok", value: "tiktok" },
  { label: "Twitter/X", value: "twitter" },
  { label: "YouTube", value: "youtube" },
];

const ACHIEVEMENT_OPTIONS = [
  "All-American",
  "Conference Champion",
  "Team Captain",
  "Starter",
  "National Team",
  "Other",
];

const SPORTS = [
  "Basketball",
  "Football",
  "Soccer",
  "Track & Field",
  "Baseball",
  "Volleyball",
  "Tennis",
  "Golf",
  "Swimming",
  "Other",
];

const GENDERS = ["Men's", "Women's", "Co-ed"];

export default function FMVStep1({ onNext }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    school: "",
    sport: "",
    gender: "",
    gradYear: "",
    socials: [],
    followers: {},
    achievements: [],
    achievementOther: "",
  });
  const [touched, setTouched] = useState({});
  const toast = useToast();

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  // Socials: Handle adding/removing platforms and their follower counts
  const handleSocialChange = (platforms) => {
    // Remove follower counts for unselected platforms
    const filteredFollowers = Object.fromEntries(
      Object.entries(form.followers).filter(([k]) => platforms.includes(k))
    );
    setForm((f) => ({
      ...f,
      socials: platforms,
      followers: filteredFollowers,
    }));
  };

  // Achievements: handle multi-select and Other field
  const handleAchievementsChange = (selected) => {
    setForm((f) => ({
      ...f,
      achievements: selected,
      achievementOther:
        selected.includes("Other") && !f.achievementOther
          ? ""
          : f.achievementOther,
    }));
  };

  // Validation
  const isEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isFormValid = () => {
    if (
      !form.name ||
      !form.email ||
      !isEmail(form.email) ||
      !form.school ||
      !form.sport ||
      !form.gender ||
      !form.gradYear ||
      form.socials.length === 0 ||
      form.socials.some(
        (p) => !form.followers[p] || isNaN(form.followers[p])
      ) ||
      form.achievements.length === 0 ||
      (form.achievements.includes("Other") && !form.achievementOther)
    ) {
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      school: true,
      sport: true,
      gender: true,
      gradYear: true,
      socials: true,
      achievements: true,
    });
    if (isFormValid()) {
      if (onNext) {
        onNext(form);
      } else {
        toast({
          title: "Form submitted (demo mode)",
          status: "success",
          duration: 2000,
        });
      }
    } else {
      toast({
        title: "Please fill out all required fields.",
        status: "error",
        duration: 2000,
      });
    }
  };

  return (
    <Box
      maxW="lg"
      mx="auto"
      mt={8}
      p={8}
      bg="gray.900"
      rounded="2xl"
      boxShadow="xl"
      color="white"
      fontFamily="Inter, sans-serif"
      border="1px solid"
      borderColor="gray.800"
    >
      <Heading mb={6} color="white" size="lg" fontWeight="bold" letterSpacing="tight">
        Athlete Profile
      </Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing={5}>
          {/* Name */}
          <FormControl isRequired isInvalid={touched.name && !form.name}>
            <FormLabel>Name</FormLabel>
            <Input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, name: true }))}
              placeholder="Full Name"
              bg="gray.800"
            />
            <FormErrorMessage>Name is required</FormErrorMessage>
          </FormControl>
          {/* Email */}
          <FormControl
            isRequired
            isInvalid={touched.email && (!form.email || !isEmail(form.email))}
          >
            <FormLabel>Email</FormLabel>
            <Input
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              placeholder="you@email.com"
              bg="gray.800"
              type="email"
            />
            <FormErrorMessage>Valid email required</FormErrorMessage>
          </FormControl>
          {/* School */}
          <FormControl isRequired isInvalid={touched.school && !form.school}>
            <FormLabel>School</FormLabel>
            <Input
              value={form.school}
              onChange={(e) => handleChange("school", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, school: true }))}
              placeholder="Your School"
              bg="gray.800"
            />
            <FormErrorMessage>School is required</FormErrorMessage>
          </FormControl>
          {/* Gender */}
          <FormControl isRequired isInvalid={touched.gender && !form.gender}>
            <FormLabel>Gender</FormLabel>
            <Select
              placeholder="Select gender"
              bg="gray.800"
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, gender: true }))}
            >
              {GENDERS.map((g) => (
                <option value={g} key={g}>
                  {g}
                </option>
              ))}
            </Select>
            <FormErrorMessage>Gender is required</FormErrorMessage>
          </FormControl>
          {/* Sport */}
          <FormControl isRequired isInvalid={touched.sport && !form.sport}>
            <FormLabel>Sport</FormLabel>
            <Select
              placeholder="Select sport"
              bg="gray.800"
              value={form.sport}
              onChange={(e) => handleChange("sport", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, sport: true }))}
            >
              {SPORTS.map((s) => (
                <option value={s} key={s}>
                  {s}
                </option>
              ))}
            </Select>
            <FormErrorMessage>Sport is required</FormErrorMessage>
          </FormControl>
          {/* Graduation Year */}
          <FormControl isRequired isInvalid={touched.gradYear && !form.gradYear}>
            <FormLabel>Graduation Year</FormLabel>
            <Input
              type="number"
              value={form.gradYear}
              onChange={(e) => handleChange("gradYear", e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, gradYear: true }))}
              placeholder="e.g. 2026"
              bg="gray.800"
              min={2020}
              max={2030}
            />
            <FormErrorMessage>Graduation year required</FormErrorMessage>
          </FormControl>
          {/* Social Media Platforms */}
          <FormControl
            isRequired
            isInvalid={touched.socials && form.socials.length === 0}
          >
            <FormLabel>Social Media Platforms (select all you use)</FormLabel>
            <CheckboxGroup
              value={form.socials}
              onChange={handleSocialChange}
              colorScheme="green"
            >
              <Stack direction="row" spacing={6}>
                {SOCIAL_OPTIONS.map((s) => (
                  <Checkbox value={s.value} key={s.value}>
                    {s.label}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            <FormErrorMessage>
              At least one social media platform required
            </FormErrorMessage>
            {/* Dynamic follower count fields */}
            <SimpleGrid columns={[1, 2]} spacing={4} mt={3}>
              {form.socials.map((platform) => (
                <FormControl
                  key={platform}
                  isRequired
                  isInvalid={
                    touched.socials &&
                    (!form.followers[platform] ||
                      isNaN(form.followers[platform]))
                  }
                >
                  <FormLabel fontSize="sm" mt={2}>
                    {SOCIAL_OPTIONS.find((o) => o.value === platform)?.label ||
                      platform}{" "}
                    followers
                  </FormLabel>
                  <Input
                    type="number"
                    min={0}
                    bg="gray.800"
                    value={form.followers[platform] || ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        followers: {
                          ...f.followers,
                          [platform]: e.target.value.replace(/\D/, ""),
                        },
                      }))
                    }
                  />
                  <FormErrorMessage>
                    Required (enter 0 if none)
                  </FormErrorMessage>
                </FormControl>
              ))}
            </SimpleGrid>
          </FormControl>
          {/* Achievements */}
          <FormControl
            isRequired
            isInvalid={touched.achievements && form.achievements.length === 0}
          >
            <FormLabel>Achievements</FormLabel>
            <CheckboxGroup
              value={form.achievements}
              onChange={handleAchievementsChange}
              colorScheme="green"
            >
              <Stack direction="row" spacing={6}>
                {ACHIEVEMENT_OPTIONS.map((a) => (
                  <Checkbox value={a} key={a}>
                    {a}
                  </Checkbox>
                ))}
              </Stack>
            </CheckboxGroup>
            <FormErrorMessage>
              At least one achievement required
            </FormErrorMessage>
            {/* Other achievement input */}
            {form.achievements.includes("Other") && (
              <Box mt={2}>
                <FormLabel fontSize="sm">Other (please specify):</FormLabel>
                <Input
                  bg="gray.800"
                  value={form.achievementOther}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      achievementOther: e.target.value,
                    }))
                  }
                  isRequired
                />
              </Box>
            )}
          </FormControl>
          {/* Submit/Next Button */}
          <Button
            type="submit"
            colorScheme="green"
            size="lg"
            fontWeight="bold"
            w="100%"
            mt={4}
            isDisabled={!isFormValid()}
          >
            Next
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
