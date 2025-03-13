import React, { useState, useEffect } from "react";
import {
    Box,
    VStack,
    HStack,
    Text,
    IconButton,
    Button,
    Input,
    Textarea,
    useToast,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    FormControl,
    FormLabel,
    Heading,
    Spinner,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";

const DatasetManager = () => {
    const [dataset, setDataset] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    // States for editing
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentEditItem, setCurrentEditItem] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editAdditional, setEditAdditional] = useState("");

    const fetchDataset = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:8000/dataset");
            const data = await res.json();
            setDataset(data.items);
        } catch (error) {
            toast({
                title: "Error fetching dataset",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDataset();
    }, []);

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`http://localhost:8000/dataset/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete dataset item");
            }
            toast({
                title: "Item deleted",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
            fetchDataset();
        } catch (error) {
            toast({
                title: "Error deleting item",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const openEditModal = (item) => {
        setCurrentEditItem(item);
        setEditContent(item.content);
        setEditAdditional(item.additionalInfo || "");
        setIsEditOpen(true);
    };

    const handleEditSave = async () => {
        try {
            const updatedItem = {
                ...currentEditItem,
                content: editContent,
                additionalInfo: editAdditional,
            };
            const res = await fetch(`http://localhost:8000/dataset/${currentEditItem.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedItem),
            });
            if (!res.ok) {
                throw new Error("Failed to update dataset item");
            }
            toast({
                title: "Item updated",
                status: "success",
                duration: 2000,
                isClosable: true,
            });
            setIsEditOpen(false);
            fetchDataset();
        } catch (error) {
            toast({
                title: "Error updating item",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box p={4}>
            <Heading size="lg" mb={4}>
                Dataset Manager
            </Heading>
            {isLoading ? (
                <Spinner />
            ) : (
                <VStack spacing={4} align="stretch">
                    {dataset.map((item) => (
                        <Box key={item.id} p={4} borderWidth="1px" borderRadius="md">
                            <Text fontWeight="bold">Content:</Text>
                            <Text mb={2}>{item.content}</Text>
                            <Text fontWeight="bold">Additional Information:</Text>
                            <Text mb={2}>{item.additionalInfo || "None"}</Text>
                            <HStack spacing={4}>
                                <IconButton
                                    icon={<EditIcon />}
                                    onClick={() => openEditModal(item)}
                                    aria-label="Edit item"
                                    colorScheme="blue"
                                />
                                <IconButton
                                    icon={<DeleteIcon />}
                                    onClick={() => handleDelete(item.id)}
                                    aria-label="Delete item"
                                    colorScheme="red"
                                />
                            </HStack>
                        </Box>
                    ))}
                </VStack>
            )}

            {/* Edit Modal */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Dataset Item</ModalHeader>
                    <ModalBody>
                        <FormControl mb={4}>
                            <FormLabel>Content</FormLabel>
                            <Textarea
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Additional Information</FormLabel>
                            <Input
                                value={editAdditional}
                                onChange={(e) => setEditAdditional(e.target.value)}
                            />
                        </FormControl>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={() => setIsEditOpen(false)}>
                            Cancel
                        </Button>
                        <Button colorScheme="blue" onClick={handleEditSave}>
                            Save
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
};

export default DatasetManager;
