import { db } from '../db';
import { 
  jobLevelsTable, 
  competencyCategoriesTable, 
  competencySubCategoriesTable, 
  metadataTable, 
  editHistoryTable 
} from '../db/schema';
import { sql } from 'drizzle-orm';

export async function seedData(): Promise<{ success: boolean; message: string }> {
  try {
    // Clear existing data - idempotent operation
    await db.delete(editHistoryTable).execute();
    await db.delete(competencySubCategoriesTable).execute();
    await db.delete(competencyCategoriesTable).execute();
    await db.delete(jobLevelsTable).execute();
    await db.delete(metadataTable).execute();

    // Insert job levels
    await db.insert(jobLevelsTable).values([
      {
        id: 'L1_L2',
        name: 'Software Engineer I/II',
        track: 'IC',
        summaryDescription: 'Entry-level engineer focused on learning and contributing to well-defined tasks.',
        trajectoryInfo: 'Expected progression: 18-24 months',
        scopeOfInfluenceSummary: 'Individual tasks and small features',
        ownershipSummary: 'Owns completion of assigned tasks with guidance'
      },
      {
        id: 'L3',
        name: 'Software Engineer III',
        track: 'IC',
        summaryDescription: 'Competent engineer who can work independently on medium-complexity features.',
        trajectoryInfo: 'Expected progression: 2-3 years',
        scopeOfInfluenceSummary: 'Full features and small projects',
        ownershipSummary: 'Owns delivery of features end-to-end'
      },
      {
        id: 'L4',
        name: 'Senior Software Engineer',
        track: 'IC',
        summaryDescription: 'Experienced engineer who drives technical decisions and mentors junior developers.',
        trajectoryInfo: 'Expected progression: 3-5 years',
        scopeOfInfluenceSummary: 'Major features and cross-team initiatives',
        ownershipSummary: 'Owns technical architecture for medium-sized projects'
      },
      {
        id: 'L5',
        name: 'Staff Software Engineer',
        track: 'IC',
        summaryDescription: 'Expert engineer who influences technical strategy across multiple teams.',
        trajectoryInfo: 'Terminal level or progression to L6 in 4-6 years',
        scopeOfInfluenceSummary: 'Multi-team technical initiatives',
        ownershipSummary: 'Owns technical strategy and execution for complex systems'
      },
      {
        id: 'TL1',
        name: 'Tech Lead I',
        track: 'TL',
        summaryDescription: 'Technical leader responsible for guiding a small team\'s technical execution.',
        trajectoryInfo: 'Expected progression: 2-3 years',
        scopeOfInfluenceSummary: 'Single team technical decisions',
        ownershipSummary: 'Owns team\'s technical roadmap and delivery'
      },
      {
        id: 'TL2',
        name: 'Tech Lead II',
        track: 'TL',
        summaryDescription: 'Senior technical leader managing complex projects across multiple teams.',
        trajectoryInfo: 'Terminal level or progression to Director in 3-5 years',
        scopeOfInfluenceSummary: 'Multi-team technical coordination',
        ownershipSummary: 'Owns technical strategy for major initiatives'
      },
      {
        id: 'EM1',
        name: 'Engineering Manager I',
        track: 'EM',
        summaryDescription: 'People manager focused on team development and delivery execution.',
        trajectoryInfo: 'Expected progression: 2-4 years',
        scopeOfInfluenceSummary: 'Single team management and development',
        ownershipSummary: 'Owns team performance and career development'
      },
      {
        id: 'EM2',
        name: 'Engineering Manager II',
        track: 'EM',
        summaryDescription: 'Experienced manager handling larger teams and complex organizational challenges.',
        trajectoryInfo: 'Expected progression: 3-5 years to Director',
        scopeOfInfluenceSummary: 'Multiple teams or large single team',
        ownershipSummary: 'Owns organizational effectiveness and strategic execution'
      },
      {
        id: 'DIR1',
        name: 'Director of Engineering',
        track: 'Director',
        summaryDescription: 'Senior leader responsible for multiple teams and strategic technical direction.',
        trajectoryInfo: null,
        scopeOfInfluenceSummary: 'Department-wide technical and organizational strategy',
        ownershipSummary: 'Owns business outcomes and organizational health'
      }
    ]).execute();

    // Insert competency categories
    await db.insert(competencyCategoriesTable).values([
      { id: 'technical', name: 'Technical Skills' },
      { id: 'leadership', name: 'Leadership & People' },
      { id: 'communication', name: 'Communication' },
      { id: 'execution', name: 'Execution & Delivery' },
      { id: 'strategy', name: 'Strategic Thinking' }
    ]).execute();

    // Insert competency sub-categories
    await db.insert(competencySubCategoriesTable).values([
      {
        id: 'coding',
        name: 'Coding & Implementation',
        categoryId: 'technical',
        descriptionsByLevel: {
          'L1_L2': 'Writes clean, functional code with guidance. Focuses on learning best practices.',
          'L3': 'Writes maintainable code independently. Understands system design patterns.',
          'L4': 'Writes exemplary code. Establishes coding standards and reviews others\' work.',
          'L5': 'Architect-level coding skills. Influences technical standards across teams.',
          'TL1': 'Strong coding skills with focus on team technical guidance.',
          'TL2': 'Expert coding skills, focuses on architectural decisions.',
          'EM1': 'Maintains technical competence, focuses on team technical growth.',
          'EM2': 'High-level technical understanding, delegates implementation.',
          'DIR1': 'Strategic technical vision, delegates detailed technical work.'
        }
      },
      {
        id: 'system_design',
        name: 'System Design',
        categoryId: 'technical',
        descriptionsByLevel: {
          'L1_L2': 'Learning system design principles. Works on small components.',
          'L3': 'Designs medium-complexity systems with guidance.',
          'L4': 'Designs robust systems independently. Considers scalability and maintainability.',
          'L5': 'Designs complex distributed systems. Influences architectural decisions.',
          'TL1': 'Designs team-level systems and guides others in design decisions.',
          'TL2': 'Architects complex multi-team systems.',
          'EM1': 'Understands system design to guide technical discussions.',
          'EM2': 'High-level system understanding to make strategic technical decisions.',
          'DIR1': 'Sets architectural vision and strategy across the organization.'
        }
      },
      {
        id: 'mentoring',
        name: 'Mentoring & Coaching',
        categoryId: 'leadership',
        descriptionsByLevel: {
          'L1_L2': 'Receives mentoring. May help onboard new interns or junior developers.',
          'L3': 'Mentors L1/L2 developers. Provides technical guidance.',
          'L4': 'Mentors engineers across levels. Develops others\' technical skills.',
          'L5': 'Mentors senior engineers and tech leads. Develops leadership skills in others.',
          'TL1': 'Mentors team members on both technical and leadership skills.',
          'TL2': 'Mentors other tech leads and senior engineers.',
          'EM1': 'Primary focus on developing team members\' careers and skills.',
          'EM2': 'Develops other managers and senior individual contributors.',
          'DIR1': 'Develops leadership pipeline. Mentors directors and senior managers.'
        }
      },
      {
        id: 'team_leadership',
        name: 'Team Leadership',
        categoryId: 'leadership',
        descriptionsByLevel: {
          'L1_L2': 'Focuses on individual contribution. May lead small initiatives.',
          'L3': 'Takes leadership on features. Coordinates with other team members.',
          'L4': 'Leads technical initiatives. Influences team technical decisions.',
          'L5': 'Leads cross-team technical initiatives. Influences multiple teams.',
          'TL1': 'Leads team technical execution and planning.',
          'TL2': 'Leads multiple teams or complex technical initiatives.',
          'EM1': 'Leads team through people management and process.',
          'EM2': 'Leads multiple teams or large organization.',
          'DIR1': 'Provides organizational leadership and vision.'
        }
      },
      {
        id: 'written_communication',
        name: 'Written Communication',
        categoryId: 'communication',
        descriptionsByLevel: {
          'L1_L2': 'Writes clear technical documentation and status updates.',
          'L3': 'Writes comprehensive technical specs and design documents.',
          'L4': 'Writes influential technical proposals and architecture docs.',
          'L5': 'Writes strategic technical vision documents.',
          'TL1': 'Writes team technical strategy and planning documents.',
          'TL2': 'Writes cross-team technical strategy and organizational updates.',
          'EM1': 'Writes team performance updates and strategic plans.',
          'EM2': 'Writes organizational strategy and vision documents.',
          'DIR1': 'Writes company-wide strategic communications.'
        }
      },
      {
        id: 'verbal_communication',
        name: 'Verbal Communication',
        categoryId: 'communication',
        descriptionsByLevel: {
          'L1_L2': 'Communicates effectively in team settings. Asks good questions.',
          'L3': 'Presents technical work clearly to team and stakeholders.',
          'L4': 'Facilitates technical discussions and influences decisions.',
          'L5': 'Presents to senior leadership and influences strategic decisions.',
          'TL1': 'Leads team meetings and technical discussions effectively.',
          'TL2': 'Presents to leadership and facilitates cross-team alignment.',
          'EM1': 'Conducts effective 1:1s and team meetings.',
          'EM2': 'Presents organizational strategy and facilitates leadership meetings.',
          'DIR1': 'Communicates vision to entire organization and external stakeholders.'
        }
      },
      {
        id: 'project_delivery',
        name: 'Project Delivery',
        categoryId: 'execution',
        descriptionsByLevel: {
          'L1_L2': 'Delivers assigned tasks on time with quality.',
          'L3': 'Delivers features end-to-end with minimal guidance.',
          'L4': 'Delivers complex projects and helps others with delivery.',
          'L5': 'Delivers strategic initiatives across multiple teams.',
          'TL1': 'Ensures team delivers projects on time and with quality.',
          'TL2': 'Delivers complex multi-team initiatives.',
          'EM1': 'Ensures team consistently delivers while maintaining quality.',
          'EM2': 'Delivers organizational goals through multiple teams.',
          'DIR1': 'Delivers business outcomes through strategic execution.'
        }
      },
      {
        id: 'process_improvement',
        name: 'Process Improvement',
        categoryId: 'execution',
        descriptionsByLevel: {
          'L1_L2': 'Identifies process problems and suggests improvements.',
          'L3': 'Implements process improvements for team workflows.',
          'L4': 'Designs and implements process improvements across teams.',
          'L5': 'Establishes engineering processes and best practices.',
          'TL1': 'Optimizes team processes and development workflows.',
          'TL2': 'Establishes processes for multiple teams and complex projects.',
          'EM1': 'Implements team processes for productivity and quality.',
          'EM2': 'Establishes organizational processes and practices.',
          'DIR1': 'Sets organizational process strategy and standards.'
        }
      },
      {
        id: 'technical_vision',
        name: 'Technical Vision',
        categoryId: 'strategy',
        descriptionsByLevel: {
          'L1_L2': 'Understands team technical direction and contributes to it.',
          'L3': 'Contributes to technical planning and architectural decisions.',
          'L4': 'Influences team technical direction and long-term planning.',
          'L5': 'Sets technical vision for multiple teams and complex systems.',
          'TL1': 'Sets team technical vision and strategic direction.',
          'TL2': 'Sets technical vision for multiple teams and major initiatives.',
          'EM1': 'Contributes to technical strategy to support team goals.',
          'EM2': 'Aligns technical strategy with business objectives.',
          'DIR1': 'Sets organizational technical strategy and vision.'
        }
      },
      {
        id: 'business_impact',
        name: 'Business Impact',
        categoryId: 'strategy',
        descriptionsByLevel: {
          'L1_L2': 'Understands how their work contributes to business goals.',
          'L3': 'Makes technical decisions that consider business impact.',
          'L4': 'Drives technical work that delivers significant business value.',
          'L5': 'Influences technical strategy to maximize business outcomes.',
          'TL1': 'Ensures team technical work aligns with business priorities.',
          'TL2': 'Drives technical initiatives that deliver major business impact.',
          'EM1': 'Manages team to deliver consistent business value.',
          'EM2': 'Drives organizational outcomes through strategic technical work.',
          'DIR1': 'Owns business outcomes through technical and organizational strategy.'
        }
      }
    ]).execute();

    // Insert metadata
    await db.insert(metadataTable).values({
      lastUpdated: new Date().toISOString(),
      goals: JSON.stringify([
        'Provide clear career progression paths for all engineering roles',
        'Establish consistent evaluation criteria across the organization',
        'Support professional development and skill building',
        'Align individual growth with business needs',
        'Create transparency in promotion and compensation decisions'
      ]),
      keyPrinciples: JSON.stringify([
        'Growth is not always upward - lateral moves and skill development matter',
        'Technical and leadership tracks are equally valuable',
        'Competencies should be demonstrated consistently over time',
        'Feedback and development should be ongoing, not just during reviews',
        'Individual contributor path should remain viable at all levels'
      ])
    }).execute();

    // Insert edit history
    await db.insert(editHistoryTable).values([
      {
        date: new Date().toISOString().split('T')[0],
        description: 'Initial career ladder framework established with comprehensive job levels and competency categories'
      },
      {
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Added detailed competency descriptions for all levels and tracks'
      },
      {
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'Refined progression timelines and scope of influence descriptions'
      }
    ]).execute();

    return {
      success: true,
      message: 'Database seeded successfully with comprehensive engineering career ladder data including 9 job levels, 5 competency categories, 10 sub-categories, metadata, and edit history'
    };
  } catch (error) {
    console.error('Seed data operation failed:', error);
    throw error;
  }
}