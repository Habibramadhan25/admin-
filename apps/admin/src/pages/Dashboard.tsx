import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  Users,
  Tags,
  BookCheck,
  Star,
  TrendingUp,
  Activity
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { initLocalStorage, Book, User, Category } from '../lib/mockData';

const dataReads = [
  { name: 'Sen', total: 1200 },
  { name: 'Sel', total: 1900 },
  { name: 'Rab', total: 1500 },
  { name: 'Kam', total: 2100 },
  { name: 'Jum', total: 2400 },
  { name: 'Sab', total: 3100 },
  { name: 'Min', total: 2800 },
];

const dataCategories = [
  { name: 'Fiksi', value: 400 },
  { name: 'Nonfiksi', value: 300 },
  { name: 'Sejarah', value: 200 },
  { name: 'Teknologi', value: 150 },
  { name: 'Anak', value: 100 },
];

const Dashboard = () => {
  const [stats, setStats] = useState(() => {
    initLocalStorage();
    const books: Book[] = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
    const users: User[] = JSON.parse(localStorage.getItem('bacayuk_users') || '[]');
    const categories: Category[] = JSON.parse(localStorage.getItem('bacayuk_categories') || '[]');

    return {
      books: books.length,
      users: users.length,
      categories: categories.length,
      reads: books.reduce((acc, curr) => acc + curr.readers, 0),
      completed: users.reduce((acc, curr) => acc + curr.booksCompleted, 0),
      ratings: 12543
    };
  });

  useEffect(() => {
    const refreshStats = () => {
      const books: Book[] = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
      const users: User[] = JSON.parse(localStorage.getItem('bacayuk_users') || '[]');
      const categories: Category[] = JSON.parse(localStorage.getItem('bacayuk_categories') || '[]');

      setStats({
        books: books.length,
        users: users.length,
        categories: categories.length,
        reads: books.reduce((acc, curr) => acc + curr.readers, 0),
        completed: users.reduce((acc, curr) => acc + curr.booksCompleted, 0),
        ratings: 12543
      });
    };

    window.addEventListener('storage', refreshStats);
    window.addEventListener('bacayuk_books_updated', refreshStats);
    return () => {
      window.removeEventListener('storage', refreshStats);
      window.removeEventListener('bacayuk_books_updated', refreshStats);
    };
  }, []);

  const statCards = [
    { title: 'Total Buku', value: stats.books, icon: BookOpen, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+12%' },
    { title: 'Total Pengguna', value: stats.users, icon: Users, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+5%' },
    { title: 'Kategori', value: stats.categories, icon: Tags, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+2%' },
    { title: 'Total Pembacaan', value: stats.reads.toLocaleString(), icon: TrendingUp, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+18%' },
    { title: 'Buku Selesai', value: stats.completed, icon: BookCheck, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+8%' },
    { title: 'Total Rating', value: stats.ratings.toLocaleString(), icon: Star, color: 'bg-[#ebdcb8]', iconColor: 'text-[#8a6d1c]', trend: '+15%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-[#2a160b]">Dashboard</h1>
          <p className="text-[#5a3a22] font-medium">Ringkasan statistik platform BacaYuk</p>
        </div>
        <div className="flex items-center gap-2 bg-[#f9f6f0] px-4 py-2 rounded-lg border border-[#d4c3a3] shadow-sm">
          <Activity className="w-5 h-5 text-[#8a6d1c]" />
          <span className="text-sm font-bold text-[#3a2012]">Status Sistem: <span className="text-emerald-700">Online</span></span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-[#f9f6f0] rounded-xl border border-[#d4c3a3] p-6 shadow-sm hover-lift">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color} border border-[#d4c3a3]`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div className="flex items-center gap-1 text-emerald-700 text-sm font-bold bg-emerald-100/50 border border-emerald-200 px-2 py-1 rounded-full">
                <TrendingUp className="w-4 h-4" />
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-bold text-[#8a6d1c] mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-[#2a160b]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Chart */}
        <div className="bg-[#f9f6f0] p-6 rounded-xl border border-[#d4c3a3] shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#2a160b]">Aktivitas Membaca</h3>
            <p className="text-sm font-medium text-[#5a3a22]">Jumlah halaman yang dibaca 7 hari terakhir</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dataReads} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8a6d1c" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8a6d1c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4c3a3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a6d1c', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a6d1c', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #d4c3a3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#f9f6f0', color: '#3a2012', fontWeight: 'bold' }}
                  cursor={{ stroke: '#8a6d1c', strokeWidth: 1, strokeDasharray: '3 3' }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8a6d1c"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-[#f9f6f0] p-6 rounded-xl border border-[#d4c3a3] shadow-sm">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-[#2a160b]">Buku Populer per Kategori</h3>
            <p className="text-sm font-medium text-[#5a3a22]">Distribusi pembacaan berdasarkan kategori</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataCategories} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d4c3a3" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#8a6d1c', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8a6d1c', fontWeight: 'bold' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #d4c3a3', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#f9f6f0', color: '#3a2012', fontWeight: 'bold' }}
                  cursor={{ fill: '#ebdcb8' }}
                />
                <Bar dataKey="value" fill="#8a6d1c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
