import { Issue } from './models';
import { allBackupIssues } from './backupData';

export const mockReports: Issue[] = allBackupIssues && allBackupIssues.length > 0 ? allBackupIssues : [
  {
    id: 'report-1',
    title: 'Downtown High-Rise: Smoke Detected',
    description: 'Fire units responding to multiple reports of smoke on 12th floor. Citizens are advised to bypass Broadway. No injuries reported.',
    location: '5th Ave & Broadway',
    distance: '1.2 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=640&q=80',
    timestamp: '2 mins ago',
    category: 'Safety',
    urgency: 'Critical',
    status: 'Live',
    upvotes: 184,
    verifiedByCount: 52,
    reporter: {
      name: 'Marcus J.',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Active Watcher'
    },
    aiSummary: {
      summary: 'Sensors and visual evidence confirm smoke plumes emanating from the mid-level floors. Platoon 4 dispatched. Traffic detours in place.',
      confidence: 97,
      categoryMatch: 'Emergency / Fire Safety',
      severityMatch: 'Critical Priority 1',
      routingTo: 'Metro Fire Department • Platoon 4'
    },
    verificationStats: {
      confirmCount: 41,
      alreadyFixedCount: 0,
      notFoundCount: 1,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Initial Smoke Alarm & Citizen Reports',
        timestamp: 'Today, 03:48 PM',
        actor: 'Citizen Marcus J. & IoT Grid',
        description: 'Multiple automated building sensors and street cameras flagged heavy aerosol particulates. Marcus J. submitted photographic confirmation through the portal.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'CivicHero AI Automated Dispatching',
        timestamp: 'Today, 03:48 PM',
        actor: 'CivicHero AI Engine',
        description: 'Visual classification evaluated report confidence at 97%. Categorized as Emergency Fire Incident. Automatically routed dispatch request to central fire command.',
        status: 'Completed'
      },
      {
        id: 't3',
        type: 'community_verified',
        title: 'Community Safety Broadcast Active',
        timestamp: 'Today, 03:49 PM',
        actor: 'CivicHero Portal Network',
        description: 'Visual telemetry is actively broadcasted to 184 nearby devices. Live stream routing initiated.',
        status: 'Active'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Chief Robert Miller',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=100&h=100&q=80',
          isOfficial: true,
          badge: 'Fire Chief'
        },
        timestamp: '1 min ago',
        text: 'Platoon 4 is on-site. The fire is localized to the commercial kitchen of the 12th-floor restaurant. Smoke venting systems are active. Please keep the street clear.',
        likesCount: 84
      },
      {
        id: 'c2',
        user: {
          name: 'Sarah Jenkins',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Local Resident'
        },
        timestamp: '5 mins ago',
        text: 'I can hear sirens from blocks away. Thank you for the rapid update, the map showed us which detour to take to avoid the block entirely!',
        likesCount: 12
      }
    ],
    relatedIssues: ['report-5']
  },
  {
    id: 'report-2',
    title: 'Tree blocking Southbound Lane',
    description: 'Cloverdale Rd. Expect heavy delays near the suspension bridge. Municipal maintenance crews notified and dispatched.',
    location: 'Cloverdale Rd.',
    distance: '0.5 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=640&q=80',
    timestamp: '15 mins ago',
    category: 'Roads',
    urgency: 'High',
    status: 'Reported',
    upvotes: 42,
    verifiedByCount: 18,
    reporter: {
      name: 'David K.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Civic Guard'
    },
    aiSummary: {
      summary: 'Large deciduous tree branch collapsed across southbound lanes. Blocks traffic flow. High risk of secondary motor accidents.',
      confidence: 94,
      categoryMatch: 'Debris Removal / Obstruction',
      severityMatch: 'High Priority 2',
      routingTo: 'Public Works - Forestry Division'
    },
    verificationStats: {
      confirmCount: 18,
      alreadyFixedCount: 0,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Debris Report Filed',
        timestamp: 'Today, 03:02 PM',
        actor: 'Citizen David K.',
        description: 'Reported large structural limb falling from municipal reserve forest directly across Cloverdale Road.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Debris & Tree Fall Categorized',
        timestamp: 'Today, 03:03 PM',
        actor: 'CivicHero AI Engine',
        description: 'Identified deciduous tree limb blocking more than 50% of the active lane. Marked as High Priority and routed to Public Works Forestry Division.',
        status: 'Completed'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Claire Vance',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Commuter'
        },
        timestamp: '10 mins ago',
        text: 'Cars are swerving to get around it! It is just past the blind curve, so please slow down as you approach the suspension bridge.',
        likesCount: 15
      }
    ],
    relatedIssues: ['report-4']
  },
  {
    id: 'report-3',
    title: 'Gas Leak Investigation Complete',
    description: 'Upper West Side. Commercial buildings cleared for safe citizen re-entry. All safety protocols successfully completed by regional utility engineers.',
    location: 'Upper West Side',
    distance: '3.1 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=640&q=80',
    timestamp: '34 mins ago',
    category: 'Utilities',
    urgency: 'Critical',
    status: 'Resolved',
    upvotes: 96,
    verifiedByCount: 48,
    reporter: {
      name: 'Alex Rivera',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Verified Citizen'
    },
    aiSummary: {
      summary: 'Report of volatile organic compounds and distinct mercaptan odors near commercial sector. Utility valve safety trip completed.',
      confidence: 99,
      categoryMatch: 'Hazardous Materials / Utilities',
      severityMatch: 'Critical Priority 1',
      routingTo: 'Pacific Gas & Utility Response'
    },
    verificationStats: {
      confirmCount: 48,
      alreadyFixedCount: 52,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Methane Odor Alert',
        timestamp: 'Yesterday, 02:15 PM',
        actor: 'Citizen Alex Rivera',
        description: 'Reported heavy rotten-egg aroma around commercial shops on 42nd Ave.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Critical Utility Incident Triggered',
        timestamp: 'Yesterday, 02:16 PM',
        actor: 'CivicHero AI Engine',
        description: 'Classified as hazardous gas leak. Automated SMS blast dispatched to surrounding property managers within 500 meters.',
        status: 'Completed'
      },
      {
        id: 't3',
        type: 'community_verified',
        title: 'Emergency Area Polled & Verified',
        timestamp: 'Yesterday, 02:22 PM',
        actor: 'Local Community Grid',
        description: '14 neighbors confirmed the distinct gas odor. Community state moved to Confirmed Threat.',
        status: 'Completed'
      },
      {
        id: 't4',
        type: 'assigned',
        title: 'Utility Response Division Dispatched',
        timestamp: 'Yesterday, 02:30 PM',
        actor: 'PG&E Emergency Response',
        description: 'Assigned Senior Engineer team #12 for immediate gas main shutoff and sniffer verification.',
        status: 'Completed'
      },
      {
        id: 't5',
        type: 'work_started',
        title: 'On-Site Venting & Main Replacement',
        timestamp: 'Yesterday, 03:00 PM',
        actor: 'PG&E Crew Team 12',
        description: 'Excavated faulty pressure-regulator diaphragm, replaced with standard ANSI class steel valve core.',
        status: 'Completed'
      },
      {
        id: 't6',
        type: 'repair_completed',
        title: 'Pressure Testing & Sensor Verification',
        timestamp: 'Today, 10:15 AM',
        actor: 'Municipal Safety Office',
        description: 'All atmospheric sniffer sensors recorded safe zero-ppm levels. Utility lines holding normal static operating pressures.',
        status: 'Completed'
      },
      {
        id: 't7',
        type: 'community_confirmation',
        title: 'Community Air Quality Confirmation',
        timestamp: 'Today, 11:30 AM',
        actor: 'Verified Neighbors',
        description: 'Local store owners confirmed the mercaptan smell was completely gone. Re-entry greenlit.',
        status: 'Completed'
      },
      {
        id: 't8',
        type: 'closed',
        title: 'Incident Resolved & Closed',
        timestamp: 'Today, 03:10 PM',
        actor: 'Civic Safety Commission',
        description: 'Permanent repairs certified. Project file sealed with digital blockchain hash.',
        status: 'Completed'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Manager Dave',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Bakery Owner'
        },
        timestamp: '2 hrs ago',
        text: 'The crew was absolutely professional. We were cleared to open our doors at noon, and customers are already back. Extremely relieved!',
        likesCount: 22
      },
      {
        id: 'c2',
        user: {
          name: 'Engineering Supervisor',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=100&h=100&q=80',
          isOfficial: true,
          badge: 'Lead Utility Inspector'
        },
        timestamp: '3 hrs ago',
        text: 'Official Report: Replaced 2-inch joint sleeve with high-grade carbon steel. Verified seal integrity using dual-phase ultrasonic tests. Air is fully safe.',
        likesCount: 31
      }
    ],
    relatedIssues: ['report-6']
  },
  {
    id: 'report-4',
    title: 'Large pothole near school entrance',
    description: 'Major tire hazard directly in front of Oakwood Primary main pickup gate. Temporary sandbags placed; paving team scheduled for 2 PM.',
    location: 'Oakwood Ave.',
    distance: '0.8 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?auto=format&fit=crop&w=640&q=80',
    timestamp: '1 hr ago',
    category: 'Roads',
    urgency: 'High',
    status: 'In Progress',
    upvotes: 29,
    verifiedByCount: 14,
    reporter: {
      name: 'Marcus Chen',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Verified Citizen'
    },
    aiSummary: {
      summary: 'A deep cavity posing high risk to commuters. Analysis of visual evidence suggests a 15cm depth, potentially affecting tire integrity. Priority expedited based on school-bus route proximity.',
      confidence: 98,
      categoryMatch: 'Road Surface Defect',
      severityMatch: 'High Priority 2',
      routingTo: 'Public Works - Road Maintenance'
    },
    verificationStats: {
      confirmCount: 24,
      alreadyFixedCount: 0,
      notFoundCount: 0,
      spamCount: 1
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Issue Reported',
        timestamp: 'Today, 09:12 AM',
        actor: 'Citizen Marcus Chen',
        description: 'Initial report submitted via CivicHero Mobile by Marcus C.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'AI Categorized',
        timestamp: 'Today, 09:13 AM',
        actor: 'CivicHero AI Engine',
        description: 'Analyzed visual evidence: detected 15cm deep pothole. Escalated priority due to proximity to Oakwood Primary school bus lane.',
        status: 'Completed'
      },
      {
        id: 't3',
        type: 'community_verified',
        title: 'Community Verified',
        timestamp: 'Today, 10:20 AM',
        actor: 'Verified Neighbors',
        description: '14 neighbors confirmed the issue remains active. Priority upgraded to Critical for dispatch scheduling.',
        status: 'Completed'
      },
      {
        id: 't4',
        type: 'assigned',
        title: 'Inspection Team Dispatched',
        timestamp: 'Today, 10:45 AM',
        actor: 'Public Works Unit #402',
        description: 'Public Works unit #402 has been assigned to assess structural integrity and execute safety cold-patching.',
        status: 'Completed'
      },
      {
        id: 't5',
        type: 'work_started',
        title: 'Repair Work Started',
        timestamp: 'Today, 02:00 PM',
        actor: 'Public Works Asphalt Team',
        description: 'Asphalt truck on site. Surface cleaning and hot-mix edge preparation in active progress.',
        status: 'Active'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Marcus Chen',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Report Owner'
        },
        timestamp: '3 hrs ago',
        text: 'I almost hit this on my bike this morning. It’s getting much wider after the rain last night. Glad to see the repair team already out here!',
        likesCount: 18
      },
      {
        id: 'c2',
        user: {
          name: 'Principal Davis',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'School Staff'
        },
        timestamp: '1 hr ago',
        text: 'The cones are helping direct traffic around it during student pickup. Thank you public works for jumping on this so quickly!',
        likesCount: 25
      }
    ],
    relatedIssues: ['report-8']
  },
  {
    id: 'report-5',
    title: 'Water main rupture affecting footpath',
    description: 'High-pressure stream spraying onto the main walkway, creating erosion and slippery hazards. Water valves being shut off by city teams.',
    location: 'Pine Crest Dr.',
    distance: '1.5 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=640&q=80',
    timestamp: '2 hrs ago',
    category: 'Water',
    urgency: 'Medium',
    status: 'Reported',
    upvotes: 15,
    verifiedByCount: 4,
    reporter: {
      name: 'Elena R.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Active Reporter'
    },
    aiSummary: {
      summary: 'Underground hydraulic rupture creating surface spring. Liquid is clean water, indicative of potable distribution line break.',
      confidence: 91,
      categoryMatch: 'Water Main Break',
      severityMatch: 'Medium Priority 3',
      routingTo: 'Municipal Water & Sewerage'
    },
    verificationStats: {
      confirmCount: 8,
      alreadyFixedCount: 0,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Pavement Geyser Reported',
        timestamp: 'Today, 01:30 PM',
        actor: 'Citizen Elena R.',
        description: 'Water spraying 3 feet high from side expansion joint on Pine Crest pedestrian sidewalk.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Hydraulic Rupture Classification',
        timestamp: 'Today, 01:35 PM',
        actor: 'CivicHero AI Engine',
        description: 'Categorized under Potable Water Distribution System. Forwarded high-priority ticketing request to municipal water grid supervisor.',
        status: 'Completed'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'James O.',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Neighbor'
        },
        timestamp: '1 hr ago',
        text: 'The water pressure on my upstairs shower dropped dramatically just as this started. Looks like they closed the feeder valve now because the spraying stopped.',
        likesCount: 9
      }
    ],
    relatedIssues: ['report-1']
  },
  {
    id: 'report-6',
    title: 'Broken high-mast streetlight',
    description: 'Sub-station circuit breaker failure left segment of Elm street completely dark. Maintenance crews swapped the smart LED controller.',
    location: 'Elm St & 4th',
    distance: '0.2 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80',
    timestamp: '4 hrs ago',
    category: 'Utilities',
    urgency: 'Low',
    status: 'Resolved',
    upvotes: 8,
    verifiedByCount: 14,
    reporter: {
      name: 'Tim O.',
      avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Local Resident'
    },
    aiSummary: {
      summary: 'Complete blackout of smart lighting terminal #903. Corresponds with substation grid line transient breaker trip.',
      confidence: 96,
      categoryMatch: 'Street Lighting Utility',
      severityMatch: 'Low Priority 4',
      routingTo: 'Smart Grid & Lighting Division'
    },
    verificationStats: {
      confirmCount: 14,
      alreadyFixedCount: 18,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Lighting Segment Blackout reported',
        timestamp: 'Yesterday, 08:30 PM',
        actor: 'Citizen Tim O.',
        description: 'Reported total failure of four streetlights on Elm and 4th block.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Smart Node Failure Categorized',
        timestamp: 'Yesterday, 08:31 PM',
        actor: 'CivicHero AI Engine',
        description: 'Correlated with smart meter voltage diagnostics. Determined controller subassembly board failure.',
        status: 'Completed'
      },
      {
        id: 't3',
        type: 'assigned',
        title: 'Maintenance Fleet Scheduled',
        timestamp: 'Today, 07:00 AM',
        actor: 'Grid Operations Depot',
        description: 'Assigned Truck #9 for replacement circuit board installation.',
        status: 'Completed'
      },
      {
        id: 't4',
        type: 'work_started',
        title: 'Microcontroller Swap Active',
        timestamp: 'Today, 08:15 AM',
        actor: 'Smart Grid Tech Crew',
        description: 'Replaced the fried controller card with weather-sealed Zigbee smart-mast chip.',
        status: 'Completed'
      },
      {
        id: 't5',
        type: 'repair_completed',
        title: 'Lux Sensor Validation',
        timestamp: 'Today, 09:30 AM',
        actor: 'Operations Center',
        description: 'Over-the-air system diagnostic test successful. Node response is healthy.',
        status: 'Completed'
      },
      {
        id: 't6',
        type: 'closed',
        title: 'Completed & Verified',
        timestamp: 'Today, 11:00 AM',
        actor: 'Public Utilities Commission',
        description: 'Issue flagged resolved. Street lamp reported functional by adjacent properties.',
        status: 'Completed'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Tim O.',
          avatar: 'https://images.unsplash.com/photo-1500048993953-d23a436266cf?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Report Creator'
        },
        timestamp: '2 hrs ago',
        text: 'The block is bright and feels much safer again. Unbelievably fast response for a non-critical utility issue!',
        likesCount: 6
      }
    ],
    relatedIssues: ['report-3']
  },
  {
    id: 'report-7',
    title: 'Overflowing garbage collection point',
    description: 'Multiple bins at capacity, waste spilling onto pedestrian boulevard. Route collector notified for expedited pickup.',
    location: 'Civic Plaza Boulevard',
    distance: '2.2 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=640&q=80',
    timestamp: '6 hrs ago',
    category: 'Environment',
    urgency: 'Medium',
    status: 'Reported',
    upvotes: 19,
    verifiedByCount: 5,
    reporter: {
      name: 'Jessica W.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Eco Advocate'
    },
    aiSummary: {
      summary: 'Public street waste receptacle overflow. Loose plastics spreading into public storm drain due to wind.',
      confidence: 88,
      categoryMatch: 'Sanitation / Waste Management',
      severityMatch: 'Medium Priority 3',
      routingTo: 'Sanitation Division - Central Route'
    },
    verificationStats: {
      confirmCount: 5,
      alreadyFixedCount: 0,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Waste Overflow Reported',
        timestamp: 'Today, 09:30 AM',
        actor: 'Citizen Jessica W.',
        description: 'Reported central plaza smart-bin exceeding structural capacity with lid unable to close.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Sanitation Routing Completed',
        timestamp: 'Today, 09:32 AM',
        actor: 'CivicHero AI Engine',
        description: 'Flagged sanitation route #14 truck dispatcher for dynamic collection redirect.',
        status: 'Completed'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Plaza Coffee Shop',
          avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Business Owner'
        },
        timestamp: '4 hrs ago',
        text: 'The wind is blowing the bags all over our outdoor dining area. Hope the truck can swing by soon!',
        likesCount: 14
      }
    ],
    relatedIssues: []
  },
  {
    id: 'report-8',
    title: 'Damaged school pedestrian crossing',
    description: 'Reflective crossing lights and paint significantly faded. Thermal painting machine in operation on-site to restore high-visibility borders.',
    location: 'Maple Expressway',
    distance: '1.9 miles away',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=640&q=80',
    timestamp: '12 hrs ago',
    category: 'Roads',
    urgency: 'High',
    status: 'In Progress',
    upvotes: 33,
    verifiedByCount: 15,
    reporter: {
      name: 'Oliver G.',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80',
      badge: 'Parent Patrol'
    },
    aiSummary: {
      summary: 'Deterioration of dual-pavement stripes and micro-bead reflective coating at school zone. Reduced luminance levels create night crossing safety risk.',
      confidence: 93,
      categoryMatch: 'Traffic Control Devices',
      severityMatch: 'High Priority 2',
      routingTo: 'Department of Transportation - Markings Unit'
    },
    verificationStats: {
      confirmCount: 15,
      alreadyFixedCount: 0,
      notFoundCount: 0,
      spamCount: 0
    },
    timeline: [
      {
        id: 't1',
        type: 'reported',
        title: 'Faded School Crossing Reported',
        timestamp: 'Yesterday, 07:15 PM',
        actor: 'Citizen Oliver G.',
        description: 'Reported severely faded white zebra striping and malfunctioning pedestrian warning beacon bulbs.',
        status: 'Completed'
      },
      {
        id: 't2',
        type: 'ai_categorized',
        title: 'Safety Warning Active',
        timestamp: 'Yesterday, 07:16 PM',
        actor: 'CivicHero AI Engine',
        description: 'Classified as Traffic Safety Asset issue. Automatically sent priority alert to public works road markings terminal.',
        status: 'Completed'
      },
      {
        id: 't3',
        type: 'assigned',
        title: 'Marking Operations scheduled',
        timestamp: 'Today, 06:15 AM',
        actor: 'DOT Markings Dispatch',
        description: 'Thermoplastic application team #24 dispatched with line paint system.',
        status: 'Completed'
      },
      {
        id: 't4',
        type: 'work_started',
        title: 'Hot-Melt Painting Active',
        timestamp: 'Today, 08:00 AM',
        actor: 'DOT Paint Crew 24',
        description: 'Swept roadway, applied hot primer, and began laying reflective glass-infused 230C thermoplastic strips.',
        status: 'Active'
      }
    ],
    discussion: [
      {
        id: 'c1',
        user: {
          name: 'Oliver G.',
          avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100&q=80',
          badge: 'Report Creator'
        },
        timestamp: '9 hrs ago',
        text: 'The crew is laying down the new reflective strips now. They look extremely bright and clean, even under direct sunlight. Amazing work!',
        likesCount: 11
      }
    ],
    relatedIssues: ['report-4']
  }
];
