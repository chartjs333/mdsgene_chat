import React, { useState } from "react";
import {
  ChakraProvider,
  Box,
  Flex,
  useColorModeValue,
  Drawer,
  DrawerContent,
  useDisclosure,
} from "@chakra-ui/react";
import Sidebar from "components/Sidebar";
import ChatWindow from "components/ChatWindow";
import Header from "components/Header";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("gray.50", "gray.900");

  const handleNewChat = () => {
    const newChatId = Date.now();
    const newChat = { id: newChatId, name: `New chat ${chats.length + 1}` };
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChat(newChatId);
    // Removed onClose() from here to keep the sidebar open
  };

  const handleSelectChat = (chatId) => {
    setCurrentChat(chatId);
    if (window.innerWidth < 768) {
      onClose(); // Close sidebar on mobile devices only
    }
  };

  return (
    <ChakraProvider>
      <Box height="100vh" bg={bgColor}>
        <Header onOpenSidebar={onOpen} />
        <Flex h="calc(100vh - 60px)">
          <Drawer
            isOpen={isOpen}
            placement="left"
            onClose={onClose}
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
          <Box flex={1} overflow="hidden">
            <ChatWindow chatId={currentChat} />
          </Box>
        </Flex>
      </Box>
    </ChakraProvider>
  );
};

export default Home;
