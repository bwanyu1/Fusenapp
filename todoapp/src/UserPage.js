// src/UserPage.js
import React, { useState } from 'react';
import UserProfile from './UserProfile';

const UserPage = () => {
  const [username] = useState('俺はいったい誰なんだ'); // デフォルトのユーザー名
  const [icon, setIcon] = useState('./images/stick-figure.png'); // デフォルトのアイコン画像
  const [bio, setBio] = useState(''); // 自己紹介文の初期状態

  const handleIconChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIcon(reader.result); // Base64エンコードされた画像データを設定
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBioChange = (event) => {
    setBio(event.target.value);
  };

  return (
    <div className="user-page">
      <h2>ユーザー設定</h2>
      <UserProfile username={username}  />
      <div className="icon-upload">
        <label htmlFor="icon-upload">Change Icon:</label>
        <input type="file" id="icon-upload" accept="image/*" onChange={handleIconChange} />
      </div>
      <div className="bio-section">
        <label htmlFor="bio">Your Bio:</label>
        <textarea
          id="bio"
          value={bio}
          onChange={handleBioChange}
          placeholder="自己紹介"
        />
      </div>
    </div>
  );
};

export default UserPage;
