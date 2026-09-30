import React from 'react';
import { BloggrProvider, useBloggr } from './context/BloggrContext';
import { Navbar } from './components/Navbar';
import { SidebarNav } from './components/SidebarNav';
import { FeedList } from './components/FeedList';
import { NewsPageView } from './components/NewsPageView';
import { FootballPageView } from './components/FootballPageView';
import { OpinionPageView } from './components/OpinionPageView';
import { RightSidebar } from './components/RightSidebar';
import { MainFeedRightSidebar } from './components/MainFeedRightSidebar';
import { ProfilePage } from './components/ProfilePage';
import { OperaArticleReader } from './components/OperaArticleReader';
import { CreatePostModal } from './components/CreatePostModal';
import { AwardModal } from './components/AwardModal';
import { Toast } from './components/Toast';
import { PolicyModal } from './components/PolicyModal';
import { AuthorDirectoryModal } from './components/AuthorDirectoryModal';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { BottomMenu } from './components/BottomMenu';
import { ReelsView } from './components/ReelsView';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { NotificationModal } from './components/NotificationModal';
import { FaviconLoader } from './components/FaviconLoader';
import { Footer } from './components/Footer';
import { MobileSideNav } from './components/MobileSideNav';

const BloggrApp: React.FC = () => {
  const { isUserProfileOpen, isAppLoading, theme, activePost, setActivePost, mainNavTab } = useBloggr();

  if (isAppLoading) {
    return (
      <div className={`min-h-screen bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4 ${theme}`}>
        <FaviconLoader
          size="lg"
          label="Connecting to Bloggr..."
          sublabel="Syncing breaking Kenya & world dispatches, verified journalists & live ticker"
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-neutral-100 dark:bg-[#0c0d14] text-neutral-900 dark:text-neutral-100 transition-colors selection:bg-orange-500 selection:text-white ${theme}`}>
      {/* Top Navigation */}
      <Navbar />

      {/* Main Responsive Grid Layout */}
      <div className="mx-auto max-w-7xl flex">
        {/* Left Categories and Feeds Drawer */}
        <SidebarNav />

        {/* Center Main View (Profile Page OR Single Article Reader OR Feed Stream & Right Sidebar) */}
        <main className="flex-1 min-w-0 p-2 sm:p-3 md:p-6 pb-24 md:pb-6">
          {isUserProfileOpen ? (
            <ProfilePage />
          ) : activePost ? (
            <div className="flex gap-4 lg:gap-6 items-start w-full">
              {/* Single Article Reader */}
              <div className="flex-1 min-w-0">
                <OperaArticleReader
                  post={activePost}
                  onClose={() => {
                    setActivePost(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>

              {/* Right Sidebar on Single Article Page ONLY */}
              <RightSidebar activePost={activePost} />
            </div>
          ) : (
            <div className="flex gap-4 lg:gap-6 items-start w-full">
              {/* Posts Feed Stream according to Main Navigation Tab */}
              <div className="flex-1 min-w-0">
                {mainNavTab === 'home' && <FeedList />}
                {mainNavTab === 'news' && <NewsPageView />}
                {mainNavTab === 'football' && <FootballPageView />}
                {mainNavTab === 'opinion' && <OpinionPageView />}
              </div>

              {/* Desktop Main Feed Right Sidebar */}
              <MainFeedRightSidebar />
            </div>
          )}
        </main>
      </div>

      {/* Platform Editorial Footer (Desktop & Tablet) */}
      <Footer />

      {/* Mobile Vertical 3-Dot Side Nav Drawer (Shifted Footer & Sidebar items) */}
      <MobileSideNav />

      {/* Mobile Bottom Menu (Home, Football, Create, Reels, Profile) */}
      <BottomMenu />

      {/* Reels Fullscreen Overlay */}
      <ReelsView />

      {/* Modals & Overlays */}
      <ReportModal />
      <NotificationModal />
      <CreatePostModal />
      <AuthModal />
      <AwardModal />
      <PolicyModal />
      <AuthorDirectoryModal />
      <AdminDashboardModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <BloggrProvider>
      <BloggrApp />
    </BloggrProvider>
  );
}
