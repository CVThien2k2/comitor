"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { ConversationList, type Conversation } from "./conversation-list"
import { ChatWindow, type Message, type AISuggestion } from "./chat-window"
import { CustomerInfoPanel, type CustomerInfo } from "./customer-info-panel"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useResizablePanel } from "@workspace/ui/hooks/use-resizable-panel"

// Mock Data
const mockConversations: Conversation[] = [
  {
    id: "1",
    customerName: "Nguyễn Văn Minh",
    customerOrg: "Công ty ABC",
    avatarColor: "#6366f1",
    lastMessage: "Tôi muốn hỏi về gói dịch vụ Enterprise của bên mình",
    timestamp: "10:32",
    channel: "zalo",
    isUnread: true,
    isPriority: true,
    status: "open",
    assignee: "me",
  },
  {
    id: "2",
    customerName: "Trần Thị Hoa",
    customerOrg: "Startup XYZ",
    avatarColor: "#ec4899",
    lastMessage: "Cảm ơn bạn, mình sẽ xem xét đề xuất này",
    timestamp: "09:45",
    channel: "facebook",
    isUnread: true,
    isPriority: false,
    status: "pending",
    assignee: "me",
  },
  {
    id: "3",
    customerName: "Lê Hoàng Nam",
    avatarColor: "#10b981",
    lastMessage: "Đã nhận được invoice, thanks!",
    timestamp: "Hôm qua",
    channel: "website",
    isUnread: false,
    isPriority: false,
    status: "resolved",
  },
  {
    id: "4",
    customerName: "Phạm Thị Mai",
    customerOrg: "Tech Solutions",
    avatarColor: "#f59e0b",
    lastMessage: "Bên mình có thể demo được không?",
    timestamp: "Hôm qua",
    channel: "zalo",
    isUnread: true,
    isPriority: true,
    status: "open",
    assignee: "me",
  },
  {
    id: "5",
    customerName: "Hoàng Minh Tuấn",
    avatarColor: "#8b5cf6",
    lastMessage: "OK mình sẽ check và phản hồi lại",
    timestamp: "15/03",
    channel: "facebook",
    isUnread: false,
    isPriority: false,
    status: "pending",
  },
  {
    id: "6",
    customerName: "Đỗ Thị Lan",
    customerOrg: "Digital Agency",
    avatarColor: "#06b6d4",
    lastMessage: "Tuyệt vời, mình rất hài lòng với dịch vụ",
    timestamp: "14/03",
    channel: "website",
    isUnread: false,
    isPriority: false,
    status: "resolved",
  },
  {
    id: "7",
    customerName: "Vũ Đình Khoa",
    avatarColor: "#ef4444",
    lastMessage: "Mình gặp lỗi khi đăng nhập vào hệ thống",
    timestamp: "13/03",
    channel: "zalo",
    isUnread: false,
    isPriority: false,
    status: "resolved",
  },
]

const mockMessages: Record<string, Message[]> = {
  "1": [
    {
      id: "m1",
      content: "Chào bạn, mình là Minh từ Công ty ABC",
      timestamp: "10:15",
      isCustomer: true,
      senderName: "Nguyễn Văn Minh",
      avatarColor: "#6366f1",
    },
    {
      id: "m2",
      content: "Mình đang tìm hiểu về các giải pháp quản lý khách hàng cho doanh nghiệp",
      timestamp: "10:16",
      isCustomer: true,
      senderName: "Nguyễn Văn Minh",
      avatarColor: "#6366f1",
    },
    {
      id: "m3",
      content: "Chào anh Minh! Em là Linh từ Elines OS. Rất vui được hỗ trợ anh ạ.",
      timestamp: "10:20",
      isCustomer: false,
    },
    {
      id: "m4",
      content: "Dạ em có thể giới thiệu qua về các gói dịch vụ của bên em không?",
      timestamp: "10:21",
      isCustomer: true,
      senderName: "Nguyễn Văn Minh",
      avatarColor: "#6366f1",
    },
    {
      id: "m5",
      content: "Dạ được ạ! Bên em hiện có 3 gói chính: Starter, Professional và Enterprise. Với quy mô công ty của anh, em nghĩ gói Professional hoặc Enterprise sẽ phù hợp ạ.",
      timestamp: "10:25",
      isCustomer: false,
    },
    {
      id: "m6",
      content: "Tôi muốn hỏi về gói dịch vụ Enterprise của bên mình",
      timestamp: "10:32",
      isCustomer: true,
      senderName: "Nguyễn Văn Minh",
      avatarColor: "#6366f1",
    },
  ],
  "2": [
    {
      id: "m1",
      content: "Hi, mình đang cần tư vấn về integration API",
      timestamp: "09:30",
      isCustomer: true,
      senderName: "Trần Thị Hoa",
      avatarColor: "#ec4899",
    },
    {
      id: "m2",
      content: "Chào chị Hoa! Em sẽ gửi tài liệu API documentation cho chị tham khảo ạ.",
      timestamp: "09:35",
      isCustomer: false,
    },
    {
      id: "m3",
      content: "Ngoài ra, bên em cũng có thể hỗ trợ technical support trong quá trình integration.",
      timestamp: "09:36",
      isCustomer: false,
    },
    {
      id: "m4",
      content: "Cảm ơn bạn, mình sẽ xem xét đề xuất này",
      timestamp: "09:45",
      isCustomer: true,
      senderName: "Trần Thị Hoa",
      avatarColor: "#ec4899",
    },
  ],
}

