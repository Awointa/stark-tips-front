"use client";
import React from "react";
 
import { sepolia} from "@starknet-react/chains";
import {
  StarknetConfig,
  publicProvider,
  ready,
  braavos,
  useInjectedConnectors,
  voyager,
} from "@starknet-react/core";

 
export function StarknetProvider({ children }: { children: React.ReactNode }) {
  const { connectors } = useInjectedConnectors({
    // Show these connectors if the user has no connector installed.
    recommended: [ready(), braavos()],
    // Hide recommended connectors if the user has any connector installed.
    includeRecommended: "onlyIfNoConnectors",
    // Randomize the order of the connectors.
    order: "random",
  });
 
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
      explorer={voyager}
      autoConnect={true}
      // defaultChainId={constants.StarknetChainId.SN_SEPOLIA}
    >
      {children}
    </StarknetConfig>
  );
}