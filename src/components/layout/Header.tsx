import React from 'react';
import { Bell, Search, User } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm z-10">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-800">採用管理システム</h1>
        </div>
        
        <div className="flex items-center space-x-4">


          <button type="button" className="p-1 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
            <span className="sr-only">通知を表示</span>
            <Bell className="h-6 w-6" />
          </button>

          <div className="flex items-center">
            <button className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500">
              <span className="sr-only">ユーザーメニューを開く</span>
              <div className="h-8 w-8 bg-gray-100 flex items-center justify-center text-gray-600">
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