const mockAISuggestions: AISuggestion[] = [
  {
    id: "s1",
    content: "Dạ với gói Enterprise, bên em cung cấp: Không giới hạn số lượng user, AI Assistant cao cấp, Dedicated support 24/7, và Custom integration. Anh có muốn em gửi báo giá chi tiết không ạ?",
    type: "reply",
  },
  {
    id: "s2",
    content: "Em có thể sắp xếp một buổi demo trực tiếp để anh trải nghiệm đầy đủ các tính năng của gói Enterprise. Anh có thể thu xếp vào thời gian nào trong tuần này ạ?",
    type: "reply",
  },
]

const mockCustomers: Record<string, CustomerInfo> = {
  "1": {
    id: "c1",
    name: "Nguyễn Văn Minh",
    email: "minh.nguyen@abccompany.vn",
    phone: "0912 345 678",
    avatarColor: "#6366f1",
    role: "CEO",
    tags: ["Enterprise", "Hot Lead", "VIP"],
    organization: {
      name: "Công ty ABC",
      website: "abccompany.vn",
      industry: "E-commerce",
      size: "50-100 nhân viên",
      location: "TP. Hồ Chí Minh",
    },
    isVIP: true,
    isB2B: true,
    lastActivity: "Hôm nay",
    firstContact: "01/03/2024",
    totalConversations: 5,
    tasks: [
      {
        id: "t1",
        title: "Gửi báo giá gói Enterprise",
        dueDate: "Hôm nay",
        status: "in-progress",
        priority: "high",
      },
      {
        id: "t2",
        title: "Lên lịch demo sản phẩm",
        dueDate: "20/03",
        status: "todo",
        priority: "medium",
      },
    ],
    notes: [
      {
        id: "n1",
        content: "Khách hàng tiềm năng, đang mở rộng kinh doanh và cần giải pháp CRM enterprise. Cần follow up chặt chẽ.",
        author: "Trần Linh",
        timestamp: "15/03",
      },
    ],
  },
  "2": {
    id: "c2",
    name: "Trần Thị Hoa",
    email: "hoa.tran@startupxyz.io",
    phone: "0987 654 321",
    avatarColor: "#ec4899",
    role: "CTO",
    tags: ["Startup", "Technical"],
    organization: {
      name: "Startup XYZ",
      website: "startupxyz.io",
      industry: "SaaS",
      size: "10-20 nhân viên",
      location: "Hà Nội",
    },
    isB2B: true,
    lastActivity: "Hôm nay",
    firstContact: "10/03/2024",
    totalConversations: 3,
    tasks: [
      {
        id: "t1",
        title: "Gửi API documentation",
        status: "done",
      },
    ],
    notes: [],
  },
}

// Default customer info for conversations without specific data
const defaultCustomer: CustomerInfo = {
  id: "default",
  name: "Khách hàng",
  avatarColor: "#6366f1",
  totalConversations: 1,
  tasks: [],
  notes: [],
}

