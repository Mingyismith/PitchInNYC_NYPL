import { VolunteerOpportunity, Application, ScheduleConflictInfo } from '../types';

/**
 * Parses time expressions (e.g. "8:30 AM - 12:00 PM", "Breakfast: 7:00 AM - 9:30 AM | Dinner: 4:30 PM - 7:00 PM")
 * into minutes from midnight (0 to 1440).
 */
export function parseTimeRanges(text: string): { startMinutes: number; endMinutes: number }[] {
  if (!text) return [];
  const ranges: { startMinutes: number; endMinutes: number }[] = [];

  // Regex to match "8:30 AM - 12:00 PM", "9:00am to 1:00pm", "11:00 AM – 1:00 PM", "3:00 PM - 5:00 PM"
  const timeRangeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/gi;

  let match;
  while ((match = timeRangeRegex.exec(text)) !== null) {
    let startH = parseInt(match[1], 10);
    const startM = match[2] ? parseInt(match[2], 10) : 0;
    let startMeridiem = match[3] ? match[3].toLowerCase() : '';

    let endH = parseInt(match[4], 10);
    const endM = match[5] ? parseInt(match[5], 10) : 0;
    const endMeridiem = match[6] ? match[6].toLowerCase() : 'pm';

    // If start doesn't have AM/PM, infer from context
    if (!startMeridiem) {
      if (endMeridiem === 'pm' && startH < 12 && startH >= 7 && startH > endH) {
        // e.g. 9 - 1 PM -> 9 AM
        startMeridiem = 'am';
      } else if (endMeridiem === 'pm' && startH < endH && startH >= 12) {
        startMeridiem = 'pm';
      } else if (endMeridiem === 'pm' && startH >= 1 && startH <= 6 && endH <= 11) {
        startMeridiem = 'pm';
      } else {
        startMeridiem = (startH >= 7 && startH <= 11) ? 'am' : endMeridiem;
      }
    }

    if (startMeridiem === 'pm' && startH < 12) startH += 12;
    if (startMeridiem === 'am' && startH === 12) startH = 0;

    if (endMeridiem === 'pm' && endH < 12) endH += 12;
    if (endMeridiem === 'am' && endH === 12) endH = 0;

    const startMinutes = startH * 60 + startM;
    let endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      // Crosses midnight or 12-hour ambiguity
      if (endMinutes < startMinutes && endH < 12) {
        endMinutes += 12 * 60;
      } else {
        endMinutes = startMinutes + 180; // default 3 hr shift if malformed
      }
    }

    ranges.push({ startMinutes, endMinutes });
  }

  // Fallback: If no range regex matched but text contains standard duration, assign a typical morning shift
  if (ranges.length === 0) {
    if (text.toLowerCase().includes('morning') || text.toLowerCase().includes('breakfast')) {
      ranges.push({ startMinutes: 9 * 60, endMinutes: 12 * 60 });
    } else if (text.toLowerCase().includes('evening') || text.toLowerCase().includes('dinner')) {
      ranges.push({ startMinutes: 17 * 60, endMinutes: 20 * 60 });
    } else if (text.toLowerCase().includes('afternoon')) {
      ranges.push({ startMinutes: 13 * 60, endMinutes: 16 * 60 });
    } else {
      // Generic 3-hour midday shift
      ranges.push({ startMinutes: 10 * 60, endMinutes: 13 * 60 });
    }
  }

  return ranges;
}

/**
 * Extracts specific calendar dates (e.g. "Aug 18, 2026", "2026-08-18") and days of the week (e.g. "Tuesday", "Saturday").
 */
export function parseDaysAndDates(text: string): { daysOfWeek: string[]; specificDates: string[]; isDaily: boolean } {
  if (!text) return { daysOfWeek: [], specificDates: [], isDaily: false };

  const lower = text.toLowerCase();
  const isDaily = lower.includes('daily') || lower.includes('every day') || lower.includes('all days');

  const daysOfWeek: string[] = [];
  const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const DAY_ALIASES: Record<string, string> = {
    'mon': 'monday',
    'tue': 'tuesday',
    'tues': 'tuesday',
    'wed': 'wednesday',
    'thu': 'thursday',
    'thur': 'thursday',
    'thurs': 'thursday',
    'fri': 'friday',
    'sat': 'saturday',
    'sun': 'sunday'
  };

  if (isDaily) {
    daysOfWeek.push(...DAYS);
  } else {
    DAYS.forEach(day => {
      if (lower.includes(day)) {
        daysOfWeek.push(day);
      }
    });

    if (daysOfWeek.length === 0) {
      Object.entries(DAY_ALIASES).forEach(([alias, full]) => {
        const regex = new RegExp(`\\b${alias}\\b`, 'i');
        if (regex.test(text) && !daysOfWeek.includes(full)) {
          daysOfWeek.push(full);
        }
      });
    }

    if (lower.includes('weekend')) {
      if (!daysOfWeek.includes('saturday')) daysOfWeek.push('saturday');
      if (!daysOfWeek.includes('sunday')) daysOfWeek.push('sunday');
    }
    if (lower.includes('weekday')) {
      ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].forEach(d => {
        if (!daysOfWeek.includes(d)) daysOfWeek.push(d);
      });
    }
  }

  // Extract month + day patterns (e.g. "Aug 18", "August 18", "Sep 5", "8/18/2026", "2026-08-18")
  const specificDates: string[] = [];
  const datePattern = /(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:,?\s*(\d{4}))?/gi;

  let dateMatch;
  while ((dateMatch = datePattern.exec(text)) !== null) {
    const month = dateMatch[1].slice(0, 3).toLowerCase();
    const day = dateMatch[2];
    const year = dateMatch[3] || '2026';
    specificDates.push(`${month}-${day}-${year}`);
  }

  // Also match ISO YYYY-MM-DD
  const isoPattern = /(\d{4})-(\d{2})-(\d{2})/g;
  let isoMatch;
  while ((isoMatch = isoPattern.exec(text)) !== null) {
    specificDates.push(`iso-${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`);
  }

  return { daysOfWeek, specificDates, isDaily };
}

