import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Upload,
  Save,
  X,
  Image as ImageIcon,
  Loader2,
  FileText,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { Book, BookChapter } from '../lib/mockData';
import { saveBookFile } from '../lib/fileStorage';

function parseTextIntoChapters(text: string, defaultTitle: string): BookChapter[] {
  const clean = text.replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  // Pola pembagian bab seperti "Bab 1", "BAB I", "Chapter 1", dll.
  const chapterRegex =
    /(?:\n|^)(?:(?:BAB|Bab|CHAPTER|Chapter|BAGIAN|Bagian)\s+[\dIVXLCDMivxlcdm]+[^\n]*|\#\#?\s+[^\n]+)/g;
  const matches = [...clean.matchAll(chapterRegex)];

  if (matches.length >= 2) {
    const chapters: BookChapter[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const title = match[0].trim().replace(/^#+\s*/, '');
      const startIndex = (match.index || 0) + match[0].length;
      const endIndex =
        i + 1 < matches.length
          ? matches[i + 1].index || clean.length
          : clean.length;
      const content = clean.slice(startIndex, endIndex).trim();
      chapters.push({
        id: `c${i + 1}`,
        title: title || `Bab ${i + 1}`,
        content: content || 'Halaman ini belum memiliki teks tambahan.',
      });
    }
    return chapters;
  }

  // Jika tidak ada heading eksplisit, bagi teks menjadi beberapa bagian logis
  const paragraphs = clean.split(/\n\s*\n/).filter((p) => p.trim());
  if (paragraphs.length > 5) {
    const chunkSize = Math.ceil(paragraphs.length / 4);
    const chapters: BookChapter[] = [];
    for (let i = 0; i < paragraphs.length; i += chunkSize) {
      const chunk = paragraphs.slice(i, i + chunkSize);
      const chIndex = Math.floor(i / chunkSize) + 1;
      chapters.push({
        id: `c${chIndex}`,
        title: `Bab ${chIndex}: ${defaultTitle}`,
        content: chunk.join('\n\n'),
      });
    }
    return chapters;
  }

  return [
    {
      id: 'c1',
      title: `1. ${defaultTitle}`,
      content: clean,
    },
  ];
}

const AddBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: string;
    type: string;
    dataUrl?: string;
    chapters?: BookChapter[];
  } | null>(null);

  const [formData, setFormData] = useState<Partial<Book>>({
    title: '',
    author: '',
    description: '',
    category: 'Fiksi',
    year: new Date().getFullYear(),
    publisher: '',
    isbn: '',
    status: 'Draft',
    coverUrl: '',
  });

  useEffect(() => {
    if (isEditing) {
      const books: Book[] = JSON.parse(
        localStorage.getItem('bacayuk_books') || '[]'
      );
      const book = books.find((b) => b.id === id);
      if (book) {
        setFormData(book);
        if (book.fileName) {
          setFileInfo({
            name: book.fileName,
            size: book.fileSize || 'Ukuran valid',
            type: book.fileType || 'DOKUMEN',
            dataUrl: book.fileUrl,
            chapters: book.chapters,
          });
        }
      }
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';

    const formatSize = (bytes: number) => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    const fileSize = formatSize(file.size);

    let fileType = ext.toUpperCase();
    if (ext === 'docx' || ext === 'doc') fileType = 'WORD';
    else if (ext === 'pdf') fileType = 'PDF';
    else if (ext === 'epub') fileType = 'EPUB';
    else if (ext === 'txt') fileType = 'TEXT';

    let extractedChapters: BookChapter[] = [];

    // Baca isi file TXT / RTF / Markdown
    if (ext === 'txt' || ext === 'md' || ext === 'rtf') {
      try {
        const text = await file.text();
        extractedChapters = parseTextIntoChapters(
          text,
          formData.title || fileName.replace(/\.[^/.]+$/, '')
        );
      } catch (err) {
        console.warn('Gagal membaca file text:', err);
      }
    }
    // Baca isi file DOCX menggunakan mammoth
    else if (ext === 'docx') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const mammoth = await import('mammoth');
        const res = await mammoth.extractRawText({ arrayBuffer });
        if (res.value && res.value.trim()) {
          extractedChapters = parseTextIntoChapters(
            res.value,
            formData.title || fileName.replace(/\.[^/.]+$/, '')
          );
        }
      } catch (err) {
        console.warn('Gagal membaca file word docx:', err);
      }
    }
    // Baca isi file PDF menggunakan pdfjs-dist
    else if (ext === 'pdf') {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await import('pdfjs-dist');
        if (pdfjsLib.GlobalWorkerOptions) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
        });
        const pdfDoc = await loadingTask.promise;
        const pageTexts: string[] = [];
        for (let p = 1; p <= pdfDoc.numPages; p++) {
          const page = await pdfDoc.getPage(p);
          const content = await page.getTextContent();
          const strings = content.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .filter((s: string) => s.trim().length > 0);
          const pageStr = strings.join(' ').trim();
          if (pageStr) {
            pageTexts.push(pageStr);
          }
        }
        if (pageTexts.length > 0) {
          const fullPdfText = pageTexts.join('\n\n');
          const parsed = parseTextIntoChapters(
            fullPdfText,
            formData.title || fileName.replace(/\.[^/.]+$/, '')
          );
          if (parsed.length <= 1 && pageTexts.length > 1) {
            extractedChapters = pageTexts.map((txt, idx) => ({
              id: `p${idx + 1}`,
              title: `Bagian ${idx + 1}`,
              content: txt,
            }));
          } else {
            extractedChapters = parsed;
          }
        }
      } catch (err) {
        console.warn('Gagal membaca file PDF:', err);
      }
    }

    // Convert file to Data URL
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadedFile(file);
      setFileInfo({
        name: fileName,
        size: fileSize,
        type: fileType,
        dataUrl,
        chapters: extractedChapters,
      });
      setFormData((prev) => ({
        ...prev,
        fileName,
        fileSize,
        fileType,
        fileUrl: dataUrl,
        chapters:
          extractedChapters.length > 0 ? extractedChapters : prev.chapters,
      }));
      setIsProcessingFile(false);
    };
    reader.onerror = () => {
      setIsProcessingFile(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (
    e: React.FormEvent,
    status: 'Published' | 'Draft'
  ) => {
    e.preventDefault();
    setLoading(true);

    const books: Book[] = JSON.parse(
      localStorage.getItem('bacayuk_books') || '[]'
    );
    const defaultCover =
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400';
    const bookId = isEditing && id ? id : 'book_' + Date.now().toString();

    // Simpan file dokumen utuh ke IndexedDB agar tidak melampaui kuota localStorage 5MB
    if (uploadedFile && fileInfo?.dataUrl) {
      await saveBookFile(bookId, {
        name: fileInfo.name,
        type: fileInfo.type,
        size: uploadedFile.size,
        dataUrl: fileInfo.dataUrl,
        blob: uploadedFile,
      });
    }

    // Simpan dataUrl ke localStorage hanya jika ukurannya aman (< 2MB)
    const safeFileUrl =
      fileInfo?.dataUrl && fileInfo.dataUrl.length < 2_000_000
        ? fileInfo.dataUrl
        : formData.fileUrl && formData.fileUrl.length < 2_000_000
        ? formData.fileUrl
        : undefined;

    if (isEditing) {
      const updatedBooks = books.map((b) =>
        b.id === id
          ? ({
              ...b,
              ...formData,
              coverUrl: formData.coverUrl || b.coverUrl || defaultCover,
              fileName: fileInfo?.name || formData.fileName || b.fileName,
              fileSize: fileInfo?.size || formData.fileSize || b.fileSize,
              fileType: fileInfo?.type || formData.fileType || b.fileType,
              fileUrl: safeFileUrl || b.fileUrl,
              chapters:
                fileInfo?.chapters && fileInfo.chapters.length > 0
                  ? fileInfo.chapters
                  : formData.chapters || b.chapters,
              status,
            } as Book)
          : b
      );
      localStorage.setItem('bacayuk_books', JSON.stringify(updatedBooks));
      window.dispatchEvent(new Event('bacayuk_books_updated'));
      window.dispatchEvent(new Event('storage'));
      setToastMessage('Data buku berhasil diperbarui.');
    } else {
      const newBook: Book = {
        ...formData,
        id: bookId,
        coverUrl: formData.coverUrl || defaultCover,
        fileName: fileInfo?.name || formData.fileName,
        fileSize: fileInfo?.size || formData.fileSize,
        fileType: fileInfo?.type || formData.fileType,
        fileUrl: safeFileUrl,
        chapters:
          fileInfo?.chapters && fileInfo.chapters.length > 0
            ? fileInfo.chapters
            : formData.chapters,
        rating: 4.8,
        readers: 0,
        dateAdded: new Date().toISOString().split('T')[0],
        status,
      } as Book;
      localStorage.setItem(
        'bacayuk_books',
        JSON.stringify([newBook, ...books])
      );
      window.dispatchEvent(new Event('bacayuk_books_updated'));
      window.dispatchEvent(new Event('storage'));
      setToastMessage('Buku baru berhasil ditambahkan.');
    }

    setLoading(false);
    setShowToast(true);
    setTimeout(() => {
      navigate('/books');
    }, 1200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/books')}
          className="p-2 hover:bg-[#d4c3a3] rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-[#5a3a22]" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[#2a160b]">
            {isEditing ? 'Edit Buku' : 'Tambah Buku Baru'}
          </h1>
          <p className="text-[#8a6d1c]">
            {isEditing
              ? 'Ubah informasi dan naskah buku digital'
              : 'Masukkan naskah dan informasi buku digital baru ke perpustakaan'}
          </p>
        </div>
      </div>

      <form className="bg-[#f9f6f0] rounded-xl shadow-sm border border-[#d4c3a3] p-6 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cover & File Upload */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#3a2012] mb-2">
                Cover Buku
              </label>
              <div className="flex justify-center">
                <div className="w-40 h-56 border-2 border-dashed border-[#c2b192] rounded-xl p-2 text-center hover:bg-[#ebdcb8] transition-colors cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden bg-[#ebdcb8]/50">
                  {formData.coverUrl ? (
                    <>
                      <img
                        src={formData.coverUrl}
                        alt="Cover Preview"
                        className="absolute inset-0 w-full h-full object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 rounded-lg backdrop-blur-sm">
                        <span className="text-[#f9f6f0] font-medium text-sm">
                          Ganti Cover
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData((prev) => ({ ...prev, coverUrl: '' }));
                          }}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-[#f9f6f0] text-xs rounded-md font-medium transition-colors"
                        >
                          Hapus
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-[#a49373] mb-2 group-hover:text-[#8a6d1c] transition-colors" />
                      <p className="text-xs font-medium text-[#5a3a22] px-2">
                        Klik atau drag foto cover
                      </p>
                      <p className="text-[10px] text-[#a49373] mt-1">Maks. 2MB</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) =>
                          setFormData((prev) => ({
                            ...prev,
                            coverUrl: ev.target?.result as string,
                          }));
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Unggah File Naskah Buku Digital (PDF, Word, EPUB, TXT) */}
            <div>
              <label className="block text-sm font-medium text-[#3a2012] mb-2">
                File Naskah / Isi Buku Digital
              </label>

              {isProcessingFile ? (
                <div className="border border-[#c2b192] bg-[#ebdcb8]/40 rounded-xl p-4 flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-[#8a6d1c]" />
                  <p className="text-xs font-medium text-[#5a3a22]">
                    Sedang memproses & membaca naskah buku...
                  </p>
                </div>
              ) : fileInfo?.name || formData.fileName ? (
                /* Card File Yang Sudah Dipilih / Diunggah */
                <div className="border-2 border-[#8a6d1c]/40 bg-[#FAF7F2] rounded-xl p-3.5 shadow-sm space-y-2.5">
                  <div className="flex items-start gap-3">
                    {/* Badge Icon Format */}
                    <div
                      className={`w-11 h-11 rounded-lg flex flex-col items-center justify-center font-bold text-[10px] shrink-0 shadow-xs ${
                        (fileInfo?.type || formData.fileType) === 'PDF'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : (fileInfo?.type || formData.fileType) === 'WORD'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : (fileInfo?.type || formData.fileType) === 'EPUB'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <FileText className="w-5 h-5 mb-0.5" />
                      <span>{fileInfo?.type || formData.fileType || 'DOC'}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p
                        className="text-xs sm:text-sm font-bold text-[#2a160b] truncate"
                        title={fileInfo?.name || formData.fileName}
                      >
                        {fileInfo?.name || formData.fileName}
                      </p>
                      <p className="text-[11px] text-[#7a6a5a] mt-0.5">
                        {fileInfo?.size || formData.fileSize || 'Ukuran naskah valid'}
                        {fileInfo?.chapters && fileInfo.chapters.length > 0 ? (
                          <span className="text-[#8a6d1c] font-semibold">
                            {' '}
                            • {fileInfo.chapters.length} Bab diekstrak
                          </span>
                        ) : null}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Siap dibaca di perpustakaan digital</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#e8dfc9]">
                    <label
                      htmlFor="file-upload"
                      className="flex-1 py-1.5 px-3 bg-[#ebdcb8] hover:bg-[#d4c3a3] text-xs font-bold text-[#3a2012] rounded-lg cursor-pointer transition-colors text-center"
                    >
                      Ganti File
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedFile(null);
                        setFileInfo(null);
                        setFormData((prev) => ({
                          ...prev,
                          fileName: undefined,
                          fileSize: undefined,
                          fileType: undefined,
                          fileUrl: undefined,
                          chapters: undefined,
                        }));
                      }}
                      className="py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Box Upload Ketika Belum Ada File */
                <div className="border-2 border-dashed border-[#c2b192] rounded-xl p-3.5 bg-[#ebdcb8]/30 hover:bg-[#ebdcb8]/50 transition-colors flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3a2012]/10 text-[#5a3a22] rounded-lg flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5 text-[#5a3a22]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-[#3a2012] truncate">
                      Pilih file naskah buku
                    </p>
                    <p className="text-[10.5px] text-[#8a6d1c] truncate">
                      PDF, Word (.docx/.doc), EPUB, atau TXT (Maks. 50MB)
                    </p>
                  </div>
                  <label
                    htmlFor="file-upload"
                    className="px-3.5 py-1.5 bg-[#ebdcb8] hover:bg-[#d4c3a3] text-[#3a2012] text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs shrink-0"
                  >
                    Browse
                  </label>
                </div>
              )}

              <input
                type="file"
                accept=".pdf,.docx,.doc,.epub,.txt,.rtf,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                className="hidden"
                id="file-upload"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* Details */}
          <div className="col-span-1 lg:col-span-2 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  Judul Buku *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Contoh: Laskar Pelangi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  Penulis *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Contoh: Andrea Hirata"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3a2012] mb-1">
                Deskripsi / Sinopsis
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                placeholder="Tuliskan sinopsis singkat buku ini..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  Kategori
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors bg-[#f9f6f0]"
                >
                  <option>Fiksi</option>
                  <option>Nonfiksi</option>
                  <option>Pendidikan</option>
                  <option>Teknologi</option>
                  <option>Sejarah</option>
                  <option>Agama</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  Tahun Terbit
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Contoh: 2024"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  Penerbit
                </label>
                <input
                  type="text"
                  name="publisher"
                  value={formData.publisher}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Nama Penerbit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#3a2012] mb-1">
                  ISBN
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-[#c2b192] rounded-lg focus:ring-2 focus:ring-[#8a6d1c]/20 focus:border-[#8a6d1c] outline-none transition-colors"
                  placeholder="Nomor ISBN"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[#d4c3a3]">
          <button
            type="button"
            onClick={() => navigate('/books')}
            disabled={loading}
            className="px-5 py-2.5 border border-[#c2b192] text-[#3a2012] font-medium rounded-lg hover:bg-[#ebdcb8] transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'Draft')}
            disabled={loading}
            className="px-5 py-2.5 border border-[#c2b192] bg-[#ebdcb8] text-[#3a2012] font-medium rounded-lg hover:bg-[#d4c3a3] transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Simpan Draft
          </button>
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, 'Published')}
            disabled={loading}
            className="px-5 py-2.5 bg-[#3a2012] text-[#f9f6f0] font-medium rounded-lg hover:bg-[#2a160b] transition-colors flex items-center gap-2 shadow-sm"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isEditing ? 'Perbarui Buku' : 'Publikasikan'}
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-24 right-6 bg-emerald-500 text-[#f9f6f0] px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-5 fade-in z-50">
          <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center shrink-0">
            <Save className="w-4 h-4" />
          </div>
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default AddBook;
