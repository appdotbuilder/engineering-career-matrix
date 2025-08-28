import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schemas
import {
  createJobLevelInputSchema,
  updateJobLevelInputSchema,
  getJobLevelInputSchema,
  createCompetencyCategoryInputSchema,
  createCompetencySubCategoryInputSchema,
  getCompetencyCategoryInputSchema,
  searchInputSchema,
  compareJobLevelsInputSchema,
  updateMetadataInputSchema,
  addEditHistoryEntryInputSchema,
} from './schema';

// Import handlers
import { getJobLevels } from './handlers/get_job_levels';
import { getJobLevel } from './handlers/get_job_level';
import { createJobLevel } from './handlers/create_job_level';
import { updateJobLevel } from './handlers/update_job_level';
import { deleteJobLevel } from './handlers/delete_job_level';
import { getCompetencyCategories } from './handlers/get_competency_categories';
import { getCompetencyCategory } from './handlers/get_competency_category';
import { createCompetencyCategory } from './handlers/create_competency_category';
import { createCompetencySubCategory } from './handlers/create_competency_sub_category';
import { searchMatrix } from './handlers/search_matrix';
import { compareJobLevels } from './handlers/compare_job_levels';
import { getFullMatrix } from './handlers/get_full_matrix';
import { getMetadata } from './handlers/get_metadata';
import { updateMetadata } from './handlers/update_metadata';
import { addEditHistoryEntry } from './handlers/add_edit_history_entry';
import { getEditHistory } from './handlers/get_edit_history';
import { seedData } from './handlers/seed_data';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Job Level operations
  getJobLevels: publicProcedure.query(() => getJobLevels()),
  
  getJobLevel: publicProcedure
    .input(getJobLevelInputSchema)
    .query(({ input }) => getJobLevel(input)),
  
  createJobLevel: publicProcedure
    .input(createJobLevelInputSchema)
    .mutation(({ input }) => createJobLevel(input)),
  
  updateJobLevel: publicProcedure
    .input(updateJobLevelInputSchema)
    .mutation(({ input }) => updateJobLevel(input)),
  
  deleteJobLevel: publicProcedure
    .input(getJobLevelInputSchema)
    .mutation(({ input }) => deleteJobLevel(input)),

  // Competency Category operations
  getCompetencyCategories: publicProcedure.query(() => getCompetencyCategories()),
  
  getCompetencyCategory: publicProcedure
    .input(getCompetencyCategoryInputSchema)
    .query(({ input }) => getCompetencyCategory(input)),
  
  createCompetencyCategory: publicProcedure
    .input(createCompetencyCategoryInputSchema)
    .mutation(({ input }) => createCompetencyCategory(input)),
  
  createCompetencySubCategory: publicProcedure
    .input(createCompetencySubCategoryInputSchema)
    .mutation(({ input }) => createCompetencySubCategory(input)),

  // Matrix operations
  getFullMatrix: publicProcedure.query(() => getFullMatrix()),
  
  searchMatrix: publicProcedure
    .input(searchInputSchema)
    .query(({ input }) => searchMatrix(input)),
  
  compareJobLevels: publicProcedure
    .input(compareJobLevelsInputSchema)
    .query(({ input }) => compareJobLevels(input)),

  // Metadata operations
  getMetadata: publicProcedure.query(() => getMetadata()),
  
  updateMetadata: publicProcedure
    .input(updateMetadataInputSchema)
    .mutation(({ input }) => updateMetadata(input)),

  // Edit History operations
  getEditHistory: publicProcedure.query(() => getEditHistory()),
  
  addEditHistoryEntry: publicProcedure
    .input(addEditHistoryEntryInputSchema)
    .mutation(({ input }) => addEditHistoryEntry(input)),

  // Data seeding
  seedData: publicProcedure.mutation(() => seedData()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();