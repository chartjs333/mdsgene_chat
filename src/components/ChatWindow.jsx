import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  VStack,
  Textarea,
  Button,
  Text,
  Flex,
  Icon,
  IconButton,
  useColorModeValue,
  Card,
  CardBody,
  Badge,
  Select,
} from "@chakra-ui/react";
import { EditIcon, LinkIcon, CloseIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import ResponseActions from "./ResponseActions";
import DocumentGroups from "./DocumentGroups";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  // Instead of predefined options, we rely entirely on the dynamic list.
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  // Fetch available categories from the server
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("http://localhost:8000/categories");
        if (res.data.categories) {
          // Prepend "All" as the default option
          setCategories(["All", ...res.data.categories]);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
  };

  const sendMessage = async () => {
    if (input.trim()) {
      const newUserMessage = {
        id: Date.now(),
        text: input,
        sender: "user",
        documentRef: selectedDocument
            ? {
              id: selectedDocument.id,
              name: selectedDocument.name,
              group: selectedDocument.group || "Without group",
            }
            : null,
        category: selectedCategory,
      };

      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setIsTyping(true);

      try {
        const response = await axios.get("http://localhost:8000/ai_prompt", {
          params: {
            prompt: input,
            use_docs: true,
            category: selectedCategory,
          },
        });
        const responseData = response.data;
        const responseText =
            typeof responseData === "string"
                ? responseData
                : responseData.response || JSON.stringify(responseData);
        const newAIMessage = {
          id: Date.now(),
          text: responseText,
          sender: "ai",
          source:
              typeof responseData === "object" ? responseData.source : "api",
        };
        setMessages((prevMessages) => [...prevMessages, newAIMessage]);
      } catch (error) {
        console.error("Error sending message to AI API:", error);
        const errorMessage = {
          id: Date.now(),
          text: `Error: ${error.message || "Failed to get response"}`,
          sender: "ai",
          isError: true,
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsTyping(false);
        setSelectedDocument(null);
        setInput("");
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const simulateTyping = () => {
    if (isSimulatingTyping) return;
    const textToType = `Patient Profile:
Age: 42 years old
* Symptoms:
* Dystonia, limb: The patient reports experiencing involuntary muscle contractions...
    `;
    setInput(textToType);
  };

  const buttonBg = useColorModeValue("blue.500", "blue.200");
  const buttonColor = useColorModeValue("white", "gray.800");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.300");
  const documentRefBg = useColorModeValue("blue.50", "blue.900");

  return (
      <Flex flexDirection="column" height="100%">
        {/* Category selector */}
        <Box p={4}>
          <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              maxW="300px"
          >
            {categories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
            ))}
          </Select>
        </Box>

        <VStack
            spacing={4}
            align="stretch"
            flex={1}
            overflowY="auto"
            p={4}
            maxW="800px"
            mx="auto"
        >
          {messages.map((message) => (
              <Box
                  key={message.id}
                  position="relative"
                  alignSelf={message.sender === "user" ? "flex-end" : "flex-start"}
              >
                {message.sender === "user" && (
                    <IconButton
                        icon={<EditIcon />}
                        size="xs"
                        position="absolute"
                        left="-25px"
                        top="50%"
                        transform="translateY(-50%)"
                        opacity={0.5}
                        _hover={{ opacity: 1 }}
                        onClick={() => {
                          setEditingId(message.id);
                          setInput(message.text);
                        }}
                    />
                )}
                <Box
                    bg={
                      message.sender === "user"
                          ? "blue.500"
                          : message.isError
                              ? "red.500"
                              : "gray.200"
                    }
                    color={message.sender === "user" || message.isError ? "white" : "black"}
                    p={3}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                    maxW="90%"
                >
                  <Text>{message.text}</Text>
                  {message.documentRef && (
                      <Flex
                          mt={2}
                          p={1}
                          bg={documentRefBg}
                          borderRadius="md"
                          alignItems="center"
                          fontSize="sm"
                      >
                        <Icon as={LinkIcon} mr={1} />
                        <Text>
                          Document: {message.documentRef.name} (
                          {message.documentRef.group || "Without group"})
                        </Text>
                      </Flex>
                  )}
                  {message.category && (
                      <Badge mt={1} colorScheme="purple">
                        Category: {message.category}
                      </Badge>
                  )}
                </Box>
                {message.sender === "ai" && !isTyping && !message.isError && (
                    <ResponseActions responseText={message.text} />
                )}
              </Box>
          ))}
          {isTyping && (
              <Text fontSize="sm" color="gray.500">
                AI is typing...
              </Text>
          )}
          <div ref={messagesEndRef} />
        </VStack>

        <DocumentGroups onSelectDocument={handleSelectDocument} />

        {selectedDocument && (
            <Card size="sm" mx={4} mb={2} bg={documentRefBg}>
              <CardBody py={2}>
                <Flex justifyContent="space-between" alignItems="center">
                  <Flex alignItems="center">
                    <Icon as={LinkIcon} mr={2} />
                    <Text fontWeight="medium">
                      Using document: {selectedDocument.name} (
                      {selectedDocument.group || "Without group"})
                    </Text>
                  </Flex>
                  <IconButton
                      icon={<CloseIcon />}
                      size="xs"
                      aria-label="Clear document selection"
                      onClick={() => setSelectedDocument(null)}
                  />
                </Flex>
              </CardBody>
            </Card>
        )}

        <Flex p={4} borderTop="1px" borderColor="gray.200" alignItems="flex-end">
          <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={editingId ? "Edit your message..." : "Message MDSGene AI..."}
              mr={2}
              rows={1}
              minHeight="40px"
              maxHeight="200px"
              resize="none"
              overflowY="auto"
              readOnly={isSimulatingTyping}
              onClick={simulateTyping}
          />
          <Button
              onClick={sendMessage}
              bg={buttonBg}
              color={buttonColor}
              _hover={{ bg: buttonHoverBg }}
              isDisabled={isTyping || isSimulatingTyping}
              height="40px"
              minWidth="40px"
          >
            <Icon as={FaPaperPlane} />
          </Button>
        </Flex>
      </Flex>
  );
};

export default ChatWindow;
