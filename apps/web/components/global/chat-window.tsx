'use client'

import { ChatHeader } from './chat-header'
import { MessageBubble } from './message-bubble'
import { AISuggestion } from './ai-suggestion'
import { MessageInput } from './message-input'
import { useState } from 'react'

interface Message {
  id: string
  content: string
  timestamp: string
  isOwn: boolean
}

const initialMessages: Message[] = [
  {
    id: '1',
    content:
      'Chào team, mình cần giữ chỗ cho 30 khách đoàn đi Đà Lạt tuần sau. Có thể gửi báo giá sớm không?',
    timestamp: '10:15 SA',
    isOwn: false,
  },
  {
    id: '2',
    content:
      'Dạ chào chị Mai, em đã nhận được yêu cầu. Em đang kiểm tra tình trạng chỗ và sẽ gửi báo giá ngay ạ.',
    timestamp: '10:20 SA',
    isOwn: true,
  },
]

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)

  const handleSendMessage = (content: string) => {
    const newMessage: Message = {
      id: String(messages.length + 1),
      content,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isOwn: true,
    }
    setMessages([...messages, newMessage])
  }

  return (
    <main className="flex-1 flex flex-col bg-background">
      <ChatHeader
        contactName="Mai Nguyễn"
        status="Trực tuyến"
        platform="Facebook Messenger"
      />

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div className="flex justify-center">
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full uppercase font-semibold">
            Hôm nay
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            content={msg.content}
            timestamp={msg.timestamp}
            isOwn={msg.isOwn}
          />
        ))}

        <AISuggestion
          title="Tạo công việc"
          description="Gửi báo giá đặt chỗ đoàn 30 khách cho Mai Nguyễn."
          onAccept={() => alert('Công việc đã được tạo!')}
        />
      </div>

      <MessageInput onSend={handleSendMessage} />
    </main>
  )
}
