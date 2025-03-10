import React from "react";
import { ChakraProvider, Box } from "@chakra-ui/react";
import SimpleUploadForm from "./SimpleUploadForm";

const Index = () => {
    return (
        <ChakraProvider>
            <Box minH="100vh" bg="gray.50" py={8}>
                <SimpleUploadForm />
            </Box>
        </ChakraProvider>
    );
};

export default Index;