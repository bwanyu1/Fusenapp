// src/Signup.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Linkをインポート
import { auth, db } from './firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // React Routerのnavigate関数

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Firestoreにユーザー名を保存
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username: username,
      });

      setEmail('');
      setPassword('');
      setUsername('');
      alert('User registered successfully!');

      // サインアップ後にグループマネージャーにリダイレクト
      navigate('/group-manager');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>サインアップページ</h2>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">サインアップ</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* ログインページへのリンク */}
      <p>
        すでにアカウントを持っていますか？ <Link to="/login">ログイン</Link>
      </p>
    </div>
  );
};

export default Signup;