/**
 * Checks if two date specifications match (either share a specific date, share a day of the week, or one is daily).
 */
export function datesOverlap(
  datesA: { daysOfWeek: string[]; specificDates: string[]; isDaily: boolean },
  datesB: { daysOfWeek: string[]; specificDates: string[]; isDaily: boolean }
): { match: boolean; matchedContext?: string } {
  // Check exact specific dates first
  if (datesA.specificDates.length > 0 && datesB.specificDates.length > 0) {
    for (const d1 of datesA.specificDates) {
      if (datesB.specificDates.includes(d1)) {
        return { match: true, matchedContext: `Exact Date (${d1.replace('-', ' ')})` };
      }
    }
  }

  // If one or both have days of week
  if (datesA.isDaily || datesB.isDaily) {
    return { match: true, matchedContext: 'Daily Shift' };
  }

  for (const d1 of datesA.daysOfWeek) {
    if (datesB.daysOfWeek.includes(d1)) {
      const cap = d1.charAt(0).toUpperCase() + d1.slice(1);
      return { match: true, matchedContext: `${cap}` };
    }
  }

  // If specific date matches a day of the week from either (or no explicit dates specified, assume possible day overlap)
  if (datesA.daysOfWeek.length === 0 && datesA.specificDates.length === 0 &&
      datesB.daysOfWeek.length === 0 && datesB.specificDates.length === 0) {
    return { match: true, matchedContext: 'Same day' };
  }

  return { match: false };
}

/**
 * Formats minutes from midnight into 12-hour AM/PM string.
 */
export function formatMinutes(mins: number): string {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const mStr = m < 10 ? `0${m}` : `${m}`;
  return `${h12}:${mStr} ${meridiem}`;
}

/**
 * Checks whether two shifts on the same date conflict given a buffer (default 150 min = 2.5 hours).
 */
export function doTimeIntervalsOverlapWithBuffer(
  rangeA: { startMinutes: number; endMinutes: number },
  rangeB: { startMinutes: number; endMinutes: number },
  bufferMinutes: number = 150 // 2.5 hours travel/prep buffer
): boolean {
  const bufferedAStart = Math.max(0, rangeA.startMinutes - bufferMinutes);
  const bufferedAEnd = Math.min(1440, rangeA.endMinutes + bufferMinutes);

  return rangeB.startMinutes < bufferedAEnd && rangeB.endMinutes > bufferedAStart;
}

/**
 * Calculates whether an opportunity or shift conflicts with a given confirmed application.
 */
export function checkSingleConflict(
  opportunityShift: string,
  opportunityDates: string,
  confirmedShiftSelected: string,
  confirmedOppDates: string = '',
  bufferMinutes: number = 150
): { hasConflict: boolean; reason?: string; bufferHours: number } {
  const bufferHours = bufferMinutes / 60;

  // 1. Parse dates & days for both
  const oppDateCombined = `${opportunityShift} ${opportunityDates}`;
  const confDateCombined = `${confirmedShiftSelected} ${confirmedOppDates}`;

  const parsedOppDates = parseDaysAndDates(oppDateCombined);
  const parsedConfDates = parseDaysAndDates(confDateCombined);

  const dateMatch = datesOverlap(parsedOppDates, parsedConfDates);
  if (!dateMatch.match) {
    return { hasConflict: false, bufferHours };
  }

  // 2. Parse time ranges
  const oppTimeRanges = parseTimeRanges(opportunityShift);
  const confTimeRanges = parseTimeRanges(confirmedShiftSelected);

  for (const cRange of confTimeRanges) {
    for (const oRange of oppTimeRanges) {
      if (doTimeIntervalsOverlapWithBuffer(cRange, oRange, bufferMinutes)) {
        const bufferedStart = formatMinutes(Math.max(0, cRange.startMinutes - bufferMinutes));
        const bufferedEnd = formatMinutes(Math.min(1440, cRange.endMinutes + bufferMinutes));
        const shiftStart = formatMinutes(cRange.startMinutes);
        const shiftEnd = formatMinutes(cRange.endMinutes);

        return {
          hasConflict: true,
          bufferHours,
          reason: `Locked shift window: ${shiftStart} - ${shiftEnd} (Buffered ${bufferHours} hrs: ${bufferedStart} - ${bufferedEnd}) on ${dateMatch.matchedContext || 'matching day'}`
        };
      }
    }
  }

  return { hasConflict: false, bufferHours };
}

