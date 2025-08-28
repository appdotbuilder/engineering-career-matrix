import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type CreateJobLevelInput } from '../schema';
import { createJobLevel } from '../handlers/create_job_level';
import { eq } from 'drizzle-orm';

// Test input with all fields
const testInput: CreateJobLevelInput = {
  id: 'L1_L2',
  name: 'Junior Software Engineer (L1-L2)',
  track: 'IC',
  summaryDescription: 'Entry-level individual contributor focused on learning and delivering features',
  trajectoryInfo: 'Growth path from L1 to L2 over 12-18 months',
  scopeOfInfluenceSummary: 'Individual tasks and small features',
  ownershipSummary: 'Owns individual tasks with guidance'
};

// Test input with minimal fields (optional fields undefined)
const minimalInput: CreateJobLevelInput = {
  id: 'TL1',
  name: 'Tech Lead I',
  track: 'TL',
  summaryDescription: 'Technical leader responsible for team delivery',
  trajectoryInfo: null, // Explicitly null
  scopeOfInfluenceSummary: undefined,
  ownershipSummary: undefined
};

describe('createJobLevel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a job level with all fields', async () => {
    const result = await createJobLevel(testInput);

    // Basic field validation
    expect(result.id).toEqual('L1_L2');
    expect(result.name).toEqual('Junior Software Engineer (L1-L2)');
    expect(result.track).toEqual('IC');
    expect(result.summaryDescription).toEqual(testInput.summaryDescription);
    expect(result.trajectoryInfo).toEqual('Growth path from L1 to L2 over 12-18 months');
    expect(result.scopeOfInfluenceSummary).toEqual('Individual tasks and small features');
    expect(result.ownershipSummary).toEqual('Owns individual tasks with guidance');
  });

  it('should create a job level with minimal fields', async () => {
    const result = await createJobLevel(minimalInput);

    // Basic field validation
    expect(result.id).toEqual('TL1');
    expect(result.name).toEqual('Tech Lead I');
    expect(result.track).toEqual('TL');
    expect(result.summaryDescription).toEqual(minimalInput.summaryDescription);
    expect(result.trajectoryInfo).toBeNull();
    expect(result.scopeOfInfluenceSummary).toBeUndefined();
    expect(result.ownershipSummary).toBeUndefined();
  });

  it('should save job level to database with all fields', async () => {
    const result = await createJobLevel(testInput);

    // Query database to verify record was created
    const jobLevels = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, result.id))
      .execute();

    expect(jobLevels).toHaveLength(1);
    const savedJobLevel = jobLevels[0];
    
    expect(savedJobLevel.id).toEqual('L1_L2');
    expect(savedJobLevel.name).toEqual('Junior Software Engineer (L1-L2)');
    expect(savedJobLevel.track).toEqual('IC');
    expect(savedJobLevel.summaryDescription).toEqual(testInput.summaryDescription);
    expect(savedJobLevel.trajectoryInfo).toEqual('Growth path from L1 to L2 over 12-18 months');
    expect(savedJobLevel.scopeOfInfluenceSummary).toEqual('Individual tasks and small features');
    expect(savedJobLevel.ownershipSummary).toEqual('Owns individual tasks with guidance');
    expect(savedJobLevel.createdAt).toBeInstanceOf(Date);
    expect(savedJobLevel.updatedAt).toBeInstanceOf(Date);
  });

  it('should save job level to database with minimal fields', async () => {
    const result = await createJobLevel(minimalInput);

    // Query database to verify record was created
    const jobLevels = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, result.id))
      .execute();

    expect(jobLevels).toHaveLength(1);
    const savedJobLevel = jobLevels[0];
    
    expect(savedJobLevel.id).toEqual('TL1');
    expect(savedJobLevel.name).toEqual('Tech Lead I');
    expect(savedJobLevel.track).toEqual('TL');
    expect(savedJobLevel.summaryDescription).toEqual(minimalInput.summaryDescription);
    expect(savedJobLevel.trajectoryInfo).toBeNull();
    expect(savedJobLevel.scopeOfInfluenceSummary).toBeNull(); // DB stores undefined as null
    expect(savedJobLevel.ownershipSummary).toBeNull(); // DB stores undefined as null
    expect(savedJobLevel.createdAt).toBeInstanceOf(Date);
    expect(savedJobLevel.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw error when creating job level with duplicate ID', async () => {
    // Create first job level
    await createJobLevel(testInput);

    // Attempt to create another with same ID
    const duplicateInput: CreateJobLevelInput = {
      ...testInput,
      name: 'Different Name'
    };

    await expect(createJobLevel(duplicateInput)).rejects.toThrow(/already exists/i);
  });

  it('should handle all track types correctly', async () => {
    const tracks: Array<'IC' | 'TL' | 'EM' | 'Director'> = ['IC', 'TL', 'EM', 'Director'];
    
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      const input: CreateJobLevelInput = {
        id: `TEST_${track}_${i}`,
        name: `Test ${track} Level`,
        track: track,
        summaryDescription: `Test description for ${track}`,
        trajectoryInfo: null,
        scopeOfInfluenceSummary: undefined,
        ownershipSummary: undefined
      };

      const result = await createJobLevel(input);
      expect(result.track).toEqual(track);

      // Verify in database
      const saved = await db.select()
        .from(jobLevelsTable)
        .where(eq(jobLevelsTable.id, input.id))
        .execute();

      expect(saved[0].track).toEqual(track);
    }
  });

  it('should handle null and undefined optional fields correctly', async () => {
    const inputWithNullTrajectory: CreateJobLevelInput = {
      id: 'NULL_TEST',
      name: 'Null Trajectory Test',
      track: 'EM',
      summaryDescription: 'Test with null trajectory',
      trajectoryInfo: null,
      scopeOfInfluenceSummary: 'Some scope info',
      ownershipSummary: undefined
    };

    const result = await createJobLevel(inputWithNullTrajectory);

    expect(result.trajectoryInfo).toBeNull();
    expect(result.scopeOfInfluenceSummary).toEqual('Some scope info');
    expect(result.ownershipSummary).toBeUndefined();

    // Verify database storage
    const saved = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, inputWithNullTrajectory.id))
      .execute();

    expect(saved[0].trajectoryInfo).toBeNull();
    expect(saved[0].scopeOfInfluenceSummary).toEqual('Some scope info');
    expect(saved[0].ownershipSummary).toBeNull(); // undefined becomes null in DB
  });
});