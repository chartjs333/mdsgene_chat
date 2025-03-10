import React, { useState } from "react";
import {
    Box,
    Button,
    Flex,
    FormControl,
    FormLabel,
    Input,
    Icon,
    Text,
    useToast,
    Drawer,
    DrawerBody,
    DrawerFooter,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    Spinner,
    VStack,
    Progress,
    List,
    ListItem,
    IconButton,
    HStack,
    Divider,
    Badge,
} from "@chakra-ui/react";
import { AttachmentIcon, CloseIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { FaFileUpload, FaFile } from "react-icons/fa";
import axios from "axios";

const FileUploadComponent = ({ isOpen, onClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [description, setDescription] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // Fetch documents when drawer opens
    React.useEffect(() => {
        if (isOpen) {
            fetchDocuments();
        }
    }, [isOpen]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("http://localhost:8000/documents");

      // Format data from the server response
      // The server returns documents in two arrays: paperqa_docs and backup_docs
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

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({
                title: "No file selected",
                status: "warning",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append("file", selectedFile);

    // Make sure description is a string to avoid DOI parsing issues
    const docDescription = description || selectedFile.name;
    formData.append("description", docDescription);

        try {
      // Use the exact format that works with curl
            const response = await axios.post(
                "http://localhost:8000/upload_document",
                formData,
                {
                    headers: {
            // Let axios set the correct Content-Type with boundary
            "Content-Type": undefined,
                    },
                    onUploadProgress: (progressEvent) => {
                        const percentage = Math.round(
                            (progressEvent.loaded * 100) / progressEvent.total
                        );
                        setUploadProgress(percentage);
                    },
                }
            );

            toast({
                title: "Document uploaded",
                description: response.data.message || "Document successfully uploaded",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Reset form
            setSelectedFile(null);
            setDescription("");

            // Refresh document list
            fetchDocuments();
        } catch (error) {
            console.error("Error uploading document:", error);
            toast({
                title: "Upload failed",
                description: error.message,
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDeleteDocument = async (docId) => {
        try {
            await axios.delete(`http://localhost:8000/documents/${docId}`);

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
            const response = await axios.get(`http://localhost:8000/document/${docId}`);

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

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Upload Documents</DrawerHeader>

                <DrawerBody>
                    <VStack spacing={4} align="stretch">
                        <FormControl>
                            <FormLabel>Select Document</FormLabel>
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
                                    leftIcon={<Icon as={AttachmentIcon} />}
                                    colorScheme="blue"
                                    variant="outline"
                                    cursor="pointer"
                                    isDisabled={isUploading}
                                    mr={2}
                                    flexGrow={1}
                                >
                                    {selectedFile ? selectedFile.name : "Choose File"}
                                </Button>
                                {selectedFile && (
                                    <IconButton
                                        icon={<CloseIcon />}
                                        onClick={() => setSelectedFile(null)}
                                        aria-label="Clear file selection"
                                        isDisabled={isUploading}
                                    />
                                )}
                            </Flex>
                        </FormControl>

                        <FormControl>
                            <FormLabel>Description (Optional)</FormLabel>
                            <Input
                                placeholder="Enter document description"
                                value={description}
                                onChange={handleDescriptionChange}
                                isDisabled={isUploading}
                            />
                        </FormControl>

                        {isUploading && (
                            <Box>
                                <Text mb={1}>Uploading: {uploadProgress}%</Text>
                                <Progress value={uploadProgress} size="sm" colorScheme="blue" />
                            </Box>
                        )}

                        <Button
                            leftIcon={<Icon as={FaFileUpload} />}
                            colorScheme="blue"
                            onClick={handleUpload}
                            isLoading={isUploading}
                            loadingText="Uploading"
                            w="full"
                            mt={2}
                        >
                            Upload Document
                        </Button>

                        <Divider my={4} />

                        <Text fontSize="lg" fontWeight="bold">
                            Uploaded Documents
                        </Text>

                        {isLoading ? (
                            <Flex justify="center" py={6}>
                                <Spinner />
                            </Flex>
                        ) : documents.length === 0 ? (
                            <Text color="gray.500" textAlign="center" py={6}>
                                No documents uploaded yet
                            </Text>
                        ) : (
                            <List spacing={2}>
                                {documents.map((doc) => (
                                    <ListItem key={doc.id} borderWidth="1px" borderRadius="md" p={2}>
                                        <HStack justify="space-between">
                                            <HStack>
                                                <Icon as={FaFile} color="blue.500" />
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
                    </VStack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px">
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Close
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};

export default FileUploadComponent;