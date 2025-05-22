import { useState, useCallback } from "react";
import { useAgentChat } from "agents/ai-react";
import type { AgentDefinition } from "~/agents/agent-types";
import { useAgent } from "agents/react";
import type { AgentState } from "~/agents/meta-agent";

interface UseAgentConnectionReturn {
  selectedAgentId: string;
  agentMessages: any[]; // Replace 'any' with the actual message type
  agentInput: string;
  agentIsLoading: boolean;
  agentClearHistory: () => void;
  handleSelectAgent: (agentId: string) => Promise<boolean>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  agentConnection: any; // Replace 'any' with the actual agent connection type
}

export function useAgentConnection(
  sessionId: string,
  initialAgentId: string = "general"
): UseAgentConnectionReturn {
  const [selectedAgentId, setSelectedAgentId] =
    useState<string>(initialAgentId);

  // Connect to the MetaAgent with proper typing
  const agentConnection = useAgent<AgentState>({
    agent: "MetaAgent",
    name: sessionId,
  });

  // Use the useAgentChat hook with the agent connection
  const {
    messages: agentMessages,
    input: agentInput,
    handleInputChange: agentHandleInputChange,
    handleSubmit: agentHandleSubmit,
    isLoading: agentIsLoading,
    clearHistory: agentClearHistory,
  } = useAgentChat({
    agent: agentConnection,
  });

  // Handle agent selection
  const handleSelectAgent = useCallback(
    async (agentId: string) => {
      console.log("Agent selected:", agentId);

      try {
        // Check if agentConnection and the setAgent method are available
        if (
          agentConnection &&
          typeof (agentConnection as any).setAgent === "function"
        ) {
          await (agentConnection as any).setAgent(agentId);
          console.log(`Backend agent set to: ${agentId}`);
          setSelectedAgentId(agentId);
          return true;
        }
      } catch (error) {
        console.error("Error setting agent:", error);
      }
      return false;
    },
    [agentConnection]
  );

  // Handle input change with debouncing if needed
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      agentHandleInputChange(e);
    },
    [agentHandleInputChange]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (agentInput.trim()) {
        agentHandleSubmit(e);
      }
    },
    [agentInput, agentHandleSubmit]
  );

  return {
    selectedAgentId,
    agentMessages,
    agentInput,
    agentIsLoading,
    agentClearHistory,
    handleSelectAgent,
    handleInputChange,
    handleSubmit,
    // Raw agent connection for any direct access needed
    agentConnection,
  };
}
