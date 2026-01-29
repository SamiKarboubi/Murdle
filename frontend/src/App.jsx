import { BrowserRouter, Routes, Route } from "react-router-dom";
import EnigmeListPage from "./pages/EnigmeListPage";
import EnigmePage from "./pages/EnigmePage"
import Layout from "./components/Layout";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<EnigmeListPage />} />
          
          <Route path="/enigme/:id" element={<EnigmePage />} />

          <Route path="/enigme/:id/game/:code" element={<EnigmePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
