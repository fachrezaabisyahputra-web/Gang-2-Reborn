/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp, ActiveModule } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickActionModal } from './components/common/QuickActionModal';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardModule } from './components/modules/DashboardModule';
import { KeuanganModule } from './components/modules/KeuanganModule';
import { KeluargaModule } from './components/modules/KeluargaModule';
import { PemudaModule } from './components/modules/PemudaModule';
import { PengumumanModule } from './components/modules/PengumumanModule';
import { AgendaModule } from './components/modules/AgendaModule';
import { ProkerModule } from './components/modules/ProkerModule';
import { InventarisModule } from './components/modules/InventarisModule';
import { UmkmModule } from './components/modules/UmkmModule';
import { DokumenModule } from './components/modules/DokumenModule';
import { PengaturanModule } from './components/modules/PengaturanModule';

function MainLayout() {
  const { activeModule, setActiveModule } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [openAddTransactionInitial, setOpenAddTransactionInitial] = useState(false);

  const handleQuickAction = (
    actionKey: 'add_transaction' | 'add_member' | 'add_family' | 'add_event' | 'add_announcement' | 'navigate',
    targetModule: ActiveModule
  ) => {
    setActiveModule(targetModule);
    if (actionKey === 'add_transaction') {
      setOpenAddTransactionInitial(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900 font-sans flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        setMobileOpen={setMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300">
        {/* Header Bar */}
        <Header
          onToggleSidebar={() => setMobileSidebarOpen(true)}
          onOpenQuickAction={() => setQuickActionOpen(true)}
        />

        {/* Dynamic Main Body Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeModule === 'beranda' && (
            <DashboardModule
              onOpenAddTransaction={() => {
                setActiveModule('keuangan');
                setOpenAddTransactionInitial(true);
              }}
              onOpenAddMember={() => setActiveModule('pemuda')}
              onOpenAddEvent={() => setActiveModule('agenda')}
              onOpenAddAnnouncement={() => setActiveModule('pengumuman')}
            />
          )}

          {activeModule === 'keuangan' && (
            <KeuanganModule initialOpenAddModal={openAddTransactionInitial} />
          )}

          {activeModule === 'keluarga' && <KeluargaModule />}

          {activeModule === 'pemuda' && <PemudaModule />}

          {activeModule === 'pengumuman' && <PengumumanModule />}

          {activeModule === 'agenda' && <AgendaModule />}

          {activeModule === 'proker' && <ProkerModule />}

          {activeModule === 'inventaris' && <InventarisModule />}

          {activeModule === 'umkm' && <UmkmModule />}

          {activeModule === 'dokumen' && <DokumenModule />}

          {activeModule === 'pengaturan' && <PengaturanModule />}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <QuickActionModal
        isOpen={quickActionOpen}
        onClose={() => setQuickActionOpen(false)}
        onSelectAction={handleQuickAction}
      />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
