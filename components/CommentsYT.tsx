'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import {
  ThumbsUp,
  MessageSquare,
  Loader2,
  Send,
  Reply as ReplyIcon,
  Link,
} from 'lucide-react'
import { useYouTubeAuth } from '@/context/YouTubeAuthContext'
import { postComment, replyToComment } from '@/lib/youtube/client'
import { cn } from '@/utilities/ui'
import { Button } from './ui/button'
import { Input } from './ui/input'

const commentDateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

interface CommentSnippet {
  textDisplay: string
  textOriginal: string
  authorDisplayName: string
  authorProfileImageUrl: string
  authorChannelUrl: string
  likeCount: number
  publishedAt: string
  updatedAt: string
}

interface Comment {
  id: string
  snippet: CommentSnippet
}

interface CommentThread {
  id: string
  snippet: {
    topLevelComment: Comment
    totalReplyCount: number
    canReply: boolean
    videoId: string
  }
  replies?: {
    comments: Comment[]
  }
}

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

export default function CommentsYT({ videoId }: { videoId: string }) {
  const { ensureToken, profile, source } = useYouTubeAuth()

  const [comments, setComments] = useState<CommentThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState<string | null>(null)

  // --- 1. Fetch Comments ---
  const fetchComments = useCallback(
    async (pageToken = '') => {
      if (!API_KEY) return
      try {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&key=${API_KEY}&maxResults=20&order=relevance&textFormat=plainText&pageToken=${pageToken}`,
        )
        if (!res.ok) {
          const errorData = await res.json()
          if (errorData?.error?.errors?.[0]?.reason === 'commentsDisabled') {
            setCommentsDisabled(true)
          }
          return
        }

        const data = await res.json()

        if (data.items) {
          setComments((prev) =>
            pageToken ? [...prev, ...data.items] : data.items,
          )
          setNextPageToken(data.nextPageToken || null)
        }
      } catch (err) {
        console.error('Failed to fetch comments', err)
      } finally {
        setIsLoading(false)
      }
    },
    [videoId],
  )

  useEffect(() => {
    setComments([])
    setCommentsDisabled(false)
    setIsLoading(true)
    fetchComments()
  }, [fetchComments])

  // --- 2. Posting ---
  const handlePostComment = async () => {
    if (!newComment.trim()) return
    setIsPosting(true)
    setError(null)

    try {
      const token = await ensureToken({ interactive: true })
      if (!token) {
        setIsPosting(false)
        return
      }
      const savedComment = await postComment(videoId, newComment, token)
      setNewComment('')
      setComments((prev) => [savedComment, ...prev])
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to post comment'
      setError(message)
    } finally {
      setIsPosting(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim()) return
    setError(null)

    try {
      const token = await ensureToken({ interactive: true })
      if (!token) return
      const newReply = await replyToComment(parentId, replyText, token)
      setComments((prev) =>
        prev.map((thread) => {
          if (thread.id === parentId) {
            const existingReplies = thread.replies?.comments || []
            return {
              ...thread,
              replies: {
                ...thread.replies,
                comments: [...existingReplies, newReply],
              },
            }
          }
          return thread
        }),
      )
      setReplyingToId(null)
      setReplyText('')
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to post reply'
      setError(message)
    }
  }

  // --- 3. Render Helpers ---
  const formatDate = (dateStr: string) => {
    return commentDateFormatter.format(new Date(dateStr))
  }

  const CommentItem = ({
    commentId,
    snippet,
    isReply = false,
  }: {
    commentId: string
    snippet: CommentSnippet
    isReply?: boolean
  }) => (
    <div className={cn('flex gap-3', isReply ? 'mt-3 ml-10' : 'mt-6')}>
      <div className="shrink-0">
        <Image
          src={snippet.authorProfileImageUrl}
          alt={snippet.authorDisplayName}
          width={isReply ? 32 : 40}
          height={isReply ? 32 : 40}
          className="rounded-full"
        />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-bold text-foreground">
            {snippet.authorDisplayName}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(snippet.publishedAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
          {snippet.textDisplay}
        </p>
        <div className="flex items-center gap-2 pb-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <ThumbsUp size={12} />
            <span>{snippet.likeCount > 0 ? snippet.likeCount : ''}</span>
          </div>
          {!isReply && (
            <Button
              onClick={() => {
                setReplyingToId(replyingToId === commentId ? null : commentId)
                setReplyText('')
              }}
              variant="link"
              size="sm"
              className="flex items-center gap-1 p-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ReplyIcon size={12} /> Reply
            </Button>
          )}
        </div>
        {replyingToId === commentId && (
          <div className="mt-3 flex gap-2">
            <Input
              autoFocus
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="flex-1 rounded-[3px] border-t-0 border-r-0 border-b border-border bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-none focus:bg-input"
            />
            <Button
              onClick={() => handleReplySubmit(commentId)}
              disabled={!replyText.trim()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs font-bold uppercase"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  // Placeholder shown inside the composer when the user hasn't authenticated
  // with YouTube yet. Clicking Send triggers the GIS popup.
  const signInHintForPost = profile
    ? `Commenting as ${profile.displayName}`
    : 'Click Send — you’ll sign in to YouTube in a popup.'

  return (
    <section className="mx-auto w-full px-3">
      <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
        <h3 className="flex items-center gap-2 font-heading text-xl tracking-wider text-foreground uppercase">
          <MessageSquare size={20} className="text-primary" />
          Comms Channel
        </h3>
        {/* {!commentsDisabled && source !== 'server' && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="flex items-center gap-2 border-accent bg-accent/10 text-xs tracking-wider text-accent/50 hover:border-primary"
            title="Save your YouTube connection to this account so you don't get prompted again"
          >
            <Link href="/api/auth/youtube/connect?returnTo=/account">
              <span className="text-xs tracking-wider text-accent/50 hover:text-primary">
                Stay signed in
              </span>
            </Link>
          </Button>
        )} */}
      </div>

      {/* Post Box */}
      {!commentsDisabled && (
        <div className="mb-2 flex gap-3">
          <div className="flex flex-1 gap-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts with the community on YouTube"
              className="flex-1 border-x-0 border-t-0 border-b border-border bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-none focus:bg-input"
            />
            <Button
              onClick={handlePostComment}
              disabled={!newComment.trim() || isPosting}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-xs font-bold uppercase"
            >
              {isPosting ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}{' '}
              Send
            </Button>
          </div>
        </div>
      )}
      {!commentsDisabled && (
        <p className="mb-8 pl-1 text-[11px] text-muted-foreground">
          {signInHintForPost}
        </p>
      )}
      {error && <p className="mb-4 text-xs text-destructive">{error}</p>}

      {/* List */}
      {commentsDisabled ? (
        <div className="flex justify-center rounded bg-background py-8 text-center font-mono text-muted-foreground italic">
          Hailing frequencies closed.
          <br />
          (YouTube disables comments for audio only releases.)
        </div>
      ) : isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center space-y-3 py-12 text-center opacity-60">
          <MessageSquare size={32} className="text-muted-foreground" />
          <p className="font-mono text-sm text-muted-foreground">
            No signals detected on this frequency.
            <br />
            Be the first to transmit.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {comments.map((thread) => (
            <div key={thread.id}>
              <CommentItem
                commentId={thread.snippet.topLevelComment.id}
                snippet={thread.snippet.topLevelComment.snippet}
              />
              {thread.replies?.comments && (
                <div>
                  {thread.replies.comments.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      commentId={reply.id}
                      snippet={reply.snippet}
                      isReply
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {nextPageToken && (
        <Button
          onClick={() => fetchComments(nextPageToken)}
          variant="outline"
          size="lg"
          className="mt-8 w-full rounded-lg border border-border py-2 text-xs tracking-widest text-muted-foreground uppercase transition-all hover:border-border/20 hover:text-foreground"
        >
          Load More Transmissions
        </Button>
      )}
    </section>
  )
}
