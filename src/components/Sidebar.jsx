import React from "react";
import { Box, VStack, Button, Icon, Flex } from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { FaCompass, FaCrown } from "react-icons/fa";

const Sidebar = ({ chats, currentChat, onSelectChat, onNewChat }) => {
  return (
      <Box width="full" h="full" bg="gray.800" color="white" p={4}>
        <VStack spacing={4} align="stretch">
          <Button
              onClick={onNewChat}
              leftIcon={<AddIcon />}
              justifyContent="flex-start"
              variant="ghost"
              color="white"
          >
            New chat
          </Button>
          <Button
              leftIcon={<Icon as={FaCompass} />}
              justifyContent="flex-start"
              variant="ghost"
              color="white"
          >
            Explore MDSGene AI
          </Button>
          {chats.map((chat) => (
              <Button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  justifyContent="flex-start"
                  variant="ghost"
                  color="white"
                  bg={currentChat === chat.id ? "gray.700" : "transparent"}
                  _hover={{ bg: "gray.700" }}
              >
                {chat.name}
              </Button>
          ))}
          <Flex mt="auto" borderTop="1px" borderColor="gray.600" pt={4}>
            <Button
                leftIcon={<Icon as={FaCrown} />}
                justifyContent="flex-start"
                variant="ghost"
                color="white"
                w="full"
            >
              Chat history
            </Button>
          </Flex>
        </VStack>
      </Box>
  );
};

export default Sidebar;
