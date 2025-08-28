import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type UpdateJobLevelInput, type CreateJobLevelInput } from '../schema';
import { updateJobLevel } from '../handlers/update_job_level';
import { eq } from 'drizzle-orm';

// Create a test job level first
const createTestJobLevel = async () => {
  const testJobLevel: CreateJobLevelInput = {
    id: 'L3_L4',
    name: 'Senior Software Engineer',
    track: 'IC',
    summaryDescription: 'A senior individual contributor role',
    trajectoryInfo: 'Path to staff level',
    scopeOfInfluenceSummary: 'Team-wide impact',
    ownershipSummary: 'Owns complex features'
  };

  await db.insert(jobLevelsTable)
    .values({
      ...testJobLevel,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    .execute();

  return testJobLevel;
};

describe('updateJobLevel', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update all fields of a job level', async () => {
    const originalJobLevel = await createTestJobLevel();

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id,
      name: 'Updated Senior Engineer',
      track: 'TL',
      summaryDescription: 'Updated description',
      trajectoryInfo: 'Updated trajectory',
      scopeOfInfluenceSummary: 'Updated scope',
      ownershipSummary: 'Updated ownership'
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalJobLevel.id);
    expect(result!.name).toEqual('Updated Senior Engineer');
    expect(result!.track).toEqual('TL');
    expect(result!.summaryDescription).toEqual('Updated description');
    expect(result!.trajectoryInfo).toEqual('Updated trajectory');
    expect(result!.scopeOfInfluenceSummary).toEqual('Updated scope');
    expect(result!.ownershipSummary).toEqual('Updated ownership');
    // Handler doesn't return updatedAt as it's a database-only field
  });

  it('should update only specified fields', async () => {
    const originalJobLevel = await createTestJobLevel();

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id,
      name: 'Partially Updated Engineer',
      track: 'EM'
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalJobLevel.id);
    expect(result!.name).toEqual('Partially Updated Engineer');
    expect(result!.track).toEqual('EM');
    // These should remain unchanged
    expect(result!.summaryDescription).toEqual('A senior individual contributor role');
    expect(result!.trajectoryInfo).toEqual('Path to staff level');
    expect(result!.scopeOfInfluenceSummary).toEqual('Team-wide impact');
    expect(result!.ownershipSummary).toEqual('Owns complex features');
  });

  it('should handle nullable fields correctly', async () => {
    const originalJobLevel = await createTestJobLevel();

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id,
      trajectoryInfo: null,
      scopeOfInfluenceSummary: undefined, // Should not update this field
      ownershipSummary: undefined
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeDefined();
    expect(result!.trajectoryInfo).toBeNull();
    // This should remain unchanged since undefined was passed
    expect(result!.scopeOfInfluenceSummary).toEqual('Team-wide impact');
    expect(result!.ownershipSummary).toEqual('Owns complex features');
  });

  it('should save updated data to database', async () => {
    const originalJobLevel = await createTestJobLevel();

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id,
      name: 'Database Verified Update',
      track: 'Director'
    };

    await updateJobLevel(updateInput);

    // Verify the data was actually saved to the database
    const dbJobLevel = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, originalJobLevel.id))
      .execute();

    expect(dbJobLevel).toHaveLength(1);
    expect(dbJobLevel[0].name).toEqual('Database Verified Update');
    expect(dbJobLevel[0].track).toEqual('Director');
    expect(dbJobLevel[0].updatedAt).toBeInstanceOf(Date);
  });

  it('should return null when job level does not exist', async () => {
    const updateInput: UpdateJobLevelInput = {
      id: 'non-existent-id',
      name: 'This should not work'
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeNull();
  });

  it('should update updatedAt timestamp in database', async () => {
    const originalJobLevel = await createTestJobLevel();

    // Get original timestamp
    const originalRecord = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, originalJobLevel.id))
      .execute();

    const originalUpdatedAt = originalRecord[0].updatedAt;

    // Wait a moment to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id,
      name: 'Timestamp Test'
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeDefined();
    expect(result!.name).toEqual('Timestamp Test');
    
    // Verify timestamp was updated in database
    const updatedRecord = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, originalJobLevel.id))
      .execute();

    expect(updatedRecord[0].updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
  });

  it('should handle empty update gracefully', async () => {
    const originalJobLevel = await createTestJobLevel();

    const updateInput: UpdateJobLevelInput = {
      id: originalJobLevel.id
      // No other fields to update
    };

    const result = await updateJobLevel(updateInput);

    expect(result).toBeDefined();
    expect(result!.id).toEqual(originalJobLevel.id);
    // All original values should remain the same
    expect(result!.name).toEqual('Senior Software Engineer');
    expect(result!.track).toEqual('IC');
    expect(result!.summaryDescription).toEqual('A senior individual contributor role');
  });
});