import { StrictMode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import HistoryPage from './pages/HistoryPage';
import OrganizationalStructurePage from './pages/OrganizationalStructurePage';
import CitizenCharterPage from './pages/CitizenCharterPage';
import StudentCornerPage from './pages/StudentCornerPage';
import ClubsOrganizationsPage from './pages/ClubsOrganizationsPage';
import AlumniPage from './pages/AlumniPage';
import LearningMaterialsPage from './pages/LearningMaterialsPage';
import TheInkspirerPage from './pages/TheInkspirerPage';
import TintangBaloboPage from './pages/TintangBaloboPage';
import SOSAPage from './pages/SOSAPage';
import ResearchInnovationsPage from './pages/ResearchInnovationsPage';
import ActionResearchPage from './pages/ActionResearchPage';
import SchoolBasedResearchPage from './pages/SchoolBasedResearchPage';
import ResearchOutputsPage from './pages/ResearchOutputsPage';
import DepEdOrdersPage from './pages/DepEdOrdersPage';
import DepEdMemorandaPage from './pages/DepEdMemorandaPage';
import DivisionOrdersMemorandaPage from './pages/DivisionOrdersMemorandaPage';
import SchoolOrdersMemorandaPage from './pages/SchoolOrdersMemorandaPage';
import AdvisoriesCircularsPage from './pages/AdvisoriesCircularsPage';
import ArchivedIssuancesPage from './pages/ArchivedIssuancesPage';
import SIPPage from './pages/SIPPage';
import ARALProgramPage from './pages/ARALProgramPage';
import INSETPage from './pages/INSETPage';
import SBMPage from './pages/SBMPage';
import PRAISEPage from './pages/PRAISEPage';
import InfrastructurePage from './pages/InfrastructurePage';
import SchoolHealthPage from './pages/SchoolHealthPage';
import LearningCurriculumPage from './pages/LearningCurriculumPage';
import WINSPage from './pages/WINSPage';
import ChildProtectionPolicyPage from './pages/ChildProtectionPolicyPage';
import PrefectOfDisciplinePage from './pages/PrefectOfDisciplinePage';
import GPPPage from './pages/GPPPage';
import BKDPage from './pages/BKDPage';
import BrigadaEskwelaPage from './pages/BrigadaEskwelaPage';
import ESWMPage from './pages/ESWMPage';
import InstructionalSupervisionPage from './pages/InstructionalSupervisionPage';
import ObservationToolsPage from './pages/ObservationToolsPage';
import SummativeAssessmentPage from './pages/SummativeAssessmentPage';
import ClassroomObservationPage from './pages/ClassroomObservationPage';
import PMCFPage from './pages/PMCFPage';
import FARPage from './pages/FARPage';
import LessonPlanPage from './pages/LessonPlanPage';
import TQPage from './pages/TQPage';
import TOsPage from './pages/TOsPage';
import PhysicalEvaluationPage from './pages/PhysicalEvaluationPage';
import DivisionMonitoringPage from './pages/DivisionMonitoringPage';
import SMEAPage from './pages/SMEAPage';
import SPTAPage from './pages/SPTAPage';
import FinancialBoardPage from './pages/FinancialBoardPage';
import MDLFeedbackPage from './pages/MDLFeedbackPage';
import NATResourcesPage from './pages/NATResourcesPage';
import NCAEResourcesPage from './pages/NCAEResourcesPage';
import KhanAcademyPage from './pages/KhanAcademyPage';
import DownloadableFormsPage from './pages/DownloadableFormsPage';
import SupportServicesPage from './pages/SupportServicesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import BannerManagementPage from './pages/BannerManagementPage';
import SchoolActivitiesManagerPage from './pages/SchoolActivitiesManagerPage';
import HistoryManagementPage from './pages/HistoryManagementPage';
import CitizenCharterManagementPage from './pages/CitizenCharterManagementPage';
import AlumniManagementPage from './pages/AlumniManagementPage';
import BNHSHymnManagementPage from './pages/BNHSHymnManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import StorageMonitorPage from './pages/StorageMonitorPage';
import OrganizationalStructureManagementPage from './pages/OrganizationalStructureManagementPage';
import { Toaster } from '@/components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

// Flat routes (legacy)
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: HistoryPage,
});

const organizationalStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/organizational-structure',
  component: OrganizationalStructurePage,
});

const citizenCharterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/citizen-charter',
  component: CitizenCharterPage,
});

const studentCornerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/student-corner',
  component: StudentCornerPage,
});

const clubsOrganizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/clubs-organizations',
  component: ClubsOrganizationsPage,
});

const alumniRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alumni',
  component: AlumniPage,
});

const learningMaterialsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning-materials',
  component: LearningMaterialsPage,
});

const theInkspirerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/the-inkspirer',
  component: TheInkspirerPage,
});

const tintangBaloboRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tintang-balobo',
  component: TintangBaloboPage,
});

const sosaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sosa',
  component: SOSAPage,
});

const researchInnovationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/research-innovations',
  component: ResearchInnovationsPage,
});

const actionResearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/action-research',
  component: ActionResearchPage,
});

const schoolBasedResearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/school-based-research',
  component: SchoolBasedResearchPage,
});

const researchOutputsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/research-outputs',
  component: ResearchOutputsPage,
});

const depedOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deped-orders',
  component: DepEdOrdersPage,
});

const depedMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/deped-memoranda',
  component: DepEdMemorandaPage,
});

const divisionOrdersMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/division-orders-memoranda',
  component: DivisionOrdersMemorandaPage,
});

const schoolOrdersMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/school-orders-memoranda',
  component: SchoolOrdersMemorandaPage,
});

const advisoriesCircularsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/advisories-circulars',
  component: AdvisoriesCircularsPage,
});

const archivedIssuancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/archived-issuances',
  component: ArchivedIssuancesPage,
});

const sipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sip',
  component: SIPPage,
});

const aralProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/aral-program',
  component: ARALProgramPage,
});

const insetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inset',
  component: INSETPage,
});

const sbmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sbm',
  component: SBMPage,
});

const praiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/praise',
  component: PRAISEPage,
});

const infrastructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/infrastructure',
  component: InfrastructurePage,
});

const schoolHealthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/school-health',
  component: SchoolHealthPage,
});

const learningCurriculumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/learning-curriculum',
  component: LearningCurriculumPage,
});

const winsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/wins',
  component: WINSPage,
});

const childProtectionPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/child-protection-policy',
  component: ChildProtectionPolicyPage,
});

const prefectOfDisciplineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/prefect-of-discipline',
  component: PrefectOfDisciplinePage,
});

const gppRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gpp',
  component: GPPPage,
});

const bkdRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/bkd',
  component: BKDPage,
});

const brigadaEskwelaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/brigada-eskwela',
  component: BrigadaEskwelaPage,
});

const eswmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/eswm',
  component: ESWMPage,
});

const instructionalSupervisionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instructional-supervision',
  component: InstructionalSupervisionPage,
});

const observationToolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/observation-tools',
  component: ObservationToolsPage,
});

const summativeAssessmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/summative-assessment',
  component: SummativeAssessmentPage,
});

const classroomObservationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/classroom-observation',
  component: ClassroomObservationPage,
});

const pmcfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pmcf',
  component: PMCFPage,
});

const farRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/far',
  component: FARPage,
});

const lessonPlanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/lesson-plan',
  component: LessonPlanPage,
});

const tqRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tq',
  component: TQPage,
});

const tosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tos',
  component: TOsPage,
});

const physicalEvaluationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/physical-evaluation',
  component: PhysicalEvaluationPage,
});

const divisionMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/division-monitoring',
  component: DivisionMonitoringPage,
});

const smeaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smea',
  component: SMEAPage,
});

const sptaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/spta',
  component: SPTAPage,
});

const financialBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/financial-board',
  component: FinancialBoardPage,
});

const mdlFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/mdl-feedback',
  component: MDLFeedbackPage,
});

const natResourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nat-resources',
  component: NATResourcesPage,
});

const ncaeResourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/ncae-resources',
  component: NCAEResourcesPage,
});

const khanAcademyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/khan-academy',
  component: KhanAcademyPage,
});

const downloadableFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/downloadable-forms',
  component: DownloadableFormsPage,
});

const supportServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/support-services',
  component: SupportServicesPage,
});

// Prefixed route aliases for About category
const aboutHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/history',
  component: HistoryPage,
});

const aboutOrganizationalStructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/organizational-structure',
  component: OrganizationalStructurePage,
});

const aboutCitizenCharterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/citizen-charter',
  component: CitizenCharterPage,
});

const aboutStudentCornerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/student-corner',
  component: StudentCornerPage,
});

const aboutClubsOrganizationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/clubs-organizations',
  component: ClubsOrganizationsPage,
});

const aboutAlumniRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about/alumni',
  component: AlumniPage,
});

// Prefixed route aliases for Issuances category
const issuancesDepEdOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/deped-orders',
  component: DepEdOrdersPage,
});

const issuancesDepEdMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/deped-memoranda',
  component: DepEdMemorandaPage,
});

const issuancesDivisionOrdersMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/division-orders-memoranda',
  component: DivisionOrdersMemorandaPage,
});

const issuancesSchoolOrdersMemorandaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/school-orders-memoranda',
  component: SchoolOrdersMemorandaPage,
});

const issuancesAdvisoriesCircularsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/advisories-circulars',
  component: AdvisoriesCircularsPage,
});

const issuancesArchivedIssuancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/issuances/archived-issuances',
  component: ArchivedIssuancesPage,
});

// Prefixed route aliases for PAPs category
const papsSIPRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/sip',
  component: SIPPage,
});

const papsLearningCurriculumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/learning-curriculum',
  component: LearningCurriculumPage,
});

const papsSBMRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/sbm',
  component: SBMPage,
});

const papsINSETRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/inset',
  component: INSETPage,
});

const papsARALProgramRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/aral-program',
  component: ARALProgramPage,
});

const papsPRAISERoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/praise',
  component: PRAISEPage,
});

const papsInfrastructureRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/infrastructure',
  component: InfrastructurePage,
});

const papsSchoolHealthRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/school-health',
  component: SchoolHealthPage,
});

const papsWINSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/wins',
  component: WINSPage,
});

const papsChildProtectionPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/child-protection-policy',
  component: ChildProtectionPolicyPage,
});

const papsPrefectOfDisciplineRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/prefect-of-discipline',
  component: PrefectOfDisciplinePage,
});

const papsGPPRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/gpp',
  component: GPPPage,
});

const papsBKDRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/bkd',
  component: BKDPage,
});

const papsBrigadaEskwelaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/brigada-eskwela',
  component: BrigadaEskwelaPage,
});

const papsESWMRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/paps/eswm',
  component: ESWMPage,
});

// Prefixed route aliases for Publications category
const publicationsTheInkspirerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publications/the-inkspirer',
  component: TheInkspirerPage,
});

const publicationsTintangBaloboRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publications/tintang-balobo',
  component: TintangBaloboPage,
});

const publicationsSOSARoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/publications/sosa',
  component: SOSAPage,
});

// Prefixed route aliases for Research category
const researchActionResearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/research/action-research',
  component: ActionResearchPage,
});

const researchSchoolBasedResearchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/research/school-based-research',
  component: SchoolBasedResearchPage,
});

const researchResearchOutputsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/research/research-outputs',
  component: ResearchOutputsPage,
});

// Prefixed route aliases for Monitoring category
const monitoringInstructionalSupervisionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/instructional-supervision',
  component: InstructionalSupervisionPage,
});

const monitoringPhysicalEvaluationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/physical-evaluation',
  component: PhysicalEvaluationPage,
});

const monitoringDivisionMonitoringRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/division-monitoring',
  component: DivisionMonitoringPage,
});

const monitoringSMEARoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/smea',
  component: SMEAPage,
});

const monitoringSPTARoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/spta',
  component: SPTAPage,
});

const monitoringFinancialBoardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/monitoring/financial-board',
  component: FinancialBoardPage,
});

// Prefixed route aliases for Others category
const othersMDLFeedbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/mdl-feedback',
  component: MDLFeedbackPage,
});

const othersNATResourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/nat-resources',
  component: NATResourcesPage,
});

const othersNCAEResourcesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/ncae-resources',
  component: NCAEResourcesPage,
});

const othersKhanAcademyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/khan-academy',
  component: KhanAcademyPage,
});

const othersDownloadableFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/downloadable-forms',
  component: DownloadableFormsPage,
});

const othersSupportServicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/others/support-services',
  component: SupportServicesPage,
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/dashboard',
  component: AdminDashboardPage,
});

const bannerManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/banner-management',
  component: BannerManagementPage,
});

const schoolActivitiesManagerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/school-activities-manager',
  component: SchoolActivitiesManagerPage,
});

const historyManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/history-management',
  component: HistoryManagementPage,
});

const citizenCharterManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/citizen-charter-management',
  component: CitizenCharterManagementPage,
});

const alumniManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/alumni-management',
  component: AlumniManagementPage,
});

const bnhsHymnManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/bnhs-hymn-management',
  component: BNHSHymnManagementPage,
});

const userManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/user-management',
  component: UserManagementPage,
});

const analyticsDashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/analytics',
  component: AnalyticsDashboardPage,
});

const storageMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/storage',
  component: StorageMonitorPage,
});

const organizationalStructureManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/organizational-structure-management',
  component: OrganizationalStructureManagementPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  // Flat routes (legacy)
  historyRoute,
  organizationalStructureRoute,
  citizenCharterRoute,
  studentCornerRoute,
  clubsOrganizationsRoute,
  alumniRoute,
  learningMaterialsRoute,
  theInkspirerRoute,
  tintangBaloboRoute,
  sosaRoute,
  researchInnovationsRoute,
  actionResearchRoute,
  schoolBasedResearchRoute,
  researchOutputsRoute,
  depedOrdersRoute,
  depedMemorandaRoute,
  divisionOrdersMemorandaRoute,
  schoolOrdersMemorandaRoute,
  advisoriesCircularsRoute,
  archivedIssuancesRoute,
  sipRoute,
  aralProgramRoute,
  insetRoute,
  sbmRoute,
  praiseRoute,
  infrastructureRoute,
  schoolHealthRoute,
  learningCurriculumRoute,
  winsRoute,
  childProtectionPolicyRoute,
  prefectOfDisciplineRoute,
  gppRoute,
  bkdRoute,
  brigadaEskwelaRoute,
  eswmRoute,
  instructionalSupervisionRoute,
  observationToolsRoute,
  summativeAssessmentRoute,
  classroomObservationRoute,
  pmcfRoute,
  farRoute,
  lessonPlanRoute,
  tqRoute,
  tosRoute,
  physicalEvaluationRoute,
  divisionMonitoringRoute,
  smeaRoute,
  sptaRoute,
  financialBoardRoute,
  mdlFeedbackRoute,
  natResourcesRoute,
  ncaeResourcesRoute,
  khanAcademyRoute,
  downloadableFormsRoute,
  supportServicesRoute,
  // Prefixed route aliases for About
  aboutHistoryRoute,
  aboutOrganizationalStructureRoute,
  aboutCitizenCharterRoute,
  aboutStudentCornerRoute,
  aboutClubsOrganizationsRoute,
  aboutAlumniRoute,
  // Prefixed route aliases for Issuances
  issuancesDepEdOrdersRoute,
  issuancesDepEdMemorandaRoute,
  issuancesDivisionOrdersMemorandaRoute,
  issuancesSchoolOrdersMemorandaRoute,
  issuancesAdvisoriesCircularsRoute,
  issuancesArchivedIssuancesRoute,
  // Prefixed route aliases for PAPs
  papsSIPRoute,
  papsLearningCurriculumRoute,
  papsSBMRoute,
  papsINSETRoute,
  papsARALProgramRoute,
  papsPRAISERoute,
  papsInfrastructureRoute,
  papsSchoolHealthRoute,
  papsWINSRoute,
  papsChildProtectionPolicyRoute,
  papsPrefectOfDisciplineRoute,
  papsGPPRoute,
  papsBKDRoute,
  papsBrigadaEskwelaRoute,
  papsESWMRoute,
  // Prefixed route aliases for Publications
  publicationsTheInkspirerRoute,
  publicationsTintangBaloboRoute,
  publicationsSOSARoute,
  // Prefixed route aliases for Research
  researchActionResearchRoute,
  researchSchoolBasedResearchRoute,
  researchResearchOutputsRoute,
  // Prefixed route aliases for Monitoring
  monitoringInstructionalSupervisionRoute,
  monitoringPhysicalEvaluationRoute,
  monitoringDivisionMonitoringRoute,
  monitoringSMEARoute,
  monitoringSPTARoute,
  monitoringFinancialBoardRoute,
  // Prefixed route aliases for Others
  othersMDLFeedbackRoute,
  othersNATResourcesRoute,
  othersNCAEResourcesRoute,
  othersKhanAcademyRoute,
  othersDownloadableFormsRoute,
  othersSupportServicesRoute,
  // Admin routes
  adminDashboardRoute,
  bannerManagementRoute,
  schoolActivitiesManagerRoute,
  historyManagementRoute,
  citizenCharterManagementRoute,
  alumniManagementRoute,
  bnhsHymnManagementRoute,
  userManagementRoute,
  analyticsDashboardRoute,
  storageMonitorRoute,
  organizationalStructureManagementRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </StrictMode>
  );
}
