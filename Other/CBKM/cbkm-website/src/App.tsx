import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SponsorshipProvider } from './context/SponsorshipContext';
import { LogoProvider } from './context/LogoContext';
import { EventsProvider } from './context/EventsContext';
import Layout from './components/Layout/Layout';
import Home from './pages/Home';
import Events from './pages/Events';
import Sponsorship from './pages/Sponsorship';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import About from './pages/About';
import Blog from './pages/Blog';
import AdminPortal from './pages/Admin/AdminPortal';
import EventDetail from './pages/EventDetail';
import Vote from './pages/Vote';
import VotingResults from './pages/VotingResults';

function App() {
  return (
    <EventsProvider>
    <LogoProvider>
    <SponsorshipProvider>
      <Router basename="/">
        <Routes>
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/events" element={<Layout><Events /></Layout>} />
          <Route path="/events/:slug" element={<Layout><EventDetail /></Layout>} />
          <Route path="/sponsorship" element={<Layout><Sponsorship /></Layout>} />
          <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/contact" element={<Layout><Contact /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/results" element={<VotingResults />} />
        </Routes>
      </Router>
      <Analytics />
    </SponsorshipProvider>
    </LogoProvider>
    </EventsProvider>
  );
}

export default App;
