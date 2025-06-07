import type { Candidate } from '../types/candidate';

export const exportCandidatesToCSV = (candidates: Candidate[], filename: string = 'candidates.csv') => {
  // CSVヘッダーを定義
  const headers = [
    '姓',
    '名',
    'メールアドレス',
    '電話番号',
    '応募ポジション',
    '応募経路',
    '現在/前職の会社名',
    '経験年数',
    '希望日',
    '希望時間帯',
    '面接に関する備考',
    '備考',
    'ステータス',
    '応募日',
    '更新日'
  ];

  // ポジションラベルの変換
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

  // 応募経路ラベルの変換
  const getSourceLabel = (source: string) => {
    const sources = {
      linkedin: 'LinkedIn',
      indeed: 'Indeed',
      referral: '社員紹介',
      'company-website': '企業サイト',
      other: 'その他'
    };
    return sources[source as keyof typeof sources] || source;
  };

  // ステータスラベルの変換
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

  // 希望時間帯ラベルの変換
  const getPreferredTimeLabel = (time: string) => {
    const times = {
      morning: '午前（9:00-12:00）',
      afternoon: '午後（13:00-17:00）',
      evening: '夕方（17:00以降）'
    };
    return times[time as keyof typeof times] || time;
  };

  // 日付のフォーマット
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP');
    } catch {
      return dateString;
    }
  };

  // CSVの値をエスケープする関数
  const escapeCSVValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    const stringValue = String(value);
    // カンマ、改行、ダブルクォートが含まれている場合はダブルクォートで囲む
    if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
      // ダブルクォートをエスケープ（""に変換）
      return `"${stringValue.replace(/"/g, '""')}"`;
    }
    return stringValue;
  };

  // 候補者データをCSV行に変換
  const csvRows = candidates.map(candidate => {
    return [
      escapeCSVValue(candidate.firstName || candidate.first_name),
      escapeCSVValue(candidate.lastName || candidate.last_name),
      escapeCSVValue(candidate.email),
      escapeCSVValue(candidate.phone),
      escapeCSVValue(getPositionLabel(candidate.position)),
      escapeCSVValue(getSourceLabel(candidate.source || '')),
      escapeCSVValue(candidate.currentCompany || candidate.current_company || ''),
      escapeCSVValue(candidate.experience ? `${candidate.experience}年` : ''),
      escapeCSVValue(candidate.availableDate || candidate.available_date || ''),
      escapeCSVValue(getPreferredTimeLabel(candidate.preferredTime || candidate.preferred_time || '')),
      escapeCSVValue(candidate.interviewNotes || candidate.interview_notes || ''),
      escapeCSVValue(candidate.notes || ''),
      escapeCSVValue(getStatusLabel(candidate.status || 'new')),
      escapeCSVValue(formatDate(candidate.createdAt || candidate.created_at)),
      escapeCSVValue(formatDate(candidate.updatedAt || candidate.updated_at))
    ].join(',');
  });

  // CSVコンテンツを作成
  const csvContent = [
    headers.map(escapeCSVValue).join(','),
    ...csvRows
  ].join('\n');

  // BOMを追加してExcelで正しく表示されるようにする
  const bom = '\uFEFF';
  const csvWithBom = bom + csvContent;

  // Blobを作成してダウンロード
  const blob = new Blob([csvWithBom], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};