"use client"

import * as React from "react"
import {
  BookIcon,
  SearchIcon,
  BookMarkedIcon,
  BrainCircuitIcon,
  LayersIcon,
  SmartphoneIcon,
  HeartIcon,
  UsersIcon,
  TrendingUpIcon,
  HomeIcon,
  DollarSignIcon,
  XIcon,
  BedIcon,
  ClockIcon,
  ShoppingBagIcon,
  MusicIcon,
  MessagesSquareIcon,
  BellIcon,
  UtensilsIcon,
  HeartPulseIcon,
  MoonIcon,
  HelpCircleIcon,
  GlobeIcon,
  CheckIcon
} from "lucide-react"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { Separator } from "~/components/ui/separator"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { REGIONS } from "~/constants/regions"

// Import JSON data
import enData from "~/data/discover/en.json"
import idData from "~/data/discover/id.json"

// Type definitions
type DiscoverData = {
  language: string;
  languageName: string;
  sections: DiscoverSection[];
}

type DiscoverSection = {
  id: string;
  title: string;
  icon: string;
  items: (CardItem | ImageCardItem | ButtonItem)[];
}

type CardItem = {
  type: "card";
  title: string;
  description: string;
  icon: string;
  query: string;
}

type ImageCardItem = {
  type: "imageCard";
  title: string;
  imageSrc: string;
  fullWidth?: boolean;
  query: string;
}

type ButtonItem = {
  type: "button";
  text: string;
  icon: string;
  query: string;
}

interface DiscoverSidebarProps {
  open: boolean
  onClose: () => void
  onSelectSuggestion: (suggestion: string) => void
  currentLanguage: string
  setCurrentLanguage: (language: string) => void
}

