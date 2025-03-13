import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  VStack,
  Flex,
  Text,
  Textarea,
  Button,
  Icon,
  IconButton,
  Select,
  Spinner,
  useColorModeValue,
  useDisclosure,
  Card,
  CardBody,
  Badge,
  Heading,
  Collapse,
} from "@chakra-ui/react";
import { FaPaperPlane, FaThumbsUp } from "react-icons/fa";
import { LinkIcon, CloseIcon } from "@chakra-ui/icons";
import AddToDatasetModal from "./AddToDatasetModal";
import DocumentGroups from "./DocumentGroups";
import ResponseActions from "./ResponseActions";

// A component to parse message text and render a collapsible "think" block
const MessageContent = ({ text }) => {
  // Look for content between <think> and </think> tags
  const regex = /<think>([\s\S]*?)<\/think>/;
  const match = text.match(regex);

  if (match) {
    const beforeText = text.replace(regex, "").trim();
    const thinkText = match[1].trim();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Box>
          {beforeText && <Box mb={2}>{beforeText}</Box>}
          <Button
              size="xs"
              variant="link"
              onClick={() => setIsOpen(!isOpen)}
              mb={2}
          >
            {isOpen ? "Hide thoughts" : "Show thoughts"}
          </Button>
          <Collapse in={isOpen} animateOpacity>
            <Box
                p={2}
                border="1px"
                borderColor="gray.300"
                borderRadius="md"
                bg="gray.100"
            >
              {thinkText}
            </Box>
          </Collapse>
        </Box>
    );
  }
  return <Box>{text}</Box>;
};

const ChatWindow = ({ chatId }) => {
  // States for messages and input
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  // States for category selection
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);
  // States for dataset management
  const [dataset, setDataset] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedForDataset, setSelectedForDataset] = useState("");

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Chakra UI color settings
  const buttonBg = useColorModeValue("blue.500", "blue.200");
  const buttonColor = useColorModeValue("white", "gray.800");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.300");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  useEffect(() => {
    // Fetch categories from the server
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/categories");
        const data = await res.json();
        if (data.categories) {
          setCategories(["All", ...data.categories]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Function to send a message via PaperQA endpoint (/ai_prompt)
  const sendMessage = async () => {
    if (!input.trim()) return;
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoadingResponse(true);
    const query = input;
    setInput("");

    try {
      const response = await fetch(
          `http://localhost:8000/ai_prompt?prompt=${encodeURIComponent(
              query
          )}&use_docs=true&category=${selectedCategory}`
      );
      const data = await response.json();
      const aiMessage = {
        id: Date.now(),
        text: data.response,
        sender: "ai",
        category: selectedCategory,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        text: `Error: ${err.message}`,
        sender: "ai",
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Open modal to add message to dataset
  const handleAddToDataset = (content) => {
    setSelectedForDataset(content);
    onOpen();
  };

  const confirmAddToDataset = (content) => {
    setDataset((prev) => [...prev, { content }]);
  };

  // Render individual message with collapsible "think" block
  const renderMessage = (message) => {
    return (
        <Box
            key={message.id}
            position="relative"
            alignSelf="center"
            w="100%"
            maxW="800px"
            mb={2}
        >
          {message.sender === "user" && (
              <IconButton
                  icon={<FaThumbsUp />}
                  size="xs"
                  position="absolute"
                  right="-40px"
                  top="50%"
                  transform="translateY(-50%)"
                  variant="ghost"
                  colorScheme="green"
                  onClick={() => handleAddToDataset(message.text)}
                  aria-label="Add to dataset"
              />
          )}
          <Box
              bg={
                message.sender === "user"
                    ? buttonBg
                    : message.isError
                        ? "red.500"
                        : "gray.200"
              }
              color={message.sender === "user" || message.isError ? "white" : "black"}
              p={3}
              borderRadius="md"
              boxShadow="md"
          >
            <MessageContent text={message.text} />
            {message.category && (
                <Badge mt={1} colorScheme="purple">
                  Category: {message.category}
                </Badge>
            )}
          </Box>
          {message.sender === "ai" && !isLoadingResponse && !message.isError && (
              <ResponseActions responseText={message.text} />
          )}
        </Box>
    );
  };

  return (
      <Flex direction="column" height="100%" bg="gray.50" w="100%">
        {/* Top panel with current category information */}
        <Box p={4} bg="white" boxShadow="sm" w="100%">
          <Flex justify="space-between" align="center">
            <Heading size="md">
              Current Category:{" "}
              <Badge colorScheme="teal" ml={2}>
                {selectedCategory}
              </Badge>
            </Heading>
            <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                maxW="300px"
                variant="filled"
            >
              {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>
                    {cat}
                  </option>
              ))}
            </Select>
          </Flex>
        </Box>

        {/* Message area */}
        <VStack
            spacing={4}
            flex={1}
            overflowY="auto"
            p={4}
            align="center"
            w="100%"
        >
          {messages.map((msg) => renderMessage(msg))}
          {isLoadingResponse && (
              <Flex align="center" justify="center">
                <Spinner size="sm" mr={2} />
                <Text fontSize="sm" color="gray.500">
                  AI is processing the request...
                </Text>
              </Flex>
          )}
          <div ref={messagesEndRef} />
        </VStack>

        {/* Document selection component (if needed) */}
        <DocumentGroups onSelectDocument={() => {}} />

        {/* Input panel */}
        <Flex p={4} borderTop="1px" borderColor="gray.200" align="flex-end" w="100%">
          <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a message for the AI..."
              mr={2}
              rows={1}
              minHeight="40px"
              maxHeight="200px"
              resize="none"
              overflowY="auto"
              flex={1}
          />
          <Button
              onClick={sendMessage}
              bg={buttonBg}
              color={buttonColor}
              _hover={{ bg: buttonHoverBg }}
              isDisabled={isLoadingResponse}
              height="40px"
              minWidth="40px"
          >
            <Icon as={FaPaperPlane} />
          </Button>
        </Flex>

        {/* Modal for adding message to dataset */}
        <AddToDatasetModal
            isOpen={isOpen}
            onClose={onClose}
            content={selectedForDataset}
            onConfirm={confirmAddToDataset}
        />
      </Flex>
  );
};

export default ChatWindow;
