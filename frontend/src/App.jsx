import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Pages/Login";
import ChangePassword from "./Pages/ChangePassword";
import ProtectedRoute from "./services/ProtectedRoute";
import Dashboard from "./Pages/Dashboard";
import AdminList from "./Pages/Admin/AdminList";
import UserList from "./Pages/Admin/UserList";
import CreateUser from "./Pages/Admin/CreateUser";
import EditUser from "./Pages/Admin/EditUser";
import EditAdmin from "./Pages/Admin/EditAdmin";
import Poolist from "./Pages/Admin/Poolist";
import CreatePoli from "./Pages/Admin/CreatePoli";
import DetailPool from "./Pages/Admin/DetailPool";
import UserDetailPool from "./Pages/User/UserVotePool";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />}/>
        <Route path="/change-password" element={<ChangePassword />}/>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />}/>
          <Route path="/user/pool/:id" element={<UserDetailPool />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/dashboard/admin" element={<AdminList />}  />
          <Route path="/users/list"  element={<UserList />} />
          <Route path="/user/list/create"  element={<CreateUser />} />
          <Route path="/user/list/edit/:id"  element={<EditUser />} />
          <Route path="/user/list/edit/admin/:id"  element={<EditAdmin />} />
          <Route path="/pool" element={<Poolist/>} />
          <Route path="/pool/create" element={<CreatePoli />} />
          <Route path="/pool/:id" element={<DetailPool />} />
        </Route>
      </Routes>
    </Router>
  );
}