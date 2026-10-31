import React, { useState } from 'react';
import { useTransactionStore } from '../../lib/ledger/transactionStore';
import { Folder, FileText, Image, Archive, Trash2, HardDrive, ArrowRight, CornerDownRight, Check } from 'lucide-react';

export const FileExplorerView: React.FC = () => {
  const { files, moveFile, deleteFile, compressFile } = useTransactionStore();
  const [activeFolder, setActiveFolder] = useState<'downloads' | 'documents' | 'pictures' | 'trashed' | 'compressed'>('downloads');

  const filesInDownloads = files.filter((f) => f.status === 'in_downloads');
  const filesInDocuments = files.filter((f) => f.status === 'in_documents');
  const filesInPictures = files.filter((f) => f.status === 'in_pictures');
  const filesInTrash = files.filter((f) => f.status === 'trashed');
  const filesInCompressed = files.filter((f) => f.status === 'compressed');

  const displayedFiles =
    activeFolder === 'downloads'
      ? filesInDownloads
      : activeFolder === 'documents'
      ? filesInDocuments
      : activeFolder === 'pictures'
      ? filesInPictures
      : activeFolder === 'trashed'
      ? filesInTrash
      : filesInCompressed;

  const totalBytesReclaimed = files
    .filter((f) => f.status !== 'in_downloads')
    .reduce((acc, f) => acc + f.sizeBytes, 0);

  const formatSize = (bytes: number) => {
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'screenshot':
        return <Image className="w-4 h-4 text-emerald-400" />;
      case 'pdf':
        return <FileText className="w-4 h-4 text-blue-400" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-amber-400" />;
      default:
        return <HardDrive className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0d101a] text-[#ede5d5] border-2 border-vedic-gold/40 rounded-2xl overflow-hidden shadow-2xl font-sans">
      {/* Reality Header */}
      <div className="bg-[#131624] p-4 border-b border-vedic-gold/30 flex flex-wrap items-center justify-between gap-3 font-devanagari">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/15 text-sky-300 rounded-xl border border-sky-500/40">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sky-300 tracking-wide flex items-center gap-2">
              मन्दरा मंथन // APFS & DOWNLOADS DIRECTORY
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-950 text-sky-300 border border-sky-700 font-sans font-bold">
                FILE SYSTEM
              </span>
            </h2>
            <p className="text-xs text-[#cbbda3] font-serif">
              Downloads Clutter: <span className="text-amber-400 font-semibold">{filesInDownloads.length}</span> files | Organized:{' '}
              <span className="text-emerald-400 font-semibold">{files.length - filesInDownloads.length}</span> | Space Handled:{' '}
              <span className="text-vedic-gold-bright font-semibold">{formatSize(totalBytesReclaimed)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Split Body: Folders Sidebar & File Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Folders Sidebar */}
        <div className="w-64 bg-[#101420] border-r border-slate-800 p-3 space-y-1 text-xs font-mono">
          <div className="text-[10px] text-slate-500 uppercase px-2 py-1 font-bold tracking-wider">
            Directory Structure
          </div>

          <button
            onClick={() => setActiveFolder('downloads')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all ${
              activeFolder === 'downloads'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              ~/Downloads
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
              {filesInDownloads.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('documents')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all ${
              activeFolder === 'documents'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-blue-400" />
              /Documents/PDFs
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800">
              {filesInDocuments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('pictures')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all ${
              activeFolder === 'pictures'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Folder className="w-4 h-4 text-emerald-400" />
              /Pictures/Screenshots
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
              {filesInPictures.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('compressed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all ${
              activeFolder === 'compressed'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Archive className="w-4 h-4 text-purple-400" />
              /Archives (.zip)
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
              {filesInCompressed.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFolder('trashed')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded transition-all ${
              activeFolder === 'trashed'
                ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-red-400" />
              ~/.Trash
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
              {filesInTrash.length}
            </span>
          </button>
        </div>

        {/* File Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead className="bg-[#141824] sticky top-0 border-b border-slate-800 text-slate-400 z-10">
              <tr>
                <th className="py-2.5 px-4 font-semibold">NAME</th>
                <th className="py-2.5 px-4 font-semibold">CURRENT PATH</th>
                <th className="py-2.5 px-4 font-semibold">SIZE</th>
                <th className="py-2.5 px-4 font-semibold">DATE</th>
                <th className="py-2.5 px-4 font-semibold text-right">MANUAL ROUTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {displayedFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-4">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.category)}
                      <span className="font-semibold text-slate-200 truncate max-w-[220px]" title={file.name}>
                        {file.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-2.5 px-4 text-slate-400 text-[11px] truncate max-w-[200px]" title={file.currentPath}>
                    {file.currentPath}
                  </td>
                  <td className="py-2.5 px-4 text-slate-300 text-[11px] whitespace-nowrap">
                    {formatSize(file.sizeBytes)}
                  </td>
                  <td className="py-2.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                    {file.createdDate}
                  </td>
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    {file.status === 'in_downloads' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => moveFile(file.id, '/Documents/PDFs/2026', file.category)}
                          className="px-2 py-0.5 bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded text-[10px] transition-colors"
                          title="Move to Documents/PDFs"
                        >
                          → PDFs
                        </button>
                        <button
                          onClick={() => moveFile(file.id, '/Pictures/Screenshots', file.category)}
                          className="px-2 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 rounded text-[10px] transition-colors"
                          title="Move to Pictures/Screenshots"
                        >
                          → Shots
                        </button>
                        <button
                          onClick={() => compressFile(file.id)}
                          className="px-2 py-0.5 bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-800 rounded text-[10px] transition-colors"
                          title="Zip Archive"
                        >
                          .ZIP
                        </button>
                        <button
                          onClick={() => deleteFile(file.id)}
                          className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                          title="Delete to Trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <Check className="w-3 h-3" /> Organized
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
