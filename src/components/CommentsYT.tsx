'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { ThumbsUp, MessageSquare, Loader2, LogIn, Send, Reply as ReplyIcon } from 'lucide-react'
import { postCommentAction, replyToCommentAction } from '@/actions/youtube'
import { cn } from '@/utilities/ui'
import { Button } from './ui/button'
import { Input } from './ui/input'

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
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function CommentsYT({ videoId }: { videoId: string }) {
  const [comments, setComments] = useState<CommentThread[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [nextPageToken, setNextPageToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [tokenClient, setTokenClient] = useState<any>(null)
  const [newComment, setNewComment] = useState('')
  const [isPosting, setIsPosting] = useState(false)
  const [commentsDisabled, setCommentsDisabled] = useState(false)
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

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
          setComments((prev) => (pageToken ? [...prev, ...data.items] : data.items))
          setNextPageToken(data.nextPageToken || null)
        }
      } catch (error) {
        console.error('Failed to fetch comments', error)
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

  // --- 2. Auth & Posting (Google Identity Services) ---
  // Note: Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env
  const fetchProfile = useCallback(async (accessToken: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true&key=${API_KEY}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      )
      if (!res.ok) throw new Error('Token invalid')
      const data = await res.json()
      if (data.items?.[0]) {
        const snippet = data.items[0].snippet
        setUser({
          displayName: snippet.title,
          profileImageUrl: snippet.thumbnails?.default?.url,
          accessToken, // Store token for posting
        })
        localStorage.setItem('yt_access_token', accessToken)
      }
    } catch (e) {
      console.error('Failed to fetch user profile', e)
      localStorage.removeItem('yt_access_token')
      setUser(null)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('yt_access_token')
    if (token) {
      fetchProfile(token)
    }
  }, [fetchProfile])

  const handleGsiLoad = useCallback(() => {
    if (!CLIENT_ID || typeof window === 'undefined' || !(window as any).google) return

    const client = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/youtube.force-ssl',
      callback: (tokenResponse: any) => {
        if (tokenResponse && tokenResponse.access_token) {
          fetchProfile(tokenResponse.access_token)
        }
      },
    })
    setTokenClient(client)
  }, [fetchProfile])

  useEffect(() => {
    if ((window as any).google && !tokenClient) {
      handleGsiLoad()
    }
  }, [tokenClient, handleGsiLoad])

  const login = () => {
    if (tokenClient) {
      tokenClient.requestAccessToken()
    } else {
      alert('Google Sign-In is not initialized. Check your Client ID configuration.')
    }
  }

  const postComment = async () => {
    if (!newComment.trim() || !user?.accessToken) return
    setIsPosting(true)

    try {
      const savedComment = await postCommentAction(user.accessToken, videoId, newComment)
      setNewComment('')
      setComments((prev) => [savedComment, ...prev])
    } catch (e) {
      console.error(e)
    } finally {
      setIsPosting(false)
    }
  }

  const handleReplySubmit = async (parentId: string) => {
    if (!replyText.trim() || !user?.accessToken) return

    try {
      const newReply = await replyToCommentAction(user.accessToken, parentId, replyText)
      // Add to thread
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
    } catch (e) {
      console.error('Failed to post reply', e)
    }
  }

  // --- 3. Render Helpers ---
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
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
          <span className="font-bold text-sm text-foreground">{snippet.authorDisplayName}</span>
          <span className="text-xs text-muted-foreground">{formatDate(snippet.publishedAt)}</span>
        </div>
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
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
                if (!user) {
                  login()
                  return
                }
                setReplyingToId(replyingToId === commentId ? null : commentId)
                setReplyText('')
              }}
              variant="link"
              size="sm"
              className="flex items-center gap-1  p-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
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
              className="flex-1 bg-transparent rounded-[3px] border-r-0 border-t-0 border-b border-border focus:border-none focus:bg-input outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={() => handleReplySubmit(commentId)}
              disabled={!replyText.trim()}
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-2 uppercase font-bold"
            >
              Submit
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <aside className="w-full mx-auto">
      <Script src="https://accounts.google.com/gsi/client" onLoad={handleGsiLoad} />

      <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <h3 className="text-xl font-heading text-foreground uppercase tracking-wider flex items-center gap-2">
          <MessageSquare size={20} className="text-accent" />
          Comms Channel
        </h3>
        {!commentsDisabled &&
          (!user ? (
            <Button
              onClick={login}
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-2"
            >
              <LogIn size={14} /> Sign In to Transmit
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {user.profileImageUrl && (
                <Image
                  src={user.profileImageUrl}
                  alt="Me"
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="text-xs text-foreground">{user.displayName}</span>
            </div>
          ))}
      </div>

      {/* Post Box */}
      {!commentsDisabled && user && (
        <div className="flex gap-3 mb-8">
          {user.profileImageUrl && (
            <Image
              src={user.profileImageUrl}
              alt="Me"
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div className="flex-1 flex gap-2">
            <Input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Hailing frequencies open. What's your message?"
              className="flex-1 bg-transparent border-x-0 border-t-0 border-b border-border focus:border-none focus:bg-input outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Button
              onClick={postComment}
              disabled={!newComment.trim() || isPosting}
              variant="ghost"
              size="sm"
              className="text-xs flex items-center gap-2 uppercase font-bold"
            >
              {isPosting ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />} Send
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      {commentsDisabled ? (
        <div className="flex justify-center py-8 text-muted-foreground italic font-mono text-center rounded bg-background">
          Hailing frequencies closed.
          <br />
          (YouTube disables comments for audio only releases.)
        </div>
      ) : isLoading && comments.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-primary" />
        </div>
      ) : comments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3 opacity-60">
          <MessageSquare size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-mono">
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
          className="mt-8 w-full py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border hover:border-border/20 rounded-lg transition-all"
        >
          Load More Transmissions
        </Button>
      )}
    </aside>
  )
}
