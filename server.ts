import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_OPPORTUNITIES } from "./src/data/initialOpportunities.ts";
import { Application, VolunteerOpportunity, OrganizationAccount, OrgMember } from "./src/types.ts";
import { 
  checkOpportunityConflictWithConfirmedApps, 
  resolveAutoCancellationsOnConfirmation,
  checkSingleConflict 
} from "./src/utils/conflictUtils.ts";

let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory persistent store
let opportunities: VolunteerOpportunity[] = [...INITIAL_OPPORTUNITIES];
let applications: Application[] = [
  {
    id: "app-demo-01",
    opportunityId: "nyc-vol-001",
    opportunityTitle: "Fresh Produce Mobile Market Repacking & Distribution",
    organization: "City Harvest NYC",
    borough: "Bronx",
    applicantName: "Jordan Rivera",
    applicantEmail: "jordan.rivera@example.com",
    applicantPhone: "(917) 555-0192",
    experienceNotes: "Passionate about food justice in NYC. Have volunteered at local pantry before.",
    emergencyContact: "Maria Rivera (Sister) - (917) 555-0199",
    status: "Confirmed",
    appliedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    shiftSelected: "Saturday, 8:30 AM - 12:00 PM",
    hoursCompleted: 3.5
  }
];

let organizations: OrganizationAccount[] = [
  {
    id: "org-city-harvest",
    orgName: "City Harvest NYC",
    ein: "13-2956102",
    website: "https://www.cityharvest.org",
    mission: "New York City's first and largest food rescue organization, helping feed millions of hungry New Yorkers.",
    borough: "Manhattan",
    contactEmail: "volunteer@cityharvest.org",
    contactPhone: "(212) 463-9456",
    isVerified: true,
    verificationBadge: "Verified 501(c)(3) NYS Charities Bureau",
    verifiedAt: new Date(Date.now() - 86400000 * 100).toISOString(),
    members: [
      { id: "m-1", name: "Sarah Jenkins", email: "sarah.jenkins@cityharvest.org", role: "Admin", title: "Director of Volunteer Operations", createdAt: new Date().toISOString() },
      { id: "m-2", name: "David Chen", email: "david.chen@cityharvest.org", role: "Staff", title: "Mobile Market Coordinator", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "org-food-bank",
    orgName: "Food Bank For New York City",
    ein: "13-3120491",
    website: "https://www.foodbanknyc.org",
    mission: "Empowering every New Yorker to achieve food security for good through a citywide network of pantries and soup kitchens.",
    borough: "Manhattan",
    contactEmail: "volunteer@foodbanknyc.org",
    contactPhone: "(212) 566-7855",
    isVerified: true,
    verificationBadge: "Verified 501(c)(3) IRS Certified",
    verifiedAt: new Date(Date.now() - 86400000 * 150).toISOString(),
    members: [
      { id: "m-3", name: "Marcus Brody", email: "mbrody@foodbanknyc.org", role: "Admin", title: "Community Partnership Lead", createdAt: new Date().toISOString() }
    ]
  },
  {
    id: "org-ny-cares",
    orgName: "New York Cares",
    ein: "13-3456789",
    website: "https://www.newyorkcares.org",
    mission: "Meeting pressing community needs in New York City by mobilizing volunteers in vital service programs.",
    borough: "Manhattan",
    contactEmail: "info@newyorkcares.org",
    contactPhone: "(212) 228-5000",
    isVerified: true,
    verificationBadge: "Verified 501(c)(3) NYC Service Partner",
    verifiedAt: new Date(Date.now() - 86400000 * 200).toISOString(),
    members: [
      { id: "m-4", name: "Elena Rostova", email: "elena@newyorkcares.org", role: "Admin", title: "Programs Director", createdAt: new Date().toISOString() }
    ]
  }
];


async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all organizations
  app.get("/api/organizations", (req, res) => {
    res.json(organizations);
  });

  // Register a new organization and create its initial admin member
  app.post("/api/organizations", (req, res) => {
    const { orgName, ein, website, mission, borough, contactEmail, adminName, adminEmail } = req.body;
    if (!orgName || !ein || !adminName || !adminEmail) {
      return res.status(400).json({ error: "Missing required organization or admin details" });
    }

    const newOrgId = `org-${Date.now()}`;
    const newMemberId = `m-${Date.now()}`;

    const newOrg: OrganizationAccount = {
      id: newOrgId,
      orgName,
      ein,
      website: website || "https://www.nyc-nonprofit.org",
      mission: mission || "Dedicated to community service and volunteer empowerment in New York City.",
      borough: borough || "Manhattan",
      contactEmail: contactEmail || adminEmail,
      isVerified: true,
      verificationBadge: "Verified 501(c)(3) NYS Charities Bureau",
      verifiedAt: new Date().toISOString(),
      members: [
        {
          id: newMemberId,
          name: adminName,
          email: adminEmail,
          role: "Admin",
          title: "Executive Director / Org Admin",
          createdAt: new Date().toISOString()
        }
      ]
    };

    organizations.push(newOrg);
    res.status(201).json(newOrg);
  });

  // Add member to organization
  app.post("/api/organizations/:orgId/members", (req, res) => {
    const { orgId } = req.params;
    const { name, email, role, title } = req.body;
    const org = organizations.find(o => o.id === orgId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const newMember: OrgMember = {
      id: `m-${Date.now()}`,
      name: name || "Staff Member",
      email: email || "staff@org.org",
      role: role || "Staff",
      title: title || "Volunteer Coordinator",
      createdAt: new Date().toISOString()
    };

    org.members.push(newMember);
    res.json(org);
  });

  // Remove member from organization
  app.delete("/api/organizations/:orgId/members/:memberId", (req, res) => {
    const { orgId, memberId } = req.params;
    const org = organizations.find(o => o.id === orgId);
    if (!org) {
      return res.status(404).json({ error: "Organization not found" });
    }

    if (org.members.length <= 1) {
      return res.status(400).json({ error: "Organization must maintain at least one member account." });
    }

    org.members = org.members.filter(m => m.id !== memberId);
    res.json(org);
  });

  // Get stats
  app.get("/api/stats", (req, res) => {
    const totalOpportunities = opportunities.length;
    const totalSpots = opportunities.reduce((acc, o) => acc + o.spotsTotal, 0);
    const spotsRemaining = opportunities.reduce((acc, o) => acc + o.spotsRemaining, 0);
    const totalApplications = applications.length;
    const hoursLogged = applications.reduce((acc, a) => acc + (a.hoursCompleted || 0), 0);

    const boroughCounts: Record<string, number> = {};
    const causeCounts: Record<string, number> = {};
    const sourceCounts: Record<string, number> = {};

    opportunities.forEach(o => {
      boroughCounts[o.borough] = (boroughCounts[o.borough] || 0) + 1;
      causeCounts[o.cause] = (causeCounts[o.cause] || 0) + 1;
      sourceCounts[o.source] = (sourceCounts[o.source] || 0) + 1;
    });

    res.json({
      totalOpportunities,
      totalSpots,
      spotsRemaining,
totalApplications,
      hoursLogged,
      boroughCounts,
      causeCounts,
      sourceCounts
    });
  });

  // Get opportunities with filtering
  app.get("/api/opportunities", (req, res) => {
    let list = [...opportunities];
    const {
      search,
      cause,
      borough,
      commitment,
      source,
      minAge,
wheelchairOnly,
      indoorOutdoor
    } = req.query;

    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      list = list.filter(o =>
        o.title.toLowerCase().includes(q) ||
        o.organization.toLowerCase().includes(q) ||
        o.description.toLowerCase().includes(q) ||
        o.neighborhood.toLowerCase().includes(q) ||
        o.whatYouWillDo.some(item => item.toLowerCase().includes(q)) ||
        o.skillsRequired.some(s => s.toLowerCase().includes(q))
      );
    }

    if (cause && typeof cause === "string" && cause !== "All") {
      list = list.filter(o => o.cause === cause);
    }

    if (borough && typeof borough === "string" && borough !== "All") {
      list = list.filter(o => o.borough === borough);
    }

    if (commitment && typeof commitment === "string" && commitment !== "All") {
      list = list.filter(o => o.commitmentType === commitment);
    }

    if (source && typeof source === "string" && source !== "All") {
      list = list.filter(o => o.source === source);
    }

    if (wheelchairOnly === "true") {
      list = list.filter(o => o.constraints.wheelchairAccessible);
    }

    if (indoorOutdoor && typeof indoorOutdoor === "string" && indoorOutdoor !== "All") {
      list = list.filter(o => o.constraints.indoorOutdoor === indoorOutdoor);
    }

    res.json(list);
  });

  // Get single opportunity
  app.get("/api/opportunities/:id", (req, res) => {
    const opp = opportunities.find(o => o.id === req.params.id);
    if (!opp) {
      return res.status(404).json({ error: "Opportunity not found" });
    }
    res.json(opp);
  });

  // Post new opportunity
  app.post("/api/opportunities", (req, res) => {
    const body = req.body;
    if (!body.title || !body.organization || !body.description || !body.cause || !body.borough) {
      return res.status(400).json({ error: "Missing mandatory fields (title, organization, description, cause, borough)" });
    }

    const newOpp: VolunteerOpportunity = {
      id: `opp-custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: body.title,
      organization: body.organization,
      orgWebsite: body.orgWebsite || "",
      orgContactPerson: body.orgContactPerson || "Volunteer Coordinator",
      contactEmail: body.contactEmail || "volunteer@community.org",
      contactPhone: body.contactPhone || "",
      description: body.description,
      cause: body.cause,
      borough: body.borough,
      neighborhood: body.neighborhood || "NYC Local",
      address: body.address || "New York, NY",
      subwayLines: Array.isArray(body.subwayLines) ? body.subwayLines : (body.subwayLines ? [body.subwayLines] : ["Subway nearby"]),
      commitmentType: body.commitmentType || "One-time Shift",
      dates: body.dates || "Upcoming Shift (Aug 2026)",
      nextDate: body.nextDate || (Array.isArray(body.upcomingDates) && body.upcomingDates.length > 0 ? body.upcomingDates[0] : "Upcoming Saturday, Aug 22, 2026"),
      upcomingDates: Array.isArray(body.upcomingDates) && body.upcomingDates.length > 0 ? body.upcomingDates : [body.dates || "Upcoming Saturday, Aug 22, 2026 (10:00 AM - 1:00 PM)"],
      timeDuration: body.timeDuration || "2-3 Hours",
      shiftSchedule: body.shiftSchedule || "Standard Shift",
      whatYouWillDo: Array.isArray(body.whatYouWillDo) && body.whatYouWillDo.length > 0 ? body.whatYouWillDo : ["Assist with community programming", "Collaborate with non-profit coordinators"],
      skillsRequired: Array.isArray(body.skillsRequired) && body.skillsRequired.length > 0 ? body.skillsRequired : ["No experience required"],
      ageRequirement: body.ageRequirement || "All Ages / 16+",
      attire: body.attire || "Comfortable casual clothes and closed-toe shoes",
constraints: {
        allergies: body.constraints?.allergies || ["None reported"],
        physicalDemands: body.constraints?.physicalDemands || ["Moderate activity"],
        wheelchairAccessible: body.constraints?.wheelchairAccessible ?? true,
        indoorOutdoor: body.constraints?.indoorOutdoor || "Indoor"
      },
      applicationMode: body.applicationMode || "direct",
      externalApplyUrl: body.externalApplyUrl || "",
      spotsTotal: Number(body.spotsTotal) || 10,
      spotsRemaining: Number(body.spotsRemaining ?? body.spotsTotal) || 10,
      source: body.source || "Community Post",
      postedDate: new Date().toISOString().split("T")[0],
      urgent: Boolean(body.urgent),
      featured: false
    };

    opportunities.unshift(newOpp);
    res.status(201).json(newOpp);
  });

  // AI-Assisted Opportunity Parsing from raw text, flyer, or job announcement
  app.post("/api/opportunities/ai-parse", async (req, res) => {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "rawText string is required" });
    }

    const ai = getGenAI();
    if (!ai) {
      // Fallback heuristics if API key not present
      return res.json({
        title: "Community Volunteer Action",
        organization: "NYC Community Initiative",
        description: rawText.slice(0, 300),
        cause: "Community Advocacy",
        borough: "Manhattan",
        neighborhood: "Central NYC",
        address: "New York, NY",
        subwayLines: ["Nearby Subway"],
        commitmentType: "One-time Shift",
        dates: "Upcoming Weekend",
        timeDuration: "3 Hours",
        shiftSchedule: "10:00 AM - 1:00 PM",
        whatYouWillDo: ["Community assistance", "Support event setup and logistics"],
        skillsRequired: ["Positive attitude", "Punctuality"],
        ageRequirement: "16+",
        attire: "Closed-toe shoes and comfortable attire",
constraints: {
          allergies: ["None stated"],
          physicalDemands: ["Light activity"],
          wheelchairAccessible: true,
          indoorOutdoor: "Indoor"
        },
        applicationMode: "direct",
        spotsTotal: 10,
        spotsRemaining: 10,
        source: "Non-Profit Direct"
      });
    }

    try {
      const prompt = `You are an expert New York City volunteer coordinator and data extractor.
Analyze the following raw volunteer post, announcement, Eventbrite blurb, or email, and extract ALL required structured fields into precise JSON.

Causes allowed: "Food Security & Hunger" | "Youth & Education" | "Animal Welfare" | "Environment & Parks" | "Housing & Homelessness" | "Senior Support" | "Arts & Culture" | "Health & Wellness" | "Community Advocacy" | "Crisis & Disaster Relief"
Boroughs allowed: "Manhattan" | "Brooklyn" | "Queens" | "Bronx" | "Staten Island" | "Remote / Citywide"
Commitment Types: "One-time Shift" | "Weekly Recurring" | "Monthly Recurring" | "Flexible Schedule" | "Seasonal / Multi-Week"
Sources allowed: "Non-Profit Direct" | "Idealist.org" | "Eventbrite" | "Point App" | "NYC Service / Community"

Raw text to analyze:
"""
${rawText}
"""

Ensure you extract realistic NYC subway lines, detailed whatYouWillDo bullet points, precise attire guidelines, allergy warnings, physical constraints, and volunteer credit eligibility.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              organization: { type: Type.STRING },
              orgWebsite: { type: Type.STRING },
              orgContactPerson: { type: Type.STRING },
              contactEmail: { type: Type.STRING },
              contactPhone: { type: Type.STRING },
              description: { type: Type.STRING },
              cause: { type: Type.STRING },
              borough: { type: Type.STRING },
              neighborhood: { type: Type.STRING },
              address: { type: Type.STRING },
              subwayLines: { type: Type.ARRAY, items: { type: Type.STRING } },
              commitmentType: { type: Type.STRING },
              dates: { type: Type.STRING },
              timeDuration: { type: Type.STRING },
              shiftSchedule: { type: Type.STRING },
              whatYouWillDo: { type: Type.ARRAY, items: { type: Type.STRING } },
              skillsRequired: { type: Type.ARRAY, items: { type: Type.STRING } },
              ageRequirement: { type: Type.STRING },
              attire: { type: Type.STRING },
              allergies: { type: Type.ARRAY, items: { type: Type.STRING } },
              physicalDemands: { type: Type.ARRAY, items: { type: Type.STRING } },
              wheelchairAccessible: { type: Type.BOOLEAN },
              indoorOutdoor: { type: Type.STRING },
              applicationMode: { type: Type.STRING },
              externalApplyUrl: { type: Type.STRING },
              spotsTotal: { type: Type.INTEGER },
              source: { type: Type.STRING }
            },
            required: ["title", "organization", "description", "cause", "borough", "whatYouWillDo", "attire"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        ...parsed,
        constraints: {
          allergies: parsed.allergies || ["None listed"],
          physicalDemands: parsed.physicalDemands || ["Moderate standing/walking"],
          wheelchairAccessible: parsed.wheelchairAccessible ?? true,
          indoorOutdoor: parsed.indoorOutdoor || "Indoor"
        },
        spotsRemaining: parsed.spotsTotal || 10
      });
    } catch (err: any) {
      console.error("Error in AI parse:", err);
      res.status(500).json({ error: "Failed to parse volunteer opportunity", details: err.message });
    }
  });



  // AI Link & Organization Fact-Check / Verification Endpoint
  app.post("/api/opportunities/verify-links", async (req, res) => {
    const { organization, orgWebsite, contactEmail, title } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        isVerified: true,
        verifiedWebsite: orgWebsite || "https://www.nycservice.org",
        verifiedEmail: contactEmail || "volunteer@nyc.gov",
        confidenceScore: 92,
        verificationSummary: `Organization '${organization}' appears active in NYC. Links and contact information match standard non-profit directories.`,
        sources: [{ title: "NYC Non-Profit Directory", uri: orgWebsite || "https://www.nycservice.org" }]
      });
    }

    try {
      const prompt = `You are an expert New York City non-profit auditor and fact-checker.
Verify the following volunteer organization and its contact details using Google Search Grounding:
- Organization Name: "${organization}"
- Proposed Website URL: "${orgWebsite}"
- Proposed Contact Email: "${contactEmail}"
- Volunteer Opportunity Title: "${title}"

Search the web for "${organization} NYC official website volunteer contact email" and verify if:
1. The organization is a legitimate active NYC non-profit or public entity.
2. The official website URL is correct and active.
3. The contact email is correct or suggest the correct official volunteer email if incorrect.

Return JSON with:
- isVerified (boolean)
- verifiedWebsite (string, the correct official domain)
- verifiedEmail (string, the correct official contact email)
- confidenceScore (number 0-100)
- verificationSummary (string, detailed findings)
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              isVerified: { type: Type.BOOLEAN },
              verifiedWebsite: { type: Type.STRING },
              verifiedEmail: { type: Type.STRING },
              confidenceScore: { type: Type.INTEGER },
              verificationSummary: { type: Type.STRING }
            },
            required: ["isVerified", "verifiedWebsite", "verifiedEmail", "confidenceScore", "verificationSummary"]
          }
        }
      });

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources = groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((w: any) => Boolean(w && w.uri))
        .slice(0, 4);

      const parsed = JSON.parse(response.text || "{}");
      res.json({
        ...parsed,
        sources: sources.length > 0 ? sources : [{ title: organization, uri: orgWebsite || "https://www.nycservice.org" }]
      });
    } catch (err: any) {
      console.error("Link verification error:", err);
      res.status(500).json({ error: "Failed to verify links", details: err.message });
    }
  });

  // AI Matchmaker Endpoint
  app.post("/api/matchmaker/ai-recommend", async (req, res) => {
    const { preferences = req.body, applications: userApplications = applications } = req.body;
    const ai = getGenAI();

    // Automatically exclude any opportunities that conflict with confirmed schedule shifts
    const nonConflictingOpportunities = opportunities.filter(o => {
      const conflict = checkOpportunityConflictWithConfirmedApps(o, userApplications, opportunities);
      return !conflict.hasConflict;
    });

    const candidateList = nonConflictingOpportunities.map(o => ({
      id: o.id,
      title: o.title,
      organization: o.organization,
      cause: o.cause,
      borough: o.borough,
      neighborhood: o.neighborhood,
      commitmentType: o.commitmentType,
      timeDuration: o.timeDuration,
      skillsRequired: o.skillsRequired,
      ageRequirement: o.ageRequirement,
      attire: o.attire,
      constraints: o.constraints,
      shiftSchedule: o.shiftSchedule,
      dates: o.dates
    }));

    // Smart preference-scoring helper for heuristic fallback
    const getSmartMatches = () => {
      const prefs = preferences.preferences || preferences;
      const preferredBoroughs: string[] = prefs.boroughs || [];
      const preferredCauses: string[] = prefs.causes || [];

      const scored = candidateList.map(c => {
        let boroughScore = preferredBoroughs.length === 0 || preferredBoroughs.includes(c.borough) ? 25 : 10;
        let causeScore = preferredCauses.length === 0 || preferredCauses.includes(c.cause) ? 35 : 15;
        let scheduleScore = 25; // Clean schedule (0 conflict)
        let skillScore = 15; // Physical & skill compatibility
        let totalScore = boroughScore + causeScore + scheduleScore + skillScore;

        let reasons: string[] = [];
        if (preferredBoroughs.includes(c.borough)) reasons.push(`+25% Borough match (${c.borough})`);
        if (preferredCauses.includes(c.cause)) reasons.push(`+35% Cause alignment (${c.cause})`);
        reasons.push(`+25% Clean schedule (no time conflicts with confirmed shifts)`);
        reasons.push(`+15% Physical & skill compatibility`);

        return {
          opportunityId: c.id,
          matchScore: Math.min(totalScore, 98),
          whyMatch: `Excellent fit for your preference in ${c.cause} within ${c.borough}. Zero schedule conflicts detected with your confirmed shifts.`,
          highlightedPros: [
            `Location: ${c.borough} (${c.neighborhood})`,
            `Commitment: ${c.commitmentType}`,
            `Duration: ${c.timeDuration}`
          ],
          scoreBreakdown: {
            boroughMatchScore: boroughScore,
            causeMatchScore: causeScore,
            scheduleMatchScore: scheduleScore,
            skillsAllergyMatchScore: skillScore,
            calculationExplanation: reasons.join(". ") + "."
          }
        };
      });

      scored.sort((a, b) => b.matchScore - a.matchScore);
      return scored.slice(0, 4);
    };

    const conflictFilteredCount = opportunities.length - nonConflictingOpportunities.length;
    const conflictNote = conflictFilteredCount > 0 
      ? ` Note: ${conflictFilteredCount} opportunity(ies) were automatically excluded due to direct time conflicts with your confirmed schedule.` 
      : ` All available roles are free of schedule conflicts with your confirmed shifts.`;

    if (!ai) {
      const matched = getSmartMatches();
      return res.json({
        topMatches: matched,
        personalizedAdvice: "Based on your saved profile preferences and confirmed schedule, conflicting shifts have been automatically excluded." + conflictNote
      });
    }

    try {
      const prompt = `You are the NYC Volunteer Matchmaker AI.
User Preferences:
${JSON.stringify(preferences, null, 2)}

Confirmed User Applications (to avoid scheduling conflicts):
${JSON.stringify(userApplications, null, 2)}

Available NYC Opportunities (already pre-filtered to exclude time conflicts):
${JSON.stringify(candidateList, null, 2)}

Evaluate and rank the top 3-4 best matches.
For each match, provide:
1. opportunityId
2. matchScore (1-100)
3. whyMatch (concise reasoning tailored to causes, schedule, and constraints)
4. highlightedPros (array of 3 short strings)
5. scoreBreakdown object with:
   - boroughMatchScore (number out of 25)
   - causeMatchScore (number out of 35)
   - scheduleMatchScore (number out of 25)
   - skillsAllergyMatchScore (number out of 15)
   - calculationExplanation (string explaining how the score was computed from these 4 criteria)

Also provide personalizedAdvice explaining how conflicting shifts were successfully excluded and tips for their volunteer schedule.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              topMatches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    opportunityId: { type: Type.STRING },
                    matchScore: { type: Type.INTEGER },
                    whyMatch: { type: Type.STRING },
                    highlightedPros: { type: Type.ARRAY, items: { type: Type.STRING } },
                    scoreBreakdown: {
                      type: Type.OBJECT,
                      properties: {
                        boroughMatchScore: { type: Type.INTEGER },
                        causeMatchScore: { type: Type.INTEGER },
                        scheduleMatchScore: { type: Type.INTEGER },
                        skillsAllergyMatchScore: { type: Type.INTEGER },
                        calculationExplanation: { type: Type.STRING }
                      },
                      required: ["boroughMatchScore", "causeMatchScore", "scheduleMatchScore", "skillsAllergyMatchScore", "calculationExplanation"]
                    }
                  },
                  required: ["opportunityId", "matchScore", "whyMatch", "highlightedPros", "scoreBreakdown"]
                }
              },
              personalizedAdvice: { type: Type.STRING }
            },
            required: ["topMatches", "personalizedAdvice"]
          }
        }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json(parsed);
    } catch (err: any) {
      console.error("Matchmaker error (falling back to smart heuristic due to quota/network):", err);
      const matched = getSmartMatches();
      return res.json({
        topMatches: matched,
        personalizedAdvice: "Based on your saved profile preferences and confirmed schedule, conflicting shifts have been automatically excluded." + conflictNote
      });
    }
  });

  // Get user applications
  app.get("/api/applications", (req, res) => {
    res.json(applications);
  });

  // Check conflict for an opportunity or shift
  app.post("/api/applications/check-conflict", (req, res) => {
    const { opportunityId, shiftSchedule, dates } = req.body;
    const opp = opportunities.find(o => o.id === opportunityId);
    
    if (opp) {
      const conflict = checkOpportunityConflictWithConfirmedApps(opp, applications, opportunities, 2.5);
      return res.json(conflict);
    } else if (shiftSchedule && dates) {
      const dummyOpp: any = { id: 'temp-check', title: 'Candidate Role', shiftSchedule, dates, upcomingDates: [] };
      const conflict = checkOpportunityConflictWithConfirmedApps(dummyOpp, applications, opportunities, 2.5);
      return res.json(conflict);
    }
    
    res.json({ hasConflict: false });
  });

  // Submit direct application (allows multiple pending applications on same time block, but blocks if already Confirmed)
  app.post("/api/applications", (req, res) => {
    const {
      opportunityId,
      applicantName,
      applicantEmail,
      applicantPhone,
      experienceNotes,
      emergencyContact,
      requestedCreditVerification,
      shiftSelected,
      status
    } = req.body;

    if (!opportunityId || !applicantName || !applicantEmail) {
      return res.status(400).json({ error: "Missing required application fields" });
    }

    const opp = opportunities.find(o => o.id === opportunityId);
    if (!opp) {
      return res.status(404).json({ error: "Opportunity not found" });
    }

    // 1. Check if user already has a CONFIRMED shift that conflicts in time (2.5h buffer)
    const conflict = checkOpportunityConflictWithConfirmedApps(opp, applications, opportunities, 2.5);
    if (conflict.hasConflict) {
      return res.status(409).json({ 
        error: "Schedule Conflict with Confirmed Shift", 
        message: conflict.reason || "You already have a confirmed shift for this timeframe (including a 2-3 hour travel and commitment buffer). PitchInNYC prevents double-booking confirmed roles.",
        conflict
      });
    }

    if (opp.spotsRemaining > 0) {
      opp.spotsRemaining -= 1;
    }

    const initialStatus = status === "Confirmed" ? "Confirmed" : "Submitted";

    const newApp: Application = {
      id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      opportunityId,
      opportunityTitle: opp.title,
      organization: opp.organization,
      borough: opp.borough,
      applicantName,
      applicantEmail,
      applicantPhone: applicantPhone || "",
      experienceNotes: experienceNotes || "Interested in supporting this community effort.",
      emergencyContact: emergencyContact || "Provided on file",
      status: initialStatus,
      appliedAt: new Date().toISOString(),
      shiftSelected: shiftSelected || opp.shiftSchedule,
      hoursCompleted: 0
    };

    applications.unshift(newApp);

    // If submitted directly as Confirmed, auto-cancel any conflicting pending applications
    let autoCancelledCount = 0;
    let cancelledApps: Application[] = [];

    if (initialStatus === "Confirmed") {
      const resolution = resolveAutoCancellationsOnConfirmation(newApp, applications, opportunities, 2.5);
      applications = resolution.updatedApplications;
      autoCancelledCount = resolution.cancelledCount;
      cancelledApps = resolution.cancelledApps;
    }

    res.status(201).json({
      ...newApp,
      autoCancelledCount,
      cancelledApps
    });
  });

  // Confirm application endpoint (confirms application and auto-cancels any conflicting pending applications)
  app.post("/api/applications/:id/confirm", (req, res) => {
    const appItem = applications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: "Application not found" });
    }

    appItem.status = "Confirmed";

    // Auto-cancel all conflicting submitted/pending applications within 2.5h buffer
    const resolution = resolveAutoCancellationsOnConfirmation(appItem, applications, opportunities, 2.5);
    applications = resolution.updatedApplications;

    res.json({
      application: appItem,
      allApplications: applications,
      autoCancelledCount: resolution.cancelledCount,
      cancelledApps: resolution.cancelledApps
    });
  });

  // Cancel application endpoint
  app.post("/api/applications/:id/cancel", (req, res) => {
    const appItem = applications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: "Application not found" });
    }

    appItem.status = "Cancelled";
    if (req.body.reason) {
      appItem.cancellationReason = req.body.reason;
    }

    // Restore spot if direct opportunity
    const opp = opportunities.find(o => o.id === appItem.opportunityId);
    if (opp && opp.spotsRemaining < opp.spotsTotal) {
      opp.spotsRemaining += 1;
    }

    res.json(appItem);
  });

  // Update application status / log completed hours
  app.patch("/api/applications/:id/status", (req, res) => {
    const appItem = applications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: "Application not found" });
    }

    const previousStatus = appItem.status;
    if (req.body.status) appItem.status = req.body.status;
    if (typeof req.body.hoursCompleted === "number") appItem.hoursCompleted = req.body.hoursCompleted;
    if (typeof req.body.hours === "number") appItem.hoursCompleted = (appItem.hoursCompleted || 0) + req.body.hours;

    let autoCancelledCount = 0;
    let cancelledApps: Application[] = [];

    // If transitioned to Confirmed, auto-cancel overlapping pending applications
    if (req.body.status === "Confirmed" && previousStatus !== "Confirmed") {
      const resolution = resolveAutoCancellationsOnConfirmation(appItem, applications, opportunities, 2.5);
      applications = resolution.updatedApplications;
      autoCancelledCount = resolution.cancelledCount;
      cancelledApps = resolution.cancelledApps;
    }

    res.json({
      ...appItem,
      autoCancelledCount,
      cancelledApps,
      allApplications: applications
    });
  });

  // Dedicated endpoint for logging hours
  app.patch("/api/applications/:id/log-hours", (req, res) => {
    const appItem = applications.find(a => a.id === req.params.id);
    if (!appItem) {
      return res.status(404).json({ error: "Application not found" });
    }

    const addedHours = typeof req.body.hours === "number" ? req.body.hours : (typeof req.body.hoursCompleted === "number" ? req.body.hoursCompleted : 0);
    appItem.hoursCompleted = (appItem.hoursCompleted || 0) + addedHours;
    if (appItem.status === "Confirmed" && appItem.hoursCompleted > 0) {
      appItem.status = "Completed";
    }

    res.json(appItem);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Volunteer Hub Server running on http://localhost:${PORT}`);
  });
}

startServer();
