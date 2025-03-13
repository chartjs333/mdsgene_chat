import React from "react";
import {
    HStack,
    IconButton,
    useClipboard,
    useToast,
    useColorModeValue,
} from "@chakra-ui/react";
import { CopyIcon, RepeatIcon } from "@chakra-ui/icons";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const ResponseActions = ({ responseText }) => {
    const { onCopy } = useClipboard(responseText);
    const toast = useToast();

    const handleCopy = () => {
        onCopy();
        toast({
            title: "Copied to clipboard",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    const buttonColor = useColorModeValue("gray.600", "gray.400");
    const buttonHoverBg = useColorModeValue("gray.200", "gray.600");

    return (
        <HStack spacing={2} mt={2}>
            <IconButton
                icon={<CopyIcon />}
                aria-label="Copy response"
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                color={buttonColor}
                _hover={{ bg: buttonHoverBg }}
            />
            <IconButton
                icon={<FaThumbsUp />}
                aria-label="Thumbs up"
                size="sm"
                variant="ghost"
                color={buttonColor}
                _hover={{ bg: buttonHoverBg }}
            />
            <IconButton
                icon={<FaThumbsDown />}
                aria-label="Thumbs down"
                size="sm"
                variant="ghost"
                color={buttonColor}
                _hover={{ bg: buttonHoverBg }}
            />
            <IconButton
                icon={<RepeatIcon />}
                aria-label="Retry"
                size="sm"
                variant="ghost"
                color={buttonColor}
                _hover={{ bg: buttonHoverBg }}
            />
        </HStack>
    );
};

export default ResponseActions;
