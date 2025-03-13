import React, { useState } from "react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Text,
    Input,
    FormControl,
    FormLabel,
    useToast,
} from "@chakra-ui/react";

const AddToDatasetModal = ({ isOpen, onClose, content, onConfirm }) => {
    const [additionalInfo, setAdditionalInfo] = useState("");
    const toast = useToast();

    const handleConfirm = async () => {
        // Build the dataset item to save on the backend.
        const datasetItem = {
            content,
            additionalInfo,
            timestamp: new Date().toISOString(),
        };

        try {
            const res = await fetch("http://localhost:8000/add_to_dataset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(datasetItem),
            });
            if (!res.ok) {
                throw new Error("Failed to add dataset item");
            }
            toast({
                title: "Dataset Updated",
                description: "Your data has been saved successfully.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
            // You can also call an onConfirm prop to update local state if needed.
            if (onConfirm) onConfirm(datasetItem);
            onClose();
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md" isCentered>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add to Dataset</ModalHeader>
                <ModalBody>
                    <Text mb={4}>
                        Are you sure you want to add the following text to your dataset?
                    </Text>
                    <Text
                        fontSize="sm"
                        borderWidth="1px"
                        p={2}
                        borderRadius="md"
                        overflowY="auto"
                        maxH="150px"
                        mb={4}
                    >
                        {content}
                    </Text>
                    <FormControl>
                        <FormLabel>Additional Information (Optional)</FormLabel>
                        <Input
                            placeholder="Enter any additional details..."
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                        />
                    </FormControl>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleConfirm}>
                        Add to Dataset
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddToDatasetModal;
