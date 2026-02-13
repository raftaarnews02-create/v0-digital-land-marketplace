'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Search, Send, ChevronLeft, Phone, MoreVertical } from 'lucide-react'

const CONVERSATIONS = [
  {
    id: 'c1', name: 'Rajesh Kumar', avatar: 'RK', lastMessage: 'The starting bid is ₹4,00,000. Current highest bid is ₹5,00,000.',
    time: '11:15 AM', unread: 2, property: 'Fertile Agricultural Land',
  },
  {
    id: 'c2', name: 'Priya Sharma', avatar: 'PS', lastMessage: 'Yes, the plot is still available for viewing.',
    time: 'Yesterday', unread: 0, property: 'Urban Residential Plot',
  },
  {
    id: 'c3', name: 'Nagaraj Rao', avatar: 'NR', lastMessage: 'I can arrange a site visit this weekend.',
    time: '2 days ago', unread: 0, property: 'Commercial Business Plot',
  },
]

const CHAT_MESSAGES = {
  c1: [
    { id: 'm1', sender: 'other', name: 'Rajesh Kumar', text: 'Hi, I am the owner of the agricultural land in Ludhiana.', time: '10:30 AM' },
    { id: 'm2', sender: 'me', text: 'Hi Rajesh! I am interested in your property. Is it still available?', time: '10:32 AM' },
    { id: 'm3', sender: 'other', name: 'Rajesh Kumar', text: 'Yes, it is available. We have received multiple bids already. Would you like to place a bid?', time: '10:45 AM' },
    { id: 'm4', sender: 'me', text: 'What is the minimum asking price? And is irrigation available?', time: '11:00 AM' },
    { id: 'm5', sender: 'other', name: 'Rajesh Kumar', text: 'The starting bid is ₹4,00,000. Current highest bid is ₹5,00,000. Yes, canal water supply is available for irrigation.', time: '11:15 AM' },
  ],
}

export default function MessagesPage() {
  const router = useRouter()
  const [selectedChat, setSelectedChat] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredConversations = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.property.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChat) return
    const chatMessages = messages[selectedChat] || []
    const newMsg = {
      id: `m_${Date.now()}`,
      sender: 'me',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages({ ...messages, [selectedChat]: [...chatMessages, newMsg] })
    setNewMessage('')
  }

  const selectedConvo = CONVERSATIONS.find((c) => c.id === selectedChat)
  const chatMessages = messages[selectedChat] || []

  // Chat View
  if (selectedChat) {
    return (
      <div className="bg-background min-h-screen flex flex-col">
        {/* Chat Header */}
        <div className="sticky top-14 z-30 bg-card/95 backdrop-blur-md border-b border-border px-4 py-2.5">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => setSelectedChat(null)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted" aria-label="Back">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">{selectedConvo?.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{selectedConvo?.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{selectedConvo?.property}</p>
            </div>
            <button className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted" aria-label="Call">
              <Phone className="w-4 h-4 text-foreground" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 pb-32">
          <div className="max-w-lg mx-auto space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ${
                  msg.sender === 'me'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border text-foreground rounded-bl-sm'
                }`}>
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-card border-t border-border px-4 py-3 safe-bottom">
          <div className="max-w-lg mx-auto flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 h-10 rounded-full"
            />
            <button
              onClick={handleSend}
              disabled={!newMessage.trim()}
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Conversation List View
  return (
    <div className="bg-background min-h-screen">
      <div className="px-4 pt-4 pb-2">
        <div className="max-w-lg mx-auto">
          <h1 className="text-xl font-bold text-foreground">Messages</h1>
          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-9 h-10 rounded-xl bg-muted border-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-2 pb-24">
        <div className="max-w-lg mx-auto space-y-1">
          {filteredConversations.map((convo) => (
            <button
              key={convo.id}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors text-left"
              onClick={() => setSelectedChat(convo.id)}
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-primary">{convo.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-foreground">{convo.name}</p>
                  <span className="text-[10px] text-muted-foreground">{convo.time}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                <p className="text-[10px] text-primary font-medium truncate mt-0.5">{convo.property}</p>
              </div>
              {convo.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {convo.unread}
                </span>
              )}
            </button>
          ))}

          {filteredConversations.length === 0 && (
            <div className="text-center py-16">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">No conversations found</p>
              <p className="text-sm text-muted-foreground mt-1">Start by contacting a property seller</p>
              <Button variant="outline" className="mt-4" onClick={() => router.push('/properties')}>
                Browse Properties
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
