"use client";

import * as React from "react";
import { useRef } from "react";
import { HomeCommandDialog } from "~/components/command/HomeCommandDialog";
import { useLocation } from "react-router";
import { GeometricDecoration } from "~/components/ui/geometric-background";
import { cn } from "~/lib/utils";
// import { DiscoverSidebar } from "./DiscoverSidebar";
import { getRegionCodeFromCountry } from "~/constants/regions";
import { AgentMarketplace } from "./AgentMarketplace";
import { getAgentById } from "~/agents/agent-registry";
import { useFocusInputOnMount } from "~/hooks/useFocusInputOnMount";
import { ChatHeader } from "./ChatHeader";
import { ChatInputArea } from "./ChatInputArea";
import { InitialStateView } from "./InitialStateView";
import { ChatMessagesView } from "./ChatMessagesView";

// Local hooks
import { useChatSession } from "./useChatSession";
import { useAgentConnection } from "./useAgentConnection";

interface AIChatExperienceProps {
  countryCode?: string;
}

export default function AIChatExperience({
  countryCode,
}: AIChatExperienceProps) {
  // State
  const [commandDialogOpen, setCommandDialogOpen] = React.useState(false);
  // const [discoverSheetOpen, setDiscoverSheetOpen] = React.useState(false);
  const [agentMarketplaceOpen, setAgentMarketplaceOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Set default content based on country code
  const [contentRegion, setContentRegion] = React.useState<string>(
    getRegionCodeFromCountry(countryCode)
  );

  // Use custom hook for session management
  const { sessionId, createNewSession } = useChatSession();

  // Use custom hook for agent connection and chat state
  const {
    agentState,
    messages: agentMessages = [],
    input: agentInput = "",
    isLoading,
    clearHistory,
    setAgentType,
    handleInputChange,
    handleSubmit,
  } = useAgentConnection(sessionId);

  // Set default agent to song-wisdom if no agent is selected
  React.useEffect(() => {
    if (!agentState.agentId) {
      setAgentType("song-wisdom");
    }
  }, [agentState.agentId, setAgentType]);

  // Get the agent class based on the selected agent type
  const selectedAgent = getAgentById(agentState.agentId);

  // Determine if chat is active based on agent messages
  const chatActive = agentMessages.length > 0;

  // Refs
  const inputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Use custom hook to focus input on mount
  useFocusInputOnMount(inputRef);

  // Handle suggestion click - submit the suggestion directly
  const handleSuggestionClick = (suggestion: string) => {
    console.log("Suggestion selected:", suggestion);

    // Set the suggestion as the input
    handleInputChange({
      target: { value: suggestion },
    } as React.ChangeEvent<HTMLInputElement>);

    // Create a simple form event and submit
    const event = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>;

    // Submit the form
    handleSubmit(event);
  };

  // Create new chat
  const handleNewChat = () => {
    createNewSession();
    clearHistory();
  };

  return (
    <div
      className={cn(
        "flex flex-col min-h-screen bg-[#0A0A0A] relative transition-all duration-300"
        // discoverSheetOpen && "md:pl-[350px]" // Add padding when sidebar is open on desktop
      )}
    >
      {/* Animated Geometric Pattern Background */}
      <GeometricDecoration variant="animated" />

      {/* Header - Fixed position with consistent blur and transition */}
      <ChatHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        // discoverSheetOpen={discoverSheetOpen}
        sessionId={sessionId}
        selectedAgent={selectedAgent}
        chatActive={chatActive}
        setAgentMarketplaceOpen={setAgentMarketplaceOpen}
        // setDiscoverSheetOpen={setDiscoverSheetOpen}
        handleNewChat={handleNewChat}
      />

      {/* Main content - Centered when empty with padding for fixed header - Mobile friendly */}
      <main
        className={`flex-1 flex flex-col ${
          !chatActive ? "justify-center" : "justify-start pt-8 sm:pt-10"
        } overflow-hidden pt-12 pb-20 sm:pb-24`}
      >
        {/* Logo and title - Only visible when chat is not active - Mobile friendly */}
        <InitialStateView
          chatActive={chatActive}
          selectedAgentId={agentState.agentId}
          handleSelectAgent={setAgentType}
          setAgentMarketplaceOpen={setAgentMarketplaceOpen}
          onSuggestionClick={handleSuggestionClick}
        />

        {/* Chat Messages - Centered container with scroll indicator - Mobile friendly */}
        <ChatMessagesView
          messages={agentMessages}
          isLoading={isLoading}
          chatActive={chatActive}
          messagesEndRef={messagesEndRef}
        />

        {/* Chat Input - Fixed at bottom with backdrop blur - Mobile friendly */}
        <ChatInputArea
          // discoverSheetOpen={discoverSheetOpen}
          selectedAgent={selectedAgent}
          chatActive={chatActive}
          setAgentMarketplaceOpen={setAgentMarketplaceOpen}
          handleSubmit={handleSubmit}
          inputRef={inputRef}
          agentInput={agentInput}
          agentHandleInputChange={handleInputChange}
          agentIsLoading={isLoading}
        />
      </main>

      {/* Command Dialog */}
      <HomeCommandDialog
        open={commandDialogOpen}
        onOpenChange={setCommandDialogOpen}
      />

      {/* Discover Sidebar */}
      {/* <DiscoverSidebar
        open={discoverSheetOpen}
        onClose={() => setDiscoverSheetOpen(false)}
        onSelectSuggestion={handleDiscoverSuggestion}
        currentLanguage={contentRegion}
        setCurrentLanguage={setContentRegion}
      /> */}

      {/* Agent Marketplace */}
      <AgentMarketplace
        open={agentMarketplaceOpen}
        onClose={() => setAgentMarketplaceOpen(false)}
        onSelectAgent={setAgentType}
        selectedAgentId={agentState.agentId}
      />
    </div>
  );
}
