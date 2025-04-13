// src/Notes.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("User is logged in with UID:", currentUser.uid); // デバッグ用ログ
        setUser(currentUser);
        const q = query(collection(db, 'notes'), where('uid', '==', currentUser.uid));
        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const fetchedNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setNotes(fetchedNotes);
        });
        return () => unsubscribeSnapshot();
      } else {
        console.log("No user is logged in");
        setUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (newNote.trim() === '' || !user) return;

    try {
      await addDoc(collection(db, 'notes'), {
        uid: user.uid, // ユーザーのUIDを使用
        text: newNote,
        createdAt: new Date(),
      });
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
      alert('Error adding note: ' + error.message);
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await deleteDoc(doc(db, 'notes', id));
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Error deleting note: ' + error.message);
    }
  };

  return (
    <div>
      <h2>Your Notes</h2>
      <form onSubmit={handleAddNote}>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Write a new note..."
        />
        <button type="submit">Add Note</button>
      </form>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            {note.text}
            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Notes;
