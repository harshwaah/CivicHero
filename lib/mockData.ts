/**
 * CivicHero Centralized Mock Data
 * Separated issues, timelines, comments, user profiles, notifications, categories, and templates.
 */

export interface PresetOption {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  urgency: string;
  imageUrl: string;
  aiSummary: string;
  confidence: number;
  categoryMatch: string;
  severityMatch: string;
  routingTo: string;
}

export const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'preset-pothole',
    title: 'Large expanding pothole in center lane',
    description: 'A deep, widening pothole has formed in the middle of the road. It is causing vehicles to swerve suddenly, which is extremely dangerous, especially for bicycles and motorcycles.',
    location: 'Linking Road, Bandra West, Mumbai',
    category: 'Roads',
    urgency: 'High',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Computer vision analysis confirms road surface cavitation. Deep crater measures ~35cm in diameter posing a structural tire hazard. Proximity to Bandra school bus route increases risk.',
    confidence: 96,
    categoryMatch: 'Road Surface Defect',
    severityMatch: 'High Priority Response',
    routingTo: 'BMC - Road Maintenance Division'
  },
  {
    id: 'preset-tree',
    title: 'Collapsed tree limb blocking sidewalk',
    description: 'A massive branch from an old banyan tree has broken off and is completely blocking the sidewalk and bike lane. Pedestrians have to step into the street to get around it.',
    location: 'Dadar TT Circle, Dadar, Mumbai',
    category: 'Roads',
    urgency: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Large tree branch collapsed across pedestrian walkway. Blocks transit flow. Forwarded to municipal tree authority.',
    confidence: 92,
    categoryMatch: 'Debris & Tree Fall',
    severityMatch: 'Medium Priority Response',
    routingTo: 'BMC - Gardens & Trees Dept'
  },
  {
    id: 'preset-water',
    title: 'Water main spraying onto walkway',
    description: 'Water is bubbling up rapidly from under the sidewalk pavement, creating a mini geyser and flooding the pedestrian walkway. Water is starting to flow into adjacent shops.',
    location: 'Powai Lake Promenade, Powai, Mumbai',
    category: 'Water',
    urgency: 'Critical',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'High pressure hydraulic rupture creating sidewalk flooding. Liquid is clean water, indicative of municipal water distribution line break. Critical priority dispatched.',
    confidence: 98,
    categoryMatch: 'Water Main Rupture',
    severityMatch: 'Critical Priority Response',
    routingTo: 'Hydraulic Engineering Dept (Mumbai)'
  },
  {
    id: 'preset-streetlight',
    title: 'Broken streetlight lamp post',
    description: 'The streetlight post at the junction is completely dead. The entire intersection is pitch black at night, making it unsafe for pedestrians and commuters.',
    location: 'SV Road, Andheri West, Mumbai',
    category: 'Utilities',
    urgency: 'Low',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Complete blackout of street lighting fixture. Corresponds with local utility node circuit failure. Routed to grid operations for repair.',
    confidence: 94,
    categoryMatch: 'Street Lighting Utility',
    severityMatch: 'Low Priority Response',
    routingTo: 'Electrical & Power Supply Dept'
  },
  {
    id: 'preset-trash',
    title: 'Overflowing community garbage bin',
    description: 'The public waste bins are overflowing with trash bags, loose plastics, and packaging. Wind is spreading litter across the footpath and towards the storm drain.',
    location: 'Bandra Kurla Complex (BKC), Mumbai',
    category: 'Environment',
    urgency: 'Medium',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=640&q=80',
    aiSummary: 'Public street waste receptacle overflow. Loose plastics spreading into public storm drain. Recommended solid waste management collector redirect.',
    confidence: 89,
    categoryMatch: 'Sanitation / Waste Management',
    severityMatch: 'Medium Priority Response',
    routingTo: 'Solid Waste Management (SWM) Dept'
  }
];

export const CATEGORIES = ['Roads', 'Utilities', 'Water', 'Safety', 'Environment', 'Animals'];

export const URGENCY_LEVELS = ['Low', 'Medium', 'High', 'Critical'];

export const ALL_STAGES_MOCK = [
  { id: 'reported', label: 'Reported', iconName: 'AlertCircle', color: 'bg-blue-500 text-white', ringColor: 'ring-blue-100' },
  { id: 'ai_categorized', label: 'AI Categorized', iconName: 'Sparkles', color: 'bg-amber-500 text-white', ringColor: 'ring-amber-100' },
  { id: 'community_verified', label: 'Community Verified', iconName: 'Users', color: 'bg-purple-500 text-white', ringColor: 'ring-purple-100' },
  { id: 'assigned', label: 'Assigned to Dept', iconName: 'Truck', color: 'bg-indigo-500 text-white', ringColor: 'ring-indigo-100' },
  { id: 'work_started', label: 'Work Started', iconName: 'Wrench', color: 'bg-orange-500 text-white', ringColor: 'ring-orange-100' },
  { id: 'repair_completed', label: 'Repair Complete', iconName: 'CheckCircle', color: 'bg-emerald-500 text-white', ringColor: 'ring-emerald-100' },
  { id: 'community_confirmation', label: 'Community Confirmation', iconName: 'BadgeCheck', color: 'bg-teal-500 text-white', ringColor: 'ring-teal-100' },
  { id: 'closed', label: 'Closed & Sealed', iconName: 'FileText', color: 'bg-slate-600 text-white', ringColor: 'ring-slate-200' },
];
