import React from 'react';
import { PlusIcon, ArrowRightIcon, ArrowLeftIcon, ArrowLeftRightIcon, ChevronDownIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface RelationshipExpandDropdownProps {
  relationshipType: string;
  direction: 'incoming' | 'outgoing' | 'both';
  onExpand: (relType: string, direction: string) => void;
}

export function RelationshipExpandDropdown({
  relationshipType,
  direction,
  onExpand
}: RelationshipExpandDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="text-xs h-7 px-2 border border-sidebar-border flex items-center gap-1"
        >
          <PlusIcon className="h-3 w-3" />
          <span>Expand</span>
          <ChevronDownIcon className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {direction !== 'incoming' && (
          <DropdownMenuItem
            onClick={() => onExpand(relationshipType, 'outgoing')}
            className="text-xs flex items-center gap-2"
          >
            <ArrowRightIcon className="h-3 w-3 text-sidebar-primary" />
            <span>Outgoing</span>
          </DropdownMenuItem>
        )}

        {direction !== 'outgoing' && (
          <DropdownMenuItem
            onClick={() => onExpand(relationshipType, 'incoming')}
            className="text-xs flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-3 w-3 text-sidebar-primary" />
            <span>Incoming</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => onExpand(relationshipType, 'both')}
          className="text-xs flex items-center gap-2"
        >
          <ArrowLeftRightIcon className="h-3 w-3 text-sidebar-primary" />
          <span>Both Directions</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
