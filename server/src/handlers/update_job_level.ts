import { db } from '../db';
import { jobLevelsTable } from '../db/schema';
import { type UpdateJobLevelInput, type JobLevel } from '../schema';
import { eq } from 'drizzle-orm';

export async function updateJobLevel(input: UpdateJobLevelInput): Promise<JobLevel | null> {
  try {
    // First check if the job level exists
    const existingJobLevel = await db.select()
      .from(jobLevelsTable)
      .where(eq(jobLevelsTable.id, input.id))
      .execute();

    if (existingJobLevel.length === 0) {
      return null;
    }

    // Build update object with only provided fields
    const updateData: any = {
      updatedAt: new Date()
    };

    if (input.name !== undefined) {
      updateData.name = input.name;
    }
    if (input.track !== undefined) {
      updateData.track = input.track;
    }
    if (input.summaryDescription !== undefined) {
      updateData.summaryDescription = input.summaryDescription;
    }
    if (input.trajectoryInfo !== undefined) {
      updateData.trajectoryInfo = input.trajectoryInfo;
    }
    if (input.scopeOfInfluenceSummary !== undefined) {
      updateData.scopeOfInfluenceSummary = input.scopeOfInfluenceSummary;
    }
    if (input.ownershipSummary !== undefined) {
      updateData.ownershipSummary = input.ownershipSummary;
    }

    // Update the job level
    const result = await db.update(jobLevelsTable)
      .set(updateData)
      .where(eq(jobLevelsTable.id, input.id))
      .returning()
      .execute();

    const updatedJobLevel = result[0];
    
    // Convert database result to match JobLevel schema
    return {
      id: updatedJobLevel.id,
      name: updatedJobLevel.name,
      track: updatedJobLevel.track,
      summaryDescription: updatedJobLevel.summaryDescription,
      trajectoryInfo: updatedJobLevel.trajectoryInfo,
      scopeOfInfluenceSummary: updatedJobLevel.scopeOfInfluenceSummary || undefined,
      ownershipSummary: updatedJobLevel.ownershipSummary || undefined,
    };
  } catch (error) {
    console.error('Job level update failed:', error);
    throw error;
  }
}