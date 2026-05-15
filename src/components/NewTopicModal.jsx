import { useState } from 'react';
import { Paperclip, X } from 'lucide-react';
import api from '../services/api';

const categories = [
  { key: 'genel', label: 'Genel' },
  { key: 'ders', label: 'Ders & Sınav' },
  { key: 'kampus', label: 'Kampüs' },
  { key: 'kariyer', label: 'Kariyer' },
  { key: 'yurt', label: 'Yurt' },
];

export default function NewTopicModal({ onClose, onCreated }) {
  const [category, setCategory] = useState('genel');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    if (selected.length > 5) {
      setError('En fazla 5 dosya ekleyebilirsiniz.');
      return;
    }
    setFiles(selected);
    setError(null);
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || saving) return;
    setSaving(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('category', category);
      formData.append('title', title.trim());
      formData.append('content', content.trim());
      files.forEach((f) => formData.append('attachments', f));
      await api.post('/forum/topics', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onCreated();
    } catch (err) {
      setError(err?.response?.data?.message || 'Konu oluşturulamadı.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
          <h2 className="text-base font-semibold text-stone-900">Yeni Konu</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-3">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setCategory(cat.key)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                    category === cat.key
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'border-stone-300 text-stone-600 hover:border-stone-500 hover:text-stone-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="nt-title"
              className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2"
            >
              Başlık
            </label>
            <input
              id="nt-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Konunun başlığını yazın"
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition"
            />
          </div>

          {/* Content */}
          <div>
            <label
              htmlFor="nt-content"
              className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2"
            >
              İçerik
            </label>
            <textarea
              id="nt-content"
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Konunuzu buraya yazın..."
              className="w-full px-4 py-3 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition resize-none"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-xs font-medium tracking-[0.12em] uppercase text-stone-500 mb-2">
              Ekler
              <span className="normal-case tracking-normal text-stone-400 ml-1">(opsiyonel)</span>
            </label>
            <label className="cursor-pointer block">
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                className="hidden"
                onChange={handleFiles}
              />
              <div className="border-2 border-dashed border-stone-200 rounded-xl p-5 flex flex-col items-center gap-2 text-stone-400 hover:border-stone-400 hover:text-stone-500 transition-colors">
                <Paperclip className="w-5 h-5" />
                <span className="text-sm">Dosya eklemek için tıklayın</span>
                <span className="text-xs">JPG, PNG, PDF, DOC — en fazla 5 dosya, 10 MB</span>
              </div>
            </label>

            {files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 bg-stone-100 rounded-lg px-3 py-1.5"
                  >
                    <span className="text-xs text-stone-600 max-w-[8rem] truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="text-stone-400 hover:text-stone-700 transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!title.trim() || !content.trim() || saving}
              className="px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Paylaşılıyor…' : 'Paylaş'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 border border-stone-300 rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
