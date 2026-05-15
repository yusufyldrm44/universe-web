import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Heart, Image, Trash2 } from 'lucide-react';
import { deleteTopic, getTopicDetail, likeTopic, replyTopic } from '../services/forumService';
import { useAuthStore } from '../services/authStore';

const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');

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

function parseAttachments(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-5 animate-pulse">
      <div className="h-4 w-28 bg-stone-200 rounded" />
      <div className="h-3 w-16 bg-stone-200 rounded" />
      <div className="h-9 w-2/3 bg-stone-200 rounded" />
      <div className="h-3 w-1/2 bg-stone-200 rounded" />
      <div className="h-48 bg-stone-200 rounded-xl mt-6" />
    </div>
  );
}

export default function ForumTopicPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const lastLoadedId = useRef(null);

  useEffect(() => {
    if (lastLoadedId.current === id) return;
    lastLoadedId.current = id;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getTopicDetail(id);
        const t = data.topic ?? data;
        setTopic(t);
        setLiked(t.is_liked ?? false);
        setLikeCount(parseInt(t.like_count) || 0);
        setReplies(Array.isArray(data.replies) ? data.replies : []);
      } catch {
        setError('Konu yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((prev) => (wasLiked ? Math.max(prev - 1, 0) : prev + 1));
    try {
      const result = await likeTopic(id);
      const nowLiked = result.liked ?? !wasLiked;
      setLiked(nowLiked);
      setTopic((prev) => ({
        ...prev,
        like_count: nowLiked
          ? (parseInt(prev.like_count) || 0) + 1
          : Math.max((parseInt(prev.like_count) || 0) - 1, 0),
        is_liked: nowLiked,
      }));
      setLikeCount((prev) => {
        if (nowLiked === !wasLiked) return prev;
        return nowLiked ? prev + 1 : Math.max(prev - 1, 0);
      });
    } catch {
      setLiked(wasLiked);
      setLikeCount((prev) => (wasLiked ? prev + 1 : Math.max(prev - 1, 0)));
    } finally {
      setLiking(false);
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    const content = replyContent.trim();
    if (!content || replying) return;
    setReplying(true);
    try {
      const data = await replyTopic(id, content);
      const newReply = data.reply ?? data;
      setReplies((prev) => [
        ...prev,
        {
          ...newReply,
          full_name: newReply.full_name ?? user?.full_name,
          university: newReply.university ?? user?.university,
          created_at: newReply.created_at ?? new Date().toISOString(),
        },
      ]);
      setReplyContent('');
    } catch {
      // silent
    } finally {
      setReplying(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bu konuyu silmek istediğinizden emin misiniz?')) return;
    setDeleting(true);
    try {
      await deleteTopic(id);
      navigate('/forum');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  if (error || !topic) {
    return (
      <div className="max-w-4xl mx-auto py-10">
        <Link
          to="/forum"
          className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Foruma dön
        </Link>
        <p className="text-stone-500">{error || 'Konu bulunamadı.'}</p>
      </div>
    );
  }

  const isOwner = Number(topic.user_id) === Number(user?.id);
  const attachments = parseAttachments(topic.attachments);
  const imageAttachments = attachments.filter((a) => a.mimetype?.startsWith('image/'));
  const docAttachments = attachments.filter((a) => !a.mimetype?.startsWith('image/'));
  const fileTypeLabel = (att) => {
    const m = att.mimetype || '';
    if (m === 'application/pdf') return 'PDF';
    if (m.includes('word') || (att.name || '').match(/\.docx?$/i)) return 'DOC';
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/forum"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Foruma dön
      </Link>

      {/* Category + title */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span
            className={`text-[10px] font-medium px-2.5 py-1 rounded uppercase tracking-wide ${
              categoryColors[topic.category] || 'bg-stone-100 text-stone-700'
            }`}
          >
            {categoryLabels[topic.category] || topic.category}
          </span>
          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Sil
            </button>
          )}
        </div>

        <h1 className="font-serif font-normal text-stone-900 text-4xl leading-tight tracking-tight">
          {topic.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-stone-500 flex-wrap">
          <span className="w-7 h-7 rounded-full bg-stone-900 text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
            {initialsOf(topic.full_name)}
          </span>
          <span className="font-medium text-stone-700">{topic.full_name || 'Kullanıcı'}</span>
          {topic.university && (
            <>
              <span className="text-stone-300">·</span>
              <span>{topic.university}</span>
            </>
          )}
          <span className="text-stone-300">·</span>
          <span>{fmtDate(topic.created_at)}</span>
          <span className="text-stone-300">·</span>
          <span>{parseInt(topic.view_count) || 0} görüntüleme</span>
        </div>
      </div>

      {/* Content */}
      <div className="mt-8 bg-white border border-stone-200 rounded-xl p-8">
        <p className="text-stone-900 text-sm leading-relaxed whitespace-pre-wrap">
          {topic.content}
        </p>

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-stone-200">
            <p className="text-xs uppercase tracking-wider text-stone-400 mb-3">Ekler</p>
            {docAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {docAttachments.map((att, i) => (
                  <a
                    key={i}
                    href={`${BASE_URL}/${att.path}`}
                    download={att.name}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 hover:bg-stone-100 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-stone-500" />
                    <span className="text-sm text-stone-600 max-w-[12rem] truncate">{att.name}</span>
                    {fileTypeLabel(att) && (
                      <span className="text-xs text-stone-400 ml-auto pl-2">{fileTypeLabel(att)}</span>
                    )}
                  </a>
                ))}
              </div>
            )}
            {imageAttachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-3">
                {imageAttachments.map((att, i) => (
                  <img
                    key={i}
                    src={`${BASE_URL}/${att.path}`}
                    alt={att.name}
                    className="max-w-lg rounded-xl border border-stone-200"
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Like */}
        <div className="mt-8 pt-6 border-t border-stone-100">
          <button
            type="button"
            onClick={handleLike}
            disabled={liking}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors disabled:opacity-50 ${
              liked
                ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                : 'bg-stone-50 border-stone-200 text-stone-500 hover:bg-stone-100 hover:text-stone-700'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-red-500 stroke-red-500' : ''}`} />
            {likeCount} beğeni
          </button>
        </div>
      </div>

      {/* Replies */}
      <div className="mt-12">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">
          Yorumlar ({replies.length})
        </h2>
        <div className="border-t border-stone-200 mt-4">
          {replies.length === 0 ? (
            <p className="py-10 text-sm text-stone-400 text-center">
              Henüz yorum yok. İlk yorumu siz yapın.
            </p>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="py-5 border-b border-stone-100">
                <div className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-stone-900 text-white text-[10px] font-semibold flex items-center justify-center flex-shrink-0">
                    {initialsOf(reply.full_name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900">
                          {reply.full_name || 'Kullanıcı'}
                        </span>
                        {reply.university && (
                          <span className="text-xs text-stone-400">{reply.university}</span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400">{fmtDate(reply.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {reply.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reply form */}
      <div className="mt-10 pb-10">
        <h3 className="text-sm font-semibold text-stone-900 mb-3">Yorum Yap</h3>
        <form onSubmit={handleReply} className="space-y-3">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            rows={4}
            placeholder="Yorumunuzu yazın..."
            className="w-full px-4 py-3 border border-stone-300 rounded-xl text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-600 focus:ring-2 focus:ring-stone-200 transition resize-none"
          />
          <button
            type="submit"
            disabled={!replyContent.trim() || replying}
            className="px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {replying ? 'Gönderiliyor…' : 'Yorum Yap'}
          </button>
        </form>
      </div>
    </div>
  );
}
