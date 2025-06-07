import React, { useEffect, useState } from 'react';
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface DashboardStats {
  totalCandidates: number;
  statusCounts: Record<string, number>;
  positionCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  upcomingInterviews: any[];
  recentActivities: any[];
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalCandidates: 0,
    statusCounts: {},
    positionCounts: {},
    sourceCounts: {},
    upcomingInterviews: [],
    recentActivities: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // 候補者の統計情報を取得
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('*');

      if (candidatesError) throw candidatesError;

      // ステータスごとの集計
      const statusCounts = candidates?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.status] = (acc[curr.status] || 0) + 1;
        return acc;
      }, {});

      // ポジションごとの集計
      const positionCounts = candidates?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.position] = (acc[curr.position] || 0) + 1;
        return acc;
      }, {});

      // 応募経路ごとの集計
      const sourceCounts = candidates?.reduce((acc: Record<string, number>, curr) => {
        acc[curr.source] = (acc[curr.source] || 0) + 1;
        return acc;
      }, {});

      // 今後の面接予定を取得
      const today = new Date();
      const upcomingInterviews = candidates?.filter(
        c => c.available_date && new Date(c.available_date) >= today
      ).sort((a, b) => new Date(a.available_date).getTime() - new Date(b.available_date).getTime());

      // 最近の活動を取得
      const { data: recentActivities, error: activitiesError } = await supabase
        .from('discussions')
        .select(`
          *,
          candidate:candidates(
            first_name,
            last_name
          ),
          user:profiles(
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (activitiesError) throw activitiesError;

      setStats({
        totalCandidates: candidates?.length || 0,
        statusCounts,
        positionCounts,
        sourceCounts,
        upcomingInterviews: upcomingInterviews?.slice(0, 5) || [],
        recentActivities: recentActivities || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      new: '新規',
      reviewing: '選考中',
      interviewed: '面接済',
      offered: 'オファー中',
      hired: '内定承諾',
      rejected: '不採用'
    };
    return labels[status] || status;
  };

  const getPositionLabel = (position: string) => {
    const labels: Record<string, string> = {
      'software-engineer': 'ソフトウェアエンジニア',
      'product-manager': 'プロダクトマネージャー',
      'ux-designer': 'UXデザイナー',
      'data-scientist': 'データサイエンティスト',
      'marketing-specialist': 'マーケティングスペシャリスト'
    };
    return labels[position] || position;
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      linkedin: 'LinkedIn',
      indeed: 'Indeed',
      referral: '社員紹介',
      'company-website': '企業サイト',
      other: 'その他'
    };
    return labels[source] || source;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 概要カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">総候補者数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">選考中</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statusCounts['reviewing'] || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">今週の面接予定</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.upcomingInterviews.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100">
              <BarChart3 className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">内定承諾率</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.statusCounts['hired'] > 0
                  ? Math.round(
                      (stats.statusCounts['hired'] /
                        (stats.statusCounts['hired'] +
                          stats.statusCounts['rejected'] || 1)) *
                        100
                    )
                  : 0}
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 選考状況 */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-primary">
            <h3 className="text-lg font-medium text-white">選考状況</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">
                    {getStatusLabel(status)}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-4 bg-gray-100">
                      <div
                        className="absolute h-4 bg-blue-600"
                        style={{
                          width: `${(count / stats.totalCandidates) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">{count}名</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 応募経路分析 */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-primary">
            <h3 className="text-lg font-medium text-white">応募経路分析</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {Object.entries(stats.sourceCounts).map(([source, count]) => (
                <div key={source} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">
                    {getSourceLabel(source)}
                  </div>
                  <div className="flex-1">
                    <div className="relative h-4 bg-gray-100">
                      <div
                        className="absolute h-4 bg-green-600"
                        style={{
                          width: `${(count / stats.totalCandidates) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="ml-4 text-sm text-gray-600">{count}名</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 今後の面接予定 */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-primary">
            <h3 className="text-lg font-medium text-white">今後の面接予定</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.upcomingInterviews.map((interview) => (
              <div key={interview.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {interview.last_name} {interview.first_name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getPositionLabel(interview.position)}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(interview.available_date), 'M月d日', {
                      locale: ja,
                    })}
                    <span className="ml-2">
                      {interview.preferred_time === 'morning'
                        ? '午前'
                        : interview.preferred_time === 'afternoon'
                        ? '午後'
                        : '夕方'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {stats.upcomingInterviews.length === 0 && (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                予定されている面接はありません
              </div>
            )}
          </div>
        </div>

        {/* 最近の活動 */}
        <div className="bg-white shadow">
          <div className="px-6 py-4 border-b border-gray-200 bg-primary">
            <h3 className="text-lg font-medium text-white">最近の活動</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentActivities.map((activity) => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.candidate.last_name} {activity.candidate.first_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.content.length > 100
                        ? `${activity.content.substring(0, 100)}...`
                        : activity.content}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(activity.created_at), 'M月d日 HH:mm', {
                      locale: ja,
                    })}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  更新者: {activity.user?.full_name || '未設定'}
                </p>
              </div>
            ))}
            {stats.recentActivities.length === 0 && (
              <div className="px-6 py-4 text-sm text-gray-500 text-center">
                最近の活動はありません
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};