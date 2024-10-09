import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import CampaignForm from './components/Forms/CampaignForm';
import ClientForm from './components/Forms/ClientForm';
import Home from './components/Home/Home';
import Login from './components/Login/Login'
import ForgotPassword from './components/Login/ForgotPassword';
import { UserProvider } from './components/Context/UserProvider';
import AdminProtectedRoute from './components/ProtectedRoutes/AdminProtectedRoute';
import ClientDetails from './components/Forms/ClientDetails';
import CampaignDetails from './components/Forms/CampaignDetails';
import ReportForm from './components/Forms/ReportForm';
import ReportDetails from './components/Forms/ReportDetails';
import ClientDashboard from './components/Dashboards/ClientDashboard';
import ClientProtectedRoute from './components/ProtectedRoutes/ClientProtectedRoute';
import ClientAdminDashBoard from './components/Dashboards/ClientAdminDashBoard';


function App() {
  return (
    <>
    <BrowserRouter>
    <UserProvider>
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/forgotpassword' element={<ForgotPassword />} />
      <Route path='/dashboard' element={<ClientProtectedRoute component={<ClientDashboard/>} />} />
      <Route path='/client-dashboard/:clientName/:campId' element={<AdminProtectedRoute component={<ClientAdminDashBoard/>} />} />
      <Route path='/home' element={<AdminProtectedRoute component={<Home/>} />} />
      <Route path='/clientform' element={<AdminProtectedRoute component={<ClientForm/>} />} />
      <Route path='/clientdetails' element={<AdminProtectedRoute component={<ClientDetails/>} />} />
      <Route path='/campaignform' element={<AdminProtectedRoute component={<CampaignForm/>} />} />
      <Route path='/campaigndetails' element={<AdminProtectedRoute component={<CampaignDetails/>} />} />
      <Route path='/reportform' element={<AdminProtectedRoute component={<ReportForm/>} />} />
      <Route path='/reportdetails' element={<AdminProtectedRoute component={<ReportDetails/>} />} />
      <Route
        path="*"
        element={<Navigate to="/home" replace />}
    />
    </Routes>
    </UserProvider>
    </BrowserRouter>
    
    
    </>
  );
}

export default App;
