import React, { useState } from 'react';
import Layout from './components/Layout';
import Generator from './components/Generator';
import Comparator from './components/Comparator';
import { AppView } from './types';

function App() {
  const [currentView, setView] = useState<AppView>(AppView.GENERATOR);

  return (
    <Layout currentView={currentView} setView={setView}>
      {currentView === AppView.GENERATOR ? (
        <Generator />
      ) : (
        <Comparator />
      )}
    </Layout>
  );
}

export default App;