/**
 * Checks if a candidate opportunity conflicts with ANY of the user's Confirmed / Completed applications.
 */
export function checkOpportunityConflictWithConfirmedApps(
  opportunity: VolunteerOpportunity,
  applications: Application[],
  opportunities: VolunteerOpportunity[] = [],
  bufferHours: number = 2.5
): ScheduleConflictInfo {
  const bufferMinutes = Math.round(bufferHours * 60);

  // Filter only Confirmed and Completed applications (Active commitments)
  const confirmedApps = applications.filter(a => a.status === 'Confirmed' || a.status === 'Completed');

  for (const app of confirmedApps) {
    // If it's literally the same opportunity they are already enrolled in
    if (app.opportunityId === opportunity.id) {
      return {
        hasConflict: true,
        conflictingOpportunityId: app.opportunityId,
        conflictingOpportunityTitle: app.opportunityTitle,
        conflictingShift: app.shiftSelected,
        conflictingDate: opportunity.dates,
        bufferHours,
        reason: `You are already enrolled and confirmed for this role (${app.shiftSelected}).`
      };
    }

    // Find the original opportunity for the confirmed app if available to get full date context
    const confOpp = opportunities.find(o => o.id === app.opportunityId);
    const confOppDates = confOpp?.dates || '';

    // Check all shift variants of the candidate opportunity (including upcomingDates if present)
    const shiftStrings = [opportunity.shiftSchedule];
    if (opportunity.upcomingDates && opportunity.upcomingDates.length > 0) {
      shiftStrings.push(...opportunity.upcomingDates);
    }

    for (const shiftStr of shiftStrings) {
      const conflictResult = checkSingleConflict(
        shiftStr,
        opportunity.dates,
        app.shiftSelected,
        confOppDates,
        bufferMinutes
      );

      if (conflictResult.hasConflict) {
        return {
          hasConflict: true,
          conflictingOpportunityId: app.opportunityId,
          conflictingOpportunityTitle: app.opportunityTitle,
          conflictingShift: app.shiftSelected,
          conflictingDate: confOppDates || opportunity.dates,
          bufferHours,
          reason: `Conflicts with your confirmed shift for "${app.opportunityTitle}" [${app.shiftSelected}]. PitchInNYC enforces a ${bufferHours}-hour buffer for transit and focus.`
        };
      }
    }
  }

  return { hasConflict: false };
}

/**
 * When an application is Confirmed, automatically identifies all pending ("Submitted" or "Waitlisted")
 * applications that have a schedule overlap (with 2-3 hr buffer) and updates them to "Cancelled".
 */
export function resolveAutoCancellationsOnConfirmation(
  confirmedApp: Application,
  allApplications: Application[],
  opportunities: VolunteerOpportunity[],
  bufferHours: number = 2.5
): { updatedApplications: Application[]; cancelledCount: number; cancelledApps: Application[] } {
  const bufferMinutes = Math.round(bufferHours * 60);
  const confOpp = opportunities.find(o => o.id === confirmedApp.opportunityId);
  const confOppDates = confOpp?.dates || '';

  const cancelledApps: Application[] = [];

  const updatedApplications = allApplications.map(app => {
    // Only cancel pending/submitted/waitlisted applications (not other already confirmed or completed ones)
    if (app.id === confirmedApp.id) {
      return { ...app, status: 'Confirmed' as const };
    }

    if (app.status !== 'Submitted' && app.status !== 'Waitlisted') {
      return app;
    }

    const appOpp = opportunities.find(o => o.id === app.opportunityId);
    const appOppDates = appOpp?.dates || '';

    const conflict = checkSingleConflict(
      app.shiftSelected,
      appOppDates,
      confirmedApp.shiftSelected,
      confOppDates,
      bufferMinutes
    );

    if (conflict.hasConflict) {
      const cancelled: Application = {
        ...app,
        status: 'Cancelled' as const,
        cancellationReason: `Auto-cancelled: Overlaps with confirmed shift for "${confirmedApp.opportunityTitle}" (${confirmedApp.shiftSelected}) within ${bufferHours}h buffer window.`,
        conflictDetails: {
          conflictingOpportunityTitle: confirmedApp.opportunityTitle,
          conflictingShift: confirmedApp.shiftSelected,
          cancelledAt: new Date().toISOString()
        }
      };
      cancelledApps.push(cancelled);
      return cancelled;
    }

    return app;
  });

  return {
    updatedApplications,
    cancelledCount: cancelledApps.length,
    cancelledApps
  };
}
