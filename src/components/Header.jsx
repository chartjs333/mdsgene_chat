import React from "react";
import {
  Flex,
  Text,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Image,
} from "@chakra-ui/react";
import { HamburgerIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { FaUser } from "react-icons/fa";

const Header = ({ onOpenSidebar }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const color = useColorModeValue("gray.800", "white");
  const buttonHoverBg = useColorModeValue("gray.200", "gray.700");

  return (
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
      <Flex alignItems="center" gap={2}>
        <Image src="logo.png" w="200px" />
        {/* <Menu>
          <MenuButton as={Text}>
            ChatGPT <ChevronDownIcon />
          </MenuButton>
          <MenuList>
            <MenuItem>GPT-3.5</MenuItem>
            <MenuItem>GPT-4</MenuItem>
          </MenuList>
        </Menu> */}
      </Flex>
      <IconButton
        icon={<FaUser />}
        variant="ghost"
        color={color}
        _hover={{ bg: buttonHoverBg }}
        aria-label="User profile"
      />
    </Flex>
  );
};

export default Header;
