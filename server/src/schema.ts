import { z } from 'zod';

// Job Level schema
export const jobLevelSchema = z.object({
  id: z.string(),
  name: z.string(),
  track: z.enum(['IC', 'TL', 'EM', 'Director']),
  summaryDescription: z.string(),
  trajectoryInfo: z.string().nullable(),
  scopeOfInfluenceSummary: z.string().optional(),
  ownershipSummary: z.string().optional(),
});

export type JobLevel = z.infer<typeof jobLevelSchema>;

// Competency Sub-Category schema
export const competencySubCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  descriptionsByLevel: z.record(z.string(), z.string()), // Record<levelId, description>
});

export type CompetencySubCategory = z.infer<typeof competencySubCategorySchema>;

// Competency Category schema
export const competencyCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  subCategories: z.array(competencySubCategorySchema),
});

export type CompetencyCategory = z.infer<typeof competencyCategorySchema>;

// Edit History Entry schema
export const editHistoryEntrySchema = z.object({
  date: z.string(),
  description: z.string(),
});

export type EditHistoryEntry = z.infer<typeof editHistoryEntrySchema>;

// Metadata schema
export const metadataSchema = z.object({
  lastUpdated: z.string(),
  goals: z.array(z.string()),
  keyPrinciples: z.array(z.string()),
  editHistory: z.array(editHistoryEntrySchema),
});

export type Metadata = z.infer<typeof metadataSchema>;

// Engineering Job Matrix schema
export const engineeringJobMatrixSchema = z.object({
  jobLevels: z.array(jobLevelSchema),
  competencyCategories: z.array(competencyCategorySchema),
  metadata: metadataSchema,
});

export type EngineeringJobMatrix = z.infer<typeof engineeringJobMatrixSchema>;

// Input schemas for creating/updating data
export const createJobLevelInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  track: z.enum(['IC', 'TL', 'EM', 'Director']),
  summaryDescription: z.string(),
  trajectoryInfo: z.string().nullable(),
  scopeOfInfluenceSummary: z.string().optional(),
  ownershipSummary: z.string().optional(),
});

export type CreateJobLevelInput = z.infer<typeof createJobLevelInputSchema>;

export const updateJobLevelInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  track: z.enum(['IC', 'TL', 'EM', 'Director']).optional(),
  summaryDescription: z.string().optional(),
  trajectoryInfo: z.string().nullable().optional(),
  scopeOfInfluenceSummary: z.string().optional(),
  ownershipSummary: z.string().optional(),
});

export type UpdateJobLevelInput = z.infer<typeof updateJobLevelInputSchema>;

export const createCompetencySubCategoryInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  categoryId: z.string(),
  descriptionsByLevel: z.record(z.string(), z.string()),
});

export type CreateCompetencySubCategoryInput = z.infer<typeof createCompetencySubCategoryInputSchema>;

export const createCompetencyCategoryInputSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type CreateCompetencyCategoryInput = z.infer<typeof createCompetencyCategoryInputSchema>;

// Search and filter schemas
export const searchInputSchema = z.object({
  query: z.string().optional(),
  tracks: z.array(z.enum(['IC', 'TL', 'EM', 'Director'])).optional(),
  levelIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
  subCategoryIds: z.array(z.string()).optional(),
});

export type SearchInput = z.infer<typeof searchInputSchema>;

export const compareJobLevelsInputSchema = z.object({
  levelIds: z.array(z.string()).min(2).max(4), // Allow 2-4 levels for comparison
});

export type CompareJobLevelsInput = z.infer<typeof compareJobLevelsInputSchema>;

// Input schema for getting a single job level
export const getJobLevelInputSchema = z.object({
  id: z.string(),
});

export type GetJobLevelInput = z.infer<typeof getJobLevelInputSchema>;

// Input schema for getting a single competency category
export const getCompetencyCategoryInputSchema = z.object({
  id: z.string(),
});

export type GetCompetencyCategoryInput = z.infer<typeof getCompetencyCategoryInputSchema>;

// Input schema for updating metadata
export const updateMetadataInputSchema = z.object({
  lastUpdated: z.string().optional(),
  goals: z.array(z.string()).optional(),
  keyPrinciples: z.array(z.string()).optional(),
});

export type UpdateMetadataInput = z.infer<typeof updateMetadataInputSchema>;

// Input schema for adding edit history entries
export const addEditHistoryEntryInputSchema = z.object({
  date: z.string(),
  description: z.string(),
});

export type AddEditHistoryEntryInput = z.infer<typeof addEditHistoryEntryInputSchema>;