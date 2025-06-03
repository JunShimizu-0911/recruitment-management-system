import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Interview {
  id: string;
  candidateId: string;
  scheduledAt: string;
  candidate: {
    firstName: string;
    lastName: string;
    position: string;
  };
}

export const InterviewCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);

  useEffect(() => {
    fetchInterviews();
  }, [currentDate]);

  const fetchInterviews = async () => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);

    const { data, error } = await supabase
      .from('candidates')
      .select(`
        id,
        first_name,
        last_name,
        position,
        available_date,
        preferred_time
      `)
      .gte('available_date', startDate.toISOString())
      .lte('available_date', endDate.toISOString());

    if (error) {
      console.error('Error fetching interviews:', error);
      return;
    }

    const formattedInterviews = data.map(candidate => ({
      id: candidate.id,
      candidateId: candidate.id,
      scheduledAt: candidate.available_date,
      candidate: {
        firstName: candidate.first_name,
        lastName: candidate.last_name,
        position: candidate.position
      }
    }));

    setInterviews(formattedInterviews);
  };

  // Get the start of the month
  const monthStart = startOfMonth(currentDate);
  // Get the start of the week (Monday) for the first day of the month
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  // Get the end of the month
  const monthEnd = endOfMonth(currentDate);
  // Get the end of the week (Sunday) for the last day of the month
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  // Generate array of dates for the calendar
  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const getInterviewsForDay = (date: Date) => {
    return interviews.filter(interview => {
      const interviewDate = parseISO(interview.scheduledAt);
      return format(interviewDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
    });
  };

  return (
    <div className="bg-white shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">面接予定</h2>
          <div className="flex space-x-2">
            <button
              onClick={previousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-lg font-medium text-gray-900">
              {format(currentDate, 'yyyy年 M月', { locale: ja })}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border border-gray-200 overflow-hidden">
          {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
            <div
              key={day}
              className="bg-gray-50 py-2 text-center text-sm font-medium text-gray-700"
            >
              {day}
            </div>
          ))}
          {days.map((day, dayIdx) => {
            const dayInterviews = getInterviewsForDay(day);
            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] bg-white p-2 ${
                  !isSameMonth(day, currentDate)
                    ? 'bg-gray-50 text-gray-400'
                    : 'text-gray-900'
                }`}
              >
                <div className={`text-sm font-medium ${
                  isToday(day) ? 'text-blue-600' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayInterviews.map((interview) => (
                    <div
                      key={interview.id}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-700 truncate"
                    >
                      {interview.candidate.lastName} {interview.candidate.firstName}
                      <div className="text-blue-500 text-xs">
                        {interview.candidate.position}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};