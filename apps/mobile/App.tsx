import React, { useCallback, useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { CollectionScreen } from './src/screens/CollectionScreen';
import { BookDetailScreen } from './src/screens/BookDetailScreen';
import { ReaderScreen } from './src/screens/ReaderScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { TopNavbar } from './src/components/TopNavbar';
import { BottomTabBar, TabKey } from './src/components/BottomTabBar';
import { BookItem } from './src/data/mockData';
import { useResponsive } from './src/hooks/useResponsive';
import { AuthApi, UserProfile } from './src/services/api';
import { UserStorage } from './src/services/storage';

const INITIAL_TAB: TabKey | 'sedang-dibaca' = 'beranda';

function AppContent() {
  const { colors, isDark } = useAppTheme();
  const { isMobile } = useResponsive();

  const [activeTab, setActiveTab] = useState<TabKey | 'sedang-dibaca'>(INITIAL_TAB);
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  /**
   * Gate autentikasi (initial route):
   * - null  -> BELUM login, aplikasi menampilkan AuthScreen (Masuk / Daftar)
   * value  -> SUDAH login, aplikasi menampilkan HomeScreen dan halaman lainnya
   * Sumber status ini dibaca langsung dari storage sehingga sesi tetap bertahan
   * setelah aplikasi di-refresh/di-reload.
   */
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() =>
    UserStorage.getActiveSessionUser()
  );

  // State favorit terisolasi per akun
  const [favoritesList, setFavoritesList] = useState<string[]>(() => {
    const active = UserStorage.getActiveSessionUser();
    return active ? UserStorage.getFavorites(active.id) : [];
  });

  const isAuthenticated = Boolean(currentUser);

  const handleSelectBook = (book: BookItem) => {
    setSelectedBook(book);
  };

  const handleStartReading = (book: BookItem) => {
    setSelectedBook(book);
    setIsReading(true);
    if (currentUser) {
      UserStorage.saveReadingProgress(
        currentUser.id,
        book.id,
        book.progressPercentage || 10
      );
    }
  };

  const handleToggleFavorite = (book: BookItem) => {
    if (!currentUser) return;

    const updated = UserStorage.toggleFavorite(currentUser.id, book.id);
    setFavoritesList(updated);
  };

  const handleTabPress = (tab: TabKey | 'sedang-dibaca') => {
    setSelectedBook(null);
    setIsReading(false);
    setIsProfileOpen(false);
    setActiveTab(tab);
  };

  /**
   * Berhasil Masuk / Daftar -> arahkan pengguna ke halaman utama (HomeScreen).
   * Sesi disimpan ke storage agar tidak diminta login lagi saat reload.
   */
  const handleAuthSuccess = useCallback((user: UserProfile) => {
    UserStorage.setActiveSessionUser(user);
    setCurrentUser(user);
    setFavoritesList(UserStorage.getFavorites(user.id));
    setActiveTab(INITIAL_TAB);
    setSelectedBook(null);
    setIsReading(false);
    setIsProfileOpen(false);
  }, []);

  /**
   * Keluar / Logout -> kembalikan pengguna ke AuthScreen.
   * State pengguna vorher dibersihkan total supaya tidak ada data yang bocor
   * ke akun berikutnya.
   */
  const handleLogout = useCallback(() => {
    UserStorage.clearSession();
    AuthApi.logout();
    setCurrentUser(null);
    setFavoritesList([]);
    setActiveTab(INITIAL_TAB);
    setSelectedBook(null);
    setIsReading(false);
    setIsProfileOpen(false);
  }, []);

  const openProfile = useCallback(() => {
    setIsProfileOpen(true);
  }, []);

  const renderScreen = () => {
    // 1. Gate: belum login -> AuthScreen adalah initial route
    if (!currentUser) {
      return <AuthScreen onSuccess={handleAuthSuccess} />;
    }

    // 2. Reading Screen (canvas baca penuh)
    if (isReading && selectedBook) {
      return (
        <ReaderScreen book={selectedBook} onBack={() => setIsReading(false)} />
      );
    }

    // 3. Profile Screen
    if (isProfileOpen) {
      return (
        <ProfileScreen
          user={currentUser}
          onBack={() => setIsProfileOpen(false)}
          onLogout={handleLogout}
        />
      );
    }

    // 4. Book Detail Screen
    if (selectedBook) {
      return (
        <BookDetailScreen
          book={selectedBook}
          onBack={() => setSelectedBook(null)}
          onStartReading={handleStartReading}
          onToggleFavorite={handleToggleFavorite}
          isFavorite={favoritesList.includes(selectedBook.id)}
        />
      );
    }

    // 5. Main Screens by Tab
    switch (activeTab) {
      case 'beranda':
        return (
          <HomeScreen
            onSelectBook={handleSelectBook}
            onReadBook={handleStartReading}
            onExploreCollection={() => setActiveTab('koleksi')}
            onOpenProfile={openProfile}
            onLogout={handleLogout}
          />
        );
      case 'koleksi':
        return (
          <CollectionScreen
            onSelectBook={handleSelectBook}
            onReadBook={handleStartReading}
            onOpenProfile={openProfile}
          />
        );
      case 'favorit':
        return (
          <FavoritesScreen
            favoriteBookIds={favoritesList}
            onSelectBook={handleSelectBook}
            onReadBook={handleStartReading}
            onToggleFavorite={handleToggleFavorite}
            onExploreCollection={() => setActiveTab('koleksi')}
            onOpenProfile={openProfile}
          />
        );
      case 'sedang-dibaca':
      case 'riwayat':
        return (
          <HistoryScreen
            onSelectBook={handleSelectBook}
            onReadBook={handleStartReading}
            onOpenProfile={openProfile}
          />
        );
      default:
        return null;
    }
  };

  // Navbar hanya tampil setelah pengguna berhasil masuk
  const showNavbar = isAuthenticated && !isReading && !isProfileOpen;
  const showBottomNav =
    isAuthenticated &&
    isMobile &&
    !selectedBook &&
    !isReading &&
    !isProfileOpen;

  return (
    <View
      style={[styles.rootContainer, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.surface}
      />

      {/* Top Navbar: Dark/Light Toggle + tombol Keluar (Logout) */}
      {showNavbar ? (
        <TopNavbar
          activeTab={activeTab}
          onTabPress={handleTabPress}
          currentUser={currentUser}
          onProfilePress={openProfile}
          onLogout={handleLogout}
        />
      ) : null}

      {/* Main Workspace Area */}
      <View style={styles.contentArea}>{renderScreen()}</View>

      {/* Mobile Bottom Navigation Bar */}
      {showBottomNav ? (
        <BottomTabBar
          activeTab={
            activeTab === 'sedang-dibaca' ? 'riwayat' : (activeTab as TabKey)
          }
          onTabPress={(tab) => handleTabPress(tab)}
        />
      ) : null}
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    height: '100%',
    minHeight: '100vh' as any,
    width: '100%',
  },
  contentArea: {
    flex: 1,
    height: '100%',
    overflow: 'auto' as any,
  },
});