import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { asc } from 'drizzle-orm';
import { type JobLevel } from '../schema';

export const getJobLevels = async (): Promise<JobLevel[]> => {
  try {
    // Fetch all job levels ordered by track, then by name
    const results = await db.select()
      .from(jobLevelsTable)
      .orderBy(asc(jobLevelsTable.track), asc(jobLevelsTable.name))
      .execute();

    // Convert database results to schema format
    return results.map(result => ({
      id: result.id,
      name: result.name,
      track: result.track,
      summaryDescription: result.summaryDescription,
      trajectoryInfo: result.trajectoryInfo,
      // Convert null to undefined for optional fields to match schema
      ...(result.scopeOfInfluenceSummary !== null && { scopeOfInfluenceSummary: result.scopeOfInfluenceSummary }),
      ...(result.ownershipSummary !== null && { ownershipSummary: result.ownershipSummary })
    }));
  } catch (error) {
    console.error('Failed to fetch job levels:', error);
    throw error;
  }
};