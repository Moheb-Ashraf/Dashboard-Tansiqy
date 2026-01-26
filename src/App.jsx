import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "./Components/AdminLayout/AdminLayout";
import AddCollege from "./Pages/AddCollege/AddCollege";
import AddUniversity from "./Pages/AddUniversity/AddUniversity";
import AdminStats from "./Pages/AdminStats/AdminStats";
import EditCollege from "./Pages/EditCollege/EditCollege";
import EditUniversity from "./Pages/EditUniversity/EditUniversity";
import Login from "./Pages/Login/Login";
import ManageUniversities from "./Pages/ManageUniversities/ManageUniversities";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/stats" />} />
          <Route path="stats" element={<AdminStats />} />
          <Route path="universities" element={<ManageUniversities />} />
          <Route path="add-university" element={<AddUniversity />} />
          <Route path="edit-university/:id" element={<EditUniversity />} />
          <Route path="add-college" element={<AddCollege />} />
          <Route path="edit-college/:uniId/:id" element={<EditCollege />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;