import React, { useState } from "react";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    Text,
    VStack,
    useToast,
    Heading,
    Container,
    Code,
    Alert,
    AlertIcon,
    Progress,
} from "@chakra-ui/react";
import axios from "axios";

const SimpleUploadForm = () => {
    const [file, setFile] = useState(null);
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const toast = useToast();

    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast({
                title: "Error",
                description: "Please select a file",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsUploading(true);
        setResponse(null);
        setError(null);
        setUploadProgress(0);

        // Create FormData exactly like the curl command
        const formData = new FormData();
        formData.append("file", file);
        formData.append("description", description || "No description");

        // Log what we're sending to help debug
        console.log("Uploading file:", file.name);
        console.log("Description:", description);

        try {
            // Make the request, logging everything for debugging
            console.log("Sending request to:", "http://localhost:8000/upload_document");

            const response = await axios.post(
                "http://localhost:8000/upload_document",
                formData,
                {
                    // Do not set Content-Type manually - let browser set it
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentage);
                        console.log("Upload progress:", percentage, "%");
                    },
                }
            );

            console.log("Response received:", response.data);
            setResponse(response.data);
            toast({
                title: "Success",
                description: "File uploaded successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "An unknown error occurred");

            // More detailed error logging
            if (err.response) {
                console.error("Error response:", err.response.data);
                console.error("Status code:", err.response.status);
            }

            toast({
                title: "Upload failed",
                description: err.message || "An unknown error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Container maxW="container.md" py={8}>
            <VStack spacing={6} align="stretch">
                <Heading size="lg">Document Upload</Heading>
                <Text>This form directly mimics the curl command that works with the backend.</Text>

                <Box as="form" onSubmit={handleSubmit}>
                    <VStack spacing={4} align="stretch">
                        <FormControl isRequired>
                            <FormLabel>Select File</FormLabel>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                disabled={isUploading}
                            />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Description</FormLabel>
                            <Input
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Enter a description"
                                disabled={isUploading}
                            />
                        </FormControl>

                        <Button
                            type="submit"
                            colorScheme="blue"
                            isLoading={isUploading}
                            loadingText="Uploading..."
                            disabled={!file || isUploading}
                        >
                            Upload Document
                        </Button>
                    </VStack>
                </Box>

                {isUploading && (
                    <Box>
                        <Text mb={1}>Upload Progress: {uploadProgress}%</Text>
                        <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                    </Box>
                )}

                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        <Text>{error}</Text>
                    </Alert>
                )}

                {response && (
                    <Box>
                        <Heading size="sm" mb={2}>Server Response:</Heading>
                        <Box p={4} bg="gray.50" borderRadius="md" overflowX="auto">
                            <Code>{JSON.stringify(response, null, 2)}</Code>
                        </Box>
                    </Box>
                )}

                <Box p={4} bg="gray.50" borderRadius="md">
                    <Heading size="sm" mb={2}>Equivalent curl Command:</Heading>
                    <Code display="block" whiteSpace="pre-wrap">
                        curl -X POST -F "file=@{file?.name || 'yourfile.pdf'}" -F "description={description || 'Your description'}" http://localhost:8000/upload_document
                    </Code>
                </Box>
            </VStack>
        </Container>
    );
};

export default SimpleUploadForm;