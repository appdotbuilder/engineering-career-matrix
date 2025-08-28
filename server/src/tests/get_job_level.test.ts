import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type GetJobLevelInput } from '../schema';
import { getJobLevel } from '../handlers/get_job_level';

describe('getJobLevel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a job level when found', async () => {
    // Create a test job level
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1_L2',
        name: 'Junior Engineer',
        track: 'IC',
        summaryDescription: 'Entry-level software engineer',
        trajectoryInfo: 'Focus on learning fundamentals',
        scopeOfInfluenceSummary: 'Individual tasks',
        ownershipSummary: 'Own small features'
      })
      .execute();

    const input: GetJobLevelInput = {
      id: 'L1_L2'
    };

    const result = await getJobLevel(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('L1_L2');
    expect(result!.name).toBe('Junior Engineer');
    expect(result!.track).toBe('IC');
    expect(result!.summaryDescription).toBe('Entry-level software engineer');
    expect(result!.trajectoryInfo).toBe('Focus on learning fundamentals');
    expect(result!.scopeOfInfluenceSummary).toBe('Individual tasks');
    expect(result!.ownershipSummary).toBe('Own small features');
  });

  it('should return null when job level is not found', async () => {
    const input: GetJobLevelInput = {
      id: 'NON_EXISTENT'
    };

    const result = await getJobLevel(input);

    expect(result).toBeNull();
  });

  it('should handle job level with minimal fields', async () => {
    // Create a job level with only required fields
    await db.insert(jobLevelsTable)
      .values({
        id: 'TL1',
        name: 'Tech Lead',
        track: 'TL',
        summaryDescription: 'Technical leadership role',
        trajectoryInfo: null, // nullable field
        scopeOfInfluenceSummary: undefined, // optional field
        ownershipSummary: undefined // optional field
      })
      .execute();

    const input: GetJobLevelInput = {
      id: 'TL1'
    };

    const result = await getJobLevel(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('TL1');
    expect(result!.name).toBe('Tech Lead');
    expect(result!.track).toBe('TL');
    expect(result!.summaryDescription).toBe('Technical leadership role');
    expect(result!.trajectoryInfo).toBeNull();
    expect(result!.scopeOfInfluenceSummary).toBeUndefined();
    expect(result!.ownershipSummary).toBeUndefined();
  });

  it('should handle different track types', async () => {
    // Create job levels for each track type
    const jobLevels = [
      {
        id: 'IC_L3',
        name: 'Senior Engineer',
        track: 'IC' as const,
        summaryDescription: 'Senior individual contributor'
      },
      {
        id: 'EM_L1',
        name: 'Engineering Manager',
        track: 'EM' as const,
        summaryDescription: 'First-line engineering manager'
      },
      {
        id: 'DIR_L1',
        name: 'Director',
        track: 'Director' as const,
        summaryDescription: 'Engineering director'
      }
    ];

    // Insert all job levels
    for (const jobLevel of jobLevels) {
      await db.insert(jobLevelsTable)
        .values(jobLevel)
        .execute();
    }

    // Test each track type
    for (const expectedJobLevel of jobLevels) {
      const input: GetJobLevelInput = {
        id: expectedJobLevel.id
      };

      const result = await getJobLevel(input);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(expectedJobLevel.id);
      expect(result!.name).toBe(expectedJobLevel.name);
      expect(result!.track).toBe(expectedJobLevel.track);
      expect(result!.summaryDescription).toBe(expectedJobLevel.summaryDescription);
    }
  });

  it('should handle special characters in job level id', async () => {
    // Create a job level with special characters in ID
    await db.insert(jobLevelsTable)
      .values({
        id: 'L1_L2-Special.Test',
        name: 'Special Test Level',
        track: 'IC',
        summaryDescription: 'Testing special characters in ID'
      })
      .execute();

    const input: GetJobLevelInput = {
      id: 'L1_L2-Special.Test'
    };

    const result = await getJobLevel(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('L1_L2-Special.Test');
    expect(result!.name).toBe('Special Test Level');
  });

  it('should return exactly one result when multiple job levels exist', async () => {
    // Create multiple job levels
    const jobLevels = [
      {
        id: 'L1',
        name: 'Junior',
        track: 'IC' as const,
        summaryDescription: 'Junior level'
      },
      {
        id: 'L2',
        name: 'Mid',
        track: 'IC' as const,
        summaryDescription: 'Mid level'
      },
      {
        id: 'L3',
        name: 'Senior',
        track: 'IC' as const,
        summaryDescription: 'Senior level'
      }
    ];

    // Insert all job levels
    for (const jobLevel of jobLevels) {
      await db.insert(jobLevelsTable)
        .values(jobLevel)
        .execute();
    }

    const input: GetJobLevelInput = {
      id: 'L2'
    };

    const result = await getJobLevel(input);

    expect(result).not.toBeNull();
    expect(result!.id).toBe('L2');
    expect(result!.name).toBe('Mid');
    expect(result!.summaryDescription).toBe('Mid level');
  });
});