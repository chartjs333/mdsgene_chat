import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  useToast,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Spinner,
  Progress,
  List,
  ListItem,
  IconButton,
  HStack,
  Divider,
  Select,
} from "@chakra-ui/react";
import { AttachmentIcon, CloseIcon, DeleteIcon, ViewIcon } from "@chakra-ui/icons";
import { FaFileUpload, FaFile } from "react-icons/fa";
import axios from "axios";

const FileUploadComponent = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");
  // Changed group field to an Input to allow free text entry
  const [group, setGroup] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const toast = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
      fetchCategories();
    }
  }, [isOpen]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://34.32.174.67:8000/documents");
      let allDocs = [];
      if (response.data.documents) {
        allDocs = response.data.documents;
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

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://34.32.174.67:8000/categories");
      if (res.data.categories) {
        setCategories(["All", ...res.data.categories]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleGroupChange = (event) => {
    setGroup(event.target.value);
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
    const docDescription = description || selectedFile.name;
    formData.append("description", docDescription);
    // Pass the entered group name
    formData.append("group", group);

    try {
      const response = await axios.post(
          "http://34.32.174.67:8000/upload_document",
          formData,
          {
            headers: {
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

      // Reset form fields
      setSelectedFile(null);
      setDescription("");
      setGroup("");
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
      await axios.delete(`http://34.32.174.67:8000/documents/${docId}`);
      toast({
        title: "Document deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
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
      const response = await axios.get(`http://34.32.174.67:8000/document/${docId}`);
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

  const handleUploadWithCallback = async (e) => {
    await handleUpload(e);
    await fetchDocuments();
    if (onUploadComplete && typeof onUploadComplete === "function") {
      onUploadComplete();
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
              {/* The group field is now a free text input */}
              <FormControl>
                <FormLabel>Group (Optional)</FormLabel>
                <Input
                    value={group}
                    onChange={handleGroupChange}
                    placeholder="Enter group name"
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
