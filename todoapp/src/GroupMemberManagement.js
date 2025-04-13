import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

const GroupMemberManagement = ({ groupId, members, setMembers, currentUserRole }) => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // 管理者ロールを確認
    const checkAdminRole = async () => {
      const groupRef = doc(db, 'groups', groupId);
      const groupSnap = await getDoc(groupRef);

      if (groupSnap.exists()) {
        const groupData = groupSnap.data();
        const adminUid = groupData.admin; // グループ管理者のUID
        if (adminUid === currentUserRole) {
          setIsAdmin(true);
        }
      }
    };
    checkAdminRole();
  }, [groupId, currentUserRole]);

  const kickMember = async (memberId) => {
    try {
      const groupRef = doc(db, 'groups', groupId);

      // メンバーリストから削除
      await updateDoc(groupRef, {
        members: arrayRemove(memberId),
      });

      // ローカルのメンバーリストを更新
      setMembers((prevMembers) => prevMembers.filter((member) => member.id !== memberId));

      alert('メンバーをキックしました。');
    } catch (error) {
      console.error('Error kicking member:', error);
    }
  };

  return (
    <div>
      <h4>メンバー管理</h4>
      <ul>
        {members.map((member) => (
          <li key={member.id}>
            {member.username}
            {/* 管理者の場合のみキックボタンを表示 */}
            {isAdmin && (
              <button onClick={() => kickMember(member.id)} style={{ marginLeft: '10px' }}>
                キック
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupMemberManagement;
