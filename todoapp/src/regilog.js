

import React, { useState } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

const LoginOrSignup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      // まずログインを試みる
      await signInWithEmailAndPassword(auth, email, password);
      alert('Logged in successfully!');
    } catch (loginError) {
      // ログインに失敗した場合、新規アカウントを作成する
      if (loginError.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password);
          alert('Account created successfully!');
        } catch (signupError) {
          setError(signupError.message);
        }
      } else {
        setError(loginError.message);
      }
    }
  };

  return (
    <div>
      <h2>Login or Signup</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleAuth}>
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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LoginOrSignup;
