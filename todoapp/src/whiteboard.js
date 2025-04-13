// src/Whiteboard.js
import React, { useState, useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import NoteCard from './NoteCard';
import UserProfile from './UserProfile';
import './styles.css'; // CSSファイルをインポート

const Whiteboard = () => {
  const [notes, setNotes] = useState([
    { id: 1, text: 'Note 1', left: 100, top: 100, bgColor: '#ffff99', font: 'Arial', width: 150, height: 100 },
    { id: 2, text: 'Note 2', left: 200, top: 200, bgColor: '#ffff99', font: 'Arial', width: 150, height: 100 },
  ]);
  const [username] = useState('John Doe'); // ユーザー名の状態
  const [icon, setIcon] = useState('/default-icon.jpg'); // アイコン画像の状態

  const whiteboardRef = useRef(null);

  const [, dropRef] = useDrop(() => ({
    accept: 'note',
  }));

  useEffect(() => {
    dropRef(whiteboardRef);
  }, [dropRef]);

  const moveNote = (id, left, top) => {
    const whiteboard = whiteboardRef.current;
    if (!whiteboard) return;

    const whiteboardRect = whiteboard.getBoundingClientRect();

    const note = notes.find(note => note.id === id);
    const noteWidth = note ? note.width : 100;
    const noteHeight = note ? note.height : 50;

    const newLeft = Math.max(0, Math.min(left, whiteboardRect.width - noteWidth));
    const newTop = Math.max(0, Math.min(top, whiteboardRect.height - noteHeight));

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id ? { ...note, left: newLeft, top: newTop } : note
      )
    );
  };

  const updateNote = (id, newText, newBgColor, newFont, newWidth, newHeight) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === id
          ? { ...note, text: newText, bgColor: newBgColor, font: newFont, width: newWidth, height: newHeight }
          : note
      )
    );
  };

  const deleteNote = (id) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== id));
  };

  return (
    <div>
      {/* ユーザープロファイルを右上に表示 */}
      <div className="header">
        <UserProfile username={username} icon={icon} />
      </div>

      <div ref={whiteboardRef} className="whiteboard">
        {notes.map((note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            text={note.text}
            left={note.left}
            top={note.top}
            onMove={moveNote}
            onDelete={deleteNote}
            onUpdate={updateNote} // onUpdate関数を渡す
          />
        ))}
      </div>

      {/* ノートリスト部分 - カード形式で表示 */}
      <div className="note-list">
        <h3>Note List</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {notes.map((note) => (
            <div key={note.id} className="note-list-item">
              <input
                type="text"
                value={note.text}
                onChange={(e) => updateNote(note.id, e.target.value, note.bgColor, note.font, note.width, note.height)}
                style={{ width: '100%', padding: '5px', boxSizing: 'border-box' }}
              />
              <button onClick={() => deleteNote(note.id)}>Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
