import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { FuelProvider } from "@fuels/react";
import { defaultConnectors } from "@fuels/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { Provider } from 'fuels';

const queryClient = new QueryClient();
const fuelProvider = Provider.create("https://mainnet.fuel.network/v1/graphql");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <FuelProvider
        fuelConfig={{
          connectors: defaultConnectors({fuelProvider: fuelProvider}),
        }}
      >
        <App />
        <Toaster
          toastOptions={{
            position: window.innerWidth <= 768 ? "top-center" : "bottom-center",
          }}
        />
      </FuelProvider>
    </QueryClientProvider>
  </StrictMode>
);
