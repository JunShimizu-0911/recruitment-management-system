import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface Discussion {
  id: string;
  content: string;
  created_at: string;
  user: {
    full_name: string;
    avatar_url: string;
  } | null;
}

interface DiscussionBoardProps {
  candidateId: string;
}

export const DiscussionBoard: React.FC<DiscussionBoardProps> = ({ candidateId }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, [candidateId]);

  const fetchDiscussions = async () => {
    try {
      const { data, error } = await supabase
        .from('discussions')
        .select(`
          id,
          content,
          created_at,
          user:profiles (
            full_name,
            avatar_url
          )
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error('Error fetching discussions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('discussions')
        .insert([
          {
            candidate_id: candidateId,
            content: newComment.trim(),
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ]);

      if (error) throw error;

      setNewComment('');
      fetchDiscussions();
    } catch (error) {
      console.error('Error posting comment:', error);
      alert('コメントの投稿中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 bg-primary">
        <h2 className="text-xl font-semibold text-white">評価・コメント</h2>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="mb-6">
          <label htmlFor="comment" className="sr-only">
            コメントを追加
          </label>
          <textarea
            id="comment"
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            placeholder="候補者に関する評価やコメントを入力してください..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '投稿中...' : 'コメントを投稿'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="flex space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">
                    {discussion.user?.full_name?.[0] || 'U'}
                  </span>
                </div>
              </div>
              <div className="flex-grow">
                <div className="text-sm">
                  <span className="font-medium text-gray-900">
                    {discussion.user?.full_name || '未設定'}
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
                  {discussion.content}
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  {format(new Date(discussion.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                </div>
              </div>
            </div>
          ))}

          {discussions.length === 0 && (
            <div className="text-center text-gray-500 text-sm">
              まだコメントはありません
            </div>
          )}
        </div>
      </div>
    </div>
  );
};