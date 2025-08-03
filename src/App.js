
import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "antd/dist/reset.css";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "./contexts/AuthContext";
import StockProvider from "./contexts/StockContext";
import ProtectedRoute from "./ProtectedRoute";
import Spinner from "./components/Spinner/Spinner";

// --- Non-Lazy Components ---
import JobDetailPage from "./components/Hiring/JobDetailPage";
import SurveyAnalytic from './Pages/Analytics/SurveyAnalytic';
import ResponsePage from "./Pages/Survey/responsePage";

// --- Lazy Loaded Components (Grouped by Feature) ---

// General & Auth
const AuthTabs = lazy(() => import("./Pages/AuthTabs/AuthTabs"));
const Register = lazy(() => import("./Pages/Register/Register"));
const Dashboard = lazy(() => import("./components/superadmin/Dashboard"));
const ResetPassword = lazy(() => import("./components/Reset/ResetPassword"));
const ResetPasswordDash = lazy(() => import("./Pages/ResetPasswordDash/ResetPasswordDash"));
const UserSideDashboard = lazy(() => import("./components/workspaces/Users/usersidebar"));
const ToastCard = lazy(() => import("./components/ToastCard/ToastCard"));

// Portfolio & Platform Management
const PlatformManagementfeature = lazy(() => import("./Pages/PlatformMangemenrfeature/PlatformMangamentfeature"));
const PortfolioHome = lazy(() => import("./Pages/PortfolioHome"));
const ProjectDetails = lazy(() => import("./Pages").then((mod) => ({ default: mod.ProjectDetails })));
const Upload = lazy(() => import("./Pages").then((mod) => ({ default: mod.Upload })));
const ClientInfo = lazy(() => import("./Pages/PortfolioManagement/ClientInfo"));
const PodInfo = lazy(() => import("./Pages/PortfolioManagement/PodInfo"));
const ReviewsPage = lazy(() => import("./Pages/PortfolioManagement/Reviews"));
const AllAdminRoutes = lazy(() => import("./components/RoutesData/AllAdminRoute"));
const Form = lazy(() => import("./Pages").then((mod) => ({ default: mod.Form })));

// Stock & Asset Management
const ListStock = lazy(() => import("./Pages").then((mod) => ({ default: mod.ListStock })));
const Allitems = lazy(() => import("./Pages").then((mod) => ({ default: mod.Allitems })));
const Request = lazy(() => import("./Pages").then((mod) => ({ default: mod.Request })));
const AssignItem = lazy(() => import("./Pages/AssignItems"));
const AcknowledgeAssetPage = lazy(() => import("./Pages/AssetAcknowlegemnt/AcknowledgeAssetRequest"));

// Actions
const ListOfActions = lazy(() => import("./components/Actions/ListOfActions"));
const ActionView = lazy(() => import("./components/Actions/ActionView/ActionView"));

// Survey Response Management
const WorkspaceSelection = lazy(() => import("./Pages/SurveyResponses/WorkspaceSelection"));
const SurveyResponseDashboard = lazy(() => import("./Pages/SurveyResponses/SurveyResponseDashboard"));
const SurveyRespondents = lazy(() => import("./Pages/SurveyResponses/SurveyRespondents"));
const UserSurveyResponse = lazy(() => import("./Pages/SurveyResponses/UserSurveyResponse"));

// Compliance
const ComplySyncForm = lazy(() => import("./Pages/Compliance/ComplySyncForm"));
const ComplySyncResponse = lazy(() => import("./Pages/Compliance/ComplySyncResponse"));
const ComplianceDashboard = lazy(() => import("./Pages/Compliance/ComplianceDashboard"));
const ComplianceSurveys = lazy(() => import("./Pages/Compliance/ComplianceSurveys"));
const ComplianceSurveyResponses = lazy(() => import("./Pages/Compliance/ComplianceSurveyResponses"));
const ComplianceSurveyDetail = lazy(() => import("./Pages/Compliance/ComplianceSurveyDetail"));
const UserComplianceTests = lazy(() => import("./Pages/Compliance/UserComplianceTests"));


