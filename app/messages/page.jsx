'use client'

import { useCallback, useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
  Search, Send, ChevronLeft, Phone, MessageCircle, Loader2, Package, Lock,
} from 'lucide-react'

function timeLabel(date) {
  if (!date) return ''
  const d = new Date(date)
  const now = new Date()
  const sameDay = d.toDateString() === now.toDateString()
  if (sameDay) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  return d.toLocaleDateString('en-IN')
}

function MessagesContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, loading: authLoading } = useAuth()

  const [conversations, setConversations] = useState([])
  const [loadingList, setLoadingList] = useState(true)
  const [selectedId, setSelectedId] = useState(searchParams.get('conversation') || null)
  const [thread, setThread] = useState(null)
  const [loadingThread, setLoadingThread] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace('/login?redirect=/messages')
  }, [authLoading, isAuthenticated, router])

  const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const loadConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages', { headers: authHeaders() })
      if (!res.ok) throw new Error('Could not load your chats')
      const data = await res.json()
      setConversations(data.data || [])
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) loadConversations()
  }, [isAuthenticated, loadConversations])

  // A listing can deep-link straight into its chat
  useEffect(() => {
    const propertyId = searchParams.get('property')
    if (!propertyId || !isAuthenticated) return

    const open = async () => {
      try {
        const res = await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: JSON.stringify({ propertyId }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not open this chat')
        setSelectedId(data.conversationId)
        loadConversations()
      } catch (err) {
        toast.error(err.message)
      }
    }
    open()
  }, [searchParams, isAuthenticated, loadConversations])

  const loadThread = useCallback(async (id) => {
    if (!id) return
    setLoadingThread(true)
    try {
      const res = await fetch(`/api/messages?conversationId=${id}`, { headers: authHeaders() })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not open this chat')
      setThread(data)
      setConversations((prev) => prev.map((c) => (c._id === id ? { ...c, unread: 0 } : c)))
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLoadingThread(false)
    }
  }, [])

  useEffect(() => { loadThread(selectedId) }, [selectedId, loadThread])

  // Scroll the message list itself — scrollIntoView would drag the whole page
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [thread?.messages?.length])

  const handleSend = async () => {
    const text = newMessage.trim()
    if (!text || !selectedId) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ conversationId: selectedId, message: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Message not sent')
      setNewMessage('')
      await loadThread(selectedId)
      loadConversations()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  const filtered = conversations.filter(
    (c) =>
      c.withUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.propertyTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const searchField = (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search chats..."
        className="pl-9 h-10 rounded-xl bg-muted border-0"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  )

  const conversationRows = (
    <>
      {filtered.map((convo) => (
        <button
          key={convo._id}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left ${
            selectedId === convo._id ? 'bg-primary/10' : 'hover:bg-muted'
          }`}
          onClick={() => setSelectedId(convo._id)}
        >
          <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-primary">
              {(convo.withUser?.name || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{convo.withUser?.name}</p>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {timeLabel(convo.lastMessageAt)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {convo.lastMessage || 'No messages yet'}
            </p>
            <p className="text-[10px] text-primary font-medium truncate mt-0.5">{convo.propertyTitle}</p>
          </div>
          {convo.unread > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
              {convo.unread}
            </span>
          )}
        </button>
      ))}

      {!loadingList && filtered.length === 0 && (
        <div className="text-center py-16 px-4">
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-foreground font-medium">No chats yet</p>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            Chats open up once our team approves your contact request on a listing.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/properties')}>
            Browse listings
          </Button>
        </div>
      )}
    </>
  )

  const chatPanel = thread ? (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <button
          onClick={() => { setSelectedId(null); setThread(null) }}
          className="md:hidden w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted"
          aria-label="Back to chats"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-primary">
            {(thread.conversation.withUser?.name || 'U').charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground truncate">
            {thread.conversation.withUser?.name}
          </p>
          <button
            onClick={() => router.push(`/properties/${thread.conversation.propertyId}`)}
            className="text-[11px] text-primary hover:underline flex items-center gap-1 truncate"
          >
            <Package className="w-3 h-3 flex-shrink-0" />
            {thread.conversation.propertyTitle}
          </button>
        </div>
        {thread.conversation.withUser?.phone && (
          <a
            href={`tel:+91${thread.conversation.withUser.phone}`}
            className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"
            aria-label="Call"
          >
            <Phone className="w-4 h-4 text-accent" />
          </a>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-background">
        {loadingThread ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : thread.messages.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-10">
            Say hello — this chat is now open.
          </p>
        ) : (
          thread.messages.map((msg) => (
            <div key={msg._id} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 ${
                  msg.mine
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-card border border-border text-foreground rounded-bl-md'
                }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.mine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                  {timeLabel(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card p-3 flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          className="h-11 rounded-xl"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
        />
        <Button
          onClick={handleSend}
          disabled={sending || !newMessage.trim()}
          className="h-11 w-11 rounded-xl p-0 flex-shrink-0"
          aria-label="Send"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  ) : (
    <div className="hidden md:flex flex-col items-center justify-center h-full text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="font-medium text-foreground">Select a chat</p>
      <p className="text-sm text-muted-foreground mt-1">Pick a conversation to start messaging.</p>
    </div>
  )

  // One tree for both breakpoints — on phones the list and the chat swap
  // places, on desktop they sit side by side
  const showChat = !!(selectedId && thread)

  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 md:px-6 py-4 md:py-8">
        <div className="app-shell-wide">
          <h1 className={`text-xl md:text-2xl font-bold text-foreground mb-3 md:mb-5 ${showChat ? 'hidden md:block' : ''}`}>
            Messages
          </h1>

          <div className="md:grid md:grid-cols-[320px_1fr] md:gap-5 md:h-[calc(100vh-16rem)] md:min-h-[480px]">
            {/* Conversation list */}
            <div
              className={`rounded-2xl md:border md:border-border md:bg-card md:p-3 md:overflow-y-auto ${
                showChat ? 'hidden md:block' : 'block'
              }`}
            >
              {searchField}
              <div className="mt-3 space-y-1 pb-24 md:pb-0">
                {loadingList ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : conversationRows}
              </div>
            </div>

            {/* Chat */}
            <div
              className={`rounded-2xl border border-border bg-card overflow-hidden h-[calc(100vh-8rem)] md:h-auto ${
                showChat ? 'block' : 'hidden md:block'
              }`}
            >
              {chatPanel}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  )
}
