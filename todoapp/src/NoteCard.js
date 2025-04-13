import React, { useState, useEffect, useRef } from 'react';
import './styles.css';

const NoteCard = ({ noteId, initialText, initialLeft, initialTop, initialColor, initialLabels, onSelect, onUpdateText, onMove, onRemoveLabel }) => {
  const [text, setText] = useState(initialText); // ローカルテキスト状態
  const textAreaRef = useRef(null);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  // ドラッグ終了時に新しい位置を保存する
  const handleDragEnd = (event) => {
    const newLeft = event.clientX - 150; // ドラッグ終了時の位置を調整
    const newTop = event.clientY - 50;
    onMove(noteId, newLeft, newTop); // Firestoreに位置を保存
  };

  const handleTextChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    onUpdateText(noteId, newText);
  };

  return (
    <div
      className="note-card"
      style={{
        position: 'absolute',
        left: initialLeft,
        top: initialTop,
        backgroundColor: initialColor, // 背景色を初期値として設定
        width: '300px', // ノートカードの幅を大きく設定
        padding: '10px', // パディングを追加して内部のテキストに余白を作成
      }}
      draggable
      onDragEnd={handleDragEnd}
      onClick={() => onSelect(noteId)} // クリックでノートを選択
    >
      <textarea
        ref={textAreaRef}
        value={text}
        onChange={handleTextChange}
        className="note-text"
        style={{
          resize: 'none',
          overflow: 'hidden',
          width: '100%',
          minHeight: '50px',
          backgroundColor: '#ffffff', // テキストボックスの背景色を白に設定
          color: '#000000', // テキスト色を黒に設定
        }}
      />

      {/* ラベル表示部分 */}
      {initialLabels && initialLabels.length > 0 && (
        <div className="note-labels">
          {initialLabels.map((label, index) => (
            <span key={index} className="note-label">
              {label}
              <button 
                className="remove-label-button" 
                onClick={() => onRemoveLabel(noteId, label)} // ラベルを削除
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoteCard;
