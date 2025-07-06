
import React, { useState } from 'react';
import HomePage from './components/pages/HomePage';
import HistoryPage from './components/pages/HistoryPage';
import { Button } from './components/ui/Button';
import { ClockIcon, ListIcon } from './components/icons/Icons';

type Page = 'home' | 'history';

const App: React.FC = () => {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-border">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">
            シンプル打刻アプリ
          </h1>
          <nav className="flex items-center gap-2">
            <Button variant={page === 'home' ? 'secondary' : 'ghost'} onClick={() => setPage('home')}>
              <ClockIcon className="h-4 w-4 mr-2" />
              打刻
            </Button>
            <Button variant={page === 'history' ? 'secondary' : 'ghost'} onClick={() => setPage('history')}>
              <ListIcon className="h-4 w-4 mr-2" />
              実績
            </Button>
          </nav>
        </header>

        <main>
          {page === 'home' && <HomePage />}
          {page === 'history' && <HistoryPage />}
        </main>
      </div>
    </div>
  );
};

export default App;
