import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Calendar, 
  BarChart, 
  Settings, 
  Menu, 
  X, 
  Home,
  LogOut,
  UserCog
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import teamRecruitmentIcon from '../../assets/team_recruitment_icon.png';

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        type="button"
        className="lg:hidden fixed top-4 left-4 z-20 p-2 text-white bg-primary shadow hover:bg-primary/85 focus:outline-none focus:ring-2 focus:ring-white"
        onClick={toggleSidebar}
      >
        <span className="sr-only">サイドバーを開く</span>
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-10 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-primary shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b border-white/10 px-4">
            <div className="flex items-center">
              <div className="p-2">
                <img src={teamRecruitmentIcon} alt="Team Recruitment" className="h-8 w-8" />
              </div>
              <h2 className="ml-2 text-2xl font-bold text-white">Bianca</h2>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-2 py-4">
            <div className="space-y-1">
              <SidebarItem icon={<Home className="h-5 w-5" />} label="ダッシュボード" to="/" className="text-base" />
              <SidebarItem icon={<Users className="h-5 w-5" />} label="候補者一覧" to="/candidates" className="text-base" />
              <SidebarItem icon={<Calendar className="h-5 w-5" />} label="面接予定" to="/interviews" className="text-base" />
              <SidebarItem icon={<UserCog className="h-5 w-5" />} label="ユーザー管理" to="/users" className="text-base" />
              <SidebarItem icon={<Settings className="h-5 w-5" />} label="設定" to="/settings" className="text-base" />
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <button className="flex w-full items-center px-2 py-2 text-base font-medium text-white/80 hover:bg-white/5 hover:text-white">
              <LogOut className="mr-3 h-5 w-5 text-white/80" />
              <span>ログアウト</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, className }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`group flex items-center px-2 py-2 font-medium ${className} ${
        isActive
          ? 'bg-white/10 text-white border-l-4 border-white'
          : 'text-white/80 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
      }`}
    >
      <div className={`mr-3 ${isActive ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
        {icon}
      </div>
      {label}
    </Link>
  );
};