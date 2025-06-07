import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface HistoryEntry {
  id: string;
  action: string;
  changes: Record<string, any>;
  created_at: string;
  user: {
    full_name: string;
  } | null;                                                            
}

interface CandidateHistoryProps {
  candidateId: string;
}

export const CandidateHistory: React.FC<CandidateHistoryProps> = ({ candidateId }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, [candidateId]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('candidate_history')
        .select(`
          id,
          action,
          changes,
          created_at,
          user:profiles(full_name)
        `)
        .eq('candidate_id', candidateId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const actions = {
      create: '作成',
      update: '更新',
      delete: '削除'
    };
    return actions[action as keyof typeof actions] || action;
  };

  const getFieldLabel = (field: string) => {
    const fields = {
      firstName: '姓',
      lastName: '名',
      email: 'メールアドレス',
      phone: '電話番号',
      position: '応募ポジション',
      source: '応募経路',
      currentCompany: '現在/前職の会社名',
      experience: '経験年数',
      availableDate: '希望日',
      preferredTime: '希望時間帯',
      interviewNotes: '面接備考',
      notes: '備考',
      status: 'ステータス'
    };
    return fields[field as keyof typeof fields] || field;
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

  const formatValue = (field: string, value: any) => {
    if (field === 'status') {
      return getStatusLabel(value);
    }
    if (value === null || value === undefined) {
      return '未設定';
    }
    return value.toString();
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200 bg-primary">
        <h2 className="text-xl font-semibold text-white">変更履歴</h2>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="text-center text-gray-500">読み込み中...</div>
        ) : history.length === 0 ? (
          <div className="text-center text-gray-500">変更履歴はありません</div>
        ) : (
          <div className="flow-root">
            <ul className="-mb-8">
              {history.map((entry, entryIdx) => (
                <li key={entry.id}>
                  <div className="relative pb-8">
                    {entryIdx !== history.length - 1 ? (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    ) : null}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <span className="text-white text-sm font-medium">
                            {entry.user?.full_name?.[0] || 'U'}
                          </span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div>
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">
                              {entry.user?.full_name || '未設定のユーザー'}
                            </span>
                            {' が '}
                            <span className="font-medium text-gray-900">
                              {getActionLabel(entry.action)}
                            </span>
                          </div>
                          <p className="mt-0.5 text-sm text-gray-500">
                            {format(new Date(entry.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                          </p>
                        </div>
                        {entry.action === 'update' && (
                          <div className="mt-2 space-y-2">
                            {Object.entries(entry.changes).map(([field, change]) => (
                              <div key={field} className="text-sm">
                                <span className="font-medium text-gray-900">
                                  {getFieldLabel(field)}
                                </span>
                                <span className="text-gray-500">
                                  {' を '}
                                  <span className="line-through">
                                    {formatValue(field, change.old)}
                                  </span>
                                  {' から '}
                                  <span className="font-medium text-gray-900">
                                    {formatValue(field, change.new)}
                                  </span>
                                  {' に変更'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};