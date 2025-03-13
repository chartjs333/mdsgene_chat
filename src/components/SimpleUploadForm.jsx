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
    Code,
    Alert,
    AlertIcon,
    Progress,
    HStack,
    IconButton,
    Divider,
    List,
    ListItem,
    Badge, Flex,
} from "@chakra-ui/react";
import { CloseIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { FaFileUpload, FaFile } from "react-icons/fa";
import axios from "axios";

const SimpleUploadForm = ({ onUploadComplete }) => {
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
        if (e) e.preventDefault();
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

        try {
            const response = await axios.post(
                "http://34.90.8.7:8000/upload_document",
                formData,
                {
                    // Do not set Content-Type manually - let browser set it
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentage);
                    },
                }
            );

            setResponse(response.data);
            toast({
                title: "Success",
                description: "Document uploaded successfully",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Reset form after successful upload
            setFile(null);
            setDescription("");
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message || "An unknown error occurred");

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

    // Add document listing functionality
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch documents when component mounts
    React.useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://34.90.8.7:8000/documents");

            // Format data from the server response
            let allDocs = [];

            if (response.data.documents) {
                allDocs = response.data.documents;
            } else {
                // Fallback handling if structure is different
                const backupDocs = response.data.backup_docs || [];
                const paperqaDocs = response.data.paperqa_docs || [];
                allDocs = [...backupDocs, ...paperqaDocs];
            }

            setDocuments(allDocs);
        } catch (error) {
            console.error("Error fetching documents:", error);
            toast({
                title: "Error fetching documents",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        try {
            await axios.delete(`http://34.90.8.7:8000/documents/${docId}`);

            toast({
                title: "Document deleted",
                status: "success",
                duration: 3000,
                isClosable: true,
            });

            // Refresh document list
            fetchDocuments();
        } catch (error) {
            console.error("Error deleting document:", error);
            toast({
                title: "Delete failed",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleViewDocument = async (docId) => {
        try {
            const response = await axios.get(`http://34.90.8.7:8000/document/${docId}`);

            toast({
                title: response.data.name,
                description: response.data.preview.slice(0, 100) + "...",
                status: "info",
                duration: 5000,
                isClosable: true,
            });
        } catch (error) {
            console.error("Error viewing document:", error);
            toast({
                title: "Error viewing document",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    // Update the upload function to refresh documents and call the completion callback
    const handleUploadWithCallback = async (e) => {
        await handleSubmit(e);
        await fetchDocuments();
        if (onUploadComplete && typeof onUploadComplete === 'function' && !error) {
            onUploadComplete();
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Heading size="md">Upload Documents</Heading>

            <Box as="form" onSubmit={handleUploadWithCallback}>
                <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                        <FormLabel>Select File</FormLabel>
                        <Flex>
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                display="none"
                                id="file-upload"
                                isDisabled={isUploading}
                            />
                            <Button
                                as="label"
                                htmlFor="file-upload"
                                leftIcon={<FaFile />}
                                colorScheme="blue"
                                variant="outline"
                                cursor="pointer"
                                isDisabled={isUploading}
                                mr={2}
                                flexGrow={1}
                            >
                                {file ? file.name : "Choose File"}
                            </Button>
                            {file && (
                                <IconButton
                                    icon={<CloseIcon />}
                                    onClick={() => setFile(null)}
                                    aria-label="Clear file selection"
                                    isDisabled={isUploading}
                                />
                            )}
                        </Flex>
                    </FormControl>

                    <FormControl>
                        <FormLabel>Description (Optional)</FormLabel>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter document description"
                            disabled={isUploading}
                        />
                    </FormControl>

                    <Button
                        type="submit"
                        leftIcon={<FaFileUpload />}
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

            {response && !error && (
                <Alert status="success">
                    <AlertIcon />
                    <Text>Document successfully uploaded!</Text>
                </Alert>
            )}

            <Divider my={2} />

            <Box>
                <Heading size="sm" mb={3}>Uploaded Documents</Heading>

                {isLoading ? (
                    <Text>Loading documents...</Text>
                ) : documents.length === 0 ? (
                    <Text color="gray.500">No documents uploaded yet</Text>
                ) : (
                    <List spacing={2}>
                        {documents.map((doc) => (
                            <ListItem key={doc.id} borderWidth="1px" borderRadius="md" p={2}>
                                <HStack justify="space-between">
                                    <HStack>
                                        <FaFile />
                                        <Text fontWeight="medium" isTruncated maxW="200px">
                                            {doc.name || doc.citation}
                                        </Text>
                                        <Badge colorScheme={doc.source === "paperqa" ? "green" : "blue"}>
                                            {doc.source}
                                        </Badge>
                                    </HStack>
                                    <HStack>
                                        <IconButton
                                            icon={<ViewIcon />}
                                            size="sm"
                                            aria-label="View document"
                                            onClick={() => handleViewDocument(doc.id)}
                                        />
                                        <IconButton
                                            icon={<DeleteIcon />}
                                            size="sm"
                                            colorScheme="red"
                                            aria-label="Delete document"
                                            onClick={() => handleDeleteDocument(doc.id)}
                                        />
                                    </HStack>
                                </HStack>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </VStack>
    );
};

export default SimpleUploadForm;