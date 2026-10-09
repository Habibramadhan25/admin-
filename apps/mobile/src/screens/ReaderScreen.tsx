import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { BookItem, BookChapter } from '../data/mockData';
import { MaterialIcon } from '../components/MaterialIcon';
import { useResponsive } from '../hooks/useResponsive';
import { getBookFile, StoredBookFile } from '../services/fileStorage';
import { UserStorage } from '../services/storage';

interface ReaderScreenProps {
  book: BookItem;
  onBack: () => void;
  initialPage?: number;
}

export type PaperThemeKey = 'white' | 'sepia' | 'green' | 'dark' | 'black';

/** Model satu lembaran halaman buku digital */
export interface EbookPage {
  pageNumber: number; // 1 to totalPages
  chapterIndex: number;
  chapterTitle: string;
  isChapterOpening: boolean;
  paragraphs: string[];
}

interface TocItem {
  id: string;
  title: string;
  pageNumber: number;
  level: number;
}

/**
 * Memastikan script PDF.js siap digunakan di lingkungan web.
 */
async function ensurePdfJs(): Promise<any> {
  if (typeof window === 'undefined') return null;
  const win = window as any;
  if (win.pdfjsLib) return win.pdfjsLib;

  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[data-pdfjs]');
    if (existingScript) {
      if (win.pdfjsLib) return resolve(win.pdfjsLib);
      existingScript.addEventListener('load', () => resolve(win.pdfjsLib));
      existingScript.addEventListener('error', () =>
        reject(new Error('Gagal memuat pdf.js'))
      );
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('data-pdfjs', 'true');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      const lib = (window as any).pdfjsLib;
      if (lib && lib.GlobalWorkerOptions) {
        lib.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      }
      resolve(lib);
    };
    script.onerror = () => reject(new Error('Gagal memuat pdf.js'));
    document.head.appendChild(script);
  });
}

/**
 * Pembersih dan perapih teks hasil ekstraksi halaman PDF
 */
function cleanAndFormatPdfLines(rawLines: string[]): {
  detectedChapterTitle?: string;
  isRealChapterOpening: boolean;
  paragraphs: string[];
} {
  if (!rawLines || rawLines.length === 0) {
    return { isRealChapterOpening: false, paragraphs: [] };
  }

  const cleanLines = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Cek apakah halaman ini adalah halaman Daftar Isi (TOC)
  const isPageLikelyToc = cleanLines.some(
    (l, idx) =>
      (idx < 5 &&
        /^(daftar\s+isi|table\s+of\s+contents|contents)$/i.test(
          l.replace(/[^a-zA-Z\s]/g, '').trim()
        )) ||
      /\.{3,}|\.\s*\.\s*\./.test(l) ||
      /(?:\.{2,}|\s{4,})\d{1,4}$/.test(l)
  );

  // Preprocessing HANYA untuk halaman daftar isi (jika ada dua entri menempel dalam satu baris)
  const preprocessed: string[] = [];
  for (const raw of cleanLines) {
    if (isPageLikelyToc && /\.{2,}/.test(raw)) {
      const parts = raw.split(
        /(?<=(?:\.{2,}|\s)\d{1,4})\s+(?=(?:[A-Z\d]+[\.\)]|BAB|BAGIAN|PART|CHAPTER)\s+)/i
      );
      for (const p of parts) {
        if (p.trim()) preprocessed.push(p.trim());
      }
    } else {
      preprocessed.push(raw);
    }
  }

  let detectedChapterTitle: string | undefined;
  let isRealChapterOpening = false;
  const filteredLines: string[] = [];

  for (let i = 0; i < preprocessed.length; i++) {
    const line = preprocessed[i];

    // Deteksi judul bab HANYA jika benar-benar merupakan judul pembuka bab baru
    // (Misal: "BAB I", "BAB 2", "CHAPTER 37", "KATA PENGANTAR", "DAFTAR ISI")
    if (
      !detectedChapterTitle &&
      i < 2 &&
      (/^(chapter|bab|bagian|part)\s+[\dIVXLCDM]+/i.test(line) ||
        /^(kata\s+pengantar|prakata|daftar\s+isi|pendahuluan|daftar\s+pustaka|glosarium)$/i.test(
          line
        ))
    ) {
      detectedChapterTitle = line;
      isRealChapterOpening = true;
      continue;
    }

    // Abaikan nomor halaman terisolasi di header atau footer (misal angka "1" atau "83" sendirian)
    if (/^\d{1,4}$/.test(line) && (i === 0 || i === preprocessed.length - 1)) {
      continue;
    }

    filteredLines.push(line);
  }

  // 1. JIKA HALAMAN DAFTAR ISI: Pertahankan setiap baris entri bab secara terpisah agar tidak acak-acakan!
  if (isPageLikelyToc) {
    const paragraphs: string[] = [];
    let pendingTitle = '';

    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      const nextLine = filteredLines[i + 1];

      // Cek apakah baris ini memuat titik-titik atau berakhiran nomor halaman
      const hasPageNumber = /(?:\.{2,}|\s{2,}|\s+)(\d{1,4}|[ivxlcdm]+)$/i.test(line);
      const hasDots = /\.{2,}|\.\s*\.\s*\./.test(line);

      if (pendingTitle) {
        const combined = `${pendingTitle} ${line}`;
        pendingTitle = '';
        if (hasPageNumber || hasDots || !nextLine) {
          paragraphs.push(combined.trim());
        } else {
          pendingTitle = combined;
        }
        continue;
      }

      // Jika baris judul panjang terpotong 2 baris (baris 1 belum ada nomor halaman, baris 2 ada kelanjutan + nomor halaman)
      const nextHasPageNumber =
        nextLine && /(?:\.{2,}|\s{2,}|\s+)(\d{1,4}|[ivxlcdm]+)$/i.test(nextLine);
      const nextStartsLabel =
        nextLine && /^([A-Z\d]+[\.\)]|BAB|BAGIAN|PART|CHAPTER)\s+/i.test(nextLine);

      if (!hasPageNumber && !hasDots && nextLine && nextHasPageNumber && !nextStartsLabel) {
        pendingTitle = line;
        continue;
      }

      paragraphs.push(line);
    }

    if (pendingTitle.trim()) {
      paragraphs.push(pendingTitle.trim());
    }

    return {
      detectedChapterTitle,
      isRealChapterOpening,
      paragraphs,
    };
  }

  // 2. UNTUK HALAMAN ISI MATERI BUKU BIASA:
  // Jamin teks poin 1, 2, 3 mengalir tuntas dan tidak terpotong!
  const paragraphs: string[] = [];
  let currentParagraph = '';

  for (let i = 0; i < filteredLines.length; i++) {
    const line = filteredLines[i];
    const nextLine = filteredLines[i + 1];

    // Cek apakah baris berikutnya adalah permulaan poin bernomor baru (misal: "2. ", "3. ", "B. ")
    const nextStartsNewNumberedPoint =
      nextLine &&
      /^(\d+[\.\)]|[A-Z][\.\)]|(?:bab|bagian|chapter)\s+[\dIVXLCDM]+)\s+/i.test(nextLine);

    // Tangani tanda hubung pemisah kata di akhir baris (misal: "per-\njalanan" -> "perjalanan")
    if (currentParagraph.endsWith('-')) {
      currentParagraph = currentParagraph.slice(0, -1) + line;
    } else if (currentParagraph.length > 0) {
      currentParagraph += ' ' + line;
    } else {
      currentParagraph = line;
    }

    const endsWithTerminal = /[.!?:"”]\s*$/.test(line);
    const isNextIndentedOrCapital =
      nextLine && /^[A-Z"“0-9(]/.test(nextLine) && line.length < 58;

    // Paragraf berakhir HANYA jika:
    // a. Kalimat sudah berakhiran tanda baca terminal (. ! ?) DAN baris berikutnya adalah poin nomor baru (seperti "2. ")
    // b. Atau ada tanda terminal dan baris berikutnya berjarak alinea
    // c. Atau sudah baris terakhir di halaman
    if (
      (endsWithTerminal && (nextStartsNewNumberedPoint || isNextIndentedOrCapital)) ||
      i === filteredLines.length - 1
    ) {
      if (currentParagraph.trim().length > 0) {
        paragraphs.push(currentParagraph.trim());
      }
      currentParagraph = '';
    }
  }

  if (currentParagraph.trim().length > 0) {
    paragraphs.push(currentParagraph.trim());
  }

  return {
    detectedChapterTitle,
    isRealChapterOpening,
    paragraphs,
  };
}

/**
 * Paginasi bab teks ke lembaran buku digital yang pas dengan layar
 */
