import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { SponsorshipProvider } from './context/SponsorshipContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Sponsorship from './pages/Sponsorship';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import AdminPortal from './pages/Admin/AdminPortal';
import VotePage from './Voting';
function App() {
  return (
    <SponsorshipProvider>
      <Router>
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/sponsorship" element={<Layout><Sponsorship /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/vote" element={<VotePage />} />
        </Routes>
      </Router>
    </SponsorshipProvider>
  );
}

export default App;
