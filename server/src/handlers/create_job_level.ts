import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type CreateJobLevelInput, type JobLevel } from '../schema';
import { eq } from 'drizzle-orm';

export const createJobLevel = async (input: CreateJobLevelInput): Promise<JobLevel> => {
  try {
    // Check if job level with this ID already exists
    const existingJobLevel = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.id))
      .execute();

    if (existingJobLevel.length > 0) {
      throw new Error(`Job level with ID '${input.id}' already exists`);
    }

    // Insert job level record
    const result = await db.insert(jobLevelsTable)
      .values({
        id: input.id,
        name: input.name,
        track: input.track,
        summaryDescription: input.summaryDescription,
        trajectoryInfo: input.trajectoryInfo,
        scopeOfInfluenceSummary: input.scopeOfInfluenceSummary,
        ownershipSummary: input.ownershipSummary
      })
      .returning()
      .execute();

    const jobLevel = result[0];
    return {
      id: jobLevel.id,
      name: jobLevel.name,
      track: jobLevel.track,
      summaryDescription: jobLevel.summaryDescription,
      trajectoryInfo: jobLevel.trajectoryInfo,
      scopeOfInfluenceSummary: jobLevel.scopeOfInfluenceSummary ?? undefined,
      ownershipSummary: jobLevel.ownershipSummary ?? undefined,
    };
  } catch (error) {
    console.error('Job level creation failed:', error);
    throw error;
  }
};