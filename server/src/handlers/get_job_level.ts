import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type GetJobLevelInput, type JobLevel } from '../schema';
import { eq } from 'drizzle-orm';

export async function getJobLevel(input: GetJobLevelInput): Promise<JobLevel | null> {
  try {
    const results = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.id))
      .execute();

    if (results.length === 0) {
      return null;
    }

    const jobLevel = results[0];
    
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
    console.error('Failed to fetch job level:', error);
    throw error;
  }
}