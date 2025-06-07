import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface UserFormProps {
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

interface Role {
  id: string;
  name: string;
}

export const UserForm: React.FC<UserFormProps> = ({ userId, onClose, onSuccess }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    fullName: '',
    roleId: ''
  });

  useEffect(() => {
    fetchRoles();
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('roles')
      .select('id, name');

    if (error) {
      console.error('Error fetching roles:', error);
      return;
    }

    setRoles(data || []);
  };

  const fetchUser = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('email, username, full_name, role_id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return;
    }

    if (data) {
      setFormData({
        email: data.email,
        password: '',
        username: data.username || '',
        fullName: data.full_name || '',
        roleId: data.role_id || ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Check for valid authentication session before proceeding
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error('認証セッションの取得に失敗しました。');
      }

      if (!sessionData.session && userId) {
        throw new Error('認証セッションが見つかりません。再度ログインしてください。');
      }

      if (!userId) {
        // Create new user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password
        });

        if (authError) throw authError;

        if (authData.user) {
          const profileData = {
            id: authData.user.id,
            email: formData.email,
            username: formData.username || null,
            full_name: formData.fullName || null,
            ...(formData.roleId && { role_id: formData.roleId })
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([profileData]);

          if (profileError) throw profileError;
        }
      } else {
        // Update existing user
        const updateData = {
          username: formData.username || null,
          full_name: formData.fullName || null,
          ...(formData.roleId ? { role_id: formData.roleId } : { role_id: null })
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', userId);

        if (profileError) throw profileError;

        if (formData.password) {
          const { error: authError } = await supabase.auth.updateUser({
            password: formData.password
          });

          if (authError) throw authError;
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {userId ? 'ユーザー情報の編集' : '新規ユーザー登録'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              メールアドレス
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={!!userId}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              パスワード{!userId && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              required={!userId}
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              ユーザー名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              氏名
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700">
              役職
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            >
              <option value="">選択してください</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 border border-transparent rounded-md hover:bg-gray-900 disabled:opacity-50"
            >
              {isLoading ? '処理中...' : userId ? '更新' : '登録'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};