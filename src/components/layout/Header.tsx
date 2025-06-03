import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-primary border-b border-white/10 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-white">採用管理システム</h1>
        </div>
        
        <div className="flex items-center space-x-4">


          <button type="button" className="p-1 rounded-full text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
            <span className="sr-only">通知を表示</span>
            <Bell className="h-6 w-6" />
          </button>

          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">
              <span className="sr-only">ユーザーメニューを開く</span>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
              <span className="ml-2 hidden lg:block">人事担当者</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};