// src/UserPage.js
import React, { useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Storageのインポート
import { useAuth } from './AuthProvider';
import './styles.css'; // CSSファイルをインポート

const UserPage = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [icon, setIcon] = useState('/default-icon.jpg');
  const [newUsername, setNewUsername] = useState('');
  const [bio, setBio] = useState(''); // 自己紹介文の初期状態
  const [newBio, setNewBio] = useState(''); // 自己紹介文の入力状態

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUsername(userData.username || 'Anonymous');
          setIcon(userData.icon || '/default-icon.jpg');
          setBio(userData.bio || ''); // 自己紹介文を取得
        } else {
          console.log('No such user!');
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleUsernameChange = async () => {
    if (newUsername.trim()) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { username: newUsername });
      setUsername(newUsername);
      setNewUsername('');
    }
  };

  const handleIconChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `user-icons/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setIcon(downloadURL); // UIを更新
      // FirestoreにアイコンのURLを保存
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { icon: downloadURL });
    }
  };

  const handleBioChange = async () => {
    if (newBio.trim()) {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { bio: newBio });
      setBio(newBio);
      setNewBio('');
    }
  };

  return (
    <div className="user-page">
      <h2>ユーザープロフィール</h2>
      <div className="user-profile-info">
        <img src={icon} alt="User Icon" className="user-profile-icon" />
        <p className="user-name-large">{username}</p>
        <p className="user-bio">{bio}</p> {/* 自己紹介文を表示 */}
      </div>
      
      <div className="user-update-section">
        <div className="username-update">
          <label>ユーザーネームを変更</label>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="新しいユーザーネーム"
          />
          <button onClick={handleUsernameChange}>更新</button>
        </div>

        <div className="icon-update">
          <label>アイコンを変更</label>
          <input type="file" accept="image/*" onChange={handleIconChange} />
        </div>

        <div className="bio-update">
          <label>自己紹介を更新</label>
          <textarea
            value={newBio}
            onChange={(e) => setNewBio(e.target.value)}
            placeholder="自己紹介"
          />
          <button onClick={handleBioChange}>更新</button>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
