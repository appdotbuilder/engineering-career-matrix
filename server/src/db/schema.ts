import { serial, text, pgTable, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Define the track enum
export const trackEnum = pgEnum('track', ['IC', 'TL', 'EM', 'Director']);

// Job Levels table
export const jobLevelsTable = pgTable('job_levels', {
  id: text('id').primaryKey(), // Using text for custom IDs like "L1_L2", "TL1", etc.
  name: text('name').notNull(),
  track: trackEnum('track').notNull(),
  summaryDescription: text('summary_description').notNull(),
  trajectoryInfo: text('trajectory_info'), // Nullable by default
  scopeOfInfluenceSummary: text('scope_of_influence_summary'),
  ownershipSummary: text('ownership_summary'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Competency Categories table
export const competencyCategoriesTable = pgTable('competency_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Competency Sub-Categories table
export const competencySubCategoriesTable = pgTable('competency_sub_categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull().references(() => competencyCategoriesTable.id, { onDelete: 'cascade' }),
  descriptionsByLevel: jsonb('descriptions_by_level').notNull(), // Store as JSONB for flexible key-value pairs
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Metadata table (single row for application metadata)
export const metadataTable = pgTable('metadata', {
  id: serial('id').primaryKey(), // Auto-increment, but we'll only have one row
  lastUpdated: text('last_updated').notNull(),
  goals: jsonb('goals').notNull(), // Array of strings stored as JSONB
  keyPrinciples: jsonb('key_principles').notNull(), // Array of strings stored as JSONB
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Edit History table
export const editHistoryTable = pgTable('edit_history', {
  id: serial('id').primaryKey(),
  date: text('date').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const competencyCategoriesRelations = relations(competencyCategoriesTable, ({ many }) => ({
  subCategories: many(competencySubCategoriesTable),
}));

export const competencySubCategoriesRelations = relations(competencySubCategoriesTable, ({ one }) => ({
  category: one(competencyCategoriesTable, {
    fields: [competencySubCategoriesTable.categoryId],
    references: [competencyCategoriesTable.id],
  }),
}));

// TypeScript types for the table schemas
export type JobLevel = typeof jobLevelsTable.$inferSelect;
export type NewJobLevel = typeof jobLevelsTable.$inferInsert;

export type CompetencyCategory = typeof competencyCategoriesTable.$inferSelect;
export type NewCompetencyCategory = typeof competencyCategoriesTable.$inferInsert;

export type CompetencySubCategory = typeof competencySubCategoriesTable.$inferSelect;
export type NewCompetencySubCategory = typeof competencySubCategoriesTable.$inferInsert;

export type Metadata = typeof metadataTable.$inferSelect;
export type NewMetadata = typeof metadataTable.$inferInsert;

export type EditHistory = typeof editHistoryTable.$inferSelect;
export type NewEditHistory = typeof editHistoryTable.$inferInsert;

// Export all tables for enabling relation queries
export const tables = {
  jobLevels: jobLevelsTable,
  competencyCategories: competencyCategoriesTable,
  competencySubCategories: competencySubCategoriesTable,
  metadata: metadataTable,
  editHistory: editHistoryTable,
};