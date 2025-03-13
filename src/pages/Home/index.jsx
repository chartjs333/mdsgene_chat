import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
  IconButton,
  Image,
  Spacer,
} from "@chakra-ui/react";
import { HamburgerIcon, AttachmentIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";
import Sidebar from "components/Sidebar";
import ChatWindow from "components/ChatWindow";
import SimpleUploadForm from "components/SimpleUploadForm"; // Import the simple upload form component

const Home = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { isOpen: isSidebarOpen, onOpen: onSidebarOpen, onClose: onSidebarClose } = useDisclosure();
  const { isOpen: isUploadOpen, onOpen: onUploadOpen, onClose: onUploadClose } = useDisclosure();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const headerBgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const buttonHoverBg = useColorModeValue("gray.200", "gray.700");

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = { id: newChatId, name: `New chat ${chats.length + 1}` };
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChat(newChatId);
  };

  const handleSelectChat = (chatId) => {
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      onSidebarClose(); // Close sidebar on mobile devices only
    }
  };

  return (
    <ChakraProvider>
      <Box height="100vh" bg={bgColor}>
        {/* Custom Header */}
        <Flex
          alignItems="center"
          justifyContent="space-between"
          p={4}
          bg={headerBgColor}
          color={color}
          h="60px"
        >
          <IconButton
            icon={<HamburgerIcon />}
            onClick={onSidebarOpen}
            variant="ghost"
            color={color}
            _hover={{ bg: buttonHoverBg }}
            aria-label="Open sidebar"
          />
          <Flex alignItems="center" gap={2}>
            <Image src="logo.png" w="200px" />
          </Flex>
          <Flex>
            {/* Document Upload Button */}
            <IconButton
              icon={<AttachmentIcon />}
              variant="ghost"
              color={color}
              _hover={{ bg: buttonHoverBg }}
              aria-label="Upload documents"
              onClick={onUploadOpen}
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

        <Flex h="calc(100vh - 60px)">
          {/* Sidebar Drawer */}
          <Drawer
            isOpen={isSidebarOpen}
            placement="left"
            onClose={onSidebarClose}
            returnFocusOnClose={false}
          >
            <DrawerContent>
              <Sidebar
                chats={chats}
                currentChat={currentChat}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
              />
            </DrawerContent>
          </Drawer>

          {/* Main Chat Window */}
          <Box flex={1} overflow="hidden">
            <ChatWindow chatId={currentChat} />
          </Box>

          {/* Document Upload Drawer */}
          <Drawer
            isOpen={isUploadOpen}
            placement="right"
            onClose={onUploadClose}
            size="md"
          >
            <DrawerContent>
              <Box p={4}>
                <SimpleUploadForm onUploadComplete={onUploadClose} />
              </Box>
            </DrawerContent>
          </Drawer>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default Home;
