import { GenerationRequest, GenerationResponse, IGenAIAdapter } from './adapter.interface.js';

export class MockProviderAdapter implements IGenAIAdapter {
  readonly providerName = 'mock' as const;

  async generateStructuredPlan(request: GenerationRequest): Promise<GenerationResponse> {
    const startTime = Date.now();
    const prompt = `${request.systemPrompt}\n${request.userPrompt}`;

    // Extract event details from prompt if present
    const isRevision = prompt.includes('REVISION INSTRUCTIONS:') || prompt.includes('REVISION_MODE');
    const isHackathon = prompt.includes('college_hackathon') || prompt.includes('Hackathon');
    const isWedding = prompt.includes('wedding') || prompt.includes('Wedding');
    const isBirthday = prompt.includes('birthday') || prompt.includes('Birthday');
    const isCommunity = prompt.includes('community_event') || prompt.includes('Community');
    const isConference = prompt.includes('corporate_conference') || prompt.includes('Conference');

    // Extract title if available
    const titleMatch = prompt.match(/Title:\s*(.+)/i) || prompt.match(/"title":\s*"([^"]+)"/i);
    const eventTitle = titleMatch ? titleMatch[1].trim() : 'Celebration Event';

    let mockOutput: any;

    if (isRevision) {
      mockOutput = this.generateRevisionMock(eventTitle, prompt);
    } else if (isHackathon) {
      mockOutput = this.generateHackathonMock(eventTitle);
    } else if (isWedding) {
      mockOutput = this.generateWeddingMock(eventTitle);
    } else if (isBirthday) {
      mockOutput = this.generateBirthdayMock(eventTitle);
    } else if (isCommunity) {
      mockOutput = this.generateCommunityMock(eventTitle);
    } else if (isConference) {
      mockOutput = this.generateConferenceMock(eventTitle);
    } else {
      mockOutput = this.generateCustomMock(eventTitle, prompt);
    }

