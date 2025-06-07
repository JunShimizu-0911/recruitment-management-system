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
              <img 
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop&crop=face"
                alt="山田太郎"
                className="h-8 w-8 rounded-full object-cover"
              />
              <span className="ml-2 hidden lg:block">山田太郎</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};