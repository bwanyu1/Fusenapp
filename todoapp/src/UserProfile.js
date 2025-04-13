// src/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import './styles.css'; // CSSファイルをインポート

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const defaultIcon = './images/stick-figure.png'; // デフォルトの棒人間の画像

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        console.error('User ID is undefined');
        return;
      }

      try {
        const userRef = doc(db, 'users', userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();

          // アイコンが未設定の場合、デフォルトアイコンをFirestoreに保存
          if (!userData.icon) {
            await updateDoc(userRef, { icon: defaultIcon });
            setUser({ ...userData, icon: defaultIcon });
          } else {
            setUser(userData);
          }
        } else {
          console.log('No such user!');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUser();
  }, [userId]);

  if (!user) {
    return <div>ロード中</div>;
  }

  return (
    <div className="user-profile-page">
      <h2>{user.username}のプロフィール</h2>
      <img src={user.icon} alt="User Icon" className="user-profile-icon" />
      <p>Email: {user.email}</p>
      <p className="user-bio">自己紹介: {user.bio || 'No bio available'}</p> {/* 自己紹介文を表示 */}
      {/* 他のユーザー情報を表示することも可能 */}
    </div>
  );
};

export default UserProfile;