function paginateBookChapters(chapters: BookChapter[]): {
  pages: EbookPage[];
  chapterStartPages: number[];
  chapterEndPages: number[];
} {
  const pages: EbookPage[] = [];
  const chapterStartPages: number[] = [];
  const chapterEndPages: number[] = [];
  let pageCounter = 1;

  const TARGET_CHARS_PER_PAGE = 750;

  chapters.forEach((chapter, chIdx) => {
    chapterStartPages.push(pageCounter);

    const rawParagraphs = chapter.content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (rawParagraphs.length === 0) {
      pages.push({
        pageNumber: pageCounter++,
        chapterIndex: chIdx,
        chapterTitle: chapter.title,
        isChapterOpening: true,
        paragraphs: ['Lembaran halaman buku ini siap untuk dibaca.'],
      });
      chapterEndPages.push(pageCounter - 1);
      return;
    }

    let currentPageParagraphs: string[] = [];
    let currentChars = 0;
    let isOpening = true;

    rawParagraphs.forEach((paragraph) => {
      if (paragraph.length > TARGET_CHARS_PER_PAGE * 1.25) {
        const sentences =
          paragraph.match(/[^.!?]+[.!?]+(?:\s+|$)|[^.!?]+$/g) || [paragraph];
        let subChunk = '';
        sentences.forEach((sentence) => {
          if (
            (subChunk + sentence).length > TARGET_CHARS_PER_PAGE &&
            subChunk.length > 0
          ) {
            currentPageParagraphs.push(subChunk.trim());
            pages.push({
              pageNumber: pageCounter++,
              chapterIndex: chIdx,
              chapterTitle: chapter.title,
              isChapterOpening: isOpening,
              paragraphs: [...currentPageParagraphs],
            });
            currentPageParagraphs = [];
            currentChars = 0;
            isOpening = false;
            subChunk = sentence;
          } else {
            subChunk += sentence;
          }
        });
        if (subChunk.trim().length > 0) {
          currentPageParagraphs.push(subChunk.trim());
          currentChars += subChunk.length;
        }
        return;
      }

      if (
        currentChars + paragraph.length > TARGET_CHARS_PER_PAGE &&
        currentPageParagraphs.length > 0
      ) {
        pages.push({
          pageNumber: pageCounter++,
          chapterIndex: chIdx,
          chapterTitle: chapter.title,
          isChapterOpening: isOpening,
          paragraphs: [...currentPageParagraphs],
        });
        currentPageParagraphs = [paragraph];
        currentChars = paragraph.length;
        isOpening = false;
      } else {
        currentPageParagraphs.push(paragraph);
        currentChars += paragraph.length;
      }
    });

    if (currentPageParagraphs.length > 0) {
      pages.push({
        pageNumber: pageCounter++,
        chapterIndex: chIdx,
        chapterTitle: chapter.title,
        isChapterOpening: isOpening,
        paragraphs: [...currentPageParagraphs],
      });
    }

    chapterEndPages.push(pageCounter - 1);
  });

  return {
    pages:
      pages.length > 0
        ? pages
        : [
            {
              pageNumber: 1,
              chapterIndex: 0,
              chapterTitle: chapters[0]?.title || 'Bab 1',
              isChapterOpening: true,
              paragraphs: [chapters[0]?.content || 'Selamat membaca buku ini.'],
            },
          ],
    chapterStartPages,
    chapterEndPages,
  };
}

/**
 * Komponen Renderer Canvas Retina jika pengguna memilih melihat PDF visual asli
 */
interface PdfCanvasRendererProps {
  pdfDoc: any;
  pageNumber: number;
  zoomScale: number;
  fitMode: 'width' | 'page';
  theme: any;
  textClarity?: 'standard' | 'sharp' | 'bold';
  onToggleZoom?: () => void;
}

const PdfCanvasRenderer: React.FC<PdfCanvasRendererProps> = ({
  pdfDoc,
  pageNumber,
  zoomScale,
  fitMode,
  theme,
  textClarity = 'sharp',
  onToggleZoom,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isRendering, setIsRendering] = useState(true);
  const [renderError, setRenderError] = useState<string | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [pageNumber]);

  useEffect(() => {
    let isCancelled = false;
    let currentRenderTask: any = null;

    async function renderPage() {
      if (!pdfDoc || !canvasRef.current || !containerRef.current) return;
      try {
        setIsRendering(true);
        setRenderError(null);

        const page = await pdfDoc.getPage(pageNumber);
        if (isCancelled) return;

        const container = containerRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const initialViewport = page.getViewport({ scale: 1.0 });
        const isMobileScreen =
          (typeof window !== 'undefined' && window.innerWidth < 768) ||
          (container && container.clientWidth < 640);

        let finalScale: number;
        if (fitMode === 'width') {
          const availableWidth = isMobileScreen
            ? container.clientWidth
            : Math.max(container.clientWidth - 32, 320);
          finalScale = (availableWidth / initialViewport.width) * zoomScale;
        } else {
          const availableWidth = isMobileScreen
            ? container.clientWidth
            : Math.max(container.clientWidth - 32, 280);
          const availableHeight = isMobileScreen
            ? container.clientHeight
            : Math.max(container.clientHeight - 24, 380);
          const widthScale = availableWidth / initialViewport.width;
          const heightScale = availableHeight / initialViewport.height;
          finalScale = Math.min(widthScale, heightScale) * zoomScale;
        }

        const dpr =
          typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
        const supersample = Math.max(dpr, 2.5);

        const renderViewport = page.getViewport({
          scale: finalScale * supersample,
        });
        const displayViewport = page.getViewport({ scale: finalScale });

        canvas.width = Math.floor(renderViewport.width);
        canvas.height = Math.floor(renderViewport.height);

        if (isMobileScreen && fitMode === 'width' && zoomScale <= 1.0) {
          canvas.style.width = '100%';
          canvas.style.maxWidth = '100%';
          canvas.style.height = 'auto';
        } else {
          canvas.style.width = `${Math.floor(displayViewport.width)}px`;
          canvas.style.maxWidth = zoomScale <= 1.0 ? '100%' : 'none';
          canvas.style.height = `${Math.floor(displayViewport.height)}px`;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        currentRenderTask = page.render({
          canvasContext: ctx,
          viewport: renderViewport,
        });

        await currentRenderTask.promise;
        if (!isCancelled) {
          setIsRendering(false);
        }
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException' && !isCancelled) {
          console.warn('Gagal render canvas halaman PDF:', err);
          setRenderError('Gagal memuat visual halaman PDF');
          setIsRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (currentRenderTask && currentRenderTask.cancel) {
        try {
          currentRenderTask.cancel();
        } catch {}
      }
    };
  }, [pdfDoc, pageNumber, zoomScale, fitMode]);

  const canvasFilter = {
    standard: 'none',
    sharp: 'contrast(1.12) brightness(0.97)',
    bold: 'contrast(1.24) brightness(0.94)',
  }[textClarity || 'sharp'];

  return (
    <div
      ref={containerRef}
      onDoubleClick={onToggleZoom}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        overflowX: 'hidden',
        position: 'relative',
        boxSizing: 'border-box',
        userSelect: 'none',
      }}
    >
      {isRendering ? (
        <div
          style={{
            position: 'absolute',
            top: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.92)',
            padding: '6px 16px',
            borderRadius: 20,
            boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
            zIndex: 10,
            gap: 8,
          }}
        >
          <ActivityIndicator size="small" color={theme.gold} />
          <span
            style={{
              fontSize: 12,
              fontFamily: 'Manrope, sans-serif',
              color: theme.muted,
              fontWeight: 600,
            }}
          >
            Memuat Halaman {pageNumber}...
          </span>
        </div>
      ) : null}

      {renderError ? (
        <div style={{ padding: 24, textAlign: 'center', color: '#c53030' }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>{renderError}</span>
        </div>
      ) : (
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 6,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            filter: canvasFilter,
          }}
        />
      )}
    </div>
  );
};

