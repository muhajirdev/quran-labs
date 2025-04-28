import { useState } from 'react';
import type { SchemaData } from '~/components/data-explorer/types';

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
    use3D: boolean;
    darkMode: boolean;
    nodeSize: number;
    linkWidth: number;
    nodeLabelProperty: NodeLabelConfig;
    relationshipLabelProperty: RelationshipLabelConfig;
  };
  schema: SchemaData | null;
  onSettingsChange: (settings: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function GraphSettings({ settings, schema, onSettingsChange, isOpen, onClose }: GraphSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [activeTab, setActiveTab] = useState<'general' | 'nodeLabels' | 'relationshipLabels'>('general');

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

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 right-0 bg-white border border-gray-300 shadow-lg rounded-lg p-4 m-4 z-10 w-96 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Graph Settings</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'general' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'nodeLabels' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('nodeLabels')}
        >
          Node Labels
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'relationshipLabels' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
            <label htmlFor="showRelationshipLabels" className="text-sm font-medium text-gray-700">
              Show Relationship Labels
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="showRelationshipLabels"
                checked={localSettings.showRelationshipLabels}
                onChange={(e) => handleChange('showRelationshipLabels', e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${localSettings.showRelationshipLabels ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${localSettings.showRelationshipLabels ? 'translate-x-4' : ''}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="showNodeLabels" className="text-sm font-medium text-gray-700">
              Show Node Labels
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="showNodeLabels"
                checked={localSettings.showNodeLabels}
                onChange={(e) => handleChange('showNodeLabels', e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${localSettings.showNodeLabels ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${localSettings.showNodeLabels ? 'translate-x-4' : ''}`}></div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="darkMode" className="text-sm font-medium text-gray-700">
              Dark Mode
            </label>
            <div className="relative inline-block w-10 mr-2 align-middle select-none">
              <input
                type="checkbox"
                id="darkMode"
                checked={localSettings.darkMode}
                onChange={(e) => handleChange('darkMode', e.target.checked)}
                className="sr-only"
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${localSettings.darkMode ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform transform ${localSettings.darkMode ? 'translate-x-4' : ''}`}></div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-2">
            <label htmlFor="nodeSize" className="text-sm font-medium text-gray-700 block">
              Node Size: {localSettings.nodeSize}
            </label>
            <input
              type="range"
              id="nodeSize"
              min="1"
              max="10"
              step="1"
              value={localSettings.nodeSize}
              onChange={(e) => handleChange('nodeSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="linkWidth" className="text-sm font-medium text-gray-700 block">
              Link Width: {localSettings.linkWidth}
            </label>
            <input
              type="range"
              id="linkWidth"
              min="0.5"
              max="3"
              step="0.5"
              value={localSettings.linkWidth}
              onChange={(e) => handleChange('linkWidth', parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* Node Label Settings Tab */}
      {activeTab === 'nodeLabels' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            Select which property to display as the label for each node type:
          </p>

          {schema?.nodeTables.map(nodeTable => {
            const nodeType = nodeTable.name;
            const currentProperty = localSettings.nodeLabelProperty[nodeType] || 'default';

            return (
              <div key={nodeType} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">{nodeType}</h4>
                <select
                  value={currentProperty}
                  onChange={(e) => handleNodeLabelChange(nodeType, e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md text-sm"
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
            <div className="text-gray-500 italic text-sm">
              No node types available in schema
            </div>
          )}
        </div>
      )}

      {/* Relationship Label Settings Tab */}
      {activeTab === 'relationshipLabels' && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 mb-2">
            Select which property to display as the label for each relationship type:
          </p>

          {schema?.relTables.map(relTable => {
            const relType = relTable.name;
            const currentProperty = localSettings.relationshipLabelProperty[relType] || 'default';

            return (
              <div key={relType} className="border border-gray-200 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2">{relType}</h4>
                <select
                  value={currentProperty}
                  onChange={(e) => handleRelationshipLabelChange(relType, e.target.value)}
                  className="block w-full p-2 border border-gray-300 rounded-md text-sm"
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
            <div className="text-gray-500 italic text-sm">
              No relationship types available in schema
            </div>
          )}
        </div>
      )}
    </div>
  );
}
