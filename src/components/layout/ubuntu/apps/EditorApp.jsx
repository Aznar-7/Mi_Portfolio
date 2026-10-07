import { File, Shell } from 'lucide-react';
import React from 'react';

export function EditorApp({ file }) {
  const lines = (file?.content || '// No file open — abre un archivo desde Files').split('\n');
  const ext = file?.name?.split('.').pop() || 'txt';
  const langLabel = { json:'JSON', jsx:'JavaScript React', cpp:'C++', py:'Python', md:'Markdown', sh:'Shell', txt:'Plain Text', pdf:'PDF', ini:'INI', toml:'TOML' }[ext] || 'Text';

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
      <div className="bg-[#252526] border-b border-black/50 flex flex-shrink-0">
        <div className="px-4 py-2 bg-[#1e1e1e] text-[#ccc] text-[12px] flex items-center gap-2 border-t-2 border-t-[#007acc]">
          <File size={13} className="text-[#519aba]" />{file?.name || 'Untitled'}
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden">
        <div className="w-10 bg-[#1e1e1e] text-[#5a5a5a] text-[12px] text-right pr-2 py-3 select-none font-mono leading-5 flex-shrink-0 overflow-hidden border-r border-[#303030]">
          {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <div className="flex-1 overflow-auto p-3 pl-4">
          <pre className="text-[#d4d4d4] font-mono text-[13px] leading-5 m-0 whitespace-pre-wrap break-words">{file?.content || '// No file open'}</pre>
        </div>
      </div>
      <div className="h-6 bg-[#007acc] px-3 flex items-center justify-between text-white text-[10px] flex-shrink-0">
        <div className="flex gap-3"><span>⎇ main</span><span>Ln 1</span></div>
        <div className="flex gap-3"><span>UTF-8</span><span>{langLabel}</span></div>
      </div>
    </div>
  );
}
