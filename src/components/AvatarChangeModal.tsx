import React, { useState, useRef } from 'react';
import { X, Upload, Camera, Check, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { FaviconLoader } from './FaviconLoader';

interface AvatarChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HUMAN_AVATAR_PRESETS = [
  {
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 1',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 2',
  },
  {
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 3',
  },
  {
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 4',
  },
  {
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 5',
  },
  {
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 6',
  },
  {
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 7',
  },
  {
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    label: 'Correspondent 8',
  },
];

export const AvatarChangeModal: React.FC<AvatarChangeModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateProfileSettings, showToast } = useBloggr();
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentUser.avatar);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please choose a valid image file (JPEG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Crop/center to 400x400 square for crisp profile avatar
        const size = 400;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatar(dataUrl);
          setIsProcessing(false);
          showToast('Image loaded and cropped to avatar size!');
        } else {
          setSelectedAvatar(e.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setIsProcessing(false);
        showToast('Error reading image.');
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setIsProcessing(false);
      showToast('Error uploading file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    showToast('Photo preview updated.');
  };

  const handleSave = () => {
    if (!selectedAvatar) return;
    updateProfileSettings({ avatar: selectedAvatar });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Change Profile Picture
              </h2>
              <p className="text-[11px] text-neutral-500">
                Upload your journalist photo or choose from accredited presets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Current / Selected Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="relative group">
              <img
                src={selectedAvatar}
                alt="Avatar preview"
                referrerPolicy="no-referrer"
                className="w-28 h-28 rounded-full object-cover border-4 border-orange-500/30 shadow-xl bg-neutral-100 dark:bg-neutral-800"
              />
              <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center text-white">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            </div>
            <div className="text-center">
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                @{currentUser.username}
              </span>
              <p className="text-[11px] text-neutral-400">
                Preview of how your author avatar appears across news dispatches
              </p>
            </div>
          </div>

          {/* Option 1: File Upload / Drag & Drop */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-orange-500" />
              <span>Upload from device / camera</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/webp"
              className="hidden"
              onChange={e => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20'
                  : 'border-neutral-300 dark:border-neutral-700 hover:border-orange-500/60 bg-neutral-50/50 dark:bg-neutral-800/40'
              }`}
            >
              {isProcessing ? (
                <div className="py-2">
                  <FaviconLoader size="sm" label="Optimizing Journalist Photo..." sublabel="Formatting high-res square avatar" />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1">
                  <Upload className="w-5 h-5 text-orange-500 mb-0.5" />
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Click to browse or drop photo here
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    Auto-crops to professional square avatar (JPG, PNG, WebP)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Curated Human Journalist Presets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Human Journalist Portrait Gallery</span>
            </label>

            <div className="grid grid-cols-4 gap-2.5">
              {HUMAN_AVATAR_PRESETS.map((item, idx) => {
                const isSelected = selectedAvatar === item.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(item.url)}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all group ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/30 scale-102'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={item.url}
                      alt={item.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    {isSelected && (
                      <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-orange-600 text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Option 3: Custom Web URL */}
          <form onSubmit={handleApplyCustomUrl} className="space-y-1.5">
            <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-neutral-400" />
              <span>Or paste direct photo URL</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={customUrl}
                onChange={e => setCustomUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-bold"
              >
                Apply
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-avatar-save-btn"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-500/20 transition-all"
          >
            Save Profile Picture
          </button>
        </div>
      </div>
    </div>
  );
};
