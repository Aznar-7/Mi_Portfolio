import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { site } from '@/data/site';

export function PdfViewerApp({ lang }) {
  const [zoom, setZoom] = useState(100);
  const resume = site.resumes[lang];
  const src = resume.url;

  return (
    <div className="h-full flex flex-col bg-[#1a1a1a]">
      {/* Toolbar */}
      <div className="h-9 bg-[#252526] border-b border-black/40 flex items-center px-3 gap-3 flex-shrink-0">
        <span className="text-white/50 text-[11px] font-medium flex-1 truncate">{resume.filename}</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.max(50, z - 25))}
            className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm flex items-center justify-center transition-colors"
          >−</button>
          <span className="text-white/40 text-[11px] font-mono w-10 text-center">{zoom}%</span>
          <button
            onClick={() => setZoom(z => Math.min(200, z + 25))}
            className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white/60 text-sm flex items-center justify-center transition-colors"
          >+</button>
        </div>
        <a
          href={src}
          download={resume.filename}
          className="flex items-center gap-1.5 text-[11px] text-white/40 hover:text-white/70 transition-colors ml-1"
        >
          <ExternalLink size={12} /> Descargar
        </a>
      </div>

      {/* Iframe viewer */}
      <div className="flex-1 overflow-auto bg-[#404040] flex justify-center py-4">
        <iframe
          src={`${src}#zoom=${zoom}`}
          className="shadow-2xl border-0 h-full"
          style={{ width: `${Math.min(zoom, 100)}%`, minHeight: 600 }}
          title="Resume PDF"
        />
      </div>
    </div>
  );
}
