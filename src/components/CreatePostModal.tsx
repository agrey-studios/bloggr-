import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  FileText,
  Video,
  Image as ImageIcon,
  MapPin,
  Film,
  Tag,
  Eye,
  Save,
  Send,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Heading,
  Bold,
  Italic,
  Link as LinkIcon,
  Quote,
  List,
  ListOrdered,
  Table as TableIcon,
  Code,
  Minus,
  Calendar,
  Clock,
  Zap,
  Camera,
  Globe,
  Search,
} from 'lucide-react';
import { useBloggr } from '../context/BloggrContext';
import { Post, VideoItem, SubmissionStatus, NewsCategory } from '../types';

export const CreatePostModal: React.FC = () => {
  const {
    isCreatePostOpen,
    setIsCreatePostOpen,
    createPostInitialMode,
    createPost,
    addVideo,
    categoriesList,
    currentUser,
    showToast,
  } = useBloggr();

  // Mode: 'article' | 'video' | 'photo_story' | 'short_update'
  const [creationMode, setCreationMode] = useState<
    'article' | 'video' | 'photo_story' | 'short_update'
  >('article');

  // Preview toggle
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // --- Article Form Fields ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(categoriesList[0]?.name || 'Kenya');
  const [tagsInput, setTagsInput] = useState('Kenya, News, Technology');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [newAddImageUrl, setNewAddImageUrl] = useState('');
  const [embeddedVideo, setEmbeddedVideo] = useState('');
  const [location, setLocation] = useState('Nairobi, Kenya');
  const [isBreaking, setIsBreaking] = useState(false);

  // --- SEO & Scheduling Fields ---
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [showSeoSettings, setShowSeoSettings] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('Autosaved just now');

  // --- Photo Story Fields ---
  const [photoStoryItems, setPhotoStoryItems] = useState<Array<{ url: string; caption: string }>>([
    {
      url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=800&q=80',
      caption: 'Dawn over the Rift Valley escarpment as solar arrays power local agricultural communities.',
    },
  ]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  // --- Short Video Form Fields ---
  const [videoUrl, setVideoUrl] = useState('');
  const [videoThumbnail, setVideoThumbnail] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoCategory, setVideoCategory] = useState('News');
  const [videoTagsInput, setVideoTagsInput] = useState('Shorts, Viral, Kenya');

  // --- Short Update / Flash News Form Fields ---
  const [shortUpdateText, setShortUpdateText] = useState('');
  const [shortUpdateBreaking, setShortUpdateBreaking] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync mode when modal opens
  useEffect(() => {
    if (isCreatePostOpen && createPostInitialMode) {
      setCreationMode(createPostInitialMode);
    }
  }, [isCreatePostOpen, createPostInitialMode]);

  // Simulate periodic autosave indicator
  useEffect(() => {
    if (!isCreatePostOpen) return;
    const interval = setInterval(() => {
      setAutosaveStatus(`Draft autosaved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    }, 20000);
    return () => clearInterval(interval);
  }, [isCreatePostOpen, title, content, shortUpdateText]);

  if (!isCreatePostOpen) return null;

  // Medium-style formatting insertion helper
  const insertFormatting = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || defaultText;

    const replacement = `${prefix}${selected}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    setContent(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 0);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = evt => {
      const dataUrl = evt.target?.result as string;
      setFeaturedImage(dataUrl);
      showToast('Featured image loaded successfully!');
    };
    reader.readAsDataURL(file);
  };

  const handleAddAdditionalImage = () => {
    if (!newAddImageUrl.trim()) return;
    setAdditionalImages(prev => [...prev, newAddImageUrl.trim()]);
    setNewAddImageUrl('');
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPhotoStoryItem = () => {
    if (!newPhotoUrl.trim()) {
      showToast('Please provide an image URL');
      return;
    }
    setPhotoStoryItems(prev => [
      ...prev,
      { url: newPhotoUrl.trim(), caption: newPhotoCaption.trim() || 'Visual dispatch from the field' },
    ]);
    setNewPhotoUrl('');
    setNewPhotoCaption('');
  };

  const handleRemovePhotoStoryItem = (idx: number) => {
    setPhotoStoryItems(prev => prev.filter((_, i) => i !== idx));
  };

  const parseTags = (str: string): string[] => {
    return str
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
  };

  // Submit Article or Photo Story
  const handleArticleAction = (status: SubmissionStatus) => {
    if (!title.trim()) {
      showToast('Please provide a compelling headline.');
      return;
    }

    if (creationMode === 'photo_story' && photoStoryItems.length === 0) {
      showToast('Please add at least one photograph with a caption for your Photo Story.');
      return;
    }

    if (creationMode === 'article' && !content.trim()) {
      showToast('Please provide article body text.');
      return;
    }

    const tags = parseTags(tagsInput);

    const articleBody =
      creationMode === 'photo_story'
        ? content.trim() ||
          `**Photo Story Dispatch from ${location}:**\n\n` +
            photoStoryItems.map((p, i) => `![${p.caption}](${p.url})\n*Photo ${i + 1}: ${p.caption}*\n`).join('\n')
        : content.trim();

    createPost({
      title: title.trim(),
      content: articleBody,
      category: category as NewsCategory,
      categories: [category as NewsCategory],
      tags,
      flair: tags[0] || category,
      imageUrl: featuredImage.trim() || (creationMode === 'photo_story' ? photoStoryItems[0]?.url : undefined),
      thumbnail: featuredImage.trim() || (creationMode === 'photo_story' ? photoStoryItems[0]?.url : undefined),
      additionalImages:
        creationMode === 'photo_story'
          ? photoStoryItems.map(p => p.url)
          : additionalImages.length > 0
          ? additionalImages
          : undefined,
      videoUrl: embeddedVideo.trim() || undefined,
      location: location.trim() || undefined,
      isBreaking,
      submissionStatus: scheduledDate ? 'scheduled' : status,
      scheduledFor: scheduledDate || undefined,
      seoTitle: seoTitle.trim() || title.trim(),
      seoDescription: seoDescription.trim() || content.substring(0, 160),
      photoStoryCaptions: creationMode === 'photo_story' ? photoStoryItems : undefined,
    });

    showToast(
      scheduledDate
        ? `Post scheduled for publication on ${new Date(scheduledDate).toLocaleDateString()}! 📅`
        : status === 'draft'
        ? 'Draft saved to your creator notebook! 💾'
        : currentUser.isAdmin || currentUser.isCreator
        ? 'Article published live on the Bloggr wire! 🚀'
        : 'Article submitted to editorial desk for review! ✍️'
    );

    setIsCreatePostOpen(false);
  };

  // Submit Short Video
  const handleVideoAction = (status: SubmissionStatus) => {
    if (!videoTitle.trim()) {
      showToast('Please provide a video title.');
      return;
    }

    const tags = parseTags(videoTagsInput);

    addVideo({
      title: videoTitle.trim(),
      description: videoDescription.trim(),
      videoUrl:
        videoUrl.trim() ||
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail:
        videoThumbnail.trim() ||
        'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=400&q=80',
      category: videoCategory,
      tags,
      author: currentUser.username,
      authorAvatar: currentUser.avatar,
    });

    showToast(
      status === 'draft'
        ? 'Video saved to drafts! 💾'
        : 'Short video uploaded and queued for publication! 🎬'
    );
    setIsCreatePostOpen(false);
  };

  // Submit Short Update (Opera-style breaking bulletin)
  const handleShortUpdateAction = () => {
    if (!shortUpdateText.trim()) {
      showToast('Please type a brief news update');
      return;
    }

    const firstSentence = shortUpdateText.trim().split(/[.?!]/)[0] || shortUpdateText.trim().slice(0, 80);
    const tags = [category, 'Breaking', 'Flash'];

    createPost({
      title: firstSentence,
      content: shortUpdateText.trim(),
      category: category as NewsCategory,
      categories: [category as NewsCategory],
      tags,
      flair: 'FlashWire',
      isBreaking: shortUpdateBreaking,
      submissionStatus: 'published',
      location: location.trim() || 'Nairobi, Kenya',
      imageUrl: featuredImage.trim() || undefined,
      thumbnail: featuredImage.trim() || undefined,
    });

    showToast('⚡ Flash News bulletin broadcast to live ticker!');
    setIsCreatePostOpen(false);
  };

  return (
    <div
      id="create-content-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        id="create-content-modal"
        className="w-full max-w-4xl bg-white dark:bg-[#121319] rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header with Mode Switcher */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#171822]">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none py-1">
            {/* 1. Article */}
            <button
              onClick={() => {
                setCreationMode('article');
                setIsPreviewMode(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                creationMode === 'article'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Write Article</span>
            </button>

            {/* 2. Video */}
            <button
              onClick={() => {
                setCreationMode('video');
                setIsPreviewMode(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                creationMode === 'video'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Upload Video</span>
            </button>

            {/* 3. Photo Story */}
            <button
              onClick={() => {
                setCreationMode('photo_story');
                setIsPreviewMode(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                creationMode === 'photo_story'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Photo Story</span>
            </button>

            {/* 4. Short Update */}
            <button
              onClick={() => {
                setCreationMode('short_update');
                setIsPreviewMode(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                creationMode === 'short_update'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Short Update</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Preview Toggle */}
            <button
              type="button"
              onClick={() => setIsPreviewMode(prev => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                isPreviewMode
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-transparent'
                  : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
            </button>

            <button
              onClick={() => setIsCreatePostOpen(false)}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* PREVIEW MODE */}
          {isPreviewMode && (
            <div className="p-5 sm:p-7 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">
                  {category} · {location}
                </span>
                {isBreaking && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-white" />
                    <span>Breaking Alert</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
                {title || (creationMode === 'short_update' ? shortUpdateText.slice(0, 80) : 'Headline will appear here')}
              </h2>

              {featuredImage && (
                <div className="rounded-xl overflow-hidden aspect-[21/9] bg-neutral-950">
                  <img src={featuredImage} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}

              {creationMode === 'photo_story' && photoStoryItems.length > 0 && (
                <div className="space-y-4 pt-2">
                  {photoStoryItems.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-white dark:bg-neutral-900">
                      <div className="rounded-lg overflow-hidden aspect-[21/9] bg-neutral-950">
                        <img src={item.url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300 italic pt-1">
                        📸 <strong>Image {idx + 1}:</strong> {item.caption}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap leading-relaxed pt-2">
                {creationMode === 'short_update'
                  ? shortUpdateText
                  : content || 'Article body content will be rendered here...'}
              </div>
            </div>
          )}

          {/* 1. WRITE ARTICLE FORM */}
          {!isPreviewMode && creationMode === 'article' && (
            <form onSubmit={e => e.preventDefault()} className="space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Headline / Article Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => {
                    setTitle(e.target.value);
                    if (!seoTitle) setSeoTitle(e.target.value);
                  }}
                  placeholder="Enter a compelling, objective headline..."
                  className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Editorial Desk / Category *
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Location / Dateline</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. Nairobi, Kenya or Mombasa"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Featured Image */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Featured Hero Image
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload image file</span>
                  </button>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/*"
                  className="hidden"
                />
                <input
                  type="url"
                  value={featuredImage}
                  onChange={e => setFeaturedImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
                {featuredImage && (
                  <div className="relative w-40 aspect-[21/9] rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-700 mt-1">
                    <img src={featuredImage} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="absolute top-1 right-1 p-0.5 rounded bg-black/60 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* MEDIUM-STYLE FORMATTING TOOLBAR */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Article Body & Typography
                  </label>
                  <span className="text-[10px] text-neutral-400">{autosaveStatus}</span>
                </div>

                {/* Toolbar */}
                <div className="flex items-center flex-wrap gap-1 p-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
                  <button
                    type="button"
                    onClick={() => insertFormatting('## ', '\n', 'Subheading')}
                    title="Heading 2"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('**', '**', 'bold text')}
                    title="Bold"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('*', '*', 'italic text')}
                    title="Italic"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('[', '](https://example.com)', 'anchor link')}
                    title="Hyperlink"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <LinkIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('> ', '\n', 'Compelling pull quote from source')}
                    title="Quote"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-px h-4 bg-neutral-300 dark:bg-neutral-700 mx-0.5" />
                  <button
                    type="button"
                    onClick={() => insertFormatting('- ', '\n', 'Bullet point item')}
                    title="Bullet List"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('1. ', '\n', 'Numbered point item')}
                    title="Numbered List"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertFormatting(
                        '\n| Indicator | Metric |\n|---|---|\n| Growth Rate | +6.2% |\n',
                        ''
                      )
                    }
                    title="Table"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <TableIcon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('```\n', '\n```', '// Code or structured snippet')}
                    title="Code Block"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting('\n---\n')}
                    title="Content Divider"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      insertFormatting(
                        '![Photo Caption](https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600)\n*Caption: Photo credit or journalistic source*\n'
                      )
                    }
                    title="Insert Image with Caption"
                    className="p-1.5 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  rows={8}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your news dispatch, investigative piece, or analysis using Markdown headings, quotes, and bullet points..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-sans rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-orange-500 leading-relaxed font-mono"
                  required
                />
              </div>

              {/* Tags & Breaking Checkbox */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Tags (comma-separated)</span>
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={e => setTagsInput(e.target.value)}
                    placeholder="Kenya, Economy, TechSummit, Innovation"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="breaking-check-article"
                    checked={isBreaking}
                    onChange={e => setIsBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="breaking-check-article" className="text-xs font-bold text-red-600 cursor-pointer">
                    Flag as Breaking News Alert
                  </label>
                </div>
              </div>

              {/* ADVANCED SEO & SCHEDULING ACCORDION */}
              <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setShowSeoSettings(prev => !prev)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-between text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/60"
                >
                  <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-orange-500" />
                    <span>SEO Meta Title, Description & Post Scheduling</span>
                  </div>
                  <span className="text-[11px] text-neutral-400">
                    {showSeoSettings ? 'Hide Options ▲' : 'Show Options ▼'}
                  </span>
                </button>

                {showSeoSettings && (
                  <div className="p-4 bg-white dark:bg-[#151620] space-y-3.5 border-t border-neutral-200 dark:border-neutral-800 text-xs">
                    {/* Google Snippet Live Preview */}
                    <div className="p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">Google Search Result Preview</span>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-xs truncate">
                        {seoTitle || title || 'Article Title - Bloggr News & Creator Publishing'}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-500">
                        https://bloggr.media/news/{category.toLowerCase()}/{(title || 'story').toLowerCase().replace(/\s+/g, '-').slice(0, 30)}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2">
                        {seoDescription || content.slice(0, 140) || 'Comprehensive reporting and independent analysis from verified Bloggr journalists.'}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                        Custom SEO Title (Max 60 chars)
                      </label>
                      <input
                        type="text"
                        value={seoTitle}
                        onChange={e => setSeoTitle(e.target.value)}
                        placeholder="Search engine optimized headline..."
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300">
                        SEO Meta Description (Max 160 chars)
                      </label>
                      <textarea
                        rows={2}
                        value={seoDescription}
                        onChange={e => setSeoDescription(e.target.value)}
                        placeholder="Summarize the core premise of this article for search engines..."
                        className="w-full px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Schedule Publication Date & Time (Optional)</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                      />
                      {scheduledDate && (
                        <p className="text-[10px] text-orange-600 dark:text-orange-400">
                          Article will be held as Scheduled until {new Date(scheduledDate).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}

          {/* 2. PHOTO STORY MODE */}
          {!isPreviewMode && creationMode === 'photo_story' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-200">
                <strong>Photo Story Journalism:</strong> Publish a visual documentary narrative. Add high-resolution images accompanied by rich captions and photographer attributions.
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Photo Story Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Faces of the Nairobi Tech Renaissance in 8 Photographs"
                  className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  required
                />
              </div>

              {/* Photo Story Gallery Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Photographs in this Series ({photoStoryItems.length})
                  </label>
                </div>

                <div className="space-y-3">
                  {photoStoryItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row gap-3 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 items-start"
                    >
                      <div className="w-full sm:w-36 aspect-[21/9] sm:aspect-video rounded-lg overflow-hidden bg-neutral-950 flex-shrink-0">
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase text-neutral-400">Photo {idx + 1} Caption</span>
                        <p className="text-xs text-neutral-800 dark:text-neutral-200">{item.caption}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhotoStoryItem(idx)}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Photo Item Card */}
                <div className="p-3.5 rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900/40 space-y-2">
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Add Next Photo to Gallery
                  </span>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={e => setNewPhotoUrl(e.target.value)}
                    placeholder="Photo image URL (https://...)"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  />
                  <input
                    type="text"
                    value={newPhotoCaption}
                    onChange={e => setNewPhotoCaption(e.target.value)}
                    placeholder="Caption, scene context & credit..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhotoStoryItem}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    + Append Photograph
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 3. SHORT UPDATE MODE (Opera-style Flash News) */}
          {!isPreviewMode && creationMode === 'short_update' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-900 dark:text-amber-200">
                <strong>⚡ Opera-Style Flash Update:</strong> Broadcast concise, instant news alerts to the Live Wire ticker. Best for breaking developments, sports scores, and quick quotes.
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Flash Update Text *
                  </label>
                  <span
                    className={`text-[10px] font-mono ${
                      shortUpdateText.length > 280 ? 'text-red-500 font-bold' : 'text-neutral-400'
                    }`}
                  >
                    {shortUpdateText.length} / 280 chars
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={shortUpdateText}
                  onChange={e => setShortUpdateText(e.target.value)}
                  placeholder="BREAKING: Central Bank announces new monetary stance as Treasury releases quarterly outlook..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-amber-500"
                  maxLength={320}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Category Desk
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="breaking-check-flash"
                    checked={shortUpdateBreaking}
                    onChange={e => setShortUpdateBreaking(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="breaking-check-flash" className="text-xs font-bold text-red-600 cursor-pointer">
                    Flag as Urgent Breaking News
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 4. VIDEO MODE */}
          {!isPreviewMode && creationMode === 'video' && (
            <form onSubmit={e => e.preventDefault()} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={videoTitle}
                  onChange={e => setVideoTitle(e.target.value)}
                  placeholder="Enter a catchy video headline..."
                  className="w-full px-3.5 py-2 text-sm font-semibold rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Category Desk
                  </label>
                  <select
                    value={videoCategory}
                    onChange={e => setVideoCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={videoTagsInput}
                    onChange={e => setVideoTagsInput(e.target.value)}
                    placeholder="Shorts, Kenya, Viral, Analysis"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Video URL (Vertical / Short-form MP4)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={e => setVideoUrl(e.target.value)}
                  placeholder="https://...mp4 or CDN video clip link"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={videoThumbnail}
                  onChange={e => setVideoThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={videoDescription}
                  onChange={e => setVideoDescription(e.target.value)}
                  placeholder="Describe your video clip..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-100/80 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer with Workflow Action Buttons (Save Draft | Preview | Submit / Publish) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#171822]">
          <span className="text-[11px] text-neutral-500">
            Author: <strong>@{currentUser.username}</strong> ({currentUser.isAdmin ? 'Super Admin' : currentUser.isCreator ? 'Verified Creator' : 'Author'})
          </span>

          <div className="flex items-center gap-2">
            {/* RESET / CLEAR */}
            <button
              type="button"
              onClick={() => {
                setTitle('');
                setContent('');
                setShortUpdateText('');
                setFeaturedImage('');
                showToast('Form cleared');
              }}
              title="Reset Form"
              className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* SAVE DRAFT */}
            {creationMode !== 'short_update' && (
              <button
                type="button"
                onClick={() => {
                  if (creationMode === 'video') {
                    handleVideoAction('draft');
                  } else {
                    handleArticleAction('draft');
                  }
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>
            )}

            {/* PUBLISH / SUBMIT */}
            <button
              type="button"
              onClick={() => {
                if (creationMode === 'short_update') {
                  handleShortUpdateAction();
                } else if (creationMode === 'video') {
                  handleVideoAction('published');
                } else {
                  handleArticleAction(
                    currentUser.isAdmin || currentUser.isCreator ? 'published' : 'submitted'
                  );
                }
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-sm shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {creationMode === 'short_update'
                  ? 'Broadcast Flash News'
                  : currentUser.isAdmin || currentUser.isCreator
                  ? 'Publish Dispatch'
                  : 'Submit for Review'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
