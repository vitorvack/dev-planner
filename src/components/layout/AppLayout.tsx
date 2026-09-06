import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
