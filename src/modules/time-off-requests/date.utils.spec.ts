import { calculateWorkingDays, datesOverlap } from '../../common/utils/date.utils';

/** Creates a local-time date at noon to avoid UTC/timezone shift issues. */
const localDate = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12, 0, 0);

describe('DateUtils', () => {
  describe('calculateWorkingDays', () => {
    it('should return 1 for a single Monday', () => {
      const monday = localDate(2025, 7, 7); // Monday
      expect(calculateWorkingDays(monday, monday)).toBe(1);
    });

    it('should return 5 for a full work week Mon-Fri', () => {
      const start = localDate(2025, 7, 7);  // Monday
      const end = localDate(2025, 7, 11);   // Friday
      expect(calculateWorkingDays(start, end)).toBe(5);
    });

    it('should exclude weekends', () => {
      const start = localDate(2025, 7, 7);  // Monday
      const end = localDate(2025, 7, 14);   // Monday next week
      expect(calculateWorkingDays(start, end)).toBe(6); // Mon-Fri + next Mon
    });

    it('should return 0 for a weekend-only range', () => {
      const saturday = localDate(2025, 7, 12);
      const sunday = localDate(2025, 7, 13);
      expect(calculateWorkingDays(saturday, sunday)).toBe(0);
    });
  });

  describe('datesOverlap', () => {
    it('should detect overlapping ranges', () => {
      const start1 = localDate(2025, 7, 1);
      const end1 = localDate(2025, 7, 10);
      const start2 = localDate(2025, 7, 5);
      const end2 = localDate(2025, 7, 15);
      expect(datesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should return false for non-overlapping ranges', () => {
      const start1 = localDate(2025, 7, 1);
      const end1 = localDate(2025, 7, 5);
      const start2 = localDate(2025, 7, 6);
      const end2 = localDate(2025, 7, 10);
      expect(datesOverlap(start1, end1, start2, end2)).toBe(false);
    });

    it('should return true for adjacent dates (touching boundaries)', () => {
      const start1 = localDate(2025, 7, 1);
      const end1 = localDate(2025, 7, 5);
      const start2 = localDate(2025, 7, 5);
      const end2 = localDate(2025, 7, 10);
      expect(datesOverlap(start1, end1, start2, end2)).toBe(true);
    });

    it('should detect when one range contains another', () => {
      const outer_start = localDate(2025, 7, 1);
      const outer_end = localDate(2025, 7, 31);
      const inner_start = localDate(2025, 7, 10);
      const inner_end = localDate(2025, 7, 15);
      expect(datesOverlap(outer_start, outer_end, inner_start, inner_end)).toBe(true);
    });
  });
});
