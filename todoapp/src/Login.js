// src/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Linkをインポート
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // React Routerのnavigate関数

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert('User logged in successfully!');
      navigate('/group-manager');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>ログインページ</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">ログイン</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {/* サインアップページへのリンク */}
      <p>
        まだアカウントを作っていませんか？ <Link to="/signup">サインアップ</Link>
      </p>
    </div>
  );
};

export default Login;
