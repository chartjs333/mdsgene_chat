import React, { useState, useEffect } from "react";
import {
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Text,
    Flex,
    Icon,
    Badge,
    Spinner,
    MenuDivider,
    useColorModeValue,
} from "@chakra-ui/react";
import { AttachmentIcon } from "@chakra-ui/icons";
import { FaFile } from "react-icons/fa";
import axios from "axios";

const DocumentReference = ({ onSelectDocument }) => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const menuBg = useColorModeValue("white", "gray.700");

    // Fetch documents when component mounts
    useEffect(() => {
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectDocument = async (docId) => {
        try {
            const response = await axios.get(`http://34.90.8.7:8000/document/${docId}`);
            if (onSelectDocument && response.data) {
                onSelectDocument(response.data);
            }
        } catch (error) {
            console.error("Error retrieving document:", error);
        }
    };

    return (
        <Menu closeOnSelect={true} placement="top">
            <MenuButton
                as={IconButton}
                icon={<AttachmentIcon />}
                variant="ghost"
                size="md"
                aria-label="Reference Document"
            />
            <MenuList bg={menuBg} maxH="300px" overflowY="auto" minW="240px">
                <Text px={3} py={2} fontWeight="medium">
                    Reference a document
                </Text>
                <MenuDivider />
                {isLoading ? (
                    <Flex justify="center" align="center" py={4}>
                        <Spinner size="sm" />
                    </Flex>
                ) : documents.length === 0 ? (
                    <Text p={3} fontSize="sm" color="gray.500">
                        No documents available
                    </Text>
                ) : (
                    documents.map((doc) => (
                        <MenuItem
                            key={doc.id}
                            onClick={() => handleSelectDocument(doc.id)}
                            _hover={{ bg: menuBg === "white" ? "gray.100" : "gray.600" }}
                        >
                            <Flex align="center" w="full">
                                <Icon as={FaFile} mr={2} color="blue.500" />
                                <Text isTruncated maxW="150px">
                                    {doc.name || doc.citation}
                                </Text>
                                <Badge ml={2} colorScheme={doc.source === "paperqa" ? "green" : "blue"}>
                                    {doc.source}
                                </Badge>
                            </Flex>
                        </MenuItem>
                    ))
                )}
                <MenuDivider />
                <MenuItem
                    onClick={fetchDocuments}
                    _hover={{ bg: menuBg === "white" ? "gray.100" : "gray.600" }}
                >
                    <Text fontSize="sm">Refresh list</Text>
                </MenuItem>
            </MenuList>
        </Menu>
    );
};

export default DocumentReference;