export function DiscoverSidebar({ open, onClose, onSelectSuggestion, currentLanguage, setCurrentLanguage }: DiscoverSidebarProps) {

  // Get the appropriate content data based on country/language code
  // id.json for Indonesia (ID), en.json for other countries
  const data = currentLanguage === "id" ? idData as unknown as DiscoverData : enData as unknown as DiscoverData;

  // Function to get icon component by name
  const getIconByName = (name: string, className: string = "h-5 w-5 text-accent") => {
    const icons: Record<string, React.ReactNode> = {
      Book: <BookIcon className={className} />,
      BookMarked: <BookMarkedIcon className={className} />,
      BrainCircuit: <BrainCircuitIcon className={className} />,
      Layers: <LayersIcon className={className} />,
      Smartphone: <SmartphoneIcon className={className} />,
      Heart: <HeartIcon className={className} />,
      Users: <UsersIcon className={className} />,
      TrendingUp: <TrendingUpIcon className={className} />,
      Home: <HomeIcon className={className} />,
      DollarSign: <DollarSignIcon className={className} />,
      Bed: <BedIcon className={className} />,
      Clock: <ClockIcon className={className} />,
      ShoppingBag: <ShoppingBagIcon className={className} />,
      Music: <MusicIcon className={className} />,
      MessagesSquare: <MessagesSquareIcon className={className} />,
      Bell: <BellIcon className={className} />,
      Utensils: <UtensilsIcon className={className} />,
      HeartPulse: <HeartPulseIcon className={className} />,
      Moon: <MoonIcon className={className} />,
      HelpCircle: <HelpCircleIcon className={className} />
    };

    return icons[name] || <SearchIcon className={className} />;
  };

  // Note: We're now using region-based content selection instead of just language selection

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[300px] sm:w-[350px] bg-[#0A0A0A] border-r border-white/10 z-40 transform transition-transform duration-300 ease-in-out overflow-hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <h2 className="text-white font-medium flex items-center gap-2">
            <div className="bg-accent/10 rounded-full p-1.5">
              <SearchIcon className="h-4 w-4 text-accent" />
            </div>
            <span className="text-base">Discover</span>
          </h2>

          <div className="flex items-center gap-2">
            {/* Region/Content Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-white/70 hover:text-white"
                >
                  <GlobeIcon className="h-4 w-4" />
                  <span className="sr-only">Select Region</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 text-white">
                {REGIONS.map(region => (
                  <DropdownMenuItem
                    key={region.code}
                    className={cn(
                      "flex items-center gap-2 cursor-pointer",
                      currentLanguage === region.code ? "bg-accent/10 text-accent" : "text-white/70"
                    )}
                    onClick={() => setCurrentLanguage(region.code)}
                  >
                    {currentLanguage === region.code && (
                      <CheckIcon className="h-4 w-4 text-accent" />
                    )}
                    <span className={currentLanguage === region.code ? "ml-0" : "ml-6"}>
                      {region.displayName}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/70 hover:text-white"
              onClick={onClose}
            >
              <XIcon className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-5 px-4 space-y-7">
          {/* Render sections from JSON data */}
          {data.sections.map((section, index) => (
            <React.Fragment key={section.id}>
              {index > 0 && <Separator className="bg-white/10 my-7" />}

              <div className="space-y-4">
                <h3 className="text-white/80 text-sm font-medium flex items-center gap-2 px-1 mb-2">
                  <div className="bg-accent/10 rounded-full p-1">
                    {getIconByName(section.icon, "h-3.5 w-3.5 text-accent")}
                  </div>
                  <span className="tracking-wide">{section.title}</span>
                </h3>

                <div className="space-y-3">
                  {section.items.map((item, itemIndex) => {
                    if (item.type === "card") {
                      return (
                        <DiscoverCard
                          key={`${section.id}-card-${itemIndex}`}
                          title={item.title}
                          description={item.description}
                          icon={getIconByName(item.icon)}
                          onClick={() => onSelectSuggestion(item.query)}
                        />
                      );
                    } else if (item.type === "imageCard") {
                      return item.fullWidth ? (
                        <DiscoverImageCard
                          key={`${section.id}-img-${itemIndex}`}
                          title={item.title}
                          imageSrc={item.imageSrc}
                          onClick={() => onSelectSuggestion(item.query)}
                          fullWidth={true}
                        />
                      ) : (
                        <div key={`${section.id}-img-${itemIndex}`} className="grid grid-cols-2 gap-3">
                          <DiscoverImageCard
                            title={item.title}
                            imageSrc={item.imageSrc}
                            onClick={() => onSelectSuggestion(item.query)}
                            fullWidth={false}
                          />
                        </div>
                      );
                    } else if (item.type === "button") {
                      return (
                        <SuggestionButton
                          key={`${section.id}-btn-${itemIndex}`}
                          text={item.text}
                          icon={getIconByName(item.icon, "h-3 w-3")}
                          onClick={() => onSelectSuggestion(item.query)}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Overlay - Only on mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  )
}

interface DiscoverCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function DiscoverCard({ title, description, icon, onClick }: DiscoverCardProps) {
  return (
    <button
      className="w-full bg-white/[0.03] hover:bg-white/[0.05] rounded-xl p-4 text-left transition-all duration-200 border border-white/5 hover:border-accent/20 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 bg-accent/10 rounded-full p-2 group-hover:bg-accent/20 transition-colors duration-200 flex items-center justify-center">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm group-hover:text-accent/90 transition-colors duration-200">{title}</h3>
          <p className="text-white/60 text-xs mt-1.5 leading-relaxed">{description}</p>
        </div>
      </div>
    </button>
  )
}

interface DiscoverImageCardProps {
  title: string
  imageSrc: string
  onClick: () => void
  fullWidth?: boolean
}

function DiscoverImageCard({ title, imageSrc, onClick, fullWidth = false }: DiscoverImageCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl aspect-square group border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer",
        fullWidth && "col-span-2 aspect-[2/1]"
      )}
      onClick={onClick}
    >
      {/* Image placeholder with gradient background - in production, you'd use a real image */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/5 z-0 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-40"
        style={{
          backgroundImage: `url(${imageSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}
        aria-label={`Image for ${title}`}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>

      {/* Text content */}
      <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
        <h3 className="text-white font-medium text-sm group-hover:text-accent/90 transition-colors duration-200">{title}</h3>
      </div>
    </div>
  )
}

interface SuggestionButtonProps {
  text: string
  icon: React.ReactNode
  onClick: () => void
}

function SuggestionButton({ text, icon, onClick }: SuggestionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start text-xs h-auto py-2.5 px-3.5 bg-white/[0.03] border-white/5 hover:bg-white/[0.05] hover:border-accent/20 text-white/80 hover:text-white transition-all duration-200"
      onClick={onClick}
    >
      <div className="bg-accent/10 rounded-full p-1 mr-2.5">
        <span className="opacity-90">{icon}</span>
      </div>
      <span className="line-clamp-1">{text}</span>
    </Button>
  )
}