    return {
      rawContent: JSON.stringify(mockOutput, null, 2),
      provider: 'mock',
      model: 'deterministic-mock-v1',
      durationMs: Date.now() - startTime,
      tokensUsed: {
        prompt: Math.round(prompt.length / 4),
        completion: 850
      }
    };
  }

  private generateHackathonMock(title: string) {
    return {
      summary: `High-impact 36-hour competitive collegiate hackathon plan for ${title}, focused on rapid prototyping, expert mentoring rounds, and rigorous judging criteria.`,
      themeAndConcept: {
        themeName: 'Code the Frontier: AI & Civic Systems',
        description: 'Immersive technology sprint bringing together multi-disciplinary engineers, designers, and mentors.',
        recommendedColorPalette: ['#0f172a', '#3b82f6', '#10b981', '#f59e0b']
      },
      assumptions: [
        'Dedicated campus lab or auditorium with minimum 1Gbps symmetrical uplink reserved.',
        '24/7 overnight campus security and medical personnel stationed on-site.',
        'Hardware kits and microcontroller inventory confirmed 14 days in advance.'
      ],
      warnings: [
        'High power density requires 3-phase industrial power strips for workstation tables.',
        'Overnight catering requires pre-approved food safety permits and allergy labelling.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 10,
        categories: [
          { categoryName: 'Prizes & Grants', percentageOfBudget: 35, reasoning: 'Attract top regional developer teams and project bounty winners.', savingTips: ['Partner with cloud sponsors for sponsored prize categories'] },
          { categoryName: 'Food & Refreshments', percentageOfBudget: 30, reasoning: 'Cater 4 hot meals, midnight pizza, energy drinks, and continuous fruit/coffee.', savingTips: ['Order local campus catering contracts at bulk rates'] },
          { categoryName: 'Venue & AV Infrastructure', percentageOfBudget: 20, reasoning: 'High-speed wireless routers, stage projection, sound system, and cable drops.', savingTips: ['Utilize university IT networking hardware'] },
          { categoryName: 'Brag Swag & Badges', percentageOfBudget: 15, reasoning: 'Custom organic cotton hoodies, NFC participant badges, and sponsor stickers.', savingTips: ['Batch apparel printing 3 weeks early'] }
        ]
      },
      tasks: [
        { title: 'Secure 1Gbps Dedicated Broadband Uplink', category: 'Venue & Infrastructure', description: 'Coordinate with university network operations for redundant fiber failover.', priority: 'critical', daysBeforeEvent: 30, suggestedAssigneeRole: 'Tech Lead' },
        { title: 'Publish Hackathon Rules & Track Themes', category: 'Academics & Content', description: 'Finalize problem statements across AI, Sustainability, and Civic Tech.', priority: 'high', daysBeforeEvent: 21, suggestedAssigneeRole: 'Track Lead' },
        { title: 'Confirm Industry Judges & Mentor Panels', category: 'Mentors & Judges', description: 'Brief 12 senior tech architects on judging rubric and scoring platform.', priority: 'high', daysBeforeEvent: 14, suggestedAssigneeRole: 'Judge Coordinator' },
        { title: 'Finalize Midnight Food & Beverage Deliveries', category: 'Hospitality', description: 'Confirm pizza delivery windows and continuous coffee urn replenishment.', priority: 'medium', daysBeforeEvent: 7, suggestedAssigneeRole: 'Logistics Lead' },
        { title: 'Setup Hardware Lab & Loan Station', category: 'Venue & Infrastructure', description: 'Catalog Raspberry Pis, sensors, test cables, and multimeter checkouts.', priority: 'high', daysBeforeEvent: 2, suggestedAssigneeRole: 'Hardware Specialist' },
        { title: 'Dry Run AV and Projector Screens', category: 'Venue & Infrastructure', description: 'Test stage microphones, demo presentation switchers, and timer display.', priority: 'critical', daysBeforeEvent: 1, suggestedAssigneeRole: 'Stage Manager' }
      ],
      timelineMilestones: [
        { milestoneName: 'Registration Portal Opens', daysBeforeEvent: 45, description: 'Launch devpost/portal and begin reviewing team applications.' },
        { milestoneName: 'Team Shortlisting & Mentors Assigned', daysBeforeEvent: 15, description: 'Notify 60 admitted teams and release discord server invites.' },
        { milestoneName: 'Hardware Check-in & Setup Complete', daysBeforeEvent: 1, description: 'Verify all staging tables, Ethernet drops, and sponsor banners.' },
        { milestoneName: 'Opening Keynote & Hacking Begins', daysBeforeEvent: 0, description: 'Official countdown and API sponsor presentations.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Doors Open, Registration & Badge Pickup', locationOrZone: 'Main Foyer', leadRole: 'Volunteers' },
        { timeOffsetHours: 1.5, activityTitle: 'Opening Ceremony & Theme Reveal', locationOrZone: 'Auditorium', leadRole: 'Lead Organizer' },
        { timeOffsetHours: 2.5, activityTitle: 'Hacking Starts & Team Formation Mixer', locationOrZone: 'Hacking Hall', leadRole: 'Track Lead' },
        { timeOffsetHours: 7, activityTitle: 'Mentor Check-in Round 1', locationOrZone: 'Breakout Zones', leadRole: 'Mentor Lead' },
        { timeOffsetHours: 14, activityTitle: 'Midnight Pizza & Lightning Games', locationOrZone: 'Dining Hall', leadRole: 'Hospitality Team' },
        { timeOffsetHours: 26, activityTitle: 'Soft Code Freeze & Submission Deadline', locationOrZone: 'Portal', leadRole: 'Tech Lead' },
        { timeOffsetHours: 28, activityTitle: 'Top 10 Demos & Final Judging', locationOrZone: 'Main Stage', leadRole: 'Judges' },
        { timeOffsetHours: 32, activityTitle: 'Awards Ceremony & Closing Remarks', locationOrZone: 'Auditorium', leadRole: 'Lead Organizer' }
      ],
      templateSpecificModules: {
        tracks: ['Generative AI for Healthcare', 'Decentralized Civic Tech', 'Clean Energy & Smart Grid'],
        hardwareLabList: ['Raspberry Pi 5 Units', 'ESP32 IoT Boards', 'Solder Stations', 'Logic Analyzers'],
        judgingRubric: ['Technical Complexity (30%)', 'Originality (25%)', 'Practical Impact (25%)', 'Presentation (20%)']
      },
      recommendations: [
        'Establish a dedicated Discord/Slack channel for technical mentors with a response SLA of 10 minutes.',
        'Provide quiet sleeping/resting zones separate from the main hacking hall with earplugs available.',
        'Run an automated sanity check script against all project GitHub repositories before final judging.'
      ]
    };
  }

  private generateWeddingMock(title: string) {
    return {
      summary: `Exquisite, multi-day celebration plan for ${title}, orchestrating sacred ceremonies, guest hospitality, artisanal catering, and aesthetic floral design.`,
      themeAndConcept: {
        themeName: 'Royal Heritage & Contemporary Elegance',
        description: 'Harmonious fusion of cultural traditions with modern minimalism and warm ambient lighting.',
        recommendedColorPalette: ['#881337', '#d97706', '#fef3c7', '#1e293b']
      },
      assumptions: [
        'Main venue allows external traditional catering and sacred fire ceremony compliance.',
        'Bridal suite and family prep rooms available 4 hours prior to guest arrival.'
      ],
      warnings: [
        'Peak wedding season vendor contracts require non-refundable deposits 90 days out.',
        'Outdoor lawn segment requires rainproof canopy contingency reservation.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 12,
        categories: [
          { categoryName: 'Hospitality & Banquet Catering', percentageOfBudget: 42, reasoning: 'Multi-course regional cuisine, live culinary counters, and artisanal mocktails.', savingTips: ['Limit premium seafood to main reception night'] },
          { categoryName: 'Venue & Decor Styling', percentageOfBudget: 28, reasoning: 'Fresh floral mandap, ambient fairy light canopies, and designer lounge seating.', savingTips: ['Repurpose ceremony floral arrangements for reception photo backdrop'] },
          { categoryName: 'Photography & Cinematography', percentageOfBudget: 15, reasoning: 'Candid photo team, drone coverage, and next-day highlight teaser.', savingTips: ['Book full-day bundle package instead of hourly add-ons'] },
          { categoryName: 'Attire, Hair & Makeup', percentageOfBudget: 15, reasoning: 'Bridal stylist, groom couture, and immediate family styling artists.', savingTips: ['Schedule trial sessions on same day as pre-wedding shoot'] }
        ]
      },
      tasks: [
        { title: 'Confirm Ceremony Priest / Officiant and Script', category: 'Ceremony & Rituals', description: 'Review ceremonial vows, auspicious muhurat timings, and sacred items checklist.', priority: 'critical', daysBeforeEvent: 60, suggestedAssigneeRole: 'Family Elder' },
        { title: 'Tasting Session & Finalize Banquet Menu', category: 'Catering & Dining', description: 'Sample signature dishes, dessert spread, and finalize dietary restriction labels.', priority: 'high', daysBeforeEvent: 30, suggestedAssigneeRole: 'Catering Manager' },
        { title: 'Dispatch Digital & Physical Invitations', category: 'Guests & RSVPs', description: 'Send digital save-the-dates with RSVP form tracking dietary requirements and accommodations.', priority: 'high', daysBeforeEvent: 45, suggestedAssigneeRole: 'RSVP Lead' },
        { title: 'Final Hair & Makeup Styling Trial', category: 'Attire & Styling', description: 'Lock in hair accessories, makeup tone, and dupatta draping timing.', priority: 'medium', daysBeforeEvent: 14, suggestedAssigneeRole: 'Bridal Stylist' },
        { title: 'Vendor Coordination Walkthrough at Venue', category: 'Logistics', description: 'Sync florists, DJ acoustics, catering kitchen access, and generator backup.', priority: 'critical', daysBeforeEvent: 7, suggestedAssigneeRole: 'Wedding Coordinator' },
        { title: 'Prepare Welcome Hampers & Room Allocations', category: 'Guests & RSVPs', description: 'Assemble gift hampers, room key envelopes, and local itinerary cards.', priority: 'medium', daysBeforeEvent: 2, suggestedAssigneeRole: 'Hospitality Team' }
      ],
      timelineMilestones: [
        { milestoneName: 'Venue & Primary Vendors Contracted', daysBeforeEvent: 90, description: 'All deposits secured for venue, photography, and lead caterer.' },
        { milestoneName: 'RSVPs Finalized & Seating Chart Locked', daysBeforeEvent: 20, description: 'Final headcount confirmed for dining and guest transport.' },
        { milestoneName: 'Sangeet & Mehendi Celebration', daysBeforeEvent: 1, description: 'Pre-wedding musical evening and ceremonial henna application.' },
        { milestoneName: 'Main Wedding Ceremony & Banquet', daysBeforeEvent: 0, description: 'Sacred nuptials followed by grand reception banquet.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Baraat Procession & Welcome Ceremony', locationOrZone: 'Grand Entrance', leadRole: 'Hospitality Lead' },
        { timeOffsetHours: 1.5, activityTitle: 'Varmala Exchange & Mandap Rituals', locationOrZone: 'Ceremony Lawn', leadRole: 'Priest / Officiant' },
        { timeOffsetHours: 3.5, activityTitle: 'Luncheon Banquet & Live Folk Ensemble', locationOrZone: 'Dining Pavilion', leadRole: 'Catering Head' },
        { timeOffsetHours: 6.5, activityTitle: 'Evening Reception & Cake Cutting', locationOrZone: 'Grand Ballroom', leadRole: 'Master of Ceremonies' },
        { timeOffsetHours: 8, activityTitle: 'First Dance & Celebration DJ Party', locationOrZone: 'Ballroom Stage', leadRole: 'DJ Artist' }
      ],
      templateSpecificModules: {
        ceremonyPhases: ['Ganesh Puja', 'Baraat Arrival', 'Varmala', 'Kanyadaan', 'Saptapadi (Seven Vows)', 'Vidaai'],
        guestAccommodations: '45 Deluxe Rooms reserved with shuttle frequency every 20 minutes',
        photoShotList: ['Family portraits at Mandap', 'Candid vows exchange', 'Golden hour bridal portraits', 'Drone overview of procession']
      },
      recommendations: [
        'Designate a dedicated family point-of-contact for vendor payments on the day of the event.',
        'Prepare a comfort basket for the bridal suite (mints, sewing kit, stain remover, electrolyte water).',
        'Have a designated photographer assistant whose only job is gathering specific family groupings.'
      ]
    };
  }

  private generateBirthdayMock(title: string) {
    return {
      summary: `Vibrant and personalized birthday celebration plan for ${title}, featuring interactive entertainment, signature treats, and custom decor.`,
      themeAndConcept: {
        themeName: 'Neon Glow Retro Arcade & Disco',
        description: 'Playful atmosphere filled with neon lighting, arcade games, and dynamic music.',
        recommendedColorPalette: ['#ec4899', '#8b5cf6', '#06b6d4', '#facc15']
      },
      assumptions: [
        'Venue allows sound amplification until 11:00 PM.',
        'Custom cake refrigeration facilities available at venue.'
      ],
      warnings: [
        'Confirm guest RSVP cutoff 5 days prior to guarantee accurate party favors and catering plates.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 10,
        categories: [
          { categoryName: 'Entertainment & Music', percentageOfBudget: 35, reasoning: 'DJ, photo booth rental, and retro arcade cabinets.', savingTips: ['Create curated playlist for early cocktail hour'] },
          { categoryName: 'Food & Gourmet Cake', percentageOfBudget: 35, reasoning: 'Artisanal sliders, live pasta station, and bespoke 3-tier celebration cake.', savingTips: ['Order sheet cake for service and smaller display cake'] },
          { categoryName: 'Thematic Decor & Lighting', percentageOfBudget: 20, reasoning: 'Balloon installation arch, LED neon signs, and photo backdrop.', savingTips: ['DIY custom table signage'] },
          { categoryName: 'Party Favors & Games', percentageOfBudget: 10, reasoning: 'Personalized gift boxes and prizes for party trivia winners.', savingTips: ['Bulk order personalized retro glasses'] }
        ]
      },
      tasks: [
        { title: 'Commission Custom Celebration Cake', category: 'Food & Cake', description: 'Finalize cake flavor (Belgian Chocolate & Raspberry) and custom fondant topper.', priority: 'high', daysBeforeEvent: 20, suggestedAssigneeRole: 'Party Host' },
        { title: 'Book 360-degree Photo Booth & DJ', category: 'Entertainment', description: 'Confirm playlist preferences, sound check schedule, and backdrop branding.', priority: 'high', daysBeforeEvent: 15, suggestedAssigneeRole: 'Entertainment Coordinator' },
        { title: 'Assemble Personalized Party Favor Bags', category: 'Decor & Favors', description: 'Package branded merchandise, sweets, and thank-you notes.', priority: 'medium', daysBeforeEvent: 4, suggestedAssigneeRole: 'Host' },
        { title: 'Venue Setup & Balloon Arch Installation', category: 'Venue & Decor', description: 'Install neon signs, table centerpieces, and arcade stations.', priority: 'high', daysBeforeEvent: 1, suggestedAssigneeRole: 'Decorator' }
      ],
      timelineMilestones: [
        { milestoneName: 'RSVP Cutoff & Final Headcount', daysBeforeEvent: 7, description: 'Lock in catering numbers with kitchen staff.' },
        { milestoneName: 'Decor & Entertainment Installed', daysBeforeEvent: 0, description: 'Soundcheck and lighting test 2 hours prior to arrival.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Guest Arrival, Welcome Cocktails & Photo Booth', locationOrZone: 'Welcome Lounge', leadRole: 'Host' },
        { timeOffsetHours: 1.5, activityTitle: 'Party Games & Trivia Competition', locationOrZone: 'Central Stage', leadRole: 'MC' },
        { timeOffsetHours: 2.5, activityTitle: 'Cake Cutting Ceremony & Speeches', locationOrZone: 'Cake Pavilion', leadRole: 'Host & Family' },
        { timeOffsetHours: 3.5, activityTitle: 'Dinner Buffet Opens & Dance Floor', locationOrZone: 'Main Hall', leadRole: 'DJ' }
      ],
      templateSpecificModules: {
        gameActivities: ['Celebrity Birthday Trivia', 'Neon Limbo Challenge', 'Retro Arcade High-Score Tournament'],
        partyFavors: 'Glow-in-the-dark enamel pins and gourmet macarons'
      },
      recommendations: [
        'Have a dedicated phone charger station near the photo booth.',
        'Schedule the birthday toast and cake cutting before heavy dinner service to keep energy high.'
      ]
    };
  }

  private generateCommunityMock(title: string) {
    return {
      summary: `Civic-minded, highly coordinated community action plan for ${title}, prioritizing volunteer safety, efficient logistics, and quantifiable social impact.`,
      themeAndConcept: {
        themeName: 'Clean Green Future: Civic Action Day',
        description: 'Grassroots community initiative focused on hands-on improvement and environmental awareness.',
        recommendedColorPalette: ['#15803d', '#0284c7', '#eab308', '#f8fafc']
      },
      assumptions: [
        'Municipal permits obtained for public park / waterfront access.',
        'City sanitation department provides waste haulage bins at 4 designated stations.'
      ],
      warnings: [
        'Safety briefings and first aid stations are mandatory before any volunteer task begins.',
        'Inclement weather protocol requires indoor community hall staging alternative.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 15,
        categories: [
          { categoryName: 'Safety Gear & Equipment', percentageOfBudget: 40, reasoning: 'Heavy-duty gloves, high-vis vests, litter pickers, and first-aid kits.', savingTips: ['Request corporate sponsor donation for safety gear'] },
          { categoryName: 'Volunteer Refreshments & Water Stations', percentageOfBudget: 30, reasoning: 'Eco-friendly water refill stations, fresh fruit, and healthy boxed lunches.', savingTips: ['Partner with local bakery for volunteer snacks'] },
          { categoryName: 'Waste Haulage & Disposal Permits', percentageOfBudget: 20, reasoning: 'Specialized recycling containers, bio-degradable bags, and municipal permits.', savingTips: ['Apply for civic community fee waiver'] },
          { categoryName: 'Community Outreach & Signage', percentageOfBudget: 10, reasoning: 'Directional banners, educational flyers, and digital registration leaflets.', savingTips: ['Utilize social media and neighborhood WhatsApp groups'] }
        ]
      },
      tasks: [
        { title: 'Submit Municipal Park & Event Permits', category: 'Permits & City Liaison', description: 'Obtain written municipal approval for public gathering and waste dumpsters.', priority: 'critical', daysBeforeEvent: 45, suggestedAssigneeRole: 'Permits Lead' },
        { title: 'Inspect Safety Equipment & First Aid Supplies', category: 'Safety & First Aid', description: 'Stock sterile bandages, antiseptic, heat-exhaustion electrolytes, and emergency kit.', priority: 'critical', daysBeforeEvent: 10, suggestedAssigneeRole: 'Safety Officer' },
        { title: 'Volunteer Captains Orientation Briefing', category: 'Volunteers', description: 'Train 10 zone leaders on volunteer check-in, safety protocols, and radio channels.', priority: 'high', daysBeforeEvent: 4, suggestedAssigneeRole: 'Volunteer Coordinator' },
        { title: 'Setup Water Refill Stations & Bins', category: 'Logistics', description: 'Position color-coded waste segregation bins across all 4 cleanup sectors.', priority: 'high', daysBeforeEvent: 1, suggestedAssigneeRole: 'Logistics Team' }
      ],
      timelineMilestones: [
        { milestoneName: 'Permits & Municipal Haulage Approved', daysBeforeEvent: 20, description: 'Written clearance from local city council received.' },
        { milestoneName: 'Volunteer Registration Target Reached', daysBeforeEvent: 7, description: '150 volunteers registered across 4 operational zones.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Volunteer Check-in & Gear Distribution', locationOrZone: 'Basecamp Pavilion', leadRole: 'Volunteer Lead' },
        { timeOffsetHours: 0.75, activityTitle: 'Safety Briefing & Zone Deployment', locationOrZone: 'Basecamp Stage', leadRole: 'Safety Officer' },
        { timeOffsetHours: 1.25, activityTitle: 'Active Cleanup & Tree Planting Operation', locationOrZone: 'Zones A, B, C, D', leadRole: 'Zone Captains' },
        { timeOffsetHours: 3.5, activityTitle: 'Waste Weigh-in & Sorting Audit', locationOrZone: 'Weigh Station', leadRole: 'Impact Analyst' },
        { timeOffsetHours: 4.5, activityTitle: 'Community Lunch & Impact Announcement', locationOrZone: 'Basecamp Pavilion', leadRole: 'Lead Organizer' }
      ],
      templateSpecificModules: {
        safetyProtocols: ['Mandatory puncture-resistant gloves', 'No handling of hazardous materials', 'Designated EMT on-site'],
        impactTargets: ['Collect 500kg recyclable plastic', 'Plant 75 native saplings', 'Engage 150 local residents']
      },
      recommendations: [
        'Publish live impact stats on social media immediately following the weigh-in ceremony.',
        'Send digital certificates of appreciation to all student and corporate volunteers within 48 hours.'
      ]
    };
  }

  private generateConferenceMock(title: string) {
    return {
      summary: `Executive-grade, dual-track corporate conference plan for ${title}, orchestrating thought-leadership sessions, VIP networking, and hybrid broadcast operations.`,
      themeAndConcept: {
        themeName: 'Enterprise Transformation: Scalable Innovation',
        description: 'Prestigious industry gathering connecting enterprise leaders, innovators, and analysts.',
        recommendedColorPalette: ['#0f172a', '#1e40af', '#475569', '#f8fafc']
      },
      assumptions: [
        'Conference center convention hall provides dual breakout stages with line-array sound.',
        'High-speed fiber connection configured for 4K low-latency virtual livestreaming.'
      ],
      warnings: [
        'VIP keynote speaker travel itineraries require confirmation 30 days prior.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 10,
        categories: [
          { categoryName: 'Conference Venue & AV Production', percentageOfBudget: 45, reasoning: 'Dual stage LED backdrops, broadcast-grade switchers, and audio engineers.', savingTips: ['Book multi-year convention center package'] },
          { categoryName: 'Executive Catering & Coffee Bars', percentageOfBudget: 25, reasoning: 'Continuous barista coffee, networking lunch buffet, and evening cocktail reception.', savingTips: ['Limit evening open bar to 2 hours'] },
          { categoryName: 'Speaker Honorariums & Travel', percentageOfBudget: 15, reasoning: 'Business class travel and premium hotel accommodations for 6 keynote guests.', savingTips: ['Invite local executive speakers to reduce long-haul flights'] },
          { categoryName: 'Branding, Badges & Event App', percentageOfBudget: 15, reasoning: 'NFC smart badges, event agenda mobile app, and sponsor exhibition booths.', savingTips: ['Use reusable digital signage displays'] }
        ]
      },
      tasks: [
        { title: 'Lock Keynote Speakers & Executive Bios', category: 'Speakers & Tracks', description: 'Confirm contracts, presentation topics, and slide deck delivery dates.', priority: 'critical', daysBeforeEvent: 45, suggestedAssigneeRole: 'Content Director' },
        { title: 'Configure Event Agenda Mobile App & Badges', category: 'Technology & Badges', description: 'Upload speaker schedules, sponsor profiles, and test QR check-in flow.', priority: 'high', daysBeforeEvent: 20, suggestedAssigneeRole: 'Digital Lead' },
        { title: 'Technical Rehearsals & Livestream Dry Run', category: 'Venue & Production', description: 'Verify lapel mics, presentation clickers, and backup livestream feed.', priority: 'critical', daysBeforeEvent: 1, suggestedAssigneeRole: 'AV Director' },
        { title: 'VIP Speaker Green Room Readiness', category: 'Speakers & Tracks', description: 'Setup private lounge with quiet work desks and catering.', priority: 'high', daysBeforeEvent: 1, suggestedAssigneeRole: 'Speaker Concierge' }
      ],
      timelineMilestones: [
        { milestoneName: 'Agenda & Speaker Lineup Announced', daysBeforeEvent: 40, description: 'Early bird ticket sales close and agenda published.' },
        { milestoneName: 'Stage Design & AV Rehearsal', daysBeforeEvent: 1, description: 'All stage lighting, podiums, and demo machines verified.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Executive Registration & Barista Networking', locationOrZone: 'Grand Atrium', leadRole: 'Registration Team' },
        { timeOffsetHours: 1.25, activityTitle: 'Welcome Address & Opening Industry Keynote', locationOrZone: 'Auditorium Stage A', leadRole: 'CEO / Chair' },
        { timeOffsetHours: 2.75, activityTitle: 'Panel: Emerging Tech Architecture & Governance', locationOrZone: 'Hall Stage B', leadRole: 'Moderator' },
        { timeOffsetHours: 4.5, activityTitle: 'Executive Networking Luncheon & Sponsor Expo', locationOrZone: 'Expo Pavilion', leadRole: 'Hospitality Lead' },
        { timeOffsetHours: 6.5, activityTitle: 'Fireside Chat & Closing Panel', locationOrZone: 'Auditorium Stage A', leadRole: 'Content Director' },
        { timeOffsetHours: 8, activityTitle: 'VIP Evening Cocktail Reception', locationOrZone: 'Rooftop Terrace', leadRole: 'Executive Host' }
      ],
      templateSpecificModules: {
        speakerList: ['Global VP of Engineering', 'Principal Research Scientist', 'Chief Information Security Officer'],
        sponsorTiers: ['Title Partner (1)', 'Platinum Sponsors (3)', 'Gold Ecosystem Partners (6)']
      },
      recommendations: [
        'Have dedicated slide-advancement clickers with fresh batteries for every individual speaker.',
        'Send attendees a concise post-event survey with a link to video session recordings within 24 hours.'
      ]
    };
  }

  private generateCustomMock(title: string, prompt: string) {
    return {
      summary: `Tailored strategic execution blueprint for "${title}", synthesized from user creative brief and custom event parameters.`,
      themeAndConcept: {
        themeName: 'Bespoke Experience & Community Vision',
        description: 'Adaptive design emphasizing the unique goals and atmosphere requested by the host.',
        recommendedColorPalette: ['#3b82f6', '#8b5cf6', '#ec4899', '#f8fafc']
      },
      assumptions: [
        'Event parameters and attendance scale validated with venue capacity.',
        'Lead time allows standard production turnaround and vendor bookings.'
      ],
      warnings: [
        'Unconventional event specifications require confirming vendor capabilities early.'
      ],
      budgetProposal: {
        suggestedContingencyPercentage: 15,
        categories: [
          { categoryName: 'Core Experience & Programming', percentageOfBudget: 40, reasoning: 'Central activities and signature elements specified in creative brief.', savingTips: ['Streamline non-essential decorative items'] },
          { categoryName: 'Hospitality & Dining', percentageOfBudget: 30, reasoning: 'Catering and refreshment provisions suited to attendee count.', savingTips: ['Select seasonal menus'] },
          { categoryName: 'Venue & Production Equipment', percentageOfBudget: 20, reasoning: 'Acoustics, ambient lighting, and space readiness.', savingTips: ['Negotiate package rate for equipment'] },
          { categoryName: 'Contingency & Incidentals', percentageOfBudget: 10, reasoning: 'Buffer for unforeseen logistics or last-minute adjustments.', savingTips: ['Reallocate to savings if unused'] }
        ]
      },
      tasks: [
        { title: 'Finalize Custom Event Format & Participant Flow', category: 'Creative Direction', description: 'Map out the guest experience from arrival to conclusion.', priority: 'critical', daysBeforeEvent: 30, suggestedAssigneeRole: 'Event Producer' },
        { title: 'Procure Specialized Event Equipment & Materials', category: 'Logistics', description: 'Acquire unique materials identified in the custom brief.', priority: 'high', daysBeforeEvent: 14, suggestedAssigneeRole: 'Logistics Lead' },
        { title: 'Coordinate On-site Safety & Hospitality Briefing', category: 'Operations', description: 'Review contingency procedures and operational roles with team.', priority: 'high', daysBeforeEvent: 2, suggestedAssigneeRole: 'Operations Lead' }
      ],
      timelineMilestones: [
        { milestoneName: 'Concept Finalization & Supplier Lock', daysBeforeEvent: 25, description: 'Confirm specialized supplies and site access.' },
        { milestoneName: 'Final On-site Walkthrough', daysBeforeEvent: 1, description: 'Verify floor plan and technical staging.' }
      ],
      eventDaySchedule: [
        { timeOffsetHours: 0, activityTitle: 'Guest Arrival & Welcome Orientation', locationOrZone: 'Entry Zone', leadRole: 'Host Team' },
        { timeOffsetHours: 1.5, activityTitle: 'Main Program & Primary Activity', locationOrZone: 'Central Area', leadRole: 'Event Lead' },
        { timeOffsetHours: 4, activityTitle: 'Concluding Remarks & Social Mixer', locationOrZone: 'Lounge Zone', leadRole: 'Host Team' }
      ],
      templateSpecificModules: {
        customParameters: {
          interpretedBrief: 'Dynamic plan structured from natural language brief',
          modularFocus: 'Customized milestones and tailored budget allocations'
        }
      },
      recommendations: [
        'Conduct an early dry-run of unique activities to ensure seamless timing on event day.',
        'Collect attendee feedback immediately following the event to measure engagement and impact.'
      ]
    };
  }

  private generateRevisionMock(title: string, prompt: string) {
    // If the prompt contains specific instructions, adapt the plan
    const isBudgetCut = prompt.includes('budget') && (prompt.includes('reduce') || prompt.includes('cut') || prompt.includes('less'));
    const isRain = prompt.includes('rain') || prompt.includes('weather');
    const isAttendanceIncrease = prompt.includes('participants') || prompt.includes('attendees') || prompt.includes('200');

    const base = this.generateHackathonMock(title);

    let summaryNote = `Updated revision tailored to user instructions.`;
    if (isBudgetCut) {
      summaryNote = `Revised plan: Budget redistributed to optimize core priorities with reduced overhead.`;
      base.budgetProposal.categories[0].percentageOfBudget = 30; // Reduced prize
      base.budgetProposal.categories[1].percentageOfBudget = 35; // Maintained food
      base.budgetProposal.categories[3].percentageOfBudget = 10; // Reduced swag
      base.warnings.push('Budget cut applied: Promotional apparel scaled down to preserve food and prize quality.');
    }

    if (isRain) {
      summaryNote += ` Inclement weather contingency plan activated.`;
      base.assumptions.push('Outdoor activities shifted to indoor secondary hall B.');
      base.tasks.unshift({
        title: 'Inspect Indoor Secondary Hall B for Rain Contingency',
        category: 'Venue & Infrastructure',
        description: 'Verify ventilation, floor covering, and electrical power for all participants indoors.',
        priority: 'critical',
        daysBeforeEvent: 3,
        suggestedAssigneeRole: 'Safety Lead'
      });
      base.warnings.push('Rain contingency: Indoor capacity verified for 100% of attendees.');
    }

    if (isAttendanceIncrease) {
      summaryNote += ` Scaled operational capacity for 200+ attendees.`;
      base.warnings.push('Attendance increased: Added extra food station and expanded registration check-in desks.');
    }

    base.summary = `${summaryNote} ${base.summary}`;
    return base;
  }
}
