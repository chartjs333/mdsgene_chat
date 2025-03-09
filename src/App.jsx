import React from "react";
import Routes, { RouterProvider } from "./pages";
import { ChakraProvider } from "./providers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

function App() {
  return (
    <ChakraProvider>
      <RouterProvider>
        <QueryClientProvider client={queryClient}>
          <Routes />
        </QueryClientProvider>
      </RouterProvider>
    </ChakraProvider>
  );
}

export default App;
