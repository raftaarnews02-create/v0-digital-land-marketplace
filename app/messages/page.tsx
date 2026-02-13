'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, Search } from 'lucide-react'

interface Message {
  id: string
  senderId: string
  senderName: string
  message: string
  read: boolean
  createdAt: string
}

interface Conversation {
  id: string
  participantName: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  avatar: string
  propertyTitle?: string
}

export default function MessagesPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  // Mock conversations
  useEffect(() => {
    const mockConversations: Conversation[] = [
      {
        id: 'conv_1',
        participantName: 'Ananya Singh',
        lastMessage: 'What is the minimum asking price?',
        lastMessageTime: '2 minutes ago',
        unread: 2,
        avatar: 'AS',
        propertyTitle: 'Fertile Agricultural Land - Punjab',
      },
      {
        id: 'conv_2',
        participantName: 'Rajesh Kumar',
        lastMessage: 'Your bid has been accepted!',
        lastMessageTime: '5 hours ago',
        unread: 0,
        avatar: 'RK',
        propertyTitle: 'Urban Residential Plot - Mumbai',
      },
      {
        id: 'conv_3',
        participantName: 'Vikram Patel',
        lastMessage: 'Can we negotiate on the price?',
        lastMessageTime: '1 day ago',
        unread: 1,
        avatar: 'VP',
        propertyTitle: 'Commercial Land - Bangalore',
      },
      {
        id: 'conv_4',
        participantName: 'Priya Sharma',
        lastMessage: 'Thanks for the information',
        lastMessageTime: '3 days ago',
        unread: 0,
        avatar: 'PS',
        propertyTitle: 'Orchard Land - Himachal Pradesh',
      },
    ]
    setConversations(mockConversations)
    if (mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0].id)
    }
  }, [])

  // Mock messages for selected conversation
  useEffect(() => {
    if (selectedConversation === 'conv_1') {
      setMessages([
        {
          id: 'msg_1',
          senderId: 'user_1',
          senderName: 'Ananya Singh',
          message: 'Hi, I am interested in your agricultural land. Is it still available?',
          read: true,
          createdAt: '10:30 AM',
        },
        {
          id: 'msg_2',
          senderId: 'seller',
          senderName: 'You',
          message: 'Yes, it is available. We have received one bid already. Would you like to place a bid?',
          read: true,
          createdAt: '10:45 AM',
        },
        {
          id: 'msg_3',
          senderId: 'user_1',
          senderName: 'Ananya Singh',
          message: 'What is the minimum asking price?',
          read: false,
          createdAt: '2 minutes ago',
        },
      ])
    }
  }, [selectedConversation])

  const handleSendMessage = () => {
    if (!messageInput.trim()) return

    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: user?.name || 'You',
      senderName: user?.name || 'You',
      message: messageInput,
      read: false,
      createdAt: 'Just now',
    }

    setMessages([...messages, newMessage])
    setMessageInput('')

    // Scroll to bottom
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 0)
  }

  const filteredConversations = conversations.filter((conv) =>
    conv.participantName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const selectedConv = conversations.find((c) => c.id === selectedConversation)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Messages</h1>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="md:col-span-1 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`w-full p-4 border-b border-border text-left transition-colors hover:bg-muted ${
                    selectedConversation === conv.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-foreground text-sm">
                          {conv.participantName}
                        </p>
                        {conv.unread > 0 && (
                          <span className="bg-accent text-accent-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                            {conv.unread}
                          </span>
                        )}
                      </div>
                      {conv.propertyTitle && (
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          {conv.propertyTitle}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.lastMessageTime}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="md:col-span-2 bg-card rounded-lg border border-border flex flex-col overflow-hidden">
            {selectedConversation && selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-border">
                  <h2 className="font-semibold text-foreground text-lg">
                    {selectedConv.participantName}
                  </h2>
                  {selectedConv.propertyTitle && (
                    <p className="text-sm text-muted-foreground">
                      {selectedConv.propertyTitle}
                    </p>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.senderId === 'seller' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === 'seller'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.senderId === 'seller'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {msg.createdAt}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage()
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto" />
                  <p className="text-muted-foreground">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
