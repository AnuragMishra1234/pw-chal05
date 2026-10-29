import { EventTemplate, ModuleId } from '../types/index.js';

export const TEMPLATES: Record<string, EventTemplate> = {
  wedding: {
    id: 'wedding',
    version: '1.0.0',
    name: 'Wedding & Anniversary',
    category: 'personal_celebration',
    description: 'Comprehensive planning for sacred ceremonies, banquets, and reception celebrations.',
    icon: 'Heart',
    requiredFields: [
      'title',
      'startDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'endDate',
      'preferences.ceremonyStyle',
      'preferences.cateringType',
      'preferences.bridalPartyCount'
    ],
    customFields: [
      {
        name: 'ceremonyStyle',
        label: 'Ceremony Style / Tradition',
        type: 'select',
        required: false,
        options: [
          { label: 'Traditional Religious', value: 'traditional_religious' },
          { label: 'Modern Civil / Secular', value: 'civil_secular' },
          { label: 'Interfaith / Multi-Cultural', value: 'interfaith' },
          { label: 'Destination / Outdoor', value: 'destination' }
        ],
        defaultValue: 'traditional_religious',
        helperText: 'Informs ceremony etiquette and timeline milestones.'
      },
      {
        name: 'cateringType',
        label: 'Catering Service Style',
        type: 'select',
        required: false,
        options: [
          { label: 'Plated Multi-Course Dinner', value: 'plated' },
          { label: 'Grand Buffet', value: 'buffet' },
          { label: 'Cocktail & Heavy Hors d\'oeuvres', value: 'cocktail' },
          { label: 'Family Style Feast', value: 'family_style' }
        ],
        defaultValue: 'plated'
      },
      {
        name: 'bridalPartyCount',
        label: 'Wedding Party Size (Attendants)',
        type: 'number',
        required: false,
        defaultValue: 8,
        helperText: 'Total bridesmaids, groomsmen, and attendants.'
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'guests',
      'vendors',
      'catering'
    ],
    taskCategories: [
      'Venue & Logistics',
      'Attire & Beauty',
      'Catering & Bar',
      'Photography & Video',
      'Music & Entertainment',
      'Stationery & Invitations',
      'Ceremony Details',
      'Legal & Marriage Licensing'
    ],
    suggestedTasks: [
      {
        title: 'Secure Ceremony & Reception Venues',
        category: 'Venue & Logistics',
        daysBeforeEvent: 270,
        priority: 'critical'
      },
      {
        title: 'Book Wedding Photographer & Videographer',
        category: 'Photography & Video',
        daysBeforeEvent: 240,
        priority: 'high'
      },
      {
        title: 'Send Save-the-Date Announcements',
        category: 'Stationery & Invitations',
        daysBeforeEvent: 180,
        priority: 'high'
      },
      {
        title: 'Finalize Catering Menu & Tasting Session',
        category: 'Catering & Bar',
        daysBeforeEvent: 90,
        priority: 'high'
      },
      {
        title: 'Apply for Marriage License with County Clerk',
        category: 'Legal & Marriage Licensing',
        daysBeforeEvent: 30,
        priority: 'critical'
      },
      {
        title: 'Conduct Wedding Rehearsal & Walkthrough',
        category: 'Ceremony Details',
        daysBeforeEvent: 1,
        priority: 'high'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 270,
      budgetAllocationGuidance: {
        'Venue & Catering': 45,
        'Photography & Video': 12,
        'Attire & Beauty': 10,
        'Decorations & Floral': 10,
        'Music & Entertainment': 8,
        'Invitations & Stationery': 3,
        'Wedding Planner / Coordination': 7,
        'Contingency Reserve': 5
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  },

  birthday: {
    id: 'birthday',
    version: '1.0.0',
    name: 'Birthday & Private Celebration',
    category: 'personal_celebration',
    description: 'Tailored milestone birthdays, surprise gatherings, and private social events.',
    icon: 'Cake',
    requiredFields: [
      'title',
      'startDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'preferences.milestoneAge',
      'preferences.isSurpriseParty',
      'preferences.entertainmentType'
    ],
    customFields: [
      {
        name: 'milestoneAge',
        label: 'Celebrant Age / Milestone',
        type: 'number',
        required: false,
        defaultValue: 25,
        helperText: 'e.g. 1st, 18th, 21st, 30th, 50th, 80th'
      },
      {
        name: 'isSurpriseParty',
        label: 'Is this a Surprise Party?',
        type: 'boolean',
        required: false,
        defaultValue: false,
        helperText: 'Adds secret guest coordination and arrival timing tasks.'
      },
      {
        name: 'entertainmentType',
        label: 'Primary Entertainment',
        type: 'select',
        required: false,
        options: [
          { label: 'DJ & Dancing', value: 'dj_dancing' },
          { label: 'Live Band / Acoustic', value: 'live_music' },
          { label: 'Interactive Games & Host', value: 'games_host' },
          { label: 'Children Entertainer / Magician', value: 'entertainer' },
          { label: 'Casual Social Gathering', value: 'casual' }
        ],
        defaultValue: 'casual'
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'guests',
      'catering'
    ],
    taskCategories: [
      'Venue & Atmosphere',
      'Cake & Refreshments',
      'Invitations & RSVP',
      'Music & Entertainment',
      'Party Favors & Keepsakes',
      'Photography & Highlights'
    ],
    suggestedTasks: [
      {
        title: 'Select Party Theme & Color Scheme',
        category: 'Venue & Atmosphere',
        daysBeforeEvent: 60,
        priority: 'medium'
      },
      {
        title: 'Book Venue or Reserve Private Dining Area',
        category: 'Venue & Atmosphere',
        daysBeforeEvent: 45,
        priority: 'high'
      },
      {
        title: 'Send Digital or Printed Invitations',
        category: 'Invitations & RSVP',
        daysBeforeEvent: 30,
        priority: 'high'
      },
      {
        title: 'Order Custom Birthday Cake & Bakery Items',
        category: 'Cake & Refreshments',
        daysBeforeEvent: 14,
        priority: 'high'
      },
      {
        title: 'Assemble Party Playlist or Confirm DJ Schedule',
        category: 'Music & Entertainment',
        daysBeforeEvent: 7,
        priority: 'medium'
      },
      {
        title: 'Decorate Venue & Setup Guest Photo Wall',
        category: 'Venue & Atmosphere',
        daysBeforeEvent: 0,
        priority: 'high'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 60,
      budgetAllocationGuidance: {
        'Food & Beverages': 40,
        'Venue Rental': 20,
        'Cake & Desserts': 10,
        'Decorations & Theme': 12,
        'Entertainment / DJ': 12,
        'Contingency Reserve': 6
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  },

  college_hackathon: {
    id: 'college_hackathon',
    version: '1.0.0',
    name: 'College Hackathon',
    category: 'academic_competition',
    description: '24-48 hour student innovation sprints, mentor matchmaking, and project judging.',
    icon: 'Laptop',
    requiredFields: [
      'title',
      'startDate',
      'endDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'preferences.durationHours',
      'preferences.focusDomains',
      'preferences.hardwareLabNeeded'
    ],
    customFields: [
      {
        name: 'durationHours',
        label: 'Hackathon Duration (Hours)',
        type: 'select',
        required: false,
        options: [
          { label: '24 Hours (Overnight)', value: '24' },
          { label: '36 Hours (Weekend)', value: '36' },
          { label: '48 Hours (Full Scale)', value: '48' },
          { label: '12 Hours (Single Day Sprint)', value: '12' }
        ],
        defaultValue: '36'
      },
      {
        name: 'hardwareLabNeeded',
        label: 'Hardware / IoT Lab Required?',
        type: 'boolean',
        required: false,
        defaultValue: false,
        helperText: 'Adds hardware bench reservation, soldering station safety, and parts checkout tasks.'
      },
      {
        name: 'focusDomains',
        label: 'Focus Domains / Problem Tracks',
        type: 'text',
        required: false,
        defaultValue: 'AI/ML, Healthcare, Web3/Fintech, Sustainability',
        helperText: 'Comma-separated track topics.'
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'registrations',
      'teams',
      'judges',
      'sessions',
      'sponsors',
      'equipment'
    ],
    taskCategories: [
      'Sponsorship & Grants',
      'Venue & Infrastructure',
      'Participant Registration',
      'Judges & Mentors',
      'Catering & Midnight Fuel',
      'Prizes & Swag',
      'Safety & Overnight Security'
    ],
    suggestedTasks: [
      {
        title: 'Secure Campus Innovation Hall & Overnight Permission',
        category: 'Venue & Infrastructure',
        daysBeforeEvent: 90,
        priority: 'critical'
      },
      {
        title: 'Publish Sponsorship Prospectus to Tech Companies',
        category: 'Sponsorship & Grants',
        daysBeforeEvent: 75,
        priority: 'high'
      },
      {
        title: 'Deploy Participant Registration Portal',
        category: 'Participant Registration',
        daysBeforeEvent: 60,
        priority: 'high'
      },
      {
        title: 'Confirm Industry Judges & Scoring Rubric',
        category: 'Judges & Mentors',
        daysBeforeEvent: 30,
        priority: 'high'
      },
      {
        title: 'Verify Gigabit Wi-Fi Capacity & Power Drops',
        category: 'Venue & Infrastructure',
        daysBeforeEvent: 14,
        priority: 'critical'
      },
      {
        title: 'Order Participant T-Shirts, Badges, and Swag Packs',
        category: 'Prizes & Swag',
        daysBeforeEvent: 20,
        priority: 'medium'
      },
      {
        title: 'Coordinate 24h Meal Schedule & Energy Drinks',
        category: 'Catering & Midnight Fuel',
        daysBeforeEvent: 10,
        priority: 'high'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 90,
      budgetAllocationGuidance: {
        'Food & 24h Catering': 35,
        'Cash Prizes & Grants': 25,
        'Swag & Merchandise': 15,
        'Venue & High-Speed AV/Network': 10,
        'Marketing & Signage': 5,
        'Contingency Reserve': 10
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  },

  community_event: {
    id: 'community_event',
    version: '1.0.0',
    name: 'Community & Social Initiative',
    category: 'civic_initiative',
    description: 'Civic drives, charity fundraisers, environmental cleanups, and local neighborhood assemblies.',
    icon: 'Users',
    requiredFields: [
      'title',
      'startDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'preferences.initiativeFocus',
      'preferences.requiresMunicipalPermit',
      'preferences.volunteerTargetCount'
    ],
    customFields: [
      {
        name: 'initiativeFocus',
        label: 'Initiative Category',
        type: 'select',
        required: false,
        options: [
          { label: 'Environmental Cleanup / Tree Planting', value: 'environmental' },
          { label: 'Food Drive / Poverty Relief', value: 'food_relief' },
          { label: 'Neighborhood Festival / Cultural Block Party', value: 'block_party' },
          { label: 'Civic Townhall / Public Forum', value: 'townhall' },
          { label: 'Charity 5K Walk/Run', value: 'charity_run' }
        ],
        defaultValue: 'environmental'
      },
      {
        name: 'requiresMunicipalPermit',
        label: 'Requires City/Park Permitting?',
        type: 'boolean',
        required: false,
        defaultValue: true,
        helperText: 'Triggers municipal permit filing and noise waiver checkpoints.'
      },
      {
        name: 'volunteerTargetCount',
        label: 'Target Number of Volunteers',
        type: 'number',
        required: false,
        defaultValue: 50
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'volunteers',
      'outreach',
      'equipment',
      'impact_tracking'
    ],
    taskCategories: [
      'Permits & City Relations',
      'Volunteer Mobilization',
      'Safety & Medical Support',
      'Logistics & Equipment',
      'Community Outreach & Media',
      'Waste Disposal & Environmental Impact'
    ],
    suggestedTasks: [
      {
        title: 'Submit Public Space & Sound Permit to City Hall',
        category: 'Permits & City Relations',
        daysBeforeEvent: 60,
        priority: 'critical'
      },
      {
        title: 'Launch Volunteer Recruitment Registration Drive',
        category: 'Volunteer Mobilization',
        daysBeforeEvent: 45,
        priority: 'high'
      },
      {
        title: 'Procure Safety Equipment, First Aid Kits & Hi-Vis Vests',
        category: 'Safety & Medical Support',
        daysBeforeEvent: 20,
        priority: 'high'
      },
      {
        title: 'Arrange Waste Dumpsters & Recycling Hauler',
        category: 'Waste Disposal & Environmental Impact',
        daysBeforeEvent: 14,
        priority: 'critical'
      },
      {
        title: 'Send Press Advisory to Local News Outlets & Community Groups',
        category: 'Community Outreach & Media',
        daysBeforeEvent: 10,
        priority: 'medium'
      },
      {
        title: 'Conduct Morning Safety Briefing & Route Deployment',
        category: 'Safety & Medical Support',
        daysBeforeEvent: 0,
        priority: 'critical'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 60,
      budgetAllocationGuidance: {
        'Safety Gear & First Aid': 30,
        'Volunteer Hydration & Refreshments': 25,
        'Waste Hauling & Environmental Disposal': 20,
        'Signage, Banners & Outreach': 10,
        'City Permit Fees': 5,
        'Contingency Reserve': 10
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  },

  corporate_conference: {
    id: 'corporate_conference',
    version: '1.0.0',
    name: 'Corporate Conference & Summit',
    category: 'professional_summit',
    description: 'Multi-track industry summits, keynote sessions, sponsor expo halls, and executive banquets.',
    icon: 'Briefcase',
    requiredFields: [
      'title',
      'startDate',
      'endDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'preferences.trackCount',
      'preferences.keynoteSpeakerTarget',
      'preferences.hasExhibitionHall'
    ],
    customFields: [
      {
        name: 'trackCount',
        label: 'Number of Parallel Presentation Tracks',
        type: 'select',
        required: false,
        options: [
          { label: 'Single Track (Plenary)', value: '1' },
          { label: '2 Parallel Tracks', value: '2' },
          { label: '3-4 Breakout Tracks', value: '4' },
          { label: '5+ Multi-Track Summit', value: '5' }
        ],
        defaultValue: '2'
      },
      {
        name: 'hasExhibitionHall',
        label: 'Sponsor Exhibition Expo Hall?',
        type: 'boolean',
        required: false,
        defaultValue: true,
        helperText: 'Adds booth layout mapping, exhibitor kit distribution, and electrician services.'
      },
      {
        name: 'keynoteSpeakerTarget',
        label: 'Target Keynote / Featured Speakers',
        type: 'number',
        required: false,
        defaultValue: 4
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports',
      'speakers',
      'sessions',
      'sponsors',
      'equipment'
    ],
    taskCategories: [
      'Venue & Breakout Rooms',
      'Speakers & Agenda',
      'Sponsorship & Exhibit Hall',
      'Audio-Visual & Live Streaming',
      'Badges & Attendee Check-In',
      'Executive Catering & Receptions',
      'PR, Brand & Media'
    ],
    suggestedTasks: [
      {
        title: 'Contract Convention Center or Hotel Ballroom',
        category: 'Venue & Breakout Rooms',
        daysBeforeEvent: 180,
        priority: 'critical'
      },
      {
        title: 'Open Call for Speaker Proposals (CFP)',
        category: 'Speakers & Agenda',
        daysBeforeEvent: 150,
        priority: 'high'
      },
      {
        title: 'Launch Sponsor Package Prospectus (Gold/Silver/Bronze)',
        category: 'Sponsorship & Exhibit Hall',
        daysBeforeEvent: 120,
        priority: 'high'
      },
      {
        title: 'Confirm Keynote Speaker Travel & Honorariums',
        category: 'Speakers & Agenda',
        daysBeforeEvent: 60,
        priority: 'high'
      },
      {
        title: 'Finalize AV Contract (Stage Lighting, Mics, Multi-Cam Streaming)',
        category: 'Audio-Visual & Live Streaming',
        daysBeforeEvent: 45,
        priority: 'critical'
      },
      {
        title: 'Print Attendee Lanyards, Badges, and Schedule Guides',
        category: 'Badges & Attendee Check-In',
        daysBeforeEvent: 14,
        priority: 'high'
      },
      {
        title: 'Conduct Stage Audio Check & Presenter Slides Rehearsal',
        category: 'Audio-Visual & Live Streaming',
        daysBeforeEvent: 1,
        priority: 'critical'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 180,
      budgetAllocationGuidance: {
        'Convention Venue & Breakout Facilities': 35,
        'Attendee Catering, Breaks & Executive Dinner': 25,
        'AV, Lighting & Live Streaming Production': 18,
        'Keynote Honorariums & VIP Hospitality': 10,
        'Signage, Badges & Conference App': 5,
        'Contingency Reserve': 7
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  },

  custom: {
    id: 'custom',
    version: '1.0.0',
    name: 'Custom Event',
    category: 'custom',
    description: 'Plan any unique, hybrid, or composite event using an open-ended natural language brief.',
    icon: 'Sparkles',
    requiredFields: [
      'title',
      'startDate',
      'location',
      'budgetLimitMinorUnits',
      'currency',
      'expectedAttendance'
    ],
    optionalFields: [
      'description',
      'endDate',
      'customPrompt',
      'preferences.eventObjective',
      'preferences.targetVibe'
    ],
    customFields: [
      {
        name: 'customPrompt',
        label: 'Detailed Event Vision & Concept',
        type: 'text',
        required: false,
        helperText: 'Describe the unique atmosphere, special arrangements, or bespoke requirements for this event.'
      },
      {
        name: 'eventObjective',
        label: 'Primary Objective / Success Metric',
        type: 'text',
        required: false,
        defaultValue: 'Deliver an unforgettable experience for all participants',
        helperText: 'What defines a successful outcome for this gathering?'
      },
      {
        name: 'targetVibe',
        label: 'Desired Ambiance & Tone',
        type: 'select',
        required: false,
        options: [
          { label: 'Vibrant & High Energy', value: 'high_energy' },
          { label: 'Elegant & Refined', value: 'elegant' },
          { label: 'Casual & Warm', value: 'casual' },
          { label: 'Focused & Professional', value: 'professional' },
          { label: 'Immersive & Artistic', value: 'artistic' }
        ],
        defaultValue: 'casual'
      }
    ],
    defaultModules: [
      'overview',
      'budget',
      'timeline',
      'tasks',
      'recommendations',
      'reports'
    ],
    taskCategories: [
      'Concept & Scoping',
      'Venue & Infrastructure',
      'Budget & Procurement',
      'Attendee Experience',
      'Operations & Day-Of Execution',
      'Post-Event Wrap-up'
    ],
    suggestedTasks: [
      {
        title: 'Finalize Event Concept & Core Experience Pillars',
        category: 'Concept & Scoping',
        daysBeforeEvent: 60,
        priority: 'critical'
      },
      {
        title: 'Secure Venue or Space Permits',
        category: 'Venue & Infrastructure',
        daysBeforeEvent: 45,
        priority: 'high'
      },
      {
        title: 'Draft Initial Budget Allocation & Supplier Inquiries',
        category: 'Budget & Procurement',
        daysBeforeEvent: 30,
        priority: 'high'
      },
      {
        title: 'Send Invitations & Confirm Participant Roster',
        category: 'Attendee Experience',
        daysBeforeEvent: 20,
        priority: 'medium'
      },
      {
        title: 'Run Operational Equipment & Staff Check',
        category: 'Operations & Day-Of Execution',
        daysBeforeEvent: 3,
        priority: 'high'
      }
    ],
    planningRules: {
      recommendedLeadTimeDays: 60,
      budgetAllocationGuidance: {
        'Venue & Staging': 35,
        'Food, Drinks & Hospitality': 30,
        'Experience & Production': 20,
        'Marketing & Materials': 5,
        'Contingency Reserve': 10
      }
    },
    outputSections: [
      'summary',
      'themeAndConcept',
      'assumptions',
      'warnings',
      'budgetProposal',
      'tasks',
      'timelineMilestones',
      'eventDaySchedule',
      'templateSpecificModules',
      'recommendations'
    ]
  }
};

export function getTemplateById(id: string): EventTemplate | undefined {
  return TEMPLATES[id];
}

export function getAllTemplates(): EventTemplate[] {
  return Object.values(TEMPLATES);
}

export function getModulesForTemplate(templateId: string): ModuleId[] {
  const template = TEMPLATES[templateId];
  return template ? template.defaultModules : ['overview', 'budget', 'timeline', 'tasks', 'recommendations', 'reports'];
}
