import React from "react";
import {
  Flex,
  IconButton,
  Image,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { HamburgerIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import FileUploadComponent from "./FileUploadComponent";

const Header = ({ onOpenSidebar }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const buttonHoverBg = useColorModeValue("gray.200", "gray.700");
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
      <>
        <Flex
            alignItems="center"
            justifyContent="space-between"
            p={4}
            bg={bgColor}
            color={color}
            h="60px"
        >
          <IconButton
              icon={<HamburgerIcon />}
              onClick={onOpenSidebar}
              variant="ghost"
              color={color}
              _hover={{ bg: buttonHoverBg }}
              aria-label="Open sidebar"
          />
          <Image src="logo.png" w="200px" />
          <Flex>
            <IconButton
                icon={<AttachmentIcon />}
                variant="ghost"
                color={color}
                _hover={{ bg: buttonHoverBg }}
                aria-label="Upload documents"
                onClick={onOpen}
                mr={2}
            />
            <IconButton
                icon={<FaUser />}
                variant="ghost"
                color={color}
                _hover={{ bg: buttonHoverBg }}
                aria-label="User profile"
            />
          </Flex>
        </Flex>
        <FileUploadComponent isOpen={isOpen} onClose={onClose} />
      </>
  );
};

export default Header;
