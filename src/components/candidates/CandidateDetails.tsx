import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';
import type { Candidate } from '../../types/candidate';
import { DiscussionBoard } from './DiscussionBoard';
import { CandidateHistory } from './CandidateHistory';

export const CandidateDetails: React.FC = () => {
  const { id } = useParams();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchCandidate(id);
    }
  }, [id]);

  const fetchCandidate = async (candidateId: string) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('id', candidateId)
        .single();

      if (error) throw error;

      if (data) {
        setCandidate({
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          source: data.source,
          currentCompany: data.current_company,
          experience: data.experience,
          availableDate: data.available_date,
          preferredTime: data.preferred_time,
          interviewNotes: data.interview_notes,
          notes: data.notes,
          status: data.status,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">候補者が見つかりません</div>
      </div>
    );
  }

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

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 bg-primary">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              候補者詳細
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(candidate.status || 'new')}`}>
              {candidate.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">氏名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.firstName} {candidate.lastName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">メールアドレス</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">電話番号</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">応募ポジション</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.position}</dd>
                </div>
              </dl>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">応募情報</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">応募経路</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.source || '未設定'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">現在/前職の会社名</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.currentCompany || '未設定'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">経験年数</dt>
                  <dd className="mt-1 text-sm text-gray-900">{candidate.experience ? `${candidate.experience}年` : '未設定'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">応募日</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {candidate.createdAt && format(new Date(candidate.createdAt), 'yyyy年MM月dd日', { locale: ja })}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">面接情報</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">希望日</dt>
                <dd className="mt-1 text-sm text-gray-900">{candidate.availableDate || '未設定'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">希望時間帯</dt>
                <dd className="mt-1 text-sm text-gray-900">{candidate.preferredTime || '未設定'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">面接に関する備考</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                  {candidate.interviewNotes || '特になし'}
                </dd>
              </div>
            </dl>
          </div>

          {candidate.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">備考</h3>
              <p className="text-sm text-gray-900 whitespace-pre-wrap">{candidate.notes}</p>
            </div>
          )}
        </div>
      </div>

      <CandidateHistory candidateId={candidate.id!} />
      <DiscussionBoard candidateId={candidate.id!} />
    </div>
  );
};