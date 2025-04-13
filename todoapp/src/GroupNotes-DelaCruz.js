// src/GroupNotes.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from './firebase';
import { collection, addDoc, onSnapshot, query, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'; 
import NoteCard from './NoteCard';
import NoteActions from './NoteActions'; // NoteActionsコンポーネントをインポート
import NoteHistory from './NoteHistory'; // NoteHistoryコンポーネントをインポート
import './styles.css';

const GroupNotes = () => {
  const { groupId } = useParams();
  const [groupName, setGroupName] = useState('');
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newLabel, setNewLabel] = useState(''); // 新しいラベル
  const [members, setMembers] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [filterLabel, setFilterLabel] = useState(''); // ラベルによるフィルタリング

  // グループ名を取得
  useEffect(() => {
    const fetchGroupName = async () => {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);
      if (groupSnap.exists()) {
        setGroupName(groupSnap.data().name);
      }
    };
    fetchGroupName();
  }, [groupId]);

  // Firebaseからノートを取得してリアルタイムで表示
  useEffect(() => {
    const notesRef = collection(db, 'notes');
    const q = query(notesRef, where('groupId', '==', groupId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const fetchGroupMembers = async () => {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const memberIds = groupSnap.data().members;
        const memberPromises = memberIds.map(id => getDoc(doc(db, 'users', id)));
        const memberSnapshots = await Promise.all(memberPromises);
        const memberData = memberSnapshots.map(snap => ({ id: snap.id, ...snap.data() }));
        setMembers(memberData);
      }
    };

    fetchGroupMembers();
    return unsubscribe;
  }, [groupId]);

  // ノートの保存（履歴を保存する機能を追加）
  const saveNote = async () => {
    if (selectedNoteId) {
      const selectedNote = notes.find(note => note.id === selectedNoteId);
      try {
        const noteRef = doc(db, 'notes', selectedNoteId);

        // 履歴に現在のノートデータを保存
        const historyRef = collection(db, 'notes', selectedNoteId, 'history');
        await addDoc(historyRef, {
          text: selectedNote.text,
          color: selectedNote.color,
          labels: selectedNote.labels || [],
          timestamp: new Date(),
        });

        // ノート自体を更新
        await setDoc(noteRef, { text: selectedNote.text, color: selectedNote.color, labels: selectedNote.labels || [] }, { merge: true });
        
        alert('ノートが保存されました！');
      } catch (error) {
        console.error('Error saving note:', error);
      }
    }
  };

  // ノートの削除
  const deleteNote = async () => {
    if (selectedNoteId) {
      try {
        await deleteDoc(doc(db, 'notes', selectedNoteId));
        setNotes(notes.filter(note => note.id !== selectedNoteId));
        setSelectedNoteId(null);
        alert('ノートが削除されました！');
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  // ノートのテキストを更新する
  const updateNoteText = (noteId, newText) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, text: newText } : note
      )
    );
  };

  // ノートの位置を更新する（Firestoreに保存）
  const moveNote = async (noteId, newLeft, newTop) => {
    setNotes(prevNotes =>
      prevNotes.map(note =>
        note.id === noteId ? { ...note, left: newLeft, top: newTop } : note
      )
    );

    try {
      const noteRef = doc(db, 'notes', noteId);
      await setDoc(noteRef, { left: newLeft, top: newTop }, { merge: true });
    } catch (error) {
      console.error('Error updating note position:', error);
    }
  };

  // ノートの色を変更する（Firestoreに保存）
  const changeNoteColor = async (newColor) => {
    if (selectedNoteId) {
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === selectedNoteId ? { ...note, color: newColor } : note
        )
      );
      try {
        const noteRef = doc(db, 'notes', selectedNoteId);
        await setDoc(noteRef, { color: newColor }, { merge: true });
      } catch (error) {
        console.error('Error updating note color:', error);
      }
    }
  };

  // ノートにラベルを追加
  const addLabelToNote = async () => {
    if (selectedNoteId && newLabel.trim()) {
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === selectedNoteId
            ? { ...note, labels: [...(note.labels || []), newLabel.trim()] }
            : note
        )
      );

      try {
        const noteRef = doc(db, 'notes', selectedNoteId);
        await setDoc(noteRef, { labels: [...(notes.find(note => note.id === selectedNoteId)?.labels || []), newLabel.trim()] }, { merge: true });
        setNewLabel(''); // ラベル入力フィールドをクリア
      } catch (error) {
        console.error('Error adding label:', error);
      }
    }
  };
  const addNote = async () => {
    if (!newNote.trim()) return;
  
    try {
      const newNoteData = {
        text: newNote,
        left: 750, // 新規ノートのデフォルト位置
        top: 430,  // 新規ノートのデフォルト位置
        color: '#ffffff', // デフォルトの色
        groupId,
        createdAt: new Date(),
      };
  
      // Firestoreに新しいノートを追加
      const docRef = await addDoc(collection(db, 'notes'), newNoteData);
  
      // 新しいノートを既存のノートリストに追加
      setNotes(prevNotes => [...prevNotes, { id: docRef.id, ...newNoteData }]);
  
      // 入力フィールドをクリア
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };
  
const restoreFromHistory = async (historyId) => {
  try {
    const historyRef = doc(db, `notes/${selectedNoteId}/history`, historyId);
    const historySnap = await getDoc(historyRef);

    if (historySnap.exists()) {
      const historyData = historySnap.data();

      // ノートリストを更新して再レンダリングをトリガー
      setNotes(prevNotes =>
        prevNotes.map(note =>
          note.id === selectedNoteId
            ? { ...note, text: historyData.text, color: historyData.color }
            : note
        )
      );

      // Firestoreのノートも更新する
      await updateNote(selectedNoteId, historyData.text, historyData.color);
    } else {
      console.error('No such history entry!');
    }
  } catch (error) {
    console.error('Error restoring from history:', error);
  }
};
const updateNote = async (noteId, newText, newColor) => {
  const noteRef = doc(db, 'notes', noteId);
  try {
    await setDoc(noteRef, { text: newText, color: newColor }, { merge: true });
  } catch (error) {
    console.error('Error updating note:', error);
  }
};
// src/GroupNotes.js

const removeLabelFromNote = async (noteId, labelToRemove) => {
  const note = notes.find(n => n.id === noteId);
  if (!note) return;

  // ラベルを削除
  const updatedLabels = note.labels.filter(label => label !== labelToRemove);

  // ノートのラベルを更新
  setNotes(prevNotes => 
    prevNotes.map(n => 
      n.id === noteId ? { ...n, labels: updatedLabels } : n
    )
  );

  // Firestoreに保存
  try {
    const noteRef = doc(db, 'notes', noteId);
    await setDoc(noteRef, { labels: updatedLabels }, { merge: true });
  } catch (error) {
    console.error('Error removing label:', error);
  }
};

  // ノートのフィルタリング（ラベルで）
  const filteredNotes = filterLabel
    ? notes.filter(note => note.labels && note.labels.includes(filterLabel))
    : notes;

  return (
    <div className="group-notes-page" style={{ display: 'flex' }}>
      {/* 履歴タブ */}
      {selectedNoteId && (
        <NoteHistory noteId={selectedNoteId} restoreFromHistory={restoreFromHistory} />
      )}

      {/* ノート一覧 */}
      <div style={{ flex: 1, paddingLeft: selectedNoteId ? '300px' : '0px' }}>
        <h3>{groupName}</h3>

        <div className="group-members">
          <h4>グループの参加者</h4>
          <ul>
            {members.map(member => (
              <li key={member.id}>
                <Link to={`/user-profile/${member.id}`}>{member.username}</Link>
              </li>
            ))}
          </ul>
        </div>

        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="付箋に記入"
        />
        <button onClick={addNote}>付箋を追加</button>

        {/* フィルタリング入力 */}
        <div className="filter-label">
          <input
            type="text"
            value={filterLabel}
            onChange={(e) => setFilterLabel(e.target.value)}
            placeholder="ラベルでフィルタ"
          />
        </div>

        <div className="notes-container">
          {filteredNotes.map(note => (
            <NoteCard
  key={note.id}
  noteId={note.id}
  initialText={note.text}
  initialLeft={note.left}
  initialTop={note.top}
  initialColor={note.color}
  initialLabels={note.labels} // ラベルを渡す
  onSelect={() => setSelectedNoteId(note.id)}
  onUpdateText={updateNoteText}
  onMove={moveNote}
  onRemoveLabel={removeLabelFromNote} // ラベル削除の関数を渡す
/>

          ))}
        </div>
      </div>

      {/* 保存、削除、色変更、ラベル追加のアクションバー */}
      {selectedNoteId && (
        <NoteActions 
          onSave={saveNote} 
          onDelete={deleteNote} 
          onChangeColor={changeNoteColor}
          onLabel={addLabelToNote}
          onAddLabel={addLabelToNote} 
          newLabel={newLabel}
          setNewLabel={setNewLabel}
        >

        </NoteActions>
      )}
    </div>
  );
};

export default GroupNotes;
