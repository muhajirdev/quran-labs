/**
 * Constants for region-based content selection
 */

// Region codes used for content selection
export const REGION_CODES = {
  INTERNATIONAL: 'en',
  INDONESIA: 'id',
  // Add more regions here as they become available
};

// Region information with display names
export const REGIONS = [
  { 
    code: REGION_CODES.INTERNATIONAL, 
    name: 'International',
    displayName: 'International (English)',
    countryCode: null, // Default for all countries not specifically mapped
  },
  { 
    code: REGION_CODES.INDONESIA, 
    name: 'Indonesia',
    displayName: 'Indonesia (Bahasa)',
    countryCode: 'ID',
  },
  // Add more regions here as they become available
];

/**
 * Get the appropriate region code based on country code
 * @param countryCode - The two-letter country code (e.g., 'ID' for Indonesia)
 * @returns The region code to use for content selection
 */
export function getRegionCodeFromCountry(countryCode?: string): string {
  if (!countryCode) return REGION_CODES.INTERNATIONAL;
  
  // Find the region that matches the country code
  const region = REGIONS.find(r => r.countryCode === countryCode);
  
  // Return the matching region code or default to international
  return region?.code || REGION_CODES.INTERNATIONAL;
}

/**
 * Get region information by code
 * @param code - The region code
 * @returns The region information object
 */
export function getRegionByCode(code: string) {
  return REGIONS.find(r => r.code === code) || REGIONS[0]; // Default to international
}
