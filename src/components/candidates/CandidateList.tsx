import React, { useEffect, useState } from 'react';
import { Pencil, Trash2, Search, Filter, UserPlus, Eye, ArrowUpDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import type { Candidate } from '../../types/candidate';

type SortField = 'last_name' | 'position' | 'status' | 'created_at';
type SortDirection = 'asc' | 'desc';

export const CandidateList: React.FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editStatusId, setEditStatusId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidates();
  }, [sortField, sortDirection]);

  const fetchCandidates = async () => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (error) throw error;
      setCandidates(data || []);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field === sortField) {
      return <ArrowUpDown className={`h-4 w-4 inline-block ml-1 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} />;
    }
    return null;
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('candidates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCandidates(candidates.filter(c => c.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting candidate:', error);
      alert('削除中にエラーが発生しました。');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('candidates')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setCandidates(candidates.map(candidate =>
        candidate.id === id ? { ...candidate, status: newStatus } : candidate
      ));

      // Add a discussion entry for the status change
      const statusMessages: { [key: string]: string } = {
        new: '新規登録されました',
        reviewing: '選考プロセスを開始しました',
        interviewed: '面接が完了しました',
        offered: 'オファーを提示しました',
        hired: '内定を承諾されました',
        rejected: '不採用となりました'
      };

      const { error: discussionError } = await supabase
        .from('discussions')
        .insert([{
          candidate_id: id,
          content: `ステータスが「${getStatusLabel(newStatus)}」に更新されました。${statusMessages[newStatus] || ''}`,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (discussionError) throw discussionError;

    } catch (error) {
      console.error('Error updating status:', error);
      alert('ステータスの更新中にエラーが発生しました。');
    } finally {
      setIsUpdating(false);
      setEditStatusId(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-yellow-100 text-yellow-800',
      interviewed: 'bg-purple-100 text-purple-800',
      offered: 'bg-green-100 text-green-800',
      hired: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPositionLabel = (position: string) => {
    const positions = {
      'software-engineer': 'ソフトウェアエンジニア',
      'product-manager': 'プロダクトマネージャー',
      'ux-designer': 'UXデザイナー',
      'data-scientist': 'データサイエンティスト',
      'marketing-specialist': 'マーケティングスペシャリスト'
    };
    return positions[position as keyof typeof positions] || position;
  };

  const getStatusLabel = (status: string) => {
    const statuses = {
      new: '新規',
      reviewing: '選考中',
      interviewed: '面接済',
      offered: 'オファー中',
      hired: '内定承諾',
      rejected: '不採用'
    };
    return statuses[status as keyof typeof statuses] || status;
  };

  const filteredCandidates = candidates.filter(candidate => {
    const searchString = searchTerm.toLowerCase();
    return (
      candidate.first_name?.toLowerCase().includes(searchString) ||
      candidate.last_name?.toLowerCase().includes(searchString) ||
      candidate.email?.toLowerCase().includes(searchString) ||
      candidate.position?.toLowerCase().includes(searchString) ||
      candidate.current_company?.toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">候補者一覧</h2>
          <Link
            to="/candidates/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            新規候補者
          </Link>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="候補者を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Filter className="h-4 w-4 mr-2" />
            フィルター
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('last_name')}
              >
                候補者
                {getSortIcon('last_name')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('position')}
              >
                ポジション
                {getSortIcon('position')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                現職
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                経験年数
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('status')}
              >
                ステータス
                {getSortIcon('status')}
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer group"
                onClick={() => handleSort('created_at')}
              >
                応募日
                {getSortIcon('created_at')}
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">アクション</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  読み込み中...
                </td>
              </tr>
            ) : filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                  候補者が見つかりません
                </td>
              </tr>
            ) : (
              filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-500 font-medium">
                            {candidate.first_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.first_name} {candidate.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {getPositionLabel(candidate.position)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.current_company || '未設定'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {candidate.experience ? `${candidate.experience}年` : '未設定'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editStatusId === candidate.id ? (
                      <select
                        value={candidate.status}
                        onChange={(e) => handleStatusChange(candidate.id!, e.target.value)}
                        disabled={isUpdating}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        onBlur={() => !isUpdating && setEditStatusId(null)}
                      >
                        <option value="new">新規</option>
                        <option value="reviewing">選考中</option>
                        <option value="interviewed">面接済</option>
                        <option value="offered">オファー中</option>
                        <option value="hired">内定承諾</option>
                        <option value="rejected">不採用</option>
                      </select>
                    ) : (
                      <span
                        onClick={() => setEditStatusId(candidate.id)}
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${getStatusColor(candidate.status || 'new')}`}
                      >
                        {getStatusLabel(candidate.status || 'new')}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(candidate.created_at || '').toLocaleDateString('ja-JP')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => navigate(`/candidates/${candidate.id}`)}
                        className="text-gray-600 hover:text-gray-900"
                        title="詳細を表示"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/candidates/edit/${candidate.id}`)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="編集"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(candidate.id)}
                        className="text-red-600 hover:text-red-900"
                        title="削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 削除確認モーダル */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              候補者を削除しますか？
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              この操作は取り消せません。本当に削除してもよろしいですか？
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                キャンセル
              </button>
              <button
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                削除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};