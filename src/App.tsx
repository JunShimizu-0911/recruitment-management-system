import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CandidateForm } from './components/candidates/CandidateForm';
import { CandidateList } from './components/candidates/CandidateList';
import { CandidateDetails } from './components/candidates/CandidateDetails';
import { InterviewCalendar } from './components/interviews/InterviewCalendar';
import { UserList } from './components/users/UserList';
import { Dashboard } from './components/dashboard/Dashboard';
import { Layout } from './components/layout/Layout';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/candidates" element={<CandidateList />} />
          <Route path="/candidates/new" element={<CandidateForm />} />
          <Route path="/candidates/edit/:id" element={<CandidateForm />} />
          <Route path="/candidates/:id" element={<CandidateDetails />} />
          <Route path="/interviews" element={<InterviewCalendar />} />
          <Route path="/users" element={<UserList />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;