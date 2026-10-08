import { useState, useEffect } from 'react';
import type { Category } from '../lib/mockData';
import { Tags, Plus, Edit, Trash2, Search } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    let data = JSON.parse(localStorage.getItem('bacayuk_categories') || '[]');
    data = data.map((c: any) => ({ ...c, bookCount: c.bookCount || 0 }));
    localStorage.setItem('bacayuk_categories', JSON.stringify(data));
    setCategories(data);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editId, setEditId] = useState('');
  const [catName, setCatName] = useState('');
  const [bookCount, setBookCount] = useState(0);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState('');

  const openAddModal = () => {
    setModalMode('add');
    setCatName('');
    setBookCount(0);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setModalMode('edit');
    setEditId(cat.id);
    setCatName(cat.name);
    setBookCount(cat.bookCount || 0);
    setIsModalOpen(true);
  };

  const saveCategory = () => {
    if (!catName.trim()) return;
    let updated;
    if (modalMode === 'add') {
      const newCat: Category = { id: String(Date.now()), name: catName, bookCount };
      updated = [...categories, newCat];
    } else {
      updated = categories.map(c => c.id === editId ? { ...c, name: catName, bookCount } : c);
    }
    setCategories(updated);
    localStorage.setItem('bacayuk_categories', JSON.stringify(updated));
    setIsModalOpen(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const executeDelete = () => {
    const updated = categories.filter(c => c.id !== deleteId);
    setCategories(updated);
    localStorage.setItem('bacayuk_categories', JSON.stringify(updated));
    setIsDeleteModalOpen(false);
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">Manajemen Kategori</h1>
          <p className="text-[#8a6d1c]">Kelola kategori buku di platform BacaYuk</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-[#3a2012] text-[#f9f6f0] px-4 py-2 rounded-lg hover:bg-[#2a160b] transition-colors shadow-sm font-medium">
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <div className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] overflow-hidden">
        <div className="p-4 border-b border-[#d4c3a3] flex justify-between items-center bg-[#f0e6d2]">
          <div className="relative w-full max-w-sm">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#a49373]" />
            <input 
              type="text" 
              placeholder="Cari kategori..." 
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
                <th className="p-4 font-medium">No</th>
                <th className="p-4 font-medium">Nama Kategori</th>
                <th className="p-4 font-medium">Jumlah Buku</th>
                <th className="p-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((cat, index) => (
                <tr key={cat.id} className="hover:bg-[#ebdcb8] transition-colors">
                  <td className="p-4 text-[#8a6d1c] font-mono text-sm">#{index + 1}</td>
                  <td className="p-4 font-medium text-[#2a160b] flex items-center gap-2">
                    <Tags className="w-4 h-4 text-[#8a6d1c]" />
                    {cat.name}
                  </td>
                  <td className="p-4 text-[#5a3a22]">
                    <span className="bg-[#ebdcb8] text-[#5a3a22] px-3 py-1 rounded-full text-xs font-medium border border-[#d4c3a3]">
                      {cat.bookCount} buku
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEditModal(cat)} className="p-2 text-[#a49373] hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => confirmDelete(cat.id)} className="p-2 text-[#a49373] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="p-12 text-center flex flex-col items-center">
              <Tags className="w-12 h-12 text-[#ebdcb8] mb-3" />
              <p className="text-[#8a6d1c] font-medium">Kategori tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f9f6f0] rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform scale-100 transition-all">
            <div className="p-5 border-b border-[#ebdcb8] flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#2a160b] flex items-center gap-2">
                <Tags className="w-5 h-5 text-[#8a6d1c]" />
                {modalMode === 'add' ? 'Tambah Kategori Baru' : 'Ubah Kategori'}
              </h3>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-2">Nama Kategori</label>
                <input 
                  type="text" 
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#c2b192] rounded-xl focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Misal: Fiksi Ilmiah"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && saveCategory()}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-2">Jumlah Buku</label>
                <input 
                  type="number" 
                  min="0"
                  value={bookCount}
                  onChange={(e) => setBookCount(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 border border-[#c2b192] rounded-xl focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="0"
                  onKeyDown={(e) => e.key === 'Enter' && saveCategory()}
                />
              </div>
            </div>
            <div className="p-5 border-t border-[#ebdcb8] flex justify-end gap-3 bg-[#ebdcb8]/50">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-[#5a3a22] font-medium hover:bg-[#d4c3a3] rounded-xl transition-colors">Batal</button>
              <button onClick={saveCategory} className="px-5 py-2 bg-[#3a2012] text-[#f9f6f0] font-medium hover:bg-[#2a160b] rounded-xl shadow-sm transition-colors">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#f9f6f0] rounded-2xl shadow-xl w-full max-w-sm overflow-hidden text-center">
            <div className="p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#2a160b] mb-2">Hapus Kategori?</h3>
              <p className="text-[#8a6d1c] text-sm">Tindakan ini tidak dapat dibatalkan. Kategori yang dihapus akan hilang dari sistem secara permanen.</p>
            </div>
            <div className="p-4 border-t border-[#ebdcb8] flex justify-center gap-3 bg-[#f0e6d2]">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 text-[#5a3a22] font-medium hover:bg-[#d4c3a3] rounded-xl transition-colors">Batal</button>
              <button onClick={executeDelete} className="flex-1 py-2.5 bg-red-500 text-[#f9f6f0] font-medium hover:bg-red-600 rounded-xl shadow-sm transition-colors">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Categories;
