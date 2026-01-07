import React, { useRef, useState } from 'react';
import { Upload } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndPass(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndPass(e.target.files[0]);
    }
  };

  const validateAndPass = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("请上传图片文件。");
      return;
    }
    onFileSelect(file);
  };

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-500 ease-out border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center text-center overflow-hidden
        ${isDragging 
          ? 'border-violet-500 bg-violet-500/10 scale-[1.02]' 
          : 'border-slate-700 hover:border-violet-400 hover:bg-slate-800/40 bg-slate-900/30'
        }
        ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={handleInputChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 bg-slate-800/80 p-5 rounded-2xl mb-5 shadow-xl shadow-black/20 group-hover:scale-110 group-hover:bg-violet-500/20 group-hover:text-violet-300 transition-all duration-300">
        <Upload className="w-10 h-10 text-slate-300 group-hover:text-violet-400" />
      </div>
      
      <h3 className="relative z-10 text-2xl font-bold text-slate-200 mb-3 group-hover:text-white transition-colors">
        上传九宫格图片
      </h3>
      <p className="relative z-10 text-slate-400 text-sm max-w-xs mx-auto group-hover:text-slate-300 transition-colors">
        拖拽或点击上传 16:9 的拼图。
        <br/>我们将为您智能切分为 9 张高清大图。
      </p>

      {isProcessing && (
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center rounded-3xl z-20">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400 mb-4 shadow-[0_0_15px_rgba(167,139,250,0.5)]"></div>
            <p className="text-violet-100 font-medium tracking-wide animate-pulse">正在处理中...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DropZone;