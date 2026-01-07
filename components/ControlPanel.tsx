import React from 'react';
import { Settings, Download, RefreshCw, Trash2 } from 'lucide-react';
import { ProcessingOptions } from '../types';

interface ControlPanelProps {
  options: ProcessingOptions;
  setOptions: (options: ProcessingOptions) => void;
  onReprocess: () => void;
  onDownloadAll: () => void;
  onReset: () => void;
  hasImages: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  options,
  setOptions,
  onReprocess,
  onDownloadAll,
  onReset,
  hasImages
}) => {
  
  const handleToggleBorder = () => {
    setOptions({ ...options, removeBlackBorders: !options.removeBlackBorders });
  };

  const handleSensitivityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, sensitivity: parseInt(e.target.value, 10) });
  };

  return (
    <div className="bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl rounded-2xl p-6 h-fit sticky top-24 shadow-2xl shadow-black/20">
      <div className="flex items-center gap-2 mb-6 text-violet-400">
        <Settings className="w-5 h-5" />
        <h2 className="font-bold text-lg tracking-wide">设置选项</h2>
      </div>

      <div className="space-y-8">
        {/* Toggle Black Border Removal */}
        <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer group select-none">
              <div className="flex flex-col">
                <span className="text-slate-200 font-medium group-hover:text-white transition-colors">智能去黑边</span>
                <span className="text-[10px] text-slate-500 mt-1">自动识别并裁切画面中的黑边</span>
              </div>
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={options.removeBlackBorders}
                  onChange={handleToggleBorder}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600 shadow-inner"></div>
              </div>
            </label>
        </div>

        {/* Sensitivity Slider (Only if Smart Crop is on) */}
        {options.removeBlackBorders && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-400">黑色阈值灵敏度</span>
              <span className="text-violet-300 font-mono">{options.sensitivity}</span>
            </div>
            <input
              type="range"
              min="0"
              max="60"
              value={options.sensitivity}
              onChange={handleSensitivityChange}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 hover:accent-violet-400"
            />
          </div>
        )}
        
        {/* Actions */}
        <div className="pt-6 border-t border-slate-700/50 space-y-3">
          <button
            onClick={onReprocess}
            disabled={!hasImages}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white py-3 rounded-xl font-medium transition-all duration-200 border border-slate-700 hover:border-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-4 h-4" />
            应用并重新处理
          </button>
          
          <button
            onClick={onDownloadAll}
            disabled={!hasImages}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <Download className="w-4 h-4" />
            下载全部图片 (ZIP)
          </button>

           <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 py-2.5 rounded-xl font-medium transition-colors mt-2 text-sm"
          >
            <Trash2 className="w-4 h-4" />
            清空重置
          </button>
        </div>
      </div>
    </div>
  );
};

export default ControlPanel;