"use client"

import * as React from "react"
import { Icons } from "@/components/global/icons"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { CustomersTable, type Customer } from "./customers-table"
import { CustomerDetailPanel, type CustomerDetails } from "./customer-detail-panel"

// Mock data
const mockCustomers: CustomerDetails[] = [
  {
    id: "1",
    name: "Nguyễn Văn Minh",
    email: "minh.nguyen@techcorp.vn",
    phone: "+84 903 456 789",
    avatarColor: "#5048E5",
    tier: "gold",
    state: "active",
    channels: ["zalo", "facebook"],
    conversationCount: 47,
    lastBooking: {
      code: "VN234",
      route: "HAN → SGN",
      date: "28/03/2026",
      status: "upcoming",
    },
    lastUpdated: "Hôm nay",
    organization: "TechCorp Vietnam",
    totalSpent: 125000000,
    loyaltyPoints: 48500,
    dateOfBirth: "15/04/1985",
    preferredAirline: "Vietnam Airlines",
    paymentMethod: "Visa **** 4242",
    linkedIdentities: [
      { channel: "zalo", identifier: "+84 903 456 789", verified: true },
      { channel: "facebook", identifier: "minh.nguyen.techcorp", verified: true },
    ],
    bookingHistory: [
      { code: "VN234", route: "HAN → SGN", date: "28/03/2026", status: "upcoming", price: "3.200.000đ" },
      { code: "VN891", route: "SGN → DAD", date: "15/02/2026", status: "completed", price: "2.100.000đ" },
      { code: "VN456", route: "HAN → PQC", date: "20/01/2026", status: "completed", price: "4.500.000đ" },
    ],
    recentActivity: [
      { type: "booking", description: "Đặt vé VN234 HAN → SGN", timestamp: "2 giờ trước" },
      { type: "message", description: "Hỏi về chính sách đổi vé", timestamp: "1 ngày trước" },
      { type: "call", description: "Gọi hotline xác nhận booking", timestamp: "3 ngày trước" },
    ],
    internalNotes: [
      { id: "n1", content: "Khách VIP, ưu tiên hỗ trợ nhanh. Hay bay chặng HAN-SGN cho công việc.", author: "Linh Trần", timestamp: "15/03/2026" },
    ],
  },
  {
    id: "2",
    name: "Trần Thị Hoa",
    email: "hoa.tran@startup.io",
    phone: "+84 912 345 678",
    avatarColor: "#10B981",
    tier: "silver",
    state: "at_risk",
    channels: ["website", "zalo"],
    conversationCount: 23,
    lastBooking: {
      code: "VJ567",
      route: "SGN → NHA",
      date: "10/02/2026",
      status: "completed",
    },
    lastUpdated: "3 ngày trước",
    organization: "Startup Hub",
    totalSpent: 45000000,
    loyaltyPoints: 12300,
    linkedIdentities: [
      { channel: "website", identifier: "hoa.tran@startup.io", verified: true },
      { channel: "zalo", identifier: "+84 912 345 678", verified: false },
    ],
    bookingHistory: [
      { code: "VJ567", route: "SGN → NHA", date: "10/02/2026", status: "completed", price: "1.800.000đ" },
    ],
    recentActivity: [
      { type: "message", description: "Phản hồi khảo sát dịch vụ", timestamp: "3 ngày trước" },
    ],
    internalNotes: [],
  },
  {
    id: "3",
    name: "Lê Quang Huy",
    email: "huy.le@enterprise.com",
    phone: "+84 908 765 432",
    avatarColor: "#F59E0B",
    tier: "gold",
    state: "active",
    channels: ["facebook", "website", "zalo"],
    conversationCount: 89,
    lastBooking: {
      code: "QH123",
      route: "HAN → DAD",
      date: "25/03/2026",
      status: "upcoming",
    },
    lastUpdated: "Hôm qua",
    organization: "Enterprise Solutions Ltd",
    totalSpent: 320000000,
    loyaltyPoints: 156000,
    dateOfBirth: "22/09/1978",
    preferredAirline: "Bamboo Airways",
    paymentMethod: "MasterCard **** 8888",
    linkedIdentities: [
      { channel: "facebook", identifier: "huy.le.enterprise", verified: true },
      { channel: "website", identifier: "huy.le@enterprise.com", verified: true },
      { channel: "zalo", identifier: "+84 908 765 432", verified: true },
    ],
    bookingHistory: [
      { code: "QH123", route: "HAN → DAD", date: "25/03/2026", status: "upcoming", price: "2.500.000đ" },
      { code: "VN789", route: "DAD → HAN", date: "20/03/2026", status: "upcoming", price: "2.400.000đ" },
      { code: "BB456", route: "SGN → PQC", date: "01/03/2026", status: "completed", price: "3.100.000đ" },
      { code: "VN321", route: "HAN → SGN", date: "15/02/2026", status: "completed", price: "3.500.000đ" },
    ],
    recentActivity: [
      { type: "booking", description: "Đặt vé QH123 HAN → DAD", timestamp: "Hôm qua" },
      { type: "note", description: "Cập nhật thông tin liên hệ", timestamp: "2 ngày trước" },
      { type: "message", description: "Yêu cầu nâng hạng ghế", timestamp: "5 ngày trước" },
      { type: "call", description: "Tư vấn gói doanh nghiệp", timestamp: "1 tuần trước" },
    ],
    internalNotes: [
      { id: "n1", content: "Khách hàng doanh nghiệp lớn, thường xuyên đặt vé cho nhân viên. Cần chăm sóc đặc biệt.", author: "Minh Phạm", timestamp: "10/03/2026" },
      { id: "n2", content: "Đang quan tâm đến gói Corporate Travel. Follow up vào cuối tháng.", author: "Lan Nguyễn", timestamp: "05/03/2026" },
    ],
  },
  {
    id: "4",
    name: "Phạm Thị Mai",
    email: "mai.pham@gmail.com",
    phone: "+84 987 654 321",
    avatarColor: "#EC4899",
    tier: "bronze",
    state: "new",
    channels: ["zalo"],
    conversationCount: 3,
    lastBooking: {
      code: "VJ890",
      route: "SGN → HAN",
      date: "20/03/2026",
      status: "upcoming",
    },
    lastUpdated: "5 ngày trước",
    totalSpent: 5200000,
    loyaltyPoints: 2100,
    linkedIdentities: [
      { channel: "zalo", identifier: "+84 987 654 321", verified: true },
    ],
    bookingHistory: [
      { code: "VJ890", route: "SGN → HAN", date: "20/03/2026", status: "upcoming", price: "2.600.000đ" },
    ],
    recentActivity: [
      { type: "booking", description: "Đặt vé đầu tiên VJ890", timestamp: "5 ngày trước" },
      { type: "message", description: "Hỏi về hành lý ký gửi", timestamp: "5 ngày trước" },
    ],
    internalNotes: [],
  },
  {
    id: "5",
    name: "Hoàng Văn Đức",
    email: "duc.hoang@corp.vn",
    phone: "+84 909 111 222",
    avatarColor: "#6366F1",
    tier: "silver",
    state: "active",
    channels: ["website", "facebook"],
    conversationCount: 31,
    lastBooking: {
      code: "VN456",
      route: "HAN → CXR",
      date: "05/04/2026",
      status: "upcoming",
    },
    lastUpdated: "2 ngày trước",
    organization: "Corp Vietnam JSC",
    totalSpent: 78000000,
    loyaltyPoints: 35600,
    dateOfBirth: "08/12/1990",
    preferredAirline: "VietJet Air",
    linkedIdentities: [
      { channel: "website", identifier: "duc.hoang@corp.vn", verified: true },
      { channel: "facebook", identifier: "duc.hoang.corp", verified: true },
    ],
    bookingHistory: [
      { code: "VN456", route: "HAN → CXR", date: "05/04/2026", status: "upcoming", price: "2.800.000đ" },
      { code: "VJ234", route: "CXR → HAN", date: "08/04/2026", status: "upcoming", price: "2.200.000đ" },
    ],
    recentActivity: [
      { type: "booking", description: "Đặt vé khứ hồi HAN ↔ CXR", timestamp: "2 ngày trước" },
      { type: "message", description: "Hỏi về dịch vụ xe đưa đón", timestamp: "2 ngày trước" },
    ],
    internalNotes: [
      { id: "n1", content: "Khách thường đi du lịch với gia đình, quan tâm đến combo flight + hotel.", author: "Hương Lê", timestamp: "01/03/2026" },
    ],
  },
  {
    id: "6",
    name: "Vũ Minh Châu",
    email: "chau.vu@agency.vn",
    phone: "+84 918 333 444",
    avatarColor: "#8B5CF6",
    tier: "gold",
    state: "active",
    channels: ["zalo", "website", "facebook"],
    conversationCount: 156,
    lastBooking: {
      code: "BB789",
      route: "SGN → VII",
      date: "22/03/2026",
      status: "upcoming",
    },
    lastUpdated: "Hôm nay",
    organization: "Travel Agency Pro",
    totalSpent: 890000000,
    loyaltyPoints: 425000,
    preferredAirline: "Bamboo Airways",
    paymentMethod: "Chuyển khoản doanh nghiệp",
    linkedIdentities: [
      { channel: "zalo", identifier: "+84 918 333 444", verified: true },
      { channel: "website", identifier: "chau.vu@agency.vn", verified: true },
      { channel: "facebook", identifier: "chau.vu.travel", verified: true },
    ],
    bookingHistory: [
      { code: "BB789", route: "SGN → VII", date: "22/03/2026", status: "upcoming", price: "4.200.000đ" },
      { code: "VN111", route: "HAN → SGN", date: "18/03/2026", status: "upcoming", price: "3.100.000đ" },
      { code: "QH222", route: "SGN → HAN", date: "15/03/2026", status: "completed", price: "2.900.000đ" },
    ],
    recentActivity: [
      { type: "booking", description: "Đặt 5 vé nhóm BB789", timestamp: "3 giờ trước" },
      { type: "message", description: "Yêu cầu báo giá tour Phú Quốc", timestamp: "Hôm nay" },
      { type: "call", description: "Thảo luận hợp đồng đại lý", timestamp: "Hôm qua" },
    ],
    internalNotes: [
      { id: "n1", content: "Đại lý du lịch, volume booking rất cao. Đang thương thảo chiết khấu đặc biệt Q2/2026.", author: "Giám đốc KD", timestamp: "17/03/2026" },
    ],
  },
  {
    id: "7",
    name: "Đặng Thị Linh",
    email: "linh.dang@outlook.com",
    avatarColor: "#14B8A6",
    tier: "bronze",
    state: "churned",
    channels: ["facebook"],
    conversationCount: 8,
    lastBooking: {
      code: "VJ321",
      route: "HAN → SGN",
      date: "10/11/2025",
      status: "cancelled",
    },
    lastUpdated: "4 tháng trước",
    totalSpent: 3500000,
    loyaltyPoints: 1200,
    linkedIdentities: [
      { channel: "facebook", identifier: "linh.dang.traveler", verified: false },
    ],
    bookingHistory: [
      { code: "VJ321", route: "HAN → SGN", date: "10/11/2025", status: "cancelled", price: "2.100.000đ" },
      { code: "VN555", route: "SGN → DAD", date: "05/08/2025", status: "completed", price: "1.400.000đ" },
    ],
    recentActivity: [
      { type: "message", description: "Yêu cầu hoàn tiền vé bị hủy", timestamp: "4 tháng trước" },
    ],
    internalNotes: [
      { id: "n1", content: "Khách không hài lòng với quá trình hoàn tiền. Cần follow up để win back.", author: "CS Team", timestamp: "15/11/2025" },
    ],
  },
  {
    id: "8",
    name: "Bùi Quốc Anh",
    email: "anh.bui@company.com",
    phone: "+84 905 888 999",
    avatarColor: "#0EA5E9",
    tier: "silver",
    state: "inactive",
    channels: ["website"],
    conversationCount: 15,
    lastBooking: {
      code: "VN777",
      route: "SGN → HAN",
      date: "20/12/2025",
      status: "completed",
    },
    lastUpdated: "3 tháng trước",
    organization: "Company ABC",
    totalSpent: 28000000,
    loyaltyPoints: 9800,
    linkedIdentities: [
      { channel: "website", identifier: "anh.bui@company.com", verified: true },
    ],
    bookingHistory: [
      { code: "VN777", route: "SGN → HAN", date: "20/12/2025", status: "completed", price: "3.200.000đ" },
      { code: "VN666", route: "HAN → SGN", date: "15/12/2025", status: "completed", price: "3.100.000đ" },
    ],
    recentActivity: [
      { type: "message", description: "Feedback về chuyến bay VN777", timestamp: "3 tháng trước" },
    ],
    internalNotes: [],
  },
]

