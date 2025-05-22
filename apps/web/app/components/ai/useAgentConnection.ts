import { useState, useCallback } from "react";
import { useAgentChat } from "agents/ai-react";
import { useAgent } from "agents/react";
import type { AgentState } from "~/agents/meta-agent";

// Default agent state
const DEFAULT_AGENT_STATE: AgentState = {
  agentId: "general",
};

// Extend the return type of useAgentChat with our custom properties
type UseAgentConnectionReturn = ReturnType<typeof useAgentChat> & {
  // Our custom properties
  agentState: AgentState;
  setAgentType: (agentId: string) => Promise<boolean>;
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
      setAgentState((prev) => ({ ...prev, ...state }));
    },
  });

  // Use the chat functionality
  const chat = useAgentChat({ agent: agentConnection });

  // Handle agent type changes
  const setAgentType = useCallback(
    async (agentId: string) => {
      agentConnection.setState({
        ...agentState,
        agentId,
      });
      return true;
    },
    [agentConnection, agentState]
  );

  // Return all chat properties plus our custom ones with proper defaults
  return {
    // Spread chat properties first
    ...chat,
    setAgentType,
    agentState,
  };
}
