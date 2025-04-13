// src/FriendManager.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useAuth } from './AuthProvider';

const FriendManager = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [newFriendUsername, setNewFriendUsername] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (user) {
        const userDoc = await getDocs(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setFriends(userDoc.data().friends || []);
        }
      }
    };
    fetchFriends();
  }, [user]);

  const searchUserByUsername = async () => {
    if (!newFriendUsername.trim()) return;

    try {
      const usersRef = collection(db, 'users');
      const allUsersSnapshot = await getDocs(usersRef);

      const results = allUsersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.username === newFriendUsername);

      if (results.length === 0) {
        alert('User not found.');
      }
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching user by username:', error);
    }
  };

  const addFriend = async (friendId) => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        friends: arrayUnion(friendId),
      });
      setFriends([...friends, friendId]);
      setNewFriendUsername('');
      setSearchResults([]);
      alert('Friend added successfully!');
    } catch (error) {
      console.error('Error adding friend:', error);
    }
  };

  return (
    <div>
      <h3>Friend Manager</h3>
      <input
        type="text"
        value={newFriendUsername}
        onChange={(e) => setNewFriendUsername(e.target.value)}
        placeholder="Search by username"
      />
      <button onClick={searchUserByUsername}>Search</button>

      <ul>
        {searchResults.map(result => (
          <li key={result.id}>
            {result.username}
            <button onClick={() => addFriend(result.id)}>Add Friend</button>
          </li>
        ))}
      </ul>

      <h4>Your Friends</h4>
      <ul>
        {friends.map(friend => (
          <li key={friend}>{friend}</li>
        ))}
      </ul>
    </div>
  );
};

export default FriendManager;
