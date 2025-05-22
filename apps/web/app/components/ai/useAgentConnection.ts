import { useState, useCallback } from "react";
import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { AgentState } from "~/agents/meta-agent";

// Default agent state
const DEFAULT_AGENT_STATE: AgentState = {
  agentType: "general",
  counter: 0,
  messages: [],
  lastUpdated: null,
};

type UseAgentConnectionReturn = { agentState: AgentState } & ReturnType<
  typeof useAgentChat
>;

export function useAgentConnection(
  sessionId: string,
  initialAgentId: string = "general"
): UseAgentConnectionReturn {
  const [agentState, setAgentState] = useState<AgentState>({
    ...DEFAULT_AGENT_STATE,
    agentType: initialAgentId,
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
            agentType: agentId,
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

  return {
    ...chat,
    agentState,
  };
}
