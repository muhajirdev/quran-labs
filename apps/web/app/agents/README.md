# QuranLabs Agent System

This directory contains the implementation of the QuranLabs agent system, which provides AI-powered assistance for exploring and understanding the Quran.

## Architecture

The agent system is designed to be modular and extensible, with a focus on data-driven configuration rather than hard-coded agent implementations. The key components are:

### MetaAgent

The `MetaAgent` is a single Cloudflare Durable Object that can behave as different specialized agents based on the agent type specified in the connection name. It dynamically loads the appropriate system prompt and tools based on the agent type.

### Agent Registry

The `agent-registry.ts` file defines all available agents in the system, including their metadata, capabilities, and system prompts. This registry is used by the UI to display available agents and by the MetaAgent to determine how to behave for a given agent type.

### Agent Factory

The `agent-factory.ts` file provides a factory pattern for creating agent configurations that can be used by the MetaAgent. This allows for easy addition of new agent types without modifying the MetaAgent implementation.

### Agent Types

The `agent-types.ts` file defines the TypeScript interfaces for agent definitions, capabilities, and categories. These types are used throughout the agent system to ensure type safety.

## Adding a New Agent

To add a new agent to the system, follow these steps:

1. Add the agent definition to the `AGENT_REGISTRY` in `agent-registry.ts`
2. Update the `getAgentToolConfig` function in `agent-factory.ts` to include any specialized tools for the new agent
3. That's it! The MetaAgent will automatically use the new agent definition when a user selects it from the UI

## Agent Marketplace UI

The agent marketplace UI is implemented in the `AgentMarketplace.tsx` component. It displays all available agents from the registry and allows users to select an agent to use for their conversation.

## Benefits of This Approach

This architecture provides several benefits:

1. **Data-Driven Configuration**: Agents are defined by their data rather than by code, making it easy to add new agents without modifying the core implementation.

2. **Single Durable Object**: All agents are implemented as a single Durable Object, reducing the need for multiple Durable Object bindings in the Cloudflare Worker.

3. **Extensibility**: New agent types can be added without modifying the core agent implementation, making the system more maintainable and easier to extend.

4. **Type Safety**: TypeScript interfaces ensure that agent definitions are consistent and type-safe.

## Example: Adding a New Agent

Here's an example of how to add a new agent to the system:

```typescript
// In agent-registry.ts
export const AGENT_REGISTRY: AgentDefinition[] = [
  // ... existing agents ...
  {
    id: "new-agent",
    name: "New Agent",
    description: "A new specialized agent",
    icon: "Star",
    iconColor: "#FF5733",
    backgroundColor: "#FFF5F0",
    capabilities: [
      {
        id: "capability-1",
        name: "Capability 1",
        description: "Description of capability 1",
        icon: "Zap"
      }
    ],
    systemPrompt: "You are a new specialized agent...",
    exampleQueries: [
      "Example query 1",
      "Example query 2"
    ],
    isAvailable: true,
    category: "knowledge"
  }
];

// In agent-factory.ts
export function getAgentToolConfig(agentId: string): AgentToolConfig[] {
  // ... existing code ...
  
  switch (agentId) {
    // ... existing cases ...
    case "new-agent":
      return [
        ...baseTools,
        {
          id: "specialTool",
          name: "Special Tool",
          description: "A special tool for the new agent",
          enabled: true
        }
      ];
    default:
      return baseTools;
  }
}
```

That's it! The new agent will automatically be available in the agent marketplace UI and the MetaAgent will know how to behave as this agent when selected.
