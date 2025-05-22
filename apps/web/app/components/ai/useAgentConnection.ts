import { useState, useCallback } from "react";
import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { AgentState } from "~/agents/meta-agent";
import type { UIMessage } from "ai";

// Default agent state
const DEFAULT_AGENT_STATE: AgentState = {
  agentId: "general",
  counter: 0,
  messages: [],
  lastUpdated: null,
};

// Extend the return type of useAgentChat with our custom properties
type UseAgentConnectionReturn = ReturnType<typeof useAgentChat> & {
  // Our custom properties
  agentState: AgentState;
  setAgentType: (agentId: string) => Promise<boolean>;
  // Re-export the chat properties with more specific types if needed
  messages: UIMessage[];
};

export function useAgentConnection(
  sessionId: string,
  initialAgentId: string = "general"
): UseAgentConnectionReturn {
  const [agentState, setAgentState] = useState<AgentState>({
    ...DEFAULT_AGENT_STATE,
    agentId: initialAgentId,
  });

  // Connect to the agent
  const agentConnection = useAgent<AgentState>({
    agent: "MetaAgent",
    name: sessionId,
    onStateUpdate: (state) => {
      console.log("[Agent State Update]", state);
      setAgentState((prev) => ({ ...prev, ...state }));
    },
  });

  // Use the chat functionality
  const chat = useAgentChat({ agent: agentConnection });

  // Handle agent type changes
  const setAgentType = useCallback(
    async (agentId: string) => {
      console.log("Setting agent type to:", agentId);
      try {
        if (agentConnection?.setState) {
          // Update the agent type using setState, preserving other state properties
          agentConnection.setState({
            ...agentState, // Spread current state
            agentId: agentId,
            lastUpdated: new Date(),
          });
          console.log(`Backend agent set to: ${agentId}`);
          return true;
        }
      } catch (error) {
        console.error("Error setting agent:", error);
      }
      return false;
    },
    [agentConnection, agentState]
  );

  // Return all chat properties plus our custom ones with proper defaults
  return {
    // Spread chat properties first
    ...chat,

    // Our custom properties
    agentState,

    // Ensure all required properties have proper defaults
    messages: chat?.messages ?? [],
  } as UseAgentConnectionReturn;
}
