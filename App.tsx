import React, { useState, useEffect, useCallback } from 'react';
import JSZip from 'jszip';
import { Download, Grid3X3, ArrowRight, Settings } from 'lucide-react';
import DropZone from './components/DropZone';
import ControlPanel from './components/ControlPanel';
import { sliceNineGrid } from './services/imageProcessor';
import { AppStatus, ProcessedImage, ProcessingOptions } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [options, setOptions] = useState<ProcessingOptions>({
    removeBlackBorders: true,
    sensitivity: 20
  });

  // Clean up object URL when file changes
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [file]);

  // Effect to process image when file or options change (but only on manual trigger for options)
  const processImage = useCallback(async (currentFile: File, currentOptions: ProcessingOptions) => {
    setStatus(AppStatus.PROCESSING);
    setImages([]); // Clear previous
    
    try {
      const results = await sliceNineGrid(currentFile, currentOptions);
      setImages(results);
      setStatus(AppStatus.READY);
    } catch (error) {
      console.error("Processing failed", error);
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    processImage(selectedFile, options);
  };

  const handleReprocess = () => {
    if (file) {
      processImage(file, options);
    }
  };

  const handleReset = () => {
    setFile(null);
    setImages([]);
    setStatus(AppStatus.IDLE);
  };

  const handleDownloadSingle = (image: ProcessedImage) => {
    const link = document.createElement('a');
    link.href = image.originalUrl;
    link.download = `slice_${image.index + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0) return;
    
    const zip = new JSZip();
    const folder = zip.folder("nine_grid_slices");
    
    if (folder) {
        images.forEach((img) => {
            folder.file(`slice_${img.index + 1}.jpg`, img.blob);
        });
        
        const content = await zip.generateAsync({ type: "blob" });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "nine_grid_images.zip";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    }
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-violet-500/30 selection:text-violet-200">
      {/* Header */}
      <header className="border-b border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 z-50 shadow-lg shadow-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
                <Grid3X3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-violet-200 to-indigo-200 tracking-tight">
              九宫格切图
            </h1>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-800">
            v1.0.0
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. Upload Section */}
            {!file && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DropZone onFileSelect={handleFileSelect} isProcessing={status === AppStatus.PROCESSING} />
              </div>
            )}

            {/* 2. Results Grid */}
            {file && (
                <div className="space-y-6">
                    {/* Original Preview (Small) */}
                    <div className="flex items-center gap-5 bg-slate-900/40 p-5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
                        {filePreviewUrl && (
                          <div className="relative group">
                             <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-lg opacity-30 group-hover:opacity-75 blur transition duration-200"></div>
                             <img 
                                 src={filePreviewUrl} 
                                 alt="Original" 
                                 className="relative w-32 h-20 object-contain bg-slate-950 rounded-lg border border-slate-800"
                             />
                          </div>
                        )}
                        <div className="flex-1">
                            <p className="text-lg font-medium text-white truncate max-w-[200px] sm:max-w-md">{file.name}</p>
                            <p className="text-sm text-slate-400 mt-1">
                                {(file.size / 1024 / 1024).toFixed(2)} MB 
                                <span className="mx-2 text-slate-600">|</span> 
                                <span className="text-indigo-400">原始 16:9 拼图源文件</span>
                            </p>
                        </div>
                        <ArrowRight className="text-slate-600 hidden sm:block" />
                    </div>

                    {/* The 9 Grid */}
                    <div className="bg-slate-900/20 rounded-3xl p-8 border border-slate-800/60 shadow-inner">
                        <div className="grid grid-cols-3 gap-4 aspect-square max-w-lg mx-auto">
                            {status === AppStatus.PROCESSING 
                             ? Array.from({ length: 9 }).map((_, i) => (
                                 <div key={i} className="bg-slate-800/50 rounded-xl animate-pulse aspect-square border border-slate-700/30"></div>
                               ))
                             : images.map((img) => (
                                <div key={img.id} className="relative group aspect-square bg-slate-950 rounded-xl overflow-hidden border border-slate-800 hover:border-violet-500/50 transition-colors duration-300 shadow-lg shadow-black/20">
                                    <img 
                                        src={img.originalUrl} 
                                        alt={`Slice ${img.index}`} 
                                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                        <button 
                                            onClick={() => handleDownloadSingle(img)}
                                            className="p-3 bg-white hover:bg-violet-50 text-violet-600 rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                                            title="下载此图片"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="absolute bottom-1.5 right-1.5 bg-black/70 text-[10px] font-mono text-white/90 px-2 py-0.5 rounded-md backdrop-blur-md border border-white/10 shadow-sm">
                                        #{img.index + 1}
                                    </span>
                                </div>
                             ))
                            }
                        </div>
                    </div>
                </div>
            )}
          </div>

          {/* Sidebar Controls */}
          <div className="lg:col-span-4">
             {file ? (
                 <ControlPanel 
                    options={options}
                    setOptions={setOptions}
                    onReprocess={handleReprocess}
                    onDownloadAll={handleDownloadAll}
                    onReset={handleReset}
                    hasImages={images.length > 0}
                 />
             ) : (
                // Empty state for sidebar when no file
                <div className="bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl p-8 text-center text-slate-600 h-64 flex flex-col items-center justify-center">
                    <Settings className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">请先上传图片以启用工具箱</p>
                </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;