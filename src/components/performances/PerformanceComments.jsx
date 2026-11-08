import { useMemo, useState } from 'react';
import { MessageSquare, Pencil, Reply, Trash2 } from 'lucide-react';
import { usePrototypeStore } from '@/stores/prototypeStore';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import SectionHeader from '@/components/patterns/SectionHeader';

const stamp = (iso) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

/**
 * Comments belong to one performance. They never expose the score or the
 * practice history behind it, and they are off when the owner says so.
 */
export default function PerformanceComments({ performance }) {
  const all = usePrototypeStore((s) => s.performanceComments) || [];
  const addComment = usePrototypeStore((s) => s.addPerformanceComment);
  const updateComment = usePrototypeStore((s) => s.updatePerformanceComment);
  const deleteComment = usePrototypeStore((s) => s.deletePerformanceComment);

  const [draft, setDraft] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState('');

  const isOwner = performance.ownerId === 'you';
  const canComment = performance.allowComments !== false
    && (isOwner || (performance.sharedCommenters || []).includes('you'));

  const comments = useMemo(
    () => all.filter((c) => c.performanceId === performance.id).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [all, performance.id]
  );
  const threads = comments.filter((c) => !c.parentId);
  const repliesTo = (id) => comments.filter((c) => c.parentId === id);

  const submit = () => {
    if (!draft.trim()) return;
    addComment({ performanceId: performance.id, body: draft });
    setDraft('');
  };

  const submitReply = (parentId) => {
    if (!replyDraft.trim()) return;
    addComment({ performanceId: performance.id, body: replyDraft, parentId });
    setReplyDraft('');
    setReplyTo(null);
  };

  const saveEdit = (id) => {
    if (!editDraft.trim()) return;
    updateComment(id, editDraft);
    setEditingId(null);
    setEditDraft('');
  };

  const CommentBody = ({ comment, isReply }) => {
    const mine = comment.authorId === 'you';
    return (
      <div className={isReply ? 'mt-3 border-l border-line-subtle pl-4' : ''}>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="type-body-small font-medium text-ink-primary">{comment.authorName}</span>
          <span className="type-metadata text-ink-tertiary">{stamp(comment.createdAt)}{comment.editedAt ? ' · edited' : ''}</span>
        </div>

        {editingId === comment.id ? (
          <div className="mt-2">
            <Textarea value={editDraft} onChange={(e) => setEditDraft(e.target.value)} rows={2} aria-label="Edit comment" />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => saveEdit(comment.id)}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditDraft(''); }}>Cancel</Button>
            </div>
          </div>
        ) : (
          <p className="mt-1 type-body-small text-ink-secondary">{comment.body}</p>
        )}

        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          {canComment && !isReply && (
            <button
              type="button"
              onClick={() => { setReplyTo(replyTo === comment.id ? null : comment.id); setReplyDraft(''); }}
              className="flex items-center gap-1 type-metadata text-ink-tertiary hover:text-ink-primary"
            >
              <Reply className="h-3 w-3" /> Reply
            </button>
          )}
          {mine && editingId !== comment.id && (
            <>
              <button
                type="button"
                onClick={() => { setEditingId(comment.id); setEditDraft(comment.body); }}
                className="flex items-center gap-1 type-metadata text-ink-tertiary hover:text-ink-primary"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
              <button
                type="button"
                onClick={() => deleteComment(comment.id)}
                className="flex items-center gap-1 type-metadata text-ink-tertiary hover:text-danger"
              >
                <Trash2 className="h-3 w-3" /> Delete
              </button>
            </>
          )}
          {!mine && isOwner && (
            <button
              type="button"
              onClick={() => deleteComment(comment.id)}
              className="flex items-center gap-1 type-metadata text-ink-tertiary hover:text-danger"
            >
              <Trash2 className="h-3 w-3" /> Remove
            </button>
          )}
        </div>

        {replyTo === comment.id && (
          <div className="mt-2">
            <Textarea
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              rows={2}
              placeholder="Write a reply…"
              aria-label="Write a reply"
            />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => submitReply(comment.id)} disabled={!replyDraft.trim()}>Reply</Button>
              <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Cancel</Button>
            </div>
          </div>
        )}

        {repliesTo(comment.id).map((reply) => <CommentBody key={reply.id} comment={reply} isReply />)}
      </div>
    );
  };

  return (
    <section>
      <SectionHeader title="Comments" />

      {!canComment && (
        <p className="mt-2 type-body-small text-ink-secondary">
          {performance.allowComments === false
            ? 'Comments are turned off for this performance.'
            : 'You can watch this performance, but comments are not open to you.'}
        </p>
      )}

      {comments.length === 0 && canComment && (
        <p className="mt-2 flex items-center gap-2 type-body-small text-ink-tertiary">
          <MessageSquare className="h-4 w-4" /> No comments yet.
        </p>
      )}

      {threads.length > 0 && (
        <div className="mt-4 divide-y divide-line-subtle">
          {threads.map((comment) => (
            <div key={comment.id} className="py-4 first:pt-0">
              <CommentBody comment={comment} isReply={false} />
            </div>
          ))}
        </div>
      )}

      {canComment && (
        <div className="mt-4">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={2}
            placeholder="Leave a comment about this performance…"
            aria-label="Write a comment"
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="type-metadata text-ink-tertiary">Comments stay with this performance — the score is not shared.</p>
            <Button size="sm" onClick={submit} disabled={!draft.trim()}>Post comment</Button>
          </div>
        </div>
      )}
    </section>
  );
}