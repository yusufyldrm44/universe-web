import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pin } from 'lucide-react';
import { getTopics } from '../services/forumService';
import NewTopicModal from '../components/NewTopicModal';

const categories = [
  { key: null, label: 'Tümü' },
  { key: 'genel', label: 'Genel' },
  { key: 'ders', label: 'Ders & Sınav' },
  { key: 'kampus', label: 'Kampüs' },
  { key: 'kariyer', label: 'Kariyer' },
  { key: 'yurt', label: 'Yurt' },
];

const categoryColors = {
  genel: 'bg-stone-100 text-stone-700',
  ders: 'bg-blue-50 text-blue-700',
  kampus: 'bg-green-50 text-green-700',
  kariyer: 'bg-purple-50 text-purple-700',
  yurt: 'bg-orange-50 text-orange-700',
};

const categoryLabels = {
  genel: 'Genel',
  ders: 'Ders & Sınav',
  kampus: 'Kampüs',
  kariyer: 'Kariyer',
  yurt: 'Yurt',
};

const initialsOf = (name) =>
  (name || '').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('') || 'U';

function fmtDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function TopicSkeleton() {
  return (
    <div className="py-5 border-b border-stone-100 animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2.5">
          <div className="h-3 w-16 bg-stone-200 rounded" />
          <div className="h-4 w-3/4 bg-stone-200 rounded" />
          <div className="h-3 w-1/2 bg-stone-200 rounded" />
          <div className="h-3 w-40 bg-stone-200 rounded" />
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="h-3 w-14 bg-stone-200 rounded" />
          <div className="h-3 w-14 bg-stone-200 rounded" />
          <div className="h-3 w-14 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

function TopicRow({ topic }) {
  return (
    <Link
      to={`/forum/${topic.id}`}
      className="flex items-start justify-between gap-6 py-5 border-b border-stone-100 hover:bg-stone-50 transition-colors group"
    >
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wide ${
              categoryColors[topic.category] || 'bg-stone-100 text-stone-700'
            }`}
          >
            {categoryLabels[topic.category] || topic.category}
          </span>
          {topic.is_pinned && (
            <Pin className="w-3 h-3 text-stone-400 rotate-45" />
          )}
        </div>

        <p className="text-sm font-semibold text-stone-900 group-hover:underline underline-offset-2 leading-snug">
          {topic.title}
        </p>

        {topic.content && (
          <p className="text-[13px] text-stone-500 leading-relaxed">
            {topic.content.length > 100 ? `${topic.content.slice(0, 100)}…` : topic.content}
          </p>
        )}

        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
          <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
            {initialsOf(topic.full_name)}
          </span>
          <span className="text-xs font-medium text-stone-600">{topic.full_name || 'Kullanıcı'}</span>
          {topic.university && (
            <>
              <span className="text-stone-300 text-xs">·</span>
              <span className="text-xs text-stone-400">{topic.university}</span>
            </>
          )}
          <span className="text-stone-300 text-xs">·</span>
          <span className="text-xs text-stone-400">{fmtDate(topic.created_at)}</span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 text-xs text-stone-400 shrink-0 pt-1">
        <span>{parseInt(topic.reply_count) || 0} yorum</span>
        <span>{parseInt(topic.like_count) || 0} beğeni</span>
        <span>{parseInt(topic.view_count) || 0} görüntüleme</span>
      </div>
    </Link>
  );
}

export default function ForumPage() {
  const [activeCategory, setActiveCategory] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewTopic, setShowNewTopic] = useState(false);

  const fetchTopics = async (category) => {
    setLoading(true);
    try {
      const data = await getTopics(category);
      const arr = Array.isArray(data) ? data : [];
      arr.sort((a, b) => (b.is_pinned ? 1 : 0) - (a.is_pinned ? 1 : 0));
      setTopics(arr);
    } catch {
      setTopics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics(activeCategory);
  }, [activeCategory]);

  return (
    <div className="text-stone-900">
      <header className="pb-10 lg:pb-12 border-b border-stone-200">
        <p className="text-[11px] tracking-[0.22em] text-stone-500 font-medium">FORUM</p>
        <h1 className="mt-8 font-serif font-normal text-stone-900 text-5xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight">
          Kampüs forumu.
        </h1>
        <p className="mt-5 font-serif italic text-stone-500 text-lg md:text-xl">
          Sorular, tartışmalar, deneyimler.
        </p>
      </header>

      <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 flex-wrap">
          {categories.map((cat) => (
            <button
              key={String(cat.key)}
              type="button"
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                activeCategory === cat.key
                  ? 'border-stone-900 text-stone-900'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setShowNewTopic(true)}
          className="px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 transition-colors"
        >
          + Yeni Konu
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => <TopicSkeleton key={i} />)
        ) : topics.length === 0 ? (
          <div className="py-20 text-center text-stone-400 text-sm">
            Bu kategoride henüz konu yok.
          </div>
        ) : (
          topics.map((topic) => <TopicRow key={topic.id} topic={topic} />)
        )}
      </div>

      {showNewTopic && (
        <NewTopicModal
          onClose={() => setShowNewTopic(false)}
          onCreated={() => {
            setShowNewTopic(false);
            fetchTopics(activeCategory);
          }}
        />
      )}
    </div>
  );
}