export function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = React.useState<CustomerDetails | null>(null)

  const handleSelectCustomer = (customer: Customer) => {
    const fullCustomer = mockCustomers.find(c => c.id === customer.id)
    setSelectedCustomer(fullCustomer || null)
  }

  const handleClosePanel = () => {
    setSelectedCustomer(null)
  }

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        selectedCustomer && "mr-0"
      )}>
        {/* Header */}
        <header className="shrink-0 px-6 py-4 border-b border-border bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icons.users className="size-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground">Khách hàng</h1>
                  <Badge variant="secondary" className="text-xs">
                    {mockCustomers.length}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Quản lý hồ sơ khách hàng và thông tin liên kết
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 text-sm">
                <Icons.download className="size-4" />
                Xuất file
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-sm">
                <Icons.upload className="size-4" />
                Nhập file
              </Button>
              <Button size="sm" className="gap-2 text-sm">
                <Icons.plus className="size-4" />
                Thêm khách hàng
              </Button>
            </div>
          </div>
        </header>

        {/* Table Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <CustomersTable
            customers={mockCustomers}
            selectedId={selectedCustomer?.id || null}
            onSelect={handleSelectCustomer}
          />
        </div>
      </div>

      {/* Detail Panel - Slide In */}
      {selectedCustomer && (
        <CustomerDetailPanel
          customer={selectedCustomer}
          onClose={handleClosePanel}
          onEdit={() => console.log("Edit customer", selectedCustomer.id)}
          onMessage={() => console.log("Message customer", selectedCustomer.id)}
        />
      )}
    </div>
  )
}
