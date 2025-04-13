// src/NoteHistory.js
import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const NoteHistory = ({ noteId, restoreFromHistory }) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!noteId) return;

    // Firestoreの `notes/{noteId}/history` コレクションを参照
    const historyRef = collection(db, 'notes', noteId, 'history');
    const q = query(historyRef, orderBy('timestamp', 'desc')); // 履歴を最新の順に並べる
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHistory(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [noteId]);

  return (
    <div className="note-history-sidebar">
      <h4>更新履歴</h4>
      <ul>
        {history.map((entry) => (
          <li key={entry.id}>
            <div>
              <strong>{new Date(entry.timestamp?.toDate()).toLocaleString()}</strong>
            </div>
            <div>{entry.text}</div> {/* ノートの内容を表示 */}
            <button onClick={() => restoreFromHistory(entry.id)}>このバージョンに戻す</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoteHistory;