function App() {
  return (
    <AuthProvider>
      <StockProvider>
        <Router>
          <Suspense fallback={<Spinner />}>
            <Routes>
              {/* --- Public & General Routes --- */}
              <Route path="/" element={<AuthTabs />} />
              <Route path="/register" element={<Register />} />
              <Route path="/job/:id" element={<JobDetailPage />} />
              <Route path="/response/:surveyId" element={<ResponsePage />} />
              <Route path="/acknowledge/:id" element={<AcknowledgeAssetPage />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/reset-passworddash" element={<ResetPasswordDash />} />
              <Route path="/:workspace_name/reset-passworddash" element={<ResetPasswordDash />} />
              <Route path="/Form" element={<Form />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/test" element={<ToastCard />} />

              {/* --- User/Admin Dashboard --- */}
              <Route
                path="/udashboard/workspacename/:workspacename"
                element={
                  <ProtectedRoute requiredRole={["user", "admin"]}>
                    <UserSideDashboard />
                  </ProtectedRoute>
                }
              />

              {/* --- Superadmin Dashboard --- */}
              <Route
                path="/dashboard/workspacename/:workspacename"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <UserSideDashboard />
                  </ProtectedRoute>
                }
              />

              {/* --- Stock Management Routes --- */}
              <Route path="/stock" element={<ListStock />} />
              <Route path="/allitems" element={<Allitems />} />
              <Route path="/request" element={<Request />} />
              <Route path="/assigned" element={<AssignItem />} />
              
              {/* --- Platform Management Routes --- */}
              <Route
                path="/platform-management-feature/*"
                element={
                  <PlatformManagementfeature>
                    <Routes>
                      <Route path="portfolio" element={<PortfolioHome />} />
                      <Route path="projectdetails/:id" element={<ProjectDetails />} />
                      <Route path="Client/:id" element={<ClientInfo />} />
                      <Route path="PodInfo" element={<PodInfo />} />
                      <Route path="Pod/:id" element={<PodInfo />} />
                      <Route path="portfoliomanagement/Reviews" element={<ReviewsPage />} />
                      <Route element={<AllAdminRoutes />}>
                        <Route path="import" element={<Upload />} />
                      </Route>
                    </Routes>
                  </PlatformManagementfeature>
                }
              />
              <Route
                path="/:workspaceName/platform-management-feature/*"
                element={
                  <ProtectedRoute requiredRole="superadmin">
                    <PlatformManagementfeature>
                      <Routes>
                        <Route path="portfolio" element={<PortfolioHome />} />
                        <Route path="projectdetails/:id" element={<ProjectDetails />} />
                        <Route path="Client/:id" element={<ClientInfo />} />
                        <Route path="PodInfo" element={<PodInfo />} />
                        <Route path="Pod/:id" element={<PodInfo />} />
                        <Route path="portfoliomanagement/Reviews" element={<ReviewsPage />} />
                        <Route element={<AllAdminRoutes />}>
                           <Route path="import" element={<Upload />} />
                        </Route>
                      </Routes>
                    </PlatformManagementfeature>
                  </ProtectedRoute>
                }
              />

              {/* --- Actions Routes --- */}
              <Route path="/actions" element={<ListOfActions />} />
              <Route path="/actions/view/:actionId" element={<ActionView />} />

              {/* --- Survey Analytics Routes --- */}
              <Route path="/analytics/survey/:sid" element={<SurveyAnalytic />} />
              <Route path="/analytics/survey/:sid/:type" element={<SurveyAnalytic />} />

              {/* --- Survey Response Management Routes (Superadmin) --- */}
              <Route path="/survey-responses" element={<ProtectedRoute requiredRole="superadmin"><WorkspaceSelection /></ProtectedRoute>} />
              <Route path="/survey-responses/workspace/:workspaceName" element={<ProtectedRoute requiredRole="superadmin"><SurveyResponseDashboard /></ProtectedRoute>} />
              <Route path="/survey-responses/:sid/respondents" element={<ProtectedRoute requiredRole="superadmin"><SurveyRespondents /></ProtectedRoute>} />
              <Route path="/survey-responses/:sid/user/:empId" element={<ProtectedRoute requiredRole="superadmin"><UserSurveyResponse /></ProtectedRoute>} />

              {/* --- Compliance Test Routes --- */}
              <Route path="/compliance" element={<ProtectedRoute requiredRole={["admin", "superadmin"]}><ComplianceDashboard /></ProtectedRoute>} />
              <Route path="/compliance-tests" element={<ProtectedRoute requiredRole={["user", "admin", "superadmin"]}><UserComplianceTests /></ProtectedRoute>} />
              <Route path="/compliance/surveys" element={<ProtectedRoute requiredRole={["user", "admin", "superadmin"]}><ComplianceSurveys /></ProtectedRoute>} />
              <Route path="/compliance/survey-responses" element={<ProtectedRoute requiredRole={["admin", "superadmin"]}><ComplianceSurveyResponses /></ProtectedRoute>} />
              <Route path="/compliance/survey/:surveyId/responses" element={<ProtectedRoute requiredRole={["admin", "superadmin"]}><ComplianceSurveyDetail /></ProtectedRoute>} />
              <Route path="/compliance/create-test" element={<ProtectedRoute requiredRole={["admin", "superadmin"]}><ComplySyncForm /></ProtectedRoute>} />
              <Route path="/compliance-test/:testId" element={<ProtectedRoute requiredRole={["user", "admin", "superadmin"]}><ComplySyncResponse /></ProtectedRoute>} />

              {/* --- Catch-all Fallback Route --- */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar
              newestOnTop
              closeOnClick
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Suspense>
        </Router>
      </StockProvider>
    </AuthProvider>
  );
}

export default App;