export const ReaderScreen: React.FC<ReaderScreenProps> = ({
  book,
  onBack,
  initialPage = 0,
}) => {
  const { colors, isDark } = useAppTheme();
  const { isDesktop, isMobile } = useResponsive();

  // Ref ScrollView untuk mereset scroll ke paling atas setiap ganti halaman
  const scrollViewRef = useRef<any>(null);

  // Ambil file asli dari IndexedDB (jika diunggah via form admin)
  const [docFile, setDocFile] = useState<StoredBookFile | null>(null);

  useEffect(() => {
    let active = true;
    getBookFile(book.id).then((file) => {
      if (active && file) {
        setDocFile(file);
      }
    });
    return () => {
      active = false;
    };
  }, [book.id]);

  // Cek apakah buku memiliki file PDF
  const isPdfBook = Boolean(
    book.fileType === 'PDF' ||
      book.fileName?.toLowerCase().endsWith('.pdf') ||
      docFile?.type === 'PDF' ||
      docFile?.name?.toLowerCase().endsWith('.pdf')
  );

  const pdfSource =
    docFile ||
    (book.fileUrl && isPdfBook ? book.fileUrl : null);

  // State Dokumen PDF.js
  const [pdfDocInstance, setPdfDocInstance] = useState<any>(null);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(0);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(isPdfBook);

  // Outline / Daftar Bab Asli dari PDF
  const [pdfOutlineItems, setPdfOutlineItems] = useState<TocItem[]>([]);

  // Default mode baca: E-Reader Digital Reflowable
  const [readerViewMode, setReaderViewMode] = useState<'ebook' | 'visual'>('ebook');

  // Cache teks halaman PDF hasil ekstraksi cerdas
  const [pdfTextCache, setPdfTextCache] = useState<
    Record<
      number,
      {
        detectedChapterTitle?: string;
        isRealChapterOpening: boolean;
        paragraphs: string[];
        isImageOnly?: boolean;
      }
    >
  >({});
  const [isExtractingCurrentPage, setIsExtractingCurrentPage] = useState(false);

  // Indikator Immersive Mode (Sembunyikan/Tampilkan UI)
  const [isUiVisible, setIsUiVisible] = useState<boolean>(true);

  // Riwayat Lokasi Membaca Sebelumnya (Sesuai gambar: "Ketuk untuk kembali ke lokasi membaca sebelumnya" / "● 70")
  const [previousLocationIndex, setPreviousLocationIndex] = useState<number | null>(null);

  // State Bab Teks untuk buku non-PDF
  const textChapters: BookChapter[] = useMemo(() => {
    if (book.chapters && book.chapters.length > 0) {
      return book.chapters;
    }
    return [
      {
        id: 'c1',
        title: `Chapter 1: ${book.title}`,
        content:
          (book.synopsis || 'Selamat membaca buku ini.') +
          '\n\nBuku ini telah dibuka dalam mode pembaca digital BacaYuk. Lembaran demi lembaran membuka cakrawala pengetahuan yang lebih luas dan membawa pembaca mengarungi petualangan yang tak terlupakan.\n\nSetiap bab menyajikan renungan mendalam dan pembelajaran berharga yang dapat dipetik dalam kehidupan sehari-hari.',
      },
      {
        id: 'c2',
        title: 'Chapter 2: Jejak Langkah',
        content:
          'Setiap perjalanan dimulai dengan langkah pertama yang berani. Di balik tantangan yang menghadang, tersimpan tekad kuat yang tak tergoyahkan untuk terus maju menggapai impian.\n\nKeberanian bukanlah ketiadaan rasa takut, melainkan kesadaran bahwa ada hal lain yang jauh lebih berharga daripada ketakutan tersebut.',
      },
      {
        id: 'c3',
        title: 'Chapter 3: Cakrawala Baru',
        content:
          'Dunia terbentang luas di hadapan mereka yang gemar membaca dan merenungi ilmu pengetahuan. Buku adalah sahabat setia dalam setiap lika-liku kehidupan.\n\nMembaca adalah jendela dunia, membuka pikiran dan membebaskan jiwa dari ketidaktahuan.',
      },
    ];
  }, [book]);

  const { pages: textPages, chapterStartPages, chapterEndPages } = useMemo(
    () => paginateBookChapters(textChapters),
    [textChapters]
  );

  // Total Halaman Buku
  const totalPages = useMemo(() => {
    if (isPdfBook && pdfTotalPages > 0) {
      return pdfTotalPages;
    }
    return Math.max(textPages.length, 1);
  }, [isPdfBook, pdfTotalPages, textPages.length]);

  // Halaman aktif saat ini (0-based)
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(() => {
    return typeof initialPage === 'number' && initialPage >= 0 ? initialPage : 0;
  });

  const displayPageNumber = currentPageIndex + 1;

  // LocalStorage Keys
  const LAST_PAGE_KEY = `bacayuk_last_page_${book.id}`;
  const BOOKMARKS_KEY = `bacayuk_bookmarks_${book.id}`;

  // Restore daftar bookmark dari LocalStorage
  const [bookmarks, setBookmarks] = useState<number[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(BOOKMARKS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch {}
    }
    return [];
  });

  // Muat dokumen PDF secara langsung dengan PDF.js
  useEffect(() => {
    if (!isPdfBook) {
      setIsLoadingPdf(false);
      return;
    }

    let active = true;
    setIsLoadingPdf(true);

    async function loadPdf() {
      try {
        const pdfjs = await ensurePdfJs();
        if (!pdfjs) throw new Error('PDF.js tidak tersedia');

        let loadingTask: any = null;
        if (
          typeof pdfSource === 'object' &&
          pdfSource !== null &&
          'blob' in pdfSource &&
          pdfSource.blob
        ) {
          const buffer = await (pdfSource.blob as Blob).arrayBuffer();
          loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer) });
        } else if (
          typeof pdfSource === 'object' &&
          pdfSource !== null &&
          'dataUrl' in pdfSource &&
          pdfSource.dataUrl
        ) {
          loadingTask = pdfjs.getDocument(pdfSource.dataUrl);
        } else if (typeof pdfSource === 'string') {
          loadingTask = pdfjs.getDocument(pdfSource);
        }

        if (!loadingTask) {
          setIsLoadingPdf(false);
          return;
        }

        const doc = await loadingTask.promise;
        if (active) {
          setPdfDocInstance(doc);
          setPdfTotalPages(doc.numPages);
          setIsLoadingPdf(false);
        }
      } catch (err) {
        console.warn('Gagal memuat dokumen PDF.js:', err);
        if (active) {
          setIsLoadingPdf(false);
        }
      }
    }

    loadPdf();

    return () => {
      active = false;
    };
  }, [pdfSource, isPdfBook]);

  // Muat Outline / Daftar Bab Asli dari PDF
  useEffect(() => {
    if (!pdfDocInstance) return;
    let active = true;

    async function loadOutline() {
      try {
        const rawOutline = await pdfDocInstance.getOutline();
        if (!rawOutline || rawOutline.length === 0) {
          if (active) setPdfOutlineItems([]);
          return;
        }

        const items: TocItem[] = [];

        async function traverse(nodes: any[], level = 0) {
          for (const node of nodes) {
            let pageNum = 1;
            if (node.dest) {
              try {
                let dest = node.dest;
                if (typeof dest === 'string') {
                  dest = await pdfDocInstance.getDestination(dest);
                }
                if (Array.isArray(dest) && dest.length > 0) {
                  const ref = dest[0];
                  const pageIdx = await pdfDocInstance.getPageIndex(ref);
                  if (typeof pageIdx === 'number' && pageIdx >= 0) {
                    pageNum = pageIdx + 1;
                  }
                }
              } catch {}
            }
            items.push({
              id: `toc_${items.length}_${pageNum}`,
              title: (node.title || `Bagian ${items.length + 1}`).trim(),
              pageNumber: pageNum,
              level,
            });

            if (node.items && node.items.length > 0 && level < 2) {
              await traverse(node.items, level + 1);
            }
          }
        }

        await traverse(rawOutline, 0);
        if (active) {
          setPdfOutlineItems(items);
        }
      } catch (err) {
        console.warn('Gagal membaca outline PDF:', err);
        if (active) setPdfOutlineItems([]);
      }
    }

    loadOutline();
    return () => {
      active = false;
    };
  }, [pdfDocInstance]);

  // Ekstraksi teks cerdas per halaman dari PDF untuk Mode Buku Digital
  const extractPdfPageText = useCallback(
    async (pageNum: number) => {
      if (!pdfDocInstance || pdfTextCache[pageNum]) return;

      try {
        setIsExtractingCurrentPage(true);
        const page = await pdfDocInstance.getPage(pageNum);
        const textContent = await page.getTextContent();

        const rawItems = (textContent.items || []).filter(
          (it: any) => it && typeof it.str === 'string' && it.transform
        );

        // Urutkan item teks sesuai alur membaca visual yang benar:
        // Dari atas ke bawah (Y besar ke kecil), lalu dari kiri ke kanan (X kecil ke besar)
        rawItems.sort((a: any, b: any) => {
          const yA = a.transform[5];
          const yB = b.transform[5];
          if (Math.abs(yA - yB) > 4) {
            return yB - yA; // Posisi Y atas muncul lebih dulu
          }
          const xA = a.transform[4];
          const xB = b.transform[4];
          return xA - xB; // Posisi X kiri muncul lebih dulu
        });

        const lines: string[] = [];
        let currentLine = '';
        let lastY: number | null = null;

        for (const item of rawItems) {
          if (!item.str) continue;
          const y = item.transform ? Math.round(item.transform[5]) : null;
          if (lastY !== null && y !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) lines.push(currentLine.trim());
            currentLine = item.str;
          } else {
            currentLine +=
              (currentLine.endsWith(' ') || item.str.startsWith(' ')
                ? ''
                : ' ') + item.str;
          }
          lastY = y;
        }
        if (currentLine.trim()) lines.push(currentLine.trim());

        const formatted = cleanAndFormatPdfLines(lines);

        setPdfTextCache((prev) => ({
          ...prev,
          [pageNum]: {
            detectedChapterTitle: formatted.detectedChapterTitle,
            isRealChapterOpening: formatted.isRealChapterOpening,
            paragraphs: formatted.paragraphs,
            isImageOnly: formatted.paragraphs.length === 0,
          },
        }));
      } catch (err) {
        console.warn(`Gagal ekstrak teks PDF hal ${pageNum}:`, err);
      } finally {
        setIsExtractingCurrentPage(false);
      }
    },
    [pdfDocInstance, pdfTextCache]
  );

  // Otomatis ekstrak halaman saat ini dan pre-fetch halaman berikutnya agar navigasi mulus
  useEffect(() => {
    if (readerViewMode !== 'ebook' || !pdfDocInstance || !isPdfBook) return;
    const pageNum = displayPageNumber;
    extractPdfPageText(pageNum);

    if (pageNum < totalPages) {
      extractPdfPageText(pageNum + 1);
    }
    if (pageNum > 1) {
      extractPdfPageText(pageNum - 1);
    }
  }, [
    readerViewMode,
    displayPageNumber,
    pdfDocInstance,
    isPdfBook,
    totalPages,
    extractPdfPageText,
  ]);

  // Otomatis kembalikan scroll ke paling atas setiap berpindah halaman
  useEffect(() => {
    if (scrollViewRef.current) {
      try {
        if (typeof scrollViewRef.current.scrollTo === 'function') {
          scrollViewRef.current.scrollTo({ y: 0, animated: false });
        } else if (typeof scrollViewRef.current.scrollTop !== 'undefined') {
          scrollViewRef.current.scrollTop = 0;
        }
      } catch {}
    }
  }, [currentPageIndex]);

  // Tema Kertas & Tipografi
  const [paperTheme, setPaperTheme] = useState<PaperThemeKey>(
    isDark ? 'dark' : 'white'
  );
  const [fontSize, setFontSize] = useState<number>(isMobile ? 16.5 : 18);
  const [textAlignMode, setTextAlignMode] = useState<'left' | 'justify'>('left');
  const [showSettings, setShowSettings] = useState(false);
  const [showTocModal, setShowTocModal] = useState(false);
  const [tocActiveTab, setTocActiveTab] = useState<'chapters' | 'jump' | 'bookmarks'>('chapters');
  const [tocSearchQuery, setTocSearchQuery] = useState('');
  const [sliderJumpValue, setSliderJumpValue] = useState<number>(displayPageNumber);

  // Sinkronkan nilai slider jump setiap kali halaman berpindah
  useEffect(() => {
    setSliderJumpValue(displayPageNumber);
  }, [displayPageNumber]);

  // Palet Tema Kertas Buku
  const themePalette = useMemo(() => {
    switch (paperTheme) {
      case 'sepia':
        return {
          bg: '#FBF5E8',
          paper: '#FCF8EE',
          text: '#2C1E14',
          border: '#E8DEC8',
          muted: '#8A7A68',
          gold: '#9E782F',
          accent: '#1F140D',
          chromeBg: 'rgba(251, 245, 232, 0.96)',
        };
      case 'green':
        return {
          bg: '#EAF0E8',
          paper: '#EDF3EC',
          text: '#1C2C1E',
          border: '#CFDBCF',
          muted: '#5F7362',
          gold: '#527A45',
          accent: '#142416',
          chromeBg: 'rgba(234, 240, 232, 0.96)',
        };
      case 'dark':
        return {
          bg: '#1C1C1E',
          paper: '#1C1C1E',
          text: '#E5E5EA',
          border: '#2C2C2E',
          muted: '#8E8E93',
          gold: '#E5C07B',
          accent: '#FFFFFF',
          chromeBg: 'rgba(28, 28, 30, 0.96)',
        };
      case 'black':
        return {
          bg: '#000000',
          paper: '#000000',
          text: '#D1D1D6',
          border: '#1C1C1E',
          muted: '#636366',
          gold: '#D4AF37',
          accent: '#FFFFFF',
          chromeBg: 'rgba(0, 0, 0, 0.96)',
        };
      case 'white':
      default:
        return {
          bg: '#FFFFFF',
          paper: '#FFFFFF',
          text: '#1C1C1E',
          border: '#E5E5EA',
          muted: '#8E8E93',
          gold: '#8A6D1C',
          accent: '#111827',
          chromeBg: 'rgba(255, 255, 255, 0.96)',
        };
    }
  }, [paperTheme]);

  // Efek transisi halus lembaran buku
  const [turnDirection, setTurnDirection] = useState<'next' | 'prev' | null>(null);

  const triggerPageAnimation = (direction: 'next' | 'prev') => {
    setTurnDirection(direction);
    setTimeout(() => {
      setTurnDirection(null);
    }, 180);
  };

  // Simpan progres baca ke LocalStorage dan UserStorage
  const savePageProgress = useCallback(
    (pageIdx: number) => {
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem(LAST_PAGE_KEY, String(pageIdx));
        } catch {}
      }
      const user = UserStorage.getActiveSessionUser();
      if (user && totalPages > 0) {
        const progressPercent = Math.round(((pageIdx + 1) / totalPages) * 100);
        UserStorage.saveReadingProgress(user.id, book.id, progressPercent);
      }
    },
    [LAST_PAGE_KEY, book.id, totalPages]
  );

  /** Navigasi ke Halaman Berikutnya */
  const goToNextPage = useCallback(() => {
    if (currentPageIndex < totalPages - 1) {
      triggerPageAnimation('next');
      const nextIndex = currentPageIndex + 1;
      setCurrentPageIndex(nextIndex);
      savePageProgress(nextIndex);
    }
  }, [currentPageIndex, totalPages, savePageProgress]);

  /** Navigasi ke Halaman Sebelumnya */
  const goToPrevPage = useCallback(() => {
    if (currentPageIndex > 0) {
      triggerPageAnimation('prev');
      const prevIndex = currentPageIndex - 1;
      setCurrentPageIndex(prevIndex);
      savePageProgress(prevIndex);
    }
  }, [currentPageIndex, savePageProgress]);

  /** Lompat ke Halaman Tertentu (dengan menyimpan lokasi sebelumnya jika jauh) */
  const jumpToPage = useCallback(
    (targetIdx: number) => {
      const target = Math.max(0, Math.min(totalPages - 1, targetIdx));
      if (Math.abs(target - currentPageIndex) > 1) {
        setPreviousLocationIndex(currentPageIndex);
      }
      triggerPageAnimation(target >= currentPageIndex ? 'next' : 'prev');
      setCurrentPageIndex(target);
      savePageProgress(target);
      setShowTocModal(false);
    },
    [currentPageIndex, totalPages, savePageProgress]
  );

  /** Kembali ke lokasi sebelumnya (fitur "● 70" di screenshot pengguna) */
  const returnToPreviousLocation = useCallback(() => {
    if (previousLocationIndex !== null) {
      const prev = previousLocationIndex;
      setPreviousLocationIndex(currentPageIndex);
      triggerPageAnimation(prev >= currentPageIndex ? 'next' : 'prev');
      setCurrentPageIndex(prev);
      savePageProgress(prev);
    }
  }, [previousLocationIndex, currentPageIndex, savePageProgress]);

  // Toggle Bookmark
  const toggleBookmark = useCallback(() => {
    let nextBookmarks: number[];
    if (bookmarks.includes(currentPageIndex)) {
      nextBookmarks = bookmarks.filter((p) => p !== currentPageIndex);
    } else {
      nextBookmarks = [...bookmarks, currentPageIndex].sort((a, b) => a - b);
    }
    setBookmarks(nextBookmarks);
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(nextBookmarks));
      } catch {}
    }
  }, [bookmarks, currentPageIndex, BOOKMARKS_KEY]);

  const isCurrentPageBookmarked = bookmarks.includes(currentPageIndex);

  // Keyboard navigation untuk desktop
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
          return;
        }
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
          e.preventDefault();
          goToNextPage();
        } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          goToPrevPage();
        } else if (e.key === 'Escape') {
          if (showTocModal) setShowTocModal(false);
          else if (showSettings) setShowSettings(false);
          else onBack();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [goToNextPage, goToPrevPage, showTocModal, showSettings, onBack]);

  // Data Bab dan Teks Halaman
  const currentTextPage = textPages[currentPageIndex] || textPages[0];

  const currentPdfData = isPdfBook ? pdfTextCache[displayPageNumber] : null;

  // Cek apakah halaman ini adalah PEMBUKA BAB ASLI (bukan halaman tengah)
  const isRealChapterOpening = useMemo(() => {
    if (isPdfBook) {
      return Boolean(currentPdfData?.isRealChapterOpening && currentPdfData?.detectedChapterTitle);
    }
    return currentTextPage.isChapterOpening;
  }, [isPdfBook, currentPdfData, currentTextPage]);

  // Judul Bab Asli yang ditampilkan jika merupakan pembuka bab
  const chapterOpeningTitle = useMemo(() => {
    if (isPdfBook) {
      return currentPdfData?.detectedChapterTitle || null;
    }
    return currentTextPage.chapterTitle;
  }, [isPdfBook, currentPdfData, currentTextPage]);

  // Keterangan Sisa Halaman di Header Atas (Persis: "Tersisa 3 halaman di bab ini")
  const headerSubtitle = useMemo(() => {
    if (isPdfBook) {
      // Cari bab aktif dari daftar outline PDF
      const currentToc = pdfOutlineItems
        .filter((item) => item.pageNumber <= displayPageNumber)
        .pop();
      if (currentToc) {
        const nextToc = pdfOutlineItems.find(
          (item) => item.pageNumber > displayPageNumber
        );
        const endPage = nextToc ? nextToc.pageNumber - 1 : totalPages;
        const remaining = Math.max(0, endPage - displayPageNumber);
        return remaining > 0
          ? `Tersisa ${remaining} halaman di bab ini`
          : 'Halaman terakhir di bab ini';
      }
      const remainingTotal = totalPages - displayPageNumber;
      return remainingTotal > 0
        ? `Tersisa ${remainingTotal} halaman lagi`
        : 'Halaman terakhir';
    }

    const curChapterIdx = currentTextPage.chapterIndex;
    const curChapterEnd = chapterEndPages[curChapterIdx] || totalPages;
    const remaining = Math.max(0, curChapterEnd - displayPageNumber);

    return remaining > 0
      ? `Tersisa ${remaining} halaman di bab ini`
      : 'Halaman terakhir di bab ini';
  }, [
    isPdfBook,
    displayPageNumber,
    pdfOutlineItems,
    totalPages,
    currentTextPage,
    chapterEndPages,
  ]);

  // Paragraf-paragraf isi halaman saat ini
  const currentPageParagraphs = useMemo(() => {
    if (isPdfBook) {
      if (currentPdfData && currentPdfData.paragraphs.length > 0) {
        return currentPdfData.paragraphs;
      }
      return null;
    }
    return currentTextPage.paragraphs;
  }, [isPdfBook, currentPdfData, currentTextPage]);

  const isPdfPageImageOnly =
    isPdfBook && currentPdfData && currentPdfData.isImageOnly;

  // Daftar Bab Bersih / Fallback Section jika PDF tidak memiliki outline bawaan
  const organizedSections = useMemo(() => {
    if (pdfOutlineItems.length > 0) {
      return pdfOutlineItems;
    }

    // Buat daftar bab terstruktur per 8-10 halaman jika PDF tanpa outline
    const chunkSize = Math.max(5, Math.ceil(totalPages / 10));
    const sections: TocItem[] = [];
    const count = Math.ceil(totalPages / chunkSize);

    for (let i = 0; i < count; i++) {
      const start = i * chunkSize + 1;
      const end = Math.min((i + 1) * chunkSize, totalPages);
      let title = `Bagian ${i + 1}: Halaman ${start} - ${end}`;
      if (i === 0) title = `Halaman Awal & Informasi Judul (Hal. ${start}-${end})`;
      else if (i === 1) title = `Kata Pengantar & Pendahuluan (Hal. ${start}-${end})`;
      else if (i === count - 1) title = `Penutup & Referensi (Hal. ${start}-${end})`;
      else title = `Materi Pokok Bagian ${i} (Hal. ${start}-${end})`;

      sections.push({
        id: `sec_${i}`,
        title,
        pageNumber: start,
        level: 0,
      });
    }

    return sections;
  }, [pdfOutlineItems, totalPages]);

  // Filter pencarian pada daftar isi
  const filteredSections = useMemo(() => {
    if (!tocSearchQuery.trim()) return organizedSections;
    const q = tocSearchQuery.toLowerCase();
    return organizedSections.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        String(item.pageNumber).includes(q)
    );
  }, [organizedSections, tocSearchQuery]);

  return (
    <SafeAreaView
      style={[styles.rootContainer, { backgroundColor: themePalette.bg }]}
    >
      {/* ========================================================== */}
      {/* 1. HEADER MINIMALIS (Sesuai Gambar Apple Books / Kindle)     */}
      {/* ========================================================== */}
      <View
        style={[
          styles.minimalHeader,
          {
            backgroundColor: themePalette.chromeBg,
            opacity: isUiVisible ? 1 : 0,
            pointerEvents: isUiVisible ? 'auto' : 'none',
          } as any,
        ]}
      >
        {/* Kiri: Indikator Lokasi Membaca Sebelumnya / Tombol Kembali */}
        <View style={styles.headerLeft}>
          {previousLocationIndex !== null ? (
            <TouchableOpacity
              onPress={returnToPreviousLocation}
              style={styles.locationReturnBtn}
              accessibilityLabel="Kembali ke lokasi membaca sebelumnya"
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.locationPinBadge,
                  { backgroundColor: themePalette.text },
                ]}
              >
                <Text
                  style={[
                    styles.locationPinText,
                    { color: themePalette.bg },
                  ]}
                >
                  ● {previousLocationIndex + 1}
                </Text>
              </View>
              <Text
                style={[
                  styles.locationTooltipLabel,
                  { color: themePalette.muted },
                ]}
                numberOfLines={1}
              >
                Kembali ke hal. {previousLocationIndex + 1}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onBack}
              style={styles.minimalIconCircleBtn}
              accessibilityLabel="Keluar dari mode baca"
              activeOpacity={0.7}
            >
              <MaterialIcon
                name="arrow_back"
                size={20}
                color={themePalette.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Tengah: Keterangan Sisa Halaman di Bab Ini (Persis seperti gambar) */}
        <View style={styles.headerCenter}>
          <Text
            style={[
              styles.remainingChapterText,
              { color: themePalette.muted },
            ]}
            numberOfLines={1}
          >
            {headerSubtitle}
          </Text>
        </View>

        {/* Kanan: Tombol Pengaturan Cepat & Tombol Tutup (✕) */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => setShowSettings((prev) => !prev)}
            style={styles.minimalIconCircleBtn}
            accessibilityLabel="Pengaturan ukuran font dan warna kertas"
            activeOpacity={0.7}
          >
            <MaterialIcon
              name="format_size"
              size={19}
              color={themePalette.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleBookmark}
            style={styles.minimalIconCircleBtn}
            accessibilityLabel="Tandai halaman ini"
            activeOpacity={0.7}
          >
            <MaterialIcon
              name={isCurrentPageBookmarked ? 'bookmark' : 'bookmark_border'}
              size={19}
              color={
                isCurrentPageBookmarked ? themePalette.gold : themePalette.muted
              }
              filled={isCurrentPageBookmarked}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onBack}
            style={[
              styles.minimalIconCircleBtn,
              styles.closeCircleBtn,
              { backgroundColor: themePalette.border },
            ]}
            accessibilityLabel="Tutup pembaca"
            activeOpacity={0.7}
          >
            <MaterialIcon
              name="close"
              size={17}
              color={themePalette.text}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================== */}
      {/* 2. PANEL POPUP PENGATURAN TEMA & TIPOGRAFI                  */}
      {/* ========================================================== */}
      {showSettings ? (
        <View
          style={[
            styles.settingsDropdownCard,
            {
              backgroundColor: themePalette.paper,
              borderColor: themePalette.border,
            },
          ]}
        >
          {/* Pengatur Ukuran Font */}
          <View style={styles.settingsRow}>
            <Text
              style={[styles.settingsRowLabel, { color: themePalette.text }]}
            >
              Ukuran Font
            </Text>
            <View style={styles.fontStepperWrap}>
              <TouchableOpacity
                onPress={() => setFontSize((s) => Math.max(14, s - 1.5))}
                style={[
                  styles.fontStepperBtn,
                  { borderColor: themePalette.border },
                ]}
              >
                <Text
                  style={[
                    styles.fontStepperBtnText,
                    { color: themePalette.text },
                  ]}
                >
                  A-
                </Text>
              </TouchableOpacity>
              <Text
                style={[
                  styles.fontStepperValue,
                  { color: themePalette.muted },
                ]}
              >
                {Math.round(fontSize)}px
              </Text>
              <TouchableOpacity
                onPress={() => setFontSize((s) => Math.min(26, s + 1.5))}
                style={[
                  styles.fontStepperBtn,
                  { borderColor: themePalette.border },
                ]}
              >
                <Text
                  style={[
                    styles.fontStepperBtnText,
                    { color: themePalette.text },
                  ]}
                >
                  A+
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Pilihan Warna Kertas */}
          <View style={styles.settingsRow}>
            <Text
              style={[styles.settingsRowLabel, { color: themePalette.text }]}
            >
              Warna Kertas
            </Text>
            <View style={styles.themeCirclesRow}>
              {(['white', 'sepia', 'green', 'dark', 'black'] as PaperThemeKey[]).map(
                (key) => {
                  const circleBg = {
                    white: '#FFFFFF',
                    sepia: '#FAF4E8',
                    green: '#EDF3EC',
                    dark: '#2C2C2E',
                    black: '#000000',
                  }[key];
                  const circleBorder = {
                    white: '#D1D5DB',
                    sepia: '#D6C8AF',
                    green: '#B8C9B8',
                    dark: '#48484A',
                    black: '#333333',
                  }[key];
                  const isActive = paperTheme === key;

                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setPaperTheme(key)}
                      style={[
                        styles.themeColorChip,
                        {
                          backgroundColor: circleBg,
                          borderColor: isActive
                            ? themePalette.gold
                            : circleBorder,
                          borderWidth: isActive ? 2.5 : 1,
                        },
                      ]}
                      accessibilityLabel={`Pilih tema ${key}`}
                    />
                  );
                }
              )}
            </View>
          </View>

          {/* Pilihan Perataan Teks (Rata Kiri vs Justify) */}
          <View style={styles.settingsRow}>
            <Text
              style={[styles.settingsRowLabel, { color: themePalette.text }]}
            >
              Perataan Teks
            </Text>
            <View style={styles.alignToggleWrap}>
              <TouchableOpacity
                onPress={() => setTextAlignMode('left')}
                style={[
                  styles.alignToggleBtn,
                  textAlignMode === 'left' && [
                    styles.alignToggleBtnActive,
                    { backgroundColor: themePalette.gold },
                  ],
                  { borderColor: themePalette.border },
                ]}
                accessibilityLabel="Rata Kiri"
              >
                <MaterialIcon
                  name="format_align_left"
                  size={14}
                  color={textAlignMode === 'left' ? '#ffffff' : themePalette.text}
                />
                <Text
                  style={[
                    styles.alignToggleText,
                    {
                      color:
                        textAlignMode === 'left'
                          ? '#ffffff'
                          : themePalette.text,
                    },
                  ]}
                >
                  Rata Kiri
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTextAlignMode('justify')}
                style={[
                  styles.alignToggleBtn,
                  textAlignMode === 'justify' && [
                    styles.alignToggleBtnActive,
                    { backgroundColor: themePalette.gold },
                  ],
                  { borderColor: themePalette.border },
                ]}
                accessibilityLabel="Rata Kanan-Kiri"
              >
                <MaterialIcon
                  name="format_align_justify"
                  size={14}
                  color={
                    textAlignMode === 'justify' ? '#ffffff' : themePalette.text
                  }
                />
                <Text
                  style={[
                    styles.alignToggleText,
                    {
                      color:
                        textAlignMode === 'justify'
                          ? '#ffffff'
                          : themePalette.text,
                    },
                  ]}
                >
                  Justify
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Opsi Switch Mode Visual PDF vs E-Reader Reflow */}
          {isPdfBook && pdfDocInstance ? (
            <View
              style={[
                styles.settingsRow,
                {
                  borderTopWidth: 1,
                  borderTopColor: themePalette.border,
                  paddingTop: 10,
                  marginTop: 4,
                },
              ]}
            >
              <Text
                style={[
                  styles.settingsRowLabel,
                  { color: themePalette.text, fontSize: 12 },
                ]}
              >
                Format Tampilan
              </Text>
              <TouchableOpacity
                onPress={() =>
                  setReaderViewMode((prev) =>
                    prev === 'ebook' ? 'visual' : 'ebook'
                  )
                }
                style={[
                  styles.modeSwitchBtn,
                  {
                    backgroundColor:
                      readerViewMode === 'visual'
                        ? 'rgba(158, 120, 47, 0.15)'
                        : themePalette.border,
                  },
                ]}
              >
                <MaterialIcon
                  name={
                    readerViewMode === 'ebook'
                      ? 'format_align_left'
                      : 'picture_as_pdf'
                  }
                  size={15}
                  color={
                    readerViewMode === 'visual'
                      ? themePalette.gold
                      : themePalette.text
                  }
                />
                <Text
                  style={[
                    styles.modeSwitchText,
                    {
                      color:
                        readerViewMode === 'visual'
                          ? themePalette.gold
                          : themePalette.text,
                    },
                  ]}
                >
                  {readerViewMode === 'ebook'
                    ? 'Buku Digital'
                    : 'PDF Asli'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* ========================================================== */}
      {/* 3. AREA UTAMA BACA LEMBARAN BUKU (RESPONSIF & SCROLLABLE)  */}
      {/* ========================================================== */}
      <View style={styles.readingStage}>
        {/* Tombol Panah Navigasi Kiri (Desktop / Tablet) */}
        {isDesktop ? (
          <TouchableOpacity
            onPress={goToPrevPage}
            disabled={currentPageIndex === 0}
            style={[
              styles.desktopSideNavBtn,
              styles.desktopSideNavLeft,
              {
                opacity: currentPageIndex === 0 ? 0.15 : 0.8,
                backgroundColor: themePalette.paper,
                borderColor: themePalette.border,
              },
            ]}
            accessibilityLabel="Halaman sebelumnya"
          >
            <MaterialIcon
              name="chevron_left"
              size={28}
              color={themePalette.text}
            />
          </TouchableOpacity>
        ) : null}

        {/* Lembaran Halaman Buku Digital (Card Reflowable E-Reader) */}
        <View
          key={`page_${currentPageIndex}_${readerViewMode}`}
          style={[
            styles.ebookPaperPage,
            {
              backgroundColor: themePalette.paper,
              maxWidth: isMobile ? '100%' : 700,
              opacity: turnDirection ? 0.85 : 1,
              transform: [
                {
                  translateX:
                    turnDirection === 'next'
                      ? 4
                      : turnDirection === 'prev'
                      ? -4
                      : 0,
                },
              ],
            },
          ]}
        >
          {/* TAMPILAN JIKA PILIHAN 'VISUAL' (Canvas Asli PDF) */}
          {readerViewMode === 'visual' && isPdfBook && pdfDocInstance ? (
            <PdfCanvasRenderer
              pdfDoc={pdfDocInstance}
              pageNumber={displayPageNumber}
              zoomScale={1.0}
              fitMode="width"
              theme={themePalette}
              textClarity="sharp"
            />
          ) : isLoadingPdf ? (
            <View style={styles.centerLoadingState}>
              <ActivityIndicator size="large" color={themePalette.gold} />
              <Text
                style={[
                  styles.centerLoadingText,
                  { color: themePalette.muted },
                ]}
              >
                Membuka lembaran buku digital...
              </Text>
            </View>
          ) : isPdfBook && isExtractingCurrentPage && !currentPageParagraphs ? (
            <View style={styles.centerLoadingState}>
              <ActivityIndicator size="small" color={themePalette.gold} />
              <Text
                style={[
                  styles.centerLoadingText,
                  { color: themePalette.muted },
                ]}
              >
                Menyiapkan teks halaman {displayPageNumber}...
              </Text>
            </View>
          ) : isPdfPageImageOnly && pdfDocInstance ? (
            /* Jika Halaman PDF adalah Scan Gambar/Foto/Tabel Utuh, tampilkan visual tajamnya */
            <PdfCanvasRenderer
              pdfDoc={pdfDocInstance}
              pageNumber={displayPageNumber}
              zoomScale={1.0}
              fitMode="width"
              theme={themePalette}
              textClarity="sharp"
            />
          ) : (
            /* ======================================================== */
            /* TAMPILAN BUKU DIGITAL UTAMA: TEKS MENGALIR DAN LENGKAP    */
            /* ======================================================== */
            <ScrollView
              ref={scrollViewRef}
              style={styles.bookTextScrollView}
              contentContainerStyle={[
                styles.bookTextScrollContent,
                { paddingHorizontal: isMobile ? 20 : 36 },
              ]}
              showsVerticalScrollIndicator={true}
            >
              {/* Judul Bab & Ornamen Pembatas Klasik
                  HANYA muncul jika halaman ini benar-benar merupakan Pembuka Bab Baru!
                  Tidak muncul pada halaman lanjutan agar teks tidak terpotong atau membingungkan. */}
              {isRealChapterOpening && chapterOpeningTitle ? (
                <View style={styles.ebookChapterHeaderBlock}>
                  <Text
                    style={[
                      styles.ebookChapterTitle,
                      { color: themePalette.accent },
                    ]}
                  >
                    {chapterOpeningTitle.replace(/^\d+\.\s*/, '')}
                  </Text>
                  <Text
                    style={[
                      styles.ebookChapterOrnament,
                      { color: themePalette.muted },
                    ]}
                  >
                    — • —
                  </Text>
                </View>
              ) : null}

              {/* Paragraf-paragraf Buku Berformat Novel Nyaman */}
              <View style={styles.ebookParagraphsContainer}>
                {currentPageParagraphs && currentPageParagraphs.length > 0 ? (
                  currentPageParagraphs.map((paragraph, pIdx) => {
                    if (
                      paragraph.startsWith('[GAMBAR_HALAMAN:') &&
                      paragraph.endsWith(']')
                    ) {
                      const imgUri = paragraph.slice(16, -1);
                      return (
                        <View key={pIdx} style={styles.inlinePageImageWrap}>
                          <Image
                            source={{ uri: imgUri }}
                            style={styles.inlinePageImage}
                            resizeMode="contain"
                          />
                        </View>
                      );
                    }

                    // Hanya kenali sebagai item daftar isi visual jika mengandung titik-titik pemimpin (dot leaders) nyata
                    const hasDottedLeader =
                      /\.{3,}|\.\s*\.\s*\./.test(paragraph) &&
                      /(?:\.{2,}|\s{2,})\s*(\d{1,4}|[ivxlcdm]+)$/i.test(paragraph.trim());

                    const tocMatch = hasDottedLeader
                      ? paragraph.match(
                          /^(.*?)(?:\.{2,}|\.\s*\.\s*\.|\s{2,})\s*(\d{1,4}|[ivxlcdm]+)$/i
                        )
                      : null;

                    if (tocMatch) {
                      const itemTitle = tocMatch[1].trim();
                      const itemPage = tocMatch[2].trim();
                      const targetPage = parseInt(itemPage, 10);
                      const canJump =
                        !isNaN(targetPage) &&
                        targetPage >= 1 &&
                        targetPage <= totalPages;

                      return (
                        <div
                          key={pIdx}
                          onClick={
                            canJump ? () => jumpToPage(targetPage - 1) : undefined
                          }
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            justifyContent: 'space-between',
                            width: '100%',
                            margin: '0 0 10px 0',
                            fontFamily:
                              'Literata, Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif',
                            fontSize: `${fontSize}px`,
                            lineHeight: `${Math.round(fontSize * 1.6)}px`,
                            color: themePalette.text,
                            cursor: canJump ? 'pointer' : 'default',
                            userSelect: 'text',
                          }}
                          title={
                            canJump
                              ? `Klik untuk lompat ke Halaman ${targetPage}`
                              : undefined
                          }
                        >
                          <span
                            style={{
                              textAlign: 'left',
                              wordBreak: 'break-word',
                              flexShrink: 1,
                              paddingRight: 6,
                              fontWeight: /^(bab|bagian|chapter)/i.test(itemTitle)
                                ? 700
                                : 400,
                            }}
                          >
                            {itemTitle}
                          </span>
                          <span
                            style={{
                              flex: 1,
                              borderBottom: `1.5px dotted ${themePalette.muted}`,
                              margin: '0 8px 3px 8px',
                              minWidth: 16,
                              opacity: 0.45,
                            }}
                          />
                          <span
                            style={{
                              flexShrink: 0,
                              fontWeight: 600,
                              fontVariantNumeric: 'tabular-nums',
                              color: themePalette.gold,
                              marginLeft: 'auto',
                            }}
                          >
                            {itemPage}
                          </span>
                        </div>
                      );
                    }

                    const isLeftAligned = textAlignMode === 'left' || Boolean(tocMatch);

                    return (
                      <p
                        key={pIdx}
                        style={{
                          fontFamily:
                            'Literata, Georgia, "Palatino Linotype", "Book Antiqua", Palatino, serif',
                          fontSize: `${fontSize}px`,
                          lineHeight: `${Math.round(fontSize * 1.84)}px`,
                          color: themePalette.text,
                          margin: Boolean(tocMatch) ? '0 0 10px 0' : '0 0 18px 0',
                          textIndent:
                            !isLeftAligned && pIdx > 0 && paragraph.length > 70
                              ? '24px'
                              : '0px',
                          textAlign: isLeftAligned ? 'left' : 'justify',
                          letterSpacing: '0.012em',
                          wordBreak: 'break-word',
                          hyphens: isLeftAligned ? 'none' : 'auto',
                        }}
                      >
                        {paragraph}
                      </p>
                    );
                  })
                ) : (
                  <Text
                    style={[
                      styles.emptyPageText,
                      { color: themePalette.muted, fontSize },
                    ]}
                  >
                    Lembaran halaman ini siap dibaca. Silakan beralih ke halaman berikutnya.
                  </Text>
                )}

                {/* Indikator Akhir Halaman: Memastikan pengguna tahu bacaan halaman ini sudah selesai utuh */}
                <View style={styles.pageEndIndicatorWrap}>
                  <View
                    style={[
                      styles.pageEndDividerLine,
                      { backgroundColor: themePalette.border },
                    ]}
                  />
                  <Text
                    style={[
                      styles.pageEndText,
                      { color: themePalette.muted },
                    ]}
                  >
                    — Akhir Halaman {displayPageNumber} dari {totalPages} —
                  </Text>
                  {displayPageNumber < totalPages ? (
                    <TouchableOpacity
                      onPress={goToNextPage}
                      style={[
                        styles.pageEndNextBtn,
                        { backgroundColor: themePalette.gold },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.pageEndNextBtnText}>
                        Lanjut ke Halaman {displayPageNumber + 1}
                      </Text>
                      <MaterialIcon
                        name="arrow_forward"
                        size={15}
                        color="#ffffff"
                      />
                    </TouchableOpacity>
                  ) : (
                    <Text
                      style={[
                        styles.pageEndFinishedText,
                        { color: themePalette.gold },
                      ]}
                    >
                      Selamat, Anda telah menyelesaikan buku ini! ✨
                    </Text>
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>

        {/* Tombol Panah Navigasi Kanan (Desktop / Tablet) */}
        {isDesktop ? (
          <TouchableOpacity
            onPress={goToNextPage}
            disabled={currentPageIndex >= totalPages - 1}
            style={[
              styles.desktopSideNavBtn,
              styles.desktopSideNavRight,
              {
                opacity: currentPageIndex >= totalPages - 1 ? 0.15 : 0.8,
                backgroundColor: themePalette.paper,
                borderColor: themePalette.border,
              },
            ]}
            accessibilityLabel="Halaman berikutnya"
          >
            <MaterialIcon
              name="chevron_right"
              size={28}
              color={themePalette.text}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ========================================================== */}
      {/* 4. FOOTER MINIMALIS (Navigasi Halaman Cepat & Daftar Isi)    */}
      {/* ========================================================== */}
      <View
        style={[
          styles.minimalFooter,
          {
            backgroundColor: themePalette.chromeBg,
            opacity: isUiVisible ? 1 : 0,
            pointerEvents: isUiVisible ? 'auto' : 'none',
          } as any,
        ]}
      >
        {/* Kiri: Tombol Pengaturan Cepat Tema */}
        <View style={styles.footerSideAction}>
          <TouchableOpacity
            onPress={() => setShowSettings((prev) => !prev)}
            style={styles.minimalIconCircleBtn}
            accessibilityLabel="Pengaturan membaca"
            activeOpacity={0.7}
          >
            <MaterialIcon
              name="tune"
              size={18}
              color={themePalette.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Tengah: Navigasi Panah Cepat & Nomor Halaman "180 dari 250" */}
        <View style={styles.footerCenterNavGroup}>
          <TouchableOpacity
            onPress={goToPrevPage}
            disabled={currentPageIndex === 0}
            style={[
              styles.footerArrowBtn,
              { opacity: currentPageIndex === 0 ? 0.25 : 1 },
            ]}
            accessibilityLabel="Halaman sebelumnya"
          >
            <MaterialIcon
              name="chevron_left"
              size={22}
              color={themePalette.text}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setTocActiveTab('jump');
              setShowTocModal(true);
            }}
            style={styles.pageIndicatorPillBtn}
            activeOpacity={0.7}
            accessibilityLabel="Klik untuk buka daftar isi atau lompat halaman"
          >
            <Text
              style={[
                styles.pageIndicatorText,
                { color: themePalette.muted },
              ]}
            >
              {displayPageNumber} dari {totalPages}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goToNextPage}
            disabled={currentPageIndex >= totalPages - 1}
            style={[
              styles.footerArrowBtn,
              { opacity: currentPageIndex >= totalPages - 1 ? 0.25 : 1 },
            ]}
            accessibilityLabel="Halaman berikutnya"
          >
            <MaterialIcon
              name="chevron_right"
              size={22}
              color={themePalette.text}
            />
          </TouchableOpacity>
        </View>

        {/* Kanan: Tombol Daftar Isi Rapi (Icon Buku) */}
        <View style={styles.footerSideAction}>
          <TouchableOpacity
            onPress={() => {
              setTocActiveTab('chapters');
              setShowTocModal(true);
            }}
            style={styles.minimalIconCircleBtn}
            accessibilityLabel="Buka daftar isi buku"
            activeOpacity={0.7}
          >
            <MaterialIcon
              name="menu_book"
              size={19}
              color={themePalette.muted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ========================================================== */}
      {/* 5. MODAL DAFTAR ISI TERPADU & RAPI (TABLE OF CONTENTS)     */}
      {/* ========================================================== */}
      {showTocModal ? (
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTocModal(false)}
          />
          <View
            style={[
              styles.tocModalCard,
              {
                backgroundColor: themePalette.paper,
                borderColor: themePalette.border,
              },
            ]}
          >
            {/* Header Modal */}
            <View
              style={[
                styles.tocModalHeader,
                { borderBottomColor: themePalette.border },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcon
                  name="menu_book"
                  size={20}
                  color={themePalette.gold}
                />
                <Text
                  style={[
                    styles.tocModalTitle,
                    { color: themePalette.accent },
                  ]}
                >
                  Daftar Isi Buku
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowTocModal(false)}
                style={styles.minimalIconCircleBtn}
              >
                <MaterialIcon
                  name="close"
                  size={18}
                  color={themePalette.text}
                />
              </TouchableOpacity>
            </View>

            {/* Tab Navigasi Modal: [Daftar Bab] | [Lompat Hal] | [Bookmark] */}
            <View
              style={[
                styles.tocTabBar,
                { borderBottomColor: themePalette.border },
              ]}
            >
              <TouchableOpacity
                onPress={() => setTocActiveTab('chapters')}
                style={[
                  styles.tocTabItem,
                  tocActiveTab === 'chapters' && [
                    styles.tocTabItemActive,
                    { borderBottomColor: themePalette.gold },
                  ],
                ]}
              >
                <MaterialIcon
                  name="format_list_bulleted"
                  size={16}
                  color={
                    tocActiveTab === 'chapters'
                      ? themePalette.gold
                      : themePalette.muted
                  }
                />
                <Text
                  style={[
                    styles.tocTabItemText,
                    {
                      color:
                        tocActiveTab === 'chapters'
                          ? themePalette.gold
                          : themePalette.muted,
                      fontWeight: tocActiveTab === 'chapters' ? '700' : '500',
                    },
                  ]}
                >
                  Daftar Bab
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTocActiveTab('jump')}
                style={[
                  styles.tocTabItem,
                  tocActiveTab === 'jump' && [
                    styles.tocTabItemActive,
                    { borderBottomColor: themePalette.gold },
                  ],
                ]}
              >
                <MaterialIcon
                  name="swap_horiz"
                  size={16}
                  color={
                    tocActiveTab === 'jump'
                      ? themePalette.gold
                      : themePalette.muted
                  }
                />
                <Text
                  style={[
                    styles.tocTabItemText,
                    {
                      color:
                        tocActiveTab === 'jump'
                          ? themePalette.gold
                          : themePalette.muted,
                      fontWeight: tocActiveTab === 'jump' ? '700' : '500',
                    },
                  ]}
                >
                  Lompat Halaman
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setTocActiveTab('bookmarks')}
                style={[
                  styles.tocTabItem,
                  tocActiveTab === 'bookmarks' && [
                    styles.tocTabItemActive,
                    { borderBottomColor: themePalette.gold },
                  ],
                ]}
              >
                <MaterialIcon
                  name="bookmark"
                  size={16}
                  color={
                    tocActiveTab === 'bookmarks'
                      ? themePalette.gold
                      : themePalette.muted
                  }
                  filled={tocActiveTab === 'bookmarks'}
                />
                <Text
                  style={[
                    styles.tocTabItemText,
                    {
                      color:
                        tocActiveTab === 'bookmarks'
                          ? themePalette.gold
                          : themePalette.muted,
                      fontWeight: tocActiveTab === 'bookmarks' ? '700' : '500',
                    },
                  ]}
                >
                  Penanda ({bookmarks.length})
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: DAFTAR BAB RAPI */}
            {tocActiveTab === 'chapters' ? (
              <View style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Kolom Pencarian Bab */}
                {organizedSections.length > 5 ? (
                  <div style={{ padding: '8px 0 10px 0' }}>
                    <input
                      type="text"
                      placeholder="Cari judul bab atau materi..."
                      value={tocSearchQuery}
                      onChange={(e) => setTocSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 12px',
                        borderRadius: 8,
                        border: `1px solid ${themePalette.border}`,
                        backgroundColor: themePalette.bg,
                        color: themePalette.text,
                        fontSize: 12.5,
                        fontFamily: 'Manrope, sans-serif',
                        outline: 'none',
                      }}
                    />
                  </div>
                ) : null}

                <ScrollView
                  style={styles.tocScrollArea}
                  showsVerticalScrollIndicator={false}
                >
                  <View style={{ gap: 4, paddingBottom: 16 }}>
                    {filteredSections.map((item, idx) => {
                      const isCurrent =
                        displayPageNumber >= item.pageNumber &&
                        (idx === filteredSections.length - 1 ||
                          displayPageNumber < filteredSections[idx + 1].pageNumber);

                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.cleanTocRow,
                            {
                              backgroundColor: isCurrent
                                ? 'rgba(158, 120, 47, 0.12)'
                                : 'transparent',
                              borderBottomColor: themePalette.border,
                              paddingLeft: item.level ? item.level * 16 + 10 : 10,
                            },
                          ]}
                          onPress={() => jumpToPage(item.pageNumber - 1)}
                        >
                          <View style={styles.cleanTocLeft}>
                            <View
                              style={[
                                styles.cleanTocBadge,
                                {
                                  backgroundColor: isCurrent
                                    ? themePalette.gold
                                    : themePalette.border,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.cleanTocBadgeText,
                                  {
                                    color: isCurrent
                                      ? '#ffffff'
                                      : themePalette.muted,
                                  },
                                ]}
                              >
                                {idx + 1}
                              </Text>
                            </View>
                            <Text
                              style={[
                                styles.cleanTocTitle,
                                {
                                  color: isCurrent
                                    ? themePalette.gold
                                    : themePalette.text,
                                  fontWeight: isCurrent ? '700' : '500',
                                },
                              ]}
                              numberOfLines={2}
                            >
                              {item.title}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.cleanTocPageTag,
                              {
                                backgroundColor: isCurrent
                                  ? themePalette.gold
                                  : themePalette.bg,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.cleanTocPageText,
                                {
                                  color: isCurrent
                                    ? '#ffffff'
                                    : themePalette.muted,
                                },
                              ]}
                            >
                              Hal. {item.pageNumber}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            ) : null}

            {/* TAB 2: LOMPAT HALAMAN INTERAKTIF DENGAN SLIDER */}
            {tocActiveTab === 'jump' ? (
              <View style={styles.jumpTabContainer}>
                <Text
                  style={[
                    styles.jumpPromptText,
                    { color: themePalette.muted },
                  ]}
                >
                  Geser slider atau masukkan nomor halaman langsung:
                </Text>

                <View style={styles.jumpBigDisplay}>
                  <Text
                    style={[
                      styles.jumpBigPageNum,
                      { color: themePalette.gold },
                    ]}
                  >
                    Halaman {sliderJumpValue}
                  </Text>
                  <Text
                    style={[
                      styles.jumpBigPageTotal,
                      { color: themePalette.muted },
                    ]}
                  >
                    dari {totalPages} halaman
                  </Text>
                </View>

                {/* Range Slider Halus */}
                <div style={{ width: '100%', padding: '12px 6px' }}>
                  <input
                    type="range"
                    min={1}
                    max={totalPages}
                    value={sliderJumpValue}
                    onChange={(e) => setSliderJumpValue(Number(e.target.value))}
                    style={{
                      width: '100%',
                      cursor: 'pointer',
                      accentColor: themePalette.gold,
                    }}
                  />
                </div>

                {/* Tombol Pintas Halaman (Awal, Seperempat, Tengah, Akhir) */}
                <View style={styles.jumpShortcutsRow}>
                  {[
                    { label: 'Awal (Hal 1)', page: 1 },
                    {
                      label: `Hal ${Math.round(totalPages * 0.25)}`,
                      page: Math.max(1, Math.round(totalPages * 0.25)),
                    },
                    {
                      label: `Tengah (${Math.round(totalPages * 0.5)})`,
                      page: Math.max(1, Math.round(totalPages * 0.5)),
                    },
                    {
                      label: `Hal ${Math.round(totalPages * 0.75)}`,
                      page: Math.max(1, Math.round(totalPages * 0.75)),
                    },
                    { label: `Akhir (${totalPages})`, page: totalPages },
                  ].map((sc, scIdx) => (
                    <TouchableOpacity
                      key={scIdx}
                      onPress={() => setSliderJumpValue(sc.page)}
                      style={[
                        styles.jumpShortcutChip,
                        {
                          borderColor: themePalette.border,
                          backgroundColor:
                            sliderJumpValue === sc.page
                              ? 'rgba(158, 120, 47, 0.15)'
                              : themePalette.bg,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.jumpShortcutText,
                          {
                            color:
                              sliderJumpValue === sc.page
                                ? themePalette.gold
                                : themePalette.text,
                          },
                        ]}
                      >
                        {sc.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Tombol Konfirmasi Lompat */}
                <TouchableOpacity
                  onPress={() => jumpToPage(sliderJumpValue - 1)}
                  style={[
                    styles.confirmJumpBtn,
                    { backgroundColor: themePalette.gold },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmJumpBtnText}>
                    Buka Halaman {sliderJumpValue}
                  </Text>
                  <MaterialIcon
                    name="arrow_forward"
                    size={16}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* TAB 3: PENANDA BACAAN (BOOKMARKS) */}
            {tocActiveTab === 'bookmarks' ? (
              <ScrollView
                style={styles.tocScrollArea}
                showsVerticalScrollIndicator={false}
              >
                {bookmarks.length > 0 ? (
                  <View style={{ gap: 6, paddingBottom: 16 }}>
                    {bookmarks.map((bmIdx) => (
                      <TouchableOpacity
                        key={bmIdx}
                        style={[
                          styles.cleanTocRow,
                          { borderBottomColor: themePalette.border },
                        ]}
                        onPress={() => jumpToPage(bmIdx)}
                      >
                        <View style={styles.cleanTocLeft}>
                          <MaterialIcon
                            name="bookmark"
                            size={18}
                            color={themePalette.gold}
                            filled={true}
                          />
                          <Text
                            style={[
                              styles.cleanTocTitle,
                              { color: themePalette.text, fontWeight: '600' },
                            ]}
                          >
                            Halaman {bmIdx + 1}
                          </Text>
                        </View>
                        <MaterialIcon
                          name="chevron_right"
                          size={18}
                          color={themePalette.muted}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyBookmarksWrap}>
                    <MaterialIcon
                      name="bookmark_border"
                      size={36}
                      color={themePalette.border}
                    />
                    <Text
                      style={[
                        styles.emptyBookmarksTitle,
                        { color: themePalette.text },
                      ]}
                    >
                      Belum Ada Penanda
                    </Text>
                    <Text
                      style={[
                        styles.emptyBookmarksSub,
                        { color: themePalette.muted },
                      ]}
                    >
                      Ketuk ikon bookmark di bagian atas saat membaca untuk menyimpan halaman favorit Anda di sini.
                    </Text>
                  </View>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  /* HEADER */
  minimalHeader: {
    height: 52,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: 'opacity 0.25s ease' as any,
  },
  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationReturnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 16,
  },
  locationPinBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 12,
  },
  locationPinText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  locationTooltipLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
    maxWidth: 150,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remainingChapterText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11.5,
    fontWeight: '500',
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  minimalIconCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCircleBtn: {
    marginLeft: 2,
  },

  /* SETTINGS CARD */
  settingsDropdownCard: {
    position: 'absolute',
    top: 54,
    right: 16,
    zIndex: 60,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 8,
    gap: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingsRowLabel: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12.5,
    fontWeight: '600',
  },
  fontStepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fontStepperBtn: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  fontStepperBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '700',
  },
  fontStepperValue: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '600',
    width: 38,
    textAlign: 'center',
  },
  themeCirclesRow: {
    flexDirection: 'row',
    gap: 7,
  },
  themeColorChip: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  modeSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  modeSwitchText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '700',
  },
  alignToggleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alignToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  alignToggleBtnActive: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  alignToggleText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
  },

  /* READING STAGE */
  readingStage: {
    flex: 1,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  desktopSideNavBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    marginTop: -22,
    zIndex: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  desktopSideNavLeft: {
    left: 20,
  },
  desktopSideNavRight: {
    right: 20,
  },
  ebookPaperPage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    paddingTop: 54,
    paddingBottom: 50,
    transition: 'transform 0.18s ease, opacity 0.18s ease' as any,
  },
  centerLoadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  centerLoadingText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '600',
  },
  bookTextScrollView: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  bookTextScrollContent: {
    paddingTop: 16,
    paddingBottom: 130, // Ruang lega agar baris paling bawah tidak tertutup footer
    maxWidth: 680,
    alignSelf: 'center',
    width: '100%',
  },

  /* CHAPTER HEADER BLOCK (Hanya muncul jika halaman pembuka bab) */
  ebookChapterHeaderBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 26,
    marginTop: 8,
  },
  ebookChapterTitle: {
    fontFamily: 'Literata, Georgia, "Palatino Linotype", Palatino, serif' as any,
    fontSize: 23,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  ebookChapterOrnament: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 13,
    letterSpacing: 2,
    opacity: 0.65,
  },

  ebookParagraphsContainer: {
    width: '100%',
  },
  emptyPageText: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 32,
  },
  inlinePageImageWrap: {
    width: '100%',
    minHeight: 380,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  inlinePageImage: {
    width: '100%',
    height: 380,
  },

  /* INDIKATOR AKHIR HALAMAN */
  pageEndIndicatorWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 36,
    paddingTop: 16,
    gap: 12,
  },
  pageEndDividerLine: {
    height: 1,
    width: 120,
    opacity: 0.6,
  },
  pageEndText: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 12,
    fontStyle: 'italic',
  },
  pageEndNextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    marginTop: 4,
  },
  pageEndNextBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  pageEndFinishedText: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 13,
    fontWeight: '700',
  },

  /* FOOTER */
  minimalFooter: {
    height: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    transition: 'opacity 0.25s ease' as any,
  },
  footerSideAction: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCenterNavGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorPillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageIndicatorText: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 12.5,
    fontWeight: '500',
    letterSpacing: 0.4,
  },

  /* MODAL DAFTAR ISI RAPI */
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  tocModalCard: {
    width: '100%',
    maxWidth: 520,
    height: '80%',
    maxHeight: 640,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 8,
    display: 'flex',
    flexDirection: 'column',
  },
  tocModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  tocModalTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 17,
    fontWeight: '700',
  },
  tocTabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginTop: 6,
  },
  tocTabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tocTabItemActive: {
    borderBottomWidth: 2,
  },
  tocTabItemText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
  },
  tocScrollArea: {
    flex: 1,
    marginTop: 8,
  },
  cleanTocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderBottomWidth: 1,
  },
  cleanTocLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 10,
  },
  cleanTocBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cleanTocBadgeText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 10.5,
    fontWeight: '700',
  },
  cleanTocTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  cleanTocPageTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cleanTocPageText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
  },

  /* TAB JUMP */
  jumpTabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  jumpPromptText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'center',
  },
  jumpBigDisplay: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  jumpBigPageNum: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 28,
    fontWeight: '700',
  },
  jumpBigPageTotal: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    marginTop: 2,
  },
  jumpShortcutsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  jumpShortcutChip: {
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
  },
  jumpShortcutText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 11,
    fontWeight: '600',
  },
  confirmJumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
  },
  confirmJumpBtnText: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },

  /* BOOKMARKS TAB */
  emptyBookmarksWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyBookmarksTitle: {
    fontFamily: 'Literata, Georgia, serif' as any,
    fontSize: 15,
    fontWeight: '700',
    marginTop: 6,
  },
  emptyBookmarksSub: {
    fontFamily: 'Manrope, sans-serif' as any,
    fontSize: 12,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
});
