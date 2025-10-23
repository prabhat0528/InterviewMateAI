import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import LearnMore from "./pages/LearnMore";
import Navbar from "./pages/Navbar";
import { AuthProvider } from "./context/Authcontext";
import Authentication from "./pages/Authentication";
import { FlashProvider } from "./context/FlashContext";
import FlashMessage from "./pages/FlashMessage";
import Arena from "./pages/Arena";
import InterviewPage from "./pages/InterviewPage";
import AnalysisPage from "./pages/AnalysisPage";
import GraphicalAnalysisPage from "./pages/GraphicalAnalysisPage";

function App() {
  return (
    <FlashProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <FlashMessage />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/learn-more" element={<LearnMore />} />
            <Route path="/auth" element={<Authentication />} />
            <Route path = "/arena" element = {<Arena/>}/>
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/analysis/:interviewId" element={<AnalysisPage />} />
            <Route path="/graphical-analysis/:interviewId" element={<GraphicalAnalysisPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </FlashProvider>
  );
}

export default App;
