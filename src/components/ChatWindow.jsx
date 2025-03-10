import axios from "axios";
import React, { useState, useEffect, useRef } from "react";
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
  HStack,
  Tooltip,
  Card,
  CardBody,
} from "@chakra-ui/react";
import { EditIcon, LinkIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import ResponseActions from "./ResponseActions";
import DocumentReferenceButton from "./DocumentReferenceButton";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
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

  const handleSelectDocument = (document) => {
    setSelectedDocument(document);
    // Optional: automatically add reference to the input
    const documentReference = `[Referencing document: ${document.name}]\n`;
    setInput((prevInput) => documentReference + prevInput);
  };

  const sendMessage = async () => {
    if (input.trim()) {
      if (editingId) {
        setMessages(
            messages.map((msg) =>
                msg.id === editingId ? { ...msg, text: input } : msg
            )
        );
        setEditingId(null);
      } else {
        let messageContent = input;

        // Include document reference if it exists
        if (selectedDocument) {
          messageContent = `${messageContent}\n\n[Referencing document: ${selectedDocument.name}]`;
        }

        const newUserMessage = {
          id: Date.now(),
          text: messageContent,
          sender: "user",
          documentRef: selectedDocument ? {
            id: selectedDocument.id,
            name: selectedDocument.name
          } : null
        };

        setMessages((prevMessages) => [...prevMessages, newUserMessage]);
        setIsTyping(true);

        // Clear document selection after sending
        setSelectedDocument(null);

        try {
          // Use GET request as shown in the server log
          const response = await axios.get(
            "http://localhost:8000/ai_prompt",
              {
              params: {
                prompt: input,
                // Only pass document ID if we have a selected document
                // The server appears to expect use_docs parameter
                use_docs: selectedDocument ? true : true
              },
              }
          );

          // Handle response
          const responseText = response.data.response || response.data;
          const newAIMessage = {
            id: Date.now(),
            text: responseText,
            sender: "ai",
            source: response.data.source || "api"
          };
          setMessages((prevMessages) => [...prevMessages, newAIMessage]);
        } catch (error) {
          console.error("Error sending message to AI API:", error);
          // Add error message
          const errorMessage = {
            id: Date.now(),
            text: `Error: ${error.message || "Failed to get response"}`,
            sender: "ai",
            isError: true
          };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Sample patient profile simulation
  const simulateTyping = () => {
    if (isSimulatingTyping) return;

    const textToType = ` Patient Profile:
Age: 42 years old
* Symptoms:
* Dystonia, limb: The patient reports experiencing involuntary muscle contractions causing repetitive movements or abnormal postures in the limbs.
* Bradykinesia: There is a noticeable slowness in the initiation and execution of movement.
* Resting tremor: The patient has observed tremors in the hands that are most prominent at rest and decrease with voluntary movements.
* Rigidity, leg: The patient feels stiffness in the legs that is not dependent on the angle of joint movement.`;

    setIsSimulatingTyping(true);
    setInput("");

    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < textToType.length) {
        setInput((prevInput) => prevInput + textToType.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
        setIsSimulatingTyping(false);
      }
    }, 0); // Настройте скорость набора, изменяя интервал
  };

  const buttonBg = useColorModeValue("blue.500", "blue.200");
  const buttonColor = useColorModeValue("white", "gray.800");
  const buttonHoverBg = useColorModeValue("blue.600", "blue.300");
  const documentRefBg = useColorModeValue("blue.50", "blue.900");

  return (
      <Flex flexDirection="column" height="100%">
        <VStack
            spacing={4}
            align="stretch"
            flex={1}
            overflowY="auto"
            p={4}
            maxW="800px"
            mx="auto"
            w="-webkit-fill-available"
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
                  // When editing, only set the original input, not the document reference
                  const textWithoutRef = message.text.split('\n\n[Referencing')[0];
                  setInput(textWithoutRef);
                }}
                    />
                )}
                <Box
              bg={message.sender === "user" ? "blue.500" : message.isError ? "red.500" : "gray.200"}
              color={message.sender === "user" || message.isError ? "white" : "black"}
              p={3}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
              maxW="90%"
                >
                  <Text>{message.text}</Text>

              {/* Show document reference badge if exists */}
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
                  <Text>Document: {message.documentRef.name}</Text>
                </Flex>
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

      {/* Selected document preview */}
      {selectedDocument && (
        <Card size="sm" mx={4} mb={2} bg={documentRefBg}>
          <CardBody py={2}>
            <Flex justifyContent="space-between" alignItems="center">
              <Flex alignItems="center">
                <Icon as={LinkIcon} mr={2} />
                <Text fontWeight="medium">
                  Using document: {selectedDocument.name}
                </Text>
              </Flex>
              <IconButton
                icon={<EditIcon />}
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
              placeholder={
                editingId ? "Edit your message..." : "Message MDSGene AI..."
              }
              mr={2}
              rows={1}
              minHeight="40px"
              maxHeight="200px"
              resize="none"
              overflowY="auto"
              readOnly={isSimulatingTyping}
          onClick={simulateTyping}
          />
        <VStack alignItems="stretch" spacing={2}>
          <DocumentReferenceButton onSelectDocument={handleSelectDocument} />
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
        </VStack>
        </Flex>
      </Flex>
  );
};

export default ChatWindow;
