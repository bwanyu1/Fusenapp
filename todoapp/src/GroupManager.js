import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, doc, arrayUnion, getDoc, query, where } from 'firebase/firestore';
import { useAuth } from './AuthProvider';
import { Link } from 'react-router-dom'; // Linkをインポート
import './styles.css'; // CSSファイルをインポート

const GroupManager = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [username, setUsername] = useState('');
  const [icon, setIcon] = useState('');
  const [inviteEmails, setInviteEmails] = useState({}); // 各グループごとに招待メールを管理
  const defaultIcon = '/images/stick-figure.png'; // デフォルトの棒人間の画像

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();

          // アイコンが未設定の場合、デフォルトアイコンをFirestoreに保存
          if (!userData.icon) {
            await updateDoc(userRef, { icon: defaultIcon });
            setIcon(defaultIcon);
          } else {
            setIcon(userData.icon);
          }

          setUsername(userData.username || 'Anonymous');
        } else {
          console.log('No such user!');
        }
      } else {
        // ユーザーがログインしていない場合
        setUsername('Guest');
        setIcon(defaultIcon);
      }
    };

    const fetchGroups = async () => {
      if (user) {
        const groupsRef = collection(db, 'groups');
        const q = query(groupsRef, where('members', 'array-contains', user.uid));
        const groupsSnapshot = await getDocs(q);
        setGroups(groupsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    };

    fetchUserProfile();
    fetchGroups();
  }, [user]);

  const createGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      // グループ作成時に作成者のUIDを管理者としてrolesフィールドに保存
      const groupRef = await addDoc(collection(db, 'groups'), {
        name: newGroupName,
        members: [user.uid],
        roles: {
          [user.uid]: '管理者', // 作成者に管理者ロールを付与
        },
      });
      setGroups([...groups, { id: groupRef.id, name: newGroupName, members: [user.uid], roles: { [user.uid]: '管理者' } }]);
      setNewGroupName('');
    } catch (error) {
      console.error('Error creating group:', error);
    }
  };

  const handleInviteEmailChange = (groupId, email) => {
    setInviteEmails({
      ...inviteEmails,
      [groupId]: email
    });
  };

  const inviteUserToGroup = async (groupId) => {
    const inviteEmail = inviteEmails[groupId];
    try {
      if (!inviteEmail.trim()) return;

      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', inviteEmail));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const friendDoc = querySnapshot.docs[0];
        const inviteeUid = friendDoc.id; // フレンドのUIDを取得

        const groupRef = doc(db, 'groups', groupId);
        await updateDoc(groupRef, {
          members: arrayUnion(inviteeUid),
        });
        alert(`Invited ${inviteEmail} to the group!`);
        handleInviteEmailChange(groupId, ''); // 招待後に入力フィールドをクリア
      } else {
        alert('ユーザーが見つかりません');
      }
    } catch (error) {
      alert('入力してください');
    }
  };

  return (
    <div>
      {/* ユーザープロファイルを右上に表示 */}
      <div className="header">
        {user ? (
          <div className="user-info">
            <img src={icon} alt="User Icon" className="user-icon" />
            <span className="username">{username}</span>
            <Link to="/user-page" className="user-page-link">ユーザーページを編集</Link>
          </div>
        ) : (
          <Link to="/login" className="login-link">Login</Link>
        )}
      </div>

      <h2>グループマネージャー</h2>
      <input
        type="text"
        value={newGroupName}
        onChange={(e) => setNewGroupName(e.target.value)}
        placeholder="グループ名"
      />
      <button onClick={createGroup}>新しいグループを作る</button>

      <h3>あなたが参加するグループ</h3>
      <ul>
        {groups.map(group => (
          <li key={group.id}>
            {group.name} (参加人数: {group.members.length}人)
            <Link to={`/group-notes/${group.id}`}>グループを開く</Link>
            {/* フレンド招待フォーム */}
            <div>
              <input
                type="email"
                value={inviteEmails[group.id] || ''}
                onChange={(e) => handleInviteEmailChange(group.id, e.target.value)}
                placeholder="emailで招待"
              />
              <button onClick={() => inviteUserToGroup(group.id)}>招待を送信</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GroupManager;
