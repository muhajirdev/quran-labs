"use client"

import * as React from "react"
import {
  SearchIcon,
  TrendingUpIcon,
  MusicIcon,
  FilmIcon,
  HeartIcon,
  BookIcon,
  CompassIcon,
  GlobeIcon,
  CheckIcon,
  ChevronDownIcon
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu"
import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"
import { REGIONS, getRegionByCode } from "~/constants/regions"

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

interface MainContentDiscoverProps {
  onSelectSuggestion: (suggestion: string) => void
  currentLanguage: string
  setCurrentLanguage?: (language: string) => void
}

export function MainContentDiscover({ onSelectSuggestion, currentLanguage, setCurrentLanguage }: MainContentDiscoverProps) {
  // Get the appropriate content data based on country/language code
  // id.json for Indonesia (ID), en.json for other countries
  const data = currentLanguage === "id" ? idData as unknown as DiscoverData : enData as unknown as DiscoverData;

  // Note: We're now using region-based content selection instead of just language selection

  // Function to get icon component by name
  const getIconByName = (name: string, className: string = "h-5 w-5 text-accent") => {
    const icons: Record<string, React.ReactNode> = {
      Book: <BookIcon className={className} />,
      Music: <MusicIcon className={className} />,
      Film: <FilmIcon className={className} />,
      Heart: <HeartIcon className={className} />,
      TrendingUp: <TrendingUpIcon className={className} />,
      Compass: <CompassIcon className={className} />
    };

    return icons[name] || <SearchIcon className={className} />;
  };

  // We'll use all sections from the data
  if (!data.sections || data.sections.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6">
      {/* Region/Content Selector - Dropdown for better scalability */}
      {setCurrentLanguage && (
        <div className="flex justify-end mb-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-lg px-3 py-1.5 text-xs font-medium border border-white/5 hover:border-accent/20 text-white/80 hover:text-white transition-colors"
              >
                <GlobeIcon className="h-3.5 w-3.5 text-accent/80" />
                <span>
                  {getRegionByCode(currentLanguage).name}
                </span>
                <ChevronDownIcon className="h-3 w-3 ml-1 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1A1A1A] border-white/10 text-white min-w-[160px]">
              {REGIONS.map(region => (
                <DropdownMenuItem
                  key={region.code}
                  className={cn(
                    "flex items-center gap-2 cursor-pointer text-xs py-2",
                    currentLanguage === region.code ? "bg-accent/10 text-accent" : "text-white/70 hover:text-white"
                  )}
                  onClick={() => setCurrentLanguage(region.code)}
                >
                  {currentLanguage === region.code && (
                    <CheckIcon className="h-3.5 w-3.5 text-accent" />
                  )}
                  <span className={currentLanguage === region.code ? "ml-0" : "ml-5.5"}>
                    {region.displayName}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Dynamic Feed Layout with all sections */}
      <div className="space-y-8">
        {/* Featured Section - First section gets special treatment */}
        {data.sections.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white/90 text-sm font-medium flex items-center gap-2">
                <div className="bg-accent/20 rounded-full p-1.5">
                  {getIconByName(data.sections[0].icon, "h-4 w-4 text-accent")}
                </div>
                <span className="tracking-wide font-semibold">{data.sections[0].title}</span>
              </h3>
              <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            </div>

            {/* Featured items with larger first item */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {data.sections[0].items.slice(0, 3).map((item, index) => {
                if (index === 0) {
                  // First item is larger and spans full width on mobile, 2 columns on desktop
                  return (
                    <div key={`featured-${index}`} className="sm:col-span-2">
                      <div className="relative overflow-hidden rounded-xl aspect-video sm:aspect-[2/1] group border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer"
                        onClick={() => onSelectSuggestion(item.query)}>
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/5 z-0 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-40"
                          style={{
                            backgroundImage: item.type === "imageCard" ? `url(${item.imageSrc})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.3
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 p-5 z-20 w-full">
                          <h3 className="text-white font-medium text-base group-hover:text-accent/90 transition-colors duration-200">
                            {item.type === "imageCard" ? item.title : item.type === "card" ? item.title : item.text}
                          </h3>
                          {item.type === "card" && (
                            <p className="text-white/60 text-xs mt-2 leading-relaxed line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        {item.type === "card" && (
                          <div className="absolute top-4 left-4 bg-accent/10 rounded-full p-2 z-20">
                            {getIconByName(item.icon, "h-5 w-5 text-accent")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                } else {
                  // Other items are smaller
                  return (
                    <div key={`featured-${index}`} className="hidden sm:block">
                      <div className="relative overflow-hidden rounded-xl aspect-square group border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer"
                        onClick={() => onSelectSuggestion(item.query)}>
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/5 z-0 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-40"
                          style={{
                            backgroundImage: item.type === "imageCard" ? `url(${item.imageSrc})` : undefined,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: 0.3
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                        <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                          <h3 className="text-white font-medium text-sm group-hover:text-accent/90 transition-colors duration-200">
                            {item.type === "imageCard" ? item.title : item.type === "card" ? item.title : item.text}
                          </h3>
                        </div>
                        {item.type === "card" && (
                          <div className="absolute top-3 left-3 bg-accent/10 rounded-full p-1.5 z-20">
                            {getIconByName(item.icon, "h-4 w-4 text-accent")}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}

        {/* Rest of the sections in alternating layouts */}
        {data.sections.slice(1).map((section, sectionIndex) => {
          const isEven = sectionIndex % 2 === 0;

          return (
            <div key={section.id} className="mb-8">
              {/* Section Header with decorative line */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white/80 text-sm font-medium flex items-center gap-2">
                  <div className="bg-accent/10 rounded-full p-1.5">
                    {getIconByName(section.icon, "h-4 w-4 text-accent")}
                  </div>
                  <span className="tracking-wide">{section.title}</span>
                </h3>
                <div className="h-px flex-1 mx-4 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              </div>

              {/* Items in alternating layouts */}
              {isEven ? (
                // Even sections: Grid layout
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {section.items.slice(0, 4).map((item, index) => {
                    if (item.type === "imageCard") {
                      return (
                        <div key={`${section.id}-img-${index}`} className={item.fullWidth ? "col-span-1 sm:col-span-2" : ""}>
                          <FeedImageCard
                            title={item.title}
                            imageSrc={item.imageSrc}
                            onClick={() => onSelectSuggestion(item.query)}
                          />
                        </div>
                      );
                    } else if (item.type === "card") {
                      return (
                        <FeedCard
                          key={`${section.id}-card-${index}`}
                          title={item.title}
                          description={item.description}
                          icon={getIconByName(item.icon)}
                          onClick={() => onSelectSuggestion(item.query)}
                        />
                      );
                    } else if (item.type === "button") {
                      return (
                        <button
                          key={`${section.id}-btn-${index}`}
                          className="flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-lg py-2.5 px-3 text-left transition-all duration-200 border border-white/5 hover:border-accent/20 group cursor-pointer"
                          onClick={() => onSelectSuggestion(item.query)}
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors duration-200">
                            {getIconByName(item.icon, "h-3 w-3 text-accent")}
                          </div>
                          <span className="text-xs text-white/80 group-hover:text-white font-medium truncate">{item.text}</span>
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : (
                // Odd sections: Horizontal scrolling cards
                <div className="relative">
                  {/* Gradient fade on edges */}
                  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0A0A0A] to-transparent z-10 pointer-events-none"></div>

                  {/* Scrollable container */}
                  <div className="flex overflow-x-auto pb-2 px-3 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <div className="flex gap-3 pl-1">
                      {section.items.map((item, index) => {
                        if (item.type === "imageCard") {
                          return (
                            <div key={`${section.id}-scroll-${index}`} className="flex-shrink-0 w-[280px]">
                              <div
                                className="relative overflow-hidden rounded-xl aspect-[2/1] group border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer"
                                onClick={() => onSelectSuggestion(item.query)}
                              >
                                <div
                                  className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent/5 z-0 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-40"
                                  style={{
                                    backgroundImage: `url(${item.imageSrc})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    opacity: 0.3
                                  }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
                                <div className="absolute bottom-0 left-0 p-4 z-20 w-full">
                                  <h3 className="text-white font-medium text-sm group-hover:text-accent/90 transition-colors duration-200">{item.title}</h3>
                                </div>
                              </div>
                            </div>
                          );
                        } else if (item.type === "card") {
                          return (
                            <div key={`${section.id}-scroll-${index}`} className="flex-shrink-0 w-[280px]">
                              <button
                                className="w-full h-full bg-white/[0.03] hover:bg-white/[0.05] rounded-xl p-4 text-left transition-all duration-200 border border-white/5 hover:border-accent/20 group cursor-pointer"
                                onClick={() => onSelectSuggestion(item.query)}
                              >
                                <div className="flex items-start gap-3.5">
                                  <div className="mt-0.5 bg-accent/10 rounded-full p-2 group-hover:bg-accent/20 transition-colors duration-200 flex items-center justify-center">
                                    {getIconByName(item.icon)}
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-white font-medium text-sm group-hover:text-accent/90 transition-colors duration-200">{item.title}</h3>
                                    <p className="text-white/60 text-xs mt-1.5 leading-relaxed line-clamp-2">{item.description}</p>
                                  </div>
                                </div>
                              </button>
                            </div>
                          );
                        } else if (item.type === "button") {
                          return (
                            <div key={`${section.id}-scroll-${index}`} className="flex-shrink-0">
                              <button
                                className="h-full flex items-center gap-2 bg-white/[0.03] hover:bg-white/[0.05] rounded-lg py-2.5 px-3 text-left transition-all duration-200 border border-white/5 hover:border-accent/20 group cursor-pointer whitespace-nowrap"
                                onClick={() => onSelectSuggestion(item.query)}
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center transition-colors duration-200">
                                  {getIconByName(item.icon, "h-3 w-3 text-accent")}
                                </div>
                                <span className="text-xs text-white/80 group-hover:text-white font-medium">{item.text}</span>
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Feed Card Components
interface FeedCardProps {
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function FeedCard({ title, description, icon, onClick }: FeedCardProps) {
  return (
    <button
      className="w-full bg-white/[0.03] hover:bg-white/[0.05] rounded-xl p-4 text-left transition-all duration-200 border border-white/5 hover:border-accent/20 group cursor-pointer"
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

interface FeedImageCardProps {
  title: string
  imageSrc: string
  onClick: () => void
}

function FeedImageCard({ title, imageSrc, onClick }: FeedImageCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl aspect-[2/1] group border border-white/5 hover:border-accent/20 transition-all duration-200 cursor-pointer"
      )}
      onClick={onClick}
    >
      {/* Image placeholder with gradient background */}
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
