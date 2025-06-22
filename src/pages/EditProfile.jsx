// src/pages/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../supabaseClient.js';
import { Box, Button, Flex, Heading, Stack, FormControl, FormLabel, Input, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function EditProfile() {
    const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (error) {
                    toast({ title: "Error fetching profile", description: error.message, status: "error" });
                } else {
                    setProfile(data);
                    reset(data); // Pre-fill form with profile data
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, [reset, toast]);
    
    const onSubmit = async (data) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: data.full_name,
                    school: data.school,
                    division: data.division,
                    gender: data.gender,
                    sports: data.sports ? [data.sports] : null,
                    graduation_year: data.graduation_year,
                })
                .eq('id', profile.id);

            if (error) throw error;
            
            toast({ title: "Profile updated successfully!", status: "success" });
            navigate('/dashboard');
        } catch (error) {
            toast({ title: "Error updating profile", description: error.message, status: "error" });
        }
    };
    
    if (loading) {
        return <Flex justify="center" align="center" h="80vh"><Spinner size="xl" /></Flex>;
    }
    
    return (
        <Flex minH="90vh" align="center" justify="center" bg="brand.backgroundLight">
            <Box w={["95vw", "600px"]} bg="white" boxShadow="xl" borderRadius="xl" p={8}>
                <Heading as="h1" size="lg" mb={6}>Edit Your Profile</Heading>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        <FormControl>
                            <FormLabel>Full Name</FormLabel>
                            <Input {...register('full_name')} />
                        </FormControl>
                        {profile?.role === 'athlete' && (
                             <>
                                <FormControl><FormLabel>School</FormLabel><Input {...register('school')} /></FormControl>
                                <FormControl><FormLabel>Division</FormLabel><Input {...register('division')} /></FormControl>
                                <FormControl><FormLabel>Gender</FormLabel><Input {...register('gender')} /></FormControl>
                                <FormControl><FormLabel>Sport(s)</FormLabel><Input {...register('sports')} /></FormControl>
                                <FormControl><FormLabel>Graduation Year</FormLabel><Input type="number" {...register('graduation_year')} /></FormControl>
                            </>
                        )}
                        <Flex justify="space-between" mt={6}>
                            <Button variant="ghost" onClick={() => navigate('/dashboard')}>Cancel</Button>
                            <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
                        </Flex>
                    </Stack>
                </form>
            </Box>
        </Flex>
    );
}