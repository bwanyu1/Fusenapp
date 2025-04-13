// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd'; // DndProviderをインポート
import { HTML5Backend } from 'react-dnd-html5-backend'; // HTML5Backendをインポート
import Signup from './Signup';
import Login from './Login';
import GroupManager from './GroupManager';
import UserPage from './user';
import GroupNotes from './GroupNotes'; // GroupNotesコンポーネントをインポート
import { AuthProvider, useAuth } from './AuthProvider';
import UserProfile from './UserProfile'

const App = () => {
  return (
    <AuthProvider>
      <DndProvider backend={HTML5Backend}> {/* DndProviderでラップ */}
        <Router>
          <Routes>
            {/* デフォルトのルートにアクセスした場合、Signupコンポーネントにリダイレクト */}
            <Route path="/" element={<Navigate to="/signup" />} />
            {/* サインアップ画面 */}
            <Route path="/signup" element={<Signup />} />
            {/* ログイン画面 */}
            <Route path="/login" element={<Login />} />
            <Route path="/user-page" element={<UserPage />} />
            {/* 認証されたユーザーのみがアクセスできるグループ管理画面 */}
            <Route path="/group-manager" element={<ProtectedRoute><GroupManager /></ProtectedRoute>} />
            {/* 認証されたユーザーのみがアクセスできるグループノート画面 */}
            <Route path="/group-notes/:groupId" element={<ProtectedRoute><GroupNotes /></ProtectedRoute>} />

            <Route path="/user-profile/:userId" element={<UserProfile />} /> {/* 新しいルート */}
          </Routes>
        </Router>
      </DndProvider>
    </AuthProvider>
  );
};

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" />;
  }
  return children;
};

export default App;
