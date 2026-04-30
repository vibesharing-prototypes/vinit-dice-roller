import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";
import IndexPage from "./pages/IndexPage";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout navigation={[]}>
            <Outlet />
          </AppLayout>
        }
      >
        <Route index element={<IndexPage />} />
      </Route>
    </Routes>
  );
}
