import { useState } from 'react';
import type { SchemaData } from '~/components/data-explorer/types';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';
import { Switch } from '~/components/ui/switch';
import { Label } from '~/components/ui/label';

export interface NodeLabelConfig {
  [nodeType: string]: string; // Maps node type to property name to display
}

export interface RelationshipLabelConfig {
  [relType: string]: string; // Maps relationship type to property name to display
}

export interface GraphSettingsProps {
  settings: {
    showRelationshipLabels: boolean;
    showNodeLabels: boolean;
    showRelationshipDirections: boolean;
    use3D: boolean;
    darkMode: boolean;
    nodeSize: number;
    linkWidth: number;
    nodeLabelProperty: NodeLabelConfig;
    relationshipLabelProperty: RelationshipLabelConfig;
  };
  schema: SchemaData | null;
  onSettingsChange: (settings: any) => void;
}

export function GraphSettingsPopover({ settings, schema, onSettingsChange }: GraphSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleNodeLabelChange = (nodeType: string, propertyName: string) => {
    const newNodeLabelProperty = {
      ...localSettings.nodeLabelProperty,
      [nodeType]: propertyName
    };

    const newSettings = {
      ...localSettings,
      nodeLabelProperty: newNodeLabelProperty
    };

    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const handleRelationshipLabelChange = (relType: string, propertyName: string) => {
    const newRelationshipLabelProperty = {
      ...localSettings.relationshipLabelProperty,
      [relType]: propertyName
    };

    const newSettings = {
      ...localSettings,
      relationshipLabelProperty: newRelationshipLabelProperty
    };

    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const [activeTab, setActiveTab] = useState<'general' | 'nodeLabels' | 'relationshipLabels'>('general');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-primary hover:text-primary/80 flex items-center"
          title="Graph Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] max-h-[80vh] overflow-y-auto p-4 border-border" align="center">
        <h3 className="font-semibold text-foreground mb-4">Graph Settings</h3>

        {/* Custom Tabs */}
        <div className="flex border-b border-border mb-4">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'general' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'nodeLabels' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('nodeLabels')}
          >
            Node Labels
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeTab === 'relationshipLabels' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('relationshipLabels')}
          >
            Relationship Labels
          </button>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-4">
            {/* Toggle switches */}
            <div className="flex items-center justify-between">
              <Label htmlFor="showRelationshipLabels" className="text-sm font-medium text-foreground">
                Show Relationship Labels
              </Label>
              <Switch
                id="showRelationshipLabels"
                checked={localSettings.showRelationshipLabels}
                onCheckedChange={(checked) => handleChange('showRelationshipLabels', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showRelationshipDirections" className="text-sm font-medium text-foreground">
                Show Relationship Directions
              </Label>
              <Switch
                id="showRelationshipDirections"
                checked={localSettings.showRelationshipDirections}
                onCheckedChange={(checked) => handleChange('showRelationshipDirections', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showNodeLabels" className="text-sm font-medium text-foreground">
                Show Node Labels
              </Label>
              <Switch
                id="showNodeLabels"
                checked={localSettings.showNodeLabels}
                onCheckedChange={(checked) => handleChange('showNodeLabels', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="text-sm font-medium text-foreground">
                Dark Mode
              </Label>
              <Switch
                id="darkMode"
                checked={localSettings.darkMode}
                onCheckedChange={(checked) => handleChange('darkMode', checked)}
              />
            </div>

            {/* Sliders */}
            <div className="space-y-2">
              <Label htmlFor="nodeSize" className="text-sm font-medium text-foreground block">
                Node Size: {localSettings.nodeSize}
              </Label>
              <input
                type="range"
                id="nodeSize"
                min="1"
                max="10"
                step="1"
                value={localSettings.nodeSize}
                onChange={(e) => handleChange('nodeSize', parseInt(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkWidth" className="text-sm font-medium text-foreground block">
                Link Width: {localSettings.linkWidth}
              </Label>
              <input
                type="range"
                id="linkWidth"
                min="0.5"
                max="3"
                step="0.5"
                value={localSettings.linkWidth}
                onChange={(e) => handleChange('linkWidth', parseFloat(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>
        )}

        {/* Node Label Settings Tab */}
        {activeTab === 'nodeLabels' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Select which property to display as the label for each node type:
            </p>

            {schema?.nodeTables.map(nodeTable => {
              const nodeType = nodeTable.name;
              const currentProperty = localSettings.nodeLabelProperty[nodeType] || 'default';

              return (
                <div key={nodeType} className="border border-border rounded-lg p-3 bg-secondary/10">
                  <h4 className="font-medium text-foreground mb-2">{nodeType}</h4>
                  <select
                    value={currentProperty}
                    onChange={(e) => handleNodeLabelChange(nodeType, e.target.value)}
                    className="block w-full p-2 border border-border rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="default">Default (Auto)</option>
                    {nodeTable.properties.map(prop => (
                      <option key={prop.name} value={prop.name}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            {(!schema || schema.nodeTables.length === 0) && (
              <div className="text-muted-foreground italic text-sm">
                No node types available in schema
              </div>
            )}
          </div>
        )}

        {/* Relationship Label Settings Tab */}
        {activeTab === 'relationshipLabels' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Select which property to display as the label for each relationship type:
            </p>

            {schema?.relTables.map(relTable => {
              const relType = relTable.name;
              const currentProperty = localSettings.relationshipLabelProperty[relType] || 'default';

              return (
                <div key={relType} className="border border-border rounded-lg p-3 bg-secondary/10">
                  <h4 className="font-medium text-foreground mb-2">{relType}</h4>
                  <select
                    value={currentProperty}
                    onChange={(e) => handleRelationshipLabelChange(relType, e.target.value)}
                    className="block w-full p-2 border border-border rounded-md text-sm bg-background text-foreground"
                  >
                    <option value="default">Default (Type Name)</option>
                    {relTable.properties.map(prop => (
                      <option key={prop.name} value={prop.name}>
                        {prop.name}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}

            {(!schema || schema.relTables.length === 0) && (
              <div className="text-muted-foreground italic text-sm">
                No relationship types available in schema
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
