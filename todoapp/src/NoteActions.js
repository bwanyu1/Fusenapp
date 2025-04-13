// src/NoteActions.js
import React from 'react';
import './styles.css';

const NoteActions = ({ onSave, onDelete, onChangeColor, onAddLabel, newLabel, setNewLabel }) => {
  return (
    <div className="note-actions-bar">
      {/* 色変更 */}
      <label className="color-picker">
        <span>色を変更: </span>
        <input
          type="color"
          onChange={(e) => onChangeColor(e.target.value)} // 色変更時にコールバックを呼び出す
        />
      </label>

      {/* ラベル追加 */}
      <div className="label-input">
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)} // 新しいラベルを入力
          placeholder="ラベルを追加"
          className="label-input-field"
        />
        <button onClick={onAddLabel} className="note-actions-button add-label-button">ラベルを追加</button>
      </div>

      {/* 保存と削除ボタン */}
      <button onClick={onSave} className="note-actions-button save-button">保存</button>
      <button onClick={onDelete} className="note-actions-button delete-button">削除</button>
    </div>
  );
};

export default NoteActions;