export function InboxPage() {
  const [selectedId, setSelectedId] = React.useState<string | null>("1")
  const [messages, setMessages] = React.useState<Record<string, Message[]>>(mockMessages)
  const [showCustomerPanel, setShowCustomerPanel] = React.useState(true)
  const [mobileView, setMobileView] = React.useState<"list" | "chat">("list")
  const { width: listWidth, isResizing, handleMouseDown: onResizeStart } = useResizablePanel({
    storageKey: "elines-conversation-list-width",
    minWidth: 320,
    defaultWidth: 320,
    maxWidth: 480,
  })

  const selectedConversation = mockConversations.find((c) => c.id === selectedId)
  const currentMessages = selectedId ? (messages[selectedId] || []) : []
  const currentCustomer = selectedId 
    ? (mockCustomers[selectedId] || {
        ...defaultCustomer,
        id: selectedId,
        name: selectedConversation?.customerName || "Khách hàng",
        avatarColor: selectedConversation?.avatarColor || "#6366f1",
        email: "",
        phone: "",
        organization: selectedConversation?.customerOrg ? {
          name: selectedConversation.customerOrg,
        } : undefined,
      })
    : defaultCustomer

  const handleSendMessage = (content: string) => {
    if (!selectedId) return
    
    const newMessage: Message = {
      id: `m${Date.now()}`,
      content,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isCustomer: false,
    }

    setMessages((prev) => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] || []), newMessage],
    }))
  }

  const handleSelectConversation = (id: string) => {
    setSelectedId(id)
    // On mobile, switch to chat view
    if (window.innerWidth < 640) {
      setMobileView("chat")
    }
  }

  const handleAddNote = (note: string) => {
    console.log("Adding note:", note)
  }

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Desktop Large (≥1132px) - Full 3-column layout */}
      <div className="hidden xl:flex w-full">
        {/* Left Column - Conversation List */}
        <div className="shrink-0 border-r border-border relative" style={{ width: listWidth }}>
          <ConversationList
            conversations={mockConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute right-0 top-0 h-full w-1 cursor-col-resize z-10 transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        {/* Center Column - Chat Window */}
        <div className="flex-1 min-w-0">
          {selectedConversation ? (
            <ChatWindow
              customerName={selectedConversation.customerName}
              customerOrg={selectedConversation.customerOrg}
              avatarColor={selectedConversation.avatarColor}
              channel={selectedConversation.channel}
              status={selectedConversation.isUnread ? "online" : "offline"}
              messages={currentMessages}
              aiSuggestions={selectedId === "1" ? mockAISuggestions : []}
              onSendMessage={handleSendMessage}
              onToggleCustomerPanel={() => setShowCustomerPanel(!showCustomerPanel)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Chọn một hội thoại</p>
                <p className="text-sm mt-1">Chọn một hội thoại từ danh sách bên trái để bắt đầu</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer Info */}
        {showCustomerPanel && selectedConversation && (
          <div className="w-80 shrink-0 border-l border-border">
            <CustomerInfoPanel
              customer={currentCustomer}
              onAddNote={handleAddNote}
              onAddTask={() => console.log("Add task")}
            />
          </div>
        )}
      </div>

      {/* Desktop Small (768-1131px) - Collapsible 3-column or 2-column */}
      <div className="hidden lg:flex xl:hidden w-full">
        {/* Left Column - Conversation List */}
        <div className="shrink-0 border-r border-border relative" style={{ width: listWidth }}>
          <ConversationList
            conversations={mockConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute right-0 top-0 h-full w-1 cursor-col-resize z-10 transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        {/* Center Column - Chat Window */}
        <div className="flex-1 min-w-0 flex flex-col">
          {selectedConversation ? (
            <>
              <ChatWindow
                customerName={selectedConversation.customerName}
                customerOrg={selectedConversation.customerOrg}
                avatarColor={selectedConversation.avatarColor}
                channel={selectedConversation.channel}
                status={selectedConversation.isUnread ? "online" : "offline"}
                messages={currentMessages}
                aiSuggestions={selectedId === "1" ? mockAISuggestions : []}
                onSendMessage={handleSendMessage}
                onToggleCustomerPanel={() => setShowCustomerPanel(!showCustomerPanel)}
                compactMode
              />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Chọn một hội thoại</p>
                <p className="text-sm mt-1">Chọn hội thoại để bắt đầu</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Customer Info (Collapsible) */}
        {showCustomerPanel && selectedConversation && (
          <div className="w-72 shrink-0 border-l border-border overflow-y-auto">
            <CustomerInfoPanel
              customer={currentCustomer}
              onAddNote={handleAddNote}
              onAddTask={() => console.log("Add task")}
            />
          </div>
        )}
      </div>

      {/* Tablet (768px) - 2-column with collapsible customer panel */}
      <div className="hidden md:flex lg:hidden w-full">
        {/* Left Column - Conversation List */}
        <div className="shrink-0 border-r border-border relative" style={{ width: listWidth }}>
          <ConversationList
            conversations={mockConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
          <div
            onMouseDown={onResizeStart}
            className={cn(
              "absolute right-0 top-0 h-full w-1 cursor-col-resize z-10 transition-colors hover:bg-primary/30",
              isResizing && "bg-primary/40"
            )}
          />
        </div>

        {/* Center Column - Chat Window */}
        <div className="flex-1 min-w-0 flex flex-col relative">
          {selectedConversation ? (
            <ChatWindow
              customerName={selectedConversation.customerName}
              customerOrg={selectedConversation.customerOrg}
              avatarColor={selectedConversation.avatarColor}
              channel={selectedConversation.channel}
              status={selectedConversation.isUnread ? "online" : "offline"}
              messages={currentMessages}
              aiSuggestions={selectedId === "1" ? mockAISuggestions : []}
              onSendMessage={handleSendMessage}
              onToggleCustomerPanel={() => setShowCustomerPanel(!showCustomerPanel)}
              compactMode
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium">Chọn một hội thoại</p>
                <p className="text-sm mt-1">Chọn hội thoại để bắt đầu</p>
              </div>
            </div>
          )}

          {/* Customer Panel Drawer (Tablet) */}
          {showCustomerPanel && selectedConversation && (
            <div className="absolute inset-0 bg-black/20 dark:bg-black/40 flex items-start justify-end z-40">
              <div className="bg-background w-80 h-full shadow-lg overflow-y-auto">
                <div className="sticky top-0 flex items-center justify-between p-4 border-b border-border bg-background bg-background">
                  <h3 className="font-semibold text-foreground">Thông tin khách hàng</h3>
                  <Button 
                    variant="ghost" 
                    size="icon-sm"
                    onClick={() => setShowCustomerPanel(false)}
                  >
                    <Icons.x className="w-4 h-4" />
                  </Button>
                </div>
                <CustomerInfoPanel
                  customer={currentCustomer}
                  onAddNote={handleAddNote}
                  onAddTask={() => console.log("Add task")}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile (<640px) - View switching */}
      <div className="md:hidden w-full flex flex-col">
        {mobileView === "list" ? (
          <ConversationList
            conversations={mockConversations}
            selectedId={selectedId}
            onSelect={handleSelectConversation}
          />
        ) : (
          <div className="flex flex-col h-full">
            {/* Mobile Chat Header */}
            <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-border bg-card bg-muted/50">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon-sm"
                  onClick={() => setMobileView("list")}
                >
                  <Icons.chevronLeft className="w-5 h-5" />
                </Button>
                <div>
                  <p className="text-sm font-medium truncate">{selectedConversation?.customerName}</p>
                  <p className="text-xs text-muted-foreground">{selectedConversation?.customerOrg || "Khách hàng"}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon-sm"
                onClick={() => setShowCustomerPanel(true)}
              >
                <Icons.panelRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Chat Area */}
            {selectedConversation ? (
              <>
                <div className="flex-1 min-h-0">
                  <ChatWindow
                    customerName={selectedConversation.customerName}
                    customerOrg={selectedConversation.customerOrg}
                    avatarColor={selectedConversation.avatarColor}
                    channel={selectedConversation.channel}
                    status={selectedConversation.isUnread ? "online" : "offline"}
                    messages={currentMessages}
                    aiSuggestions={selectedId === "1" ? mockAISuggestions : []}
                    onSendMessage={handleSendMessage}
                    compact
                  />
                </div>

                {/* Mobile Customer Panel Bottom Sheet */}
                {showCustomerPanel && (
                  <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex animate-in fade-in">
                    <div className="bg-background w-full h-full overflow-y-auto">
                      <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                        <h3 className="font-semibold text-foreground">Thông tin khách hàng</h3>
                        <Button 
                          variant="ghost" 
                          size="icon-sm"
                          onClick={() => setShowCustomerPanel(false)}
                        >
                          <Icons.x className="w-4 h-4" />
                        </Button>
                      </div>
                      <CustomerInfoPanel
                        customer={currentCustomer}
                        onAddNote={handleAddNote}
                        onAddTask={() => console.log("Add task")}
                      />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Không có hội thoại</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
