import React, { useState, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';
import { FormSection } from './FormSection';
import { supabase } from '../../lib/supabase';
import type { Candidate } from '../../types/candidate';
import { useNavigate, useParams } from 'react-router-dom';

export const CandidateForm: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalData, setOriginalData] = useState<Candidate | null>(null);
  const [candidate, setCandidate] = useState<Candidate>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    source: '',
    currentCompany: '',
    experience: undefined,
    availableDate: '',
    preferredTime: '',
    interviewNotes: '',
    notes: '',
    status: 'new'
  });
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

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
        const candidateData = {
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          phone: data.phone,
          position: data.position,
          source: data.source || '',
          currentCompany: data.current_company || '',
          experience: data.experience,
          availableDate: data.available_date || '',
          preferredTime: data.preferred_time || '',
          interviewNotes: data.interview_notes || '',
          notes: data.notes || '',
          status: data.status || 'new'
        };
        setCandidate(candidateData);
        setOriginalData(candidateData);
      }
    } catch (error) {
      console.error('Error fetching candidate:', error);
      alert('候補者情報の取得中にエラーが発生しました。');
    }
  };

  const getChangedFields = () => {
    if (!originalData) return {};
    
    const changes: Record<string, any> = {};
    Object.keys(candidate).forEach(key => {
      const originalValue = originalData[key as keyof Candidate];
      const newValue = candidate[key as keyof Candidate];
      if (originalValue !== newValue) {
        changes[key] = {
          old: originalValue,
          new: newValue
        };
      }
    });
    return changes;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCandidate(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const candidateData = {
        first_name: candidate.firstName,
        last_name: candidate.lastName,
        email: candidate.email,
        phone: candidate.phone,
        position: candidate.position,
        source: candidate.source,
        current_company: candidate.currentCompany,
        experience: candidate.experience,
        available_date: candidate.availableDate,
        preferred_time: candidate.preferredTime,
        interview_notes: candidate.interviewNotes,
        notes: candidate.notes,
        status: candidate.status
      };

      const userId = (await supabase.auth.getUser()).data.user?.id;
      let error;
      let candidateId = id;

      if (isEditMode) {
        ({ error } = await supabase
          .from('candidates')
          .update(candidateData)
          .eq('id', id));

        if (!error) {
          // Record history for update
          const changes = getChangedFields();
          if (Object.keys(changes).length > 0) {
            await supabase
              .from('candidate_history')
              .insert([{
                candidate_id: id,
                user_id: userId,
                action: 'update',
                changes
              }]);
          }

          // Add status change comment if status was changed
          if (originalData && originalData.status !== candidate.status) {
            const statusMessages: { [key: string]: string } = {
              new: '新規登録されました',
              reviewing: '選考プロセスを開始しました',
              interviewed: '面接が完了しました',
              offered: 'オファーを提示しました',
              hired: '内定を承諾されました',
              rejected: '不採用となりました'
            };

            await supabase
              .from('discussions')
              .insert([{
                candidate_id: id,
                content: `ステータスが「${getStatusLabel(candidate.status)}」に更新されました。${statusMessages[candidate.status] || ''}`,
                user_id: userId
              }]);
          }
        }
      } else {
        const { data, error: insertError } = await supabase
          .from('candidates')
          .insert([candidateData])
          .select()
          .single();

        error = insertError;
        if (data) {
          candidateId = data.id;
          // Record history for creation
          await supabase
            .from('candidate_history')
            .insert([{
              candidate_id: data.id,
              user_id: userId,
              action: 'create',
              changes: candidateData
            }]);
        }
      }

      if (error) throw error;

      alert(isEditMode ? '候補者情報が更新されました' : '候補者情報が正常に登録されました');
      navigate('/candidates');
    } catch (error) {
      console.error('Error:', error);
      alert('保存中にエラーが発生しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">
          {isEditMode ? '候補者情報の編集' : '新規候補者登録'}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {isEditMode ? '候補者情報を更新してください' : '候補者情報と関連書類を登録してください'}
        </p>
      </div>

      <form className="p-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-y-8">
          {/* 基本情報セクション */}
          <FormSection title="基本情報">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  姓<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={candidate.firstName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  名<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={candidate.lastName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  メールアドレス<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={candidate.email}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  電話番号<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={candidate.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  required
                />
              </div>
            </div>
          </FormSection>

          {/* 応募情報セクション */}
          <FormSection title="応募情報">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  応募ポジション<span className="text-red-500">*</span>
                </label>
                <select
                  id="position"
                  name="position"
                  value={candidate.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="software-engineer">ソフトウェアエンジニア</option>
                  <option value="product-manager">プロダクトマネージャー</option>
                  <option value="ux-designer">UXデザイナー</option>
                  <option value="data-scientist">データサイエンティスト</option>
                  <option value="marketing-specialist">マーケティングスペシャリスト</option>
                </select>
              </div>
              <div>
                <label htmlFor="source" className="block text-sm font-medium text-gray-700">
                  応募経路
                </label>
                <select
                  id="source"
                  name="source"
                  value={candidate.source}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="indeed">Indeed</option>
                  <option value="referral">社員紹介</option>
                  <option value="company-website">企業サイト</option>
                  <option value="other">その他</option>
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  ステータス
                </label>
                <select
                  id="status"
                  name="status"
                  value={candidate.status}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                >
                  <option value="new">新規</option>
                  <option value="reviewing">選考中</option>
                  <option value="interviewed">面接済</option>
                  <option value="offered">オファー中</option>
                  <option value="hired">内定承諾</option>
                  <option value="rejected">不採用</option>
                </select>
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                  経験年数
                </label>
                <input
                  type="number"
                  id="experience"
                  name="experience"
                  value={candidate.experience || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label htmlFor="currentCompany" className="block text-sm font-medium text-gray-700">
                  現在/前職の会社名
                </label>
                <input
                  type="text"
                  id="currentCompany"
                  name="currentCompany"
                  value={candidate.currentCompany}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </FormSection>

          {/* 面接スケジュールセクション */}
          <FormSection title="面接スケジュール">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="availableDate" className="block text-sm font-medium text-gray-700">
                  希望日
                </label>
                <input
                  type="date"
                  id="availableDate"
                  name="availableDate"
                  value={candidate.availableDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-700">
                  希望時間帯
                </label>
                <select
                  id="preferredTime"
                  name="preferredTime"
                  value={candidate.preferredTime}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                >
                  <option value="">選択してください</option>
                  <option value="morning">午前（9:00-12:00）</option>
                  <option value="afternoon">午後（13:00-17:00）</option>
                  <option value="evening">夕方（17:00以降）</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="interviewNotes" className="block text-sm font-medium text-gray-700">
                  面接に関する備考
                </label>
                <textarea
                  id="interviewNotes"
                  name="interviewNotes"
                  value={candidate.interviewNotes}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                  placeholder="面接に関する特別な要望や注意事項があればご記入ください"
                ></textarea>
              </div>
            </div>
          </FormSection>

          {/* 追加情報セクション */}
          <FormSection title="追加情報">
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                備考
              </label>
              <textarea
                id="notes"
                name="notes"
                value={candidate.notes}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                placeholder="候補者に関する追加情報があればご記入ください"
              ></textarea>
            </div>
          </FormSection>

          {/* 添付書類セクション */}
          <FormSection title="添付書類">
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="fileUpload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Paperclip className="w-8 h-8 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">クリックしてアップロード</span>、またはドラッグ＆ドロップ
                    </p>
                    <p className="text-xs text-gray-500">PDF、DOC、DOCX（最大10MB）</p>
                  </div>
                  <input
                    id="fileUpload"
                    type="file"
                    className="hidden"
                    multiple
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>

              {files.length > 0 && (
                <ul className="mt-3 divide-y divide-gray-200 border border-gray-200 rounded-md">
                  {files.map((file, index) => (
                    <li key={index} className="flex items-center justify-between py-2 pl-3 pr-2 text-sm">
                      <div className="flex items-center flex-1 w-0">
                        <Paperclip className="h-5 w-5 text-gray-400" />
                        <span className="ml-2 truncate">{file.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="font-medium text-blue-600 hover:text-blue-500"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FormSection>
        </div>

        <div className="mt-8 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/candidates')}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md border border-transparent bg-gray-800 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '保存中...' : isEditMode ? '更新' : '登録'}
          </button>
        </div>
      </form>
    </div>
  );
};