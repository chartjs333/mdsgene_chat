import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Box,
  Text,
  Flex,
  Spinner,
  useColorModeValue,
  Badge,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { FaFile } from "react-icons/fa";

const DocumentGroups = ({ onSelectDocument }) => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const menuBg = useColorModeValue("white", "gray.700");

  // Fetch documents filtered by category
  const fetchDocuments = async (category = "All") => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/documents", {
        params: category !== "All" ? { group: category } : {},
      });
      let allDocs = [];
      if (response.data.documents) {
        allDocs = response.data.documents;
      }
      setDocuments(allDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments(selectedCategory);
  }, [selectedCategory]);

  // Group documents by "group" field
  const groupedDocs = documents.reduce((groups, doc) => {
    const groupName = doc.group || "Without group";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(doc);
    return groups;
  }, {});

  return (
      <Box p={4}>
        <Text mb={2} fontWeight="bold">
        Choose group:
        </Text>
        <Select
            mb={4}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
        >
        <option value="All">All</option>
          <option value="Reports">Reports</option>
          <option value="Invoices">Invoices</option>
          <option value="Manuals">Manuals</option>
        </Select>

        <Text mb={2} fontWeight="bold">
        Choose document:
        </Text>
        {isLoading ? (
            <Flex justify="center" align="center" py={4}>
              <Spinner size="sm" />
            </Flex>
        ) : (
            <Accordion allowToggle>
              {Object.entries(groupedDocs).map(([groupName, docs]) => (
                  <AccordionItem key={groupName}>
                    <h2>
                      <AccordionButton>
                        <Box flex="1" textAlign="left">
                          {groupName}
                        </Box>
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
                      {docs.map((doc) => (
                          <Flex
                              key={doc.id}
                              p={2}
                              mb={2}
                              borderWidth="1px"
                              borderRadius="md"
                              cursor="pointer"
                              onClick={() => onSelectDocument(doc)}
                              alignItems="center"
                          >
                            <Box mr={2}>
                              <FaFile />
                            </Box>
                            <Box flex="1">
                              <Text isTruncated maxW="150px">
                                {doc.name || doc.citation}
                              </Text>
                            </Box>
                            <Badge ml={2} colorScheme={doc.source === "paperqa" ? "green" : "blue"}>
                              {doc.source}
                            </Badge>
                          </Flex>
                      ))}
                    </AccordionPanel>
                  </AccordionItem>
              ))}
            </Accordion>
        )}
      </Box>
  );
};

export default DocumentGroups;
