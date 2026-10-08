import { useState, useEffect } from 'react';
import type { Book } from '../lib/mockData';
import { Star, MessageSquare, Search } from 'lucide-react';

const Ratings = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bacayuk_books') || '[]');
    setBooks(data);
  }, []);

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filtered = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-[#ebdcb8]'}`} />
    ));
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">Rating Buku</h1>
          <p className="text-[#8a6d1c]">Tinjau ulasan dan penilaian buku dari komunitas</p>
        </div>
      </div>

      <div className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden">
        <div className="p-4 border-b border-[#d4c3a3] flex justify-between items-center bg-[#f0e6d2]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a49373]" />
            <input 
              type="text" 
              placeholder="Cari judul buku..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#c2b192] rounded-lg text-sm focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0e6d2] border-b border-[#d4c3a3] text-[#8a6d1c] text-sm">
                <th className="p-4 font-medium w-96">Informasi Buku</th>
                <th className="p-4 font-medium">Rating Rata-rata</th>
                <th className="p-4 font-medium">Jumlah Ulasan</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(book => (
                <tr key={book.id} className="hover:bg-[#ebdcb8] transition-colors">
                  <td className="p-4 flex items-center gap-4">
                    <img src={book.coverUrl} alt={book.title} className="w-20 h-28 object-cover rounded-md shadow-sm border border-[#d4c3a3]" />
                    <div>
                      <div className="font-medium text-[#2a160b]">{book.title}</div>
                      <div className="text-xs text-[#8a6d1c] mt-1">{book.author}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex">{renderStars(book.rating)}</div>
                      <span className="font-bold text-[#2a160b]">{book.rating}</span>
                    </div>
                  </td>
                  <td className="p-4 text-[#5a3a22]">
                    <span className="bg-[#ebdcb8] px-3 py-1 rounded-full text-xs font-medium text-[#3a2012] border border-[#d4c3a3]">
                      {Math.floor(book.readers / 10)} ulasan
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => setSelectedBook(book)} className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#d4c3a3] rounded-lg text-sm font-medium text-[#5a3a22] hover:bg-[#ebdcb8] hover:text-[#8a6d1c] transition-colors shadow-sm">
                      <MessageSquare className="w-4 h-4" /> Lihat Ulasan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <Star className="w-12 h-12 text-[#ebdcb8] mb-3" />
              <p className="text-[#8a6d1c] font-medium">Buku tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Modal */}
      {selectedBook && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f9f6f0] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-[#ebdcb8] flex items-center justify-between bg-[#f0e6d2]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#ebdcb8] rounded-full flex items-center justify-center text-[#8a6d1c]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#2a160b] leading-tight">Ulasan Pembaca</h3>
                  <p className="text-sm text-[#8a6d1c]">{selectedBook.title}</p>
                </div>
              </div>
              <button onClick={() => setSelectedBook(null)} className="p-2 text-[#a49373] hover:bg-[#d4c3a3] rounded-full transition-colors">
                <span className="sr-only">Tutup</span>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="flex items-center justify-center py-12 text-[#a49373] flex-col">
                <MessageSquare className="w-12 h-12 mb-3 text-[#ebdcb8]" />
                <p>Belum ada ulasan teks terperinci untuk buku ini.</p>
                <p className="text-sm mt-1">Buku ini memiliki rating rata-rata <strong className="text-[#8a6d1c]">{selectedBook.rating}</strong> berdasarkan penilaian numerik pengguna.</p>
              </div>
            </div>
            
            <div className="p-4 border-t border-[#ebdcb8] bg-[#f0e6d2] text-right">
              <button onClick={() => setSelectedBook(null)} className="px-5 py-2 bg-[#2a160b] text-[#f9f6f0] font-medium hover:bg-slate-800 rounded-xl transition-colors">Tutup Jendela</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Ratings;
