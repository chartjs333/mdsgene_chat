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
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { FaPaperPlane } from "react-icons/fa";
import ResponseActions from "./ResponseActions";

const ChatWindow = ({ chatId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSimulatingTyping, setIsSimulatingTyping] = useState(false);
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

  // Раскомментированный вариант sendMessage, который обращается к API PaperQA
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
        const newUserMessage = { id: Date.now(), text: input, sender: "user" };
        setMessages((prevMessages) => [...prevMessages, newUserMessage]);

        try {
          // Отправка запроса на API PaperQA
          const response = await axios.post(
              "http://localhost:8000/ai_prompt", // Измените этот URL при необходимости
              {},
              {
                params: { prompt: input },
              }
          );

          // Обработка ответа от сервера
          const newAIMessage = {
            id: Date.now(),
            text: response.data, // Если API возвращает JSON, возможно, нужно использовать response.data.answer или подобное
            sender: "ai",
          };
          setMessages((prevMessages) => [...prevMessages, newAIMessage]);
        } catch (error) {
          console.error("Error sending message to AI API:", error);
          // Здесь можно добавить сообщение об ошибке в чат
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

  // Если не хотите использовать API и хотите оставить симуляцию, можно переключаться между вариантами,
  // например, используя условный оператор или комментарии.

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
                        onClick={() => setEditingId(message.id) || setInput(message.text)}
                    />
                )}
                <Box
                    bg={message.sender === "user" ? "blue.500" : "gray.200"}
                    color={message.sender === "user" ? "white" : "black"}
                    p={2}
                    borderRadius="md"
                    whiteSpace="pre-wrap"
                >
                  <Text>{message.text}</Text>
                </Box>
                {message.sender === "ai" && !isTyping && (
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
        <Flex p={4} borderTop="1px" borderColor="gray.200" alignItems="flex-end">
          <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onClick={simulateTyping}
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
