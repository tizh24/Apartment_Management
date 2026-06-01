# Cấu trúc dự án — Nền tảng quản lý Multi-Apartment

> **Stack giả định:** Next.js 14 (App Router) · TypeScript · Tailwind · Zustand · React Query · Prisma

---

## Tổng quan

```
src/
 ├── app/                        # Next.js App Router — routing only
 ├── components/                 # Shared UI toàn app
 ├── constants/                  # Hằng số dùng toàn app
 ├── features/                   # Business domains
 ├── hooks/                      # Shared hooks toàn app
 ├── lib/                        # Infrastructure layer
 ├── providers/                  # Global providers
 ├── services/                   # Shared API calls (nếu có)
 ├── store/                      # Global state (nếu có)
 ├── styles/                     # Global styling
 └── types/                      # Shared types toàn app
```

---

## `app/` — Routing layer

> App Router của Next.js. **Không chứa business logic.** Chỉ import từ `features/`.

```
app/
 ├── (admin)/                    # Route group: staff/admin interface
 │    ├── layout.tsx             # Admin layout (sidebar + navbar)
 │    ├── dashboard/
 │    │    └── page.tsx
 │    ├── rooms/
 │    │    ├── page.tsx          # Danh sách phòng
 │    │    └── [id]/
 │    │         └── page.tsx     # Chi tiết phòng
 │    ├── customers/
 │    │    ├── page.tsx
 │    │    └── [id]/
 │    │         └── page.tsx
 │    ├── contracts/
 │    │    ├── page.tsx
 │    │    └── [id]/
 │    │         └── page.tsx
 │    ├── revenue/
 │    │    └── page.tsx
 │    ├── payments/
 │    │    └── page.tsx
 │    ├── sales/
 │    │    ├── page.tsx
 │    │    └── [id]/
 │    │         └── page.tsx
 │    └── ai/
 │         └── page.tsx
 │
 ├── (guest)/                    # Route group: guest portal
 │    ├── layout.tsx             # Guest layout (minimal, mobile-first)
 │    ├── login/
 │    │    └── page.tsx
 │    └── portal/
 │         ├── page.tsx          # Trang chủ khách: phòng + hóa đơn
 │         ├── invoices/
 │         │    └── page.tsx
 │         ├── payment/
 │         │    └── page.tsx
 │         ├── complaint/
 │         │    └── page.tsx
 │         └── review/
 │              └── page.tsx
 │
 ├── (auth)/
 │    └── login/
 │         └── page.tsx          # Admin login
 │
 └── api/                        # API routes (Next.js)
      ├── auth/
      │    └── [...nextauth]/
      │         └── route.ts
      ├── webhooks/
      │    └── payment/
      │         └── route.ts     # Bank webhook xác minh thanh toán
      └── upload/
           └── route.ts          # Upload giấy tờ, hình ảnh
```

---

## `components/` — Shared UI

> Dùng được ở bất kỳ feature nào. Không chứa business logic domain cụ thể.

```
components/
 ├── ui/                         # Primitive components (shadcn/ui base)
 │    ├── button.tsx
 │    ├── input.tsx
 │    ├── dialog.tsx
 │    ├── table.tsx
 │    ├── badge.tsx
 │    ├── select.tsx
 │    ├── date-picker.tsx
 │    ├── pagination.tsx
 │    ├── skeleton.tsx
 │    ├── toast.tsx
 │    ├── tabs.tsx
 │    ├── card.tsx
 │    ├── avatar.tsx
 │    ├── dropdown-menu.tsx
 │    └── qr-code.tsx            # Shared: dùng ở payment + sale + guest
 │
 ├── layouts/
 │    ├── admin-sidebar.tsx
 │    ├── admin-navbar.tsx
 │    ├── guest-header.tsx
 │    └── page-wrapper.tsx       # Wrapper chuẩn hóa padding/max-width
 │
 └── shared/
      ├── empty-state.tsx        # UI khi danh sách trống
      ├── error-boundary.tsx
      ├── loading-spinner.tsx
      ├── confirm-dialog.tsx     # Dialog xác nhận xóa/hủy
      ├── file-uploader.tsx      # Upload file chung (ảnh, pdf)
      ├── status-badge.tsx       # Badge generic: active/inactive/pending
      └── data-table/
           ├── data-table.tsx    # Table có filter + sort + pagination
           ├── columns.ts
           └── toolbar.tsx
```

---

## `features/` — Business domains

> Mỗi folder = 1 domain. Chỉ chứa logic thuộc domain đó.

### `features/auth/`

```
features/auth/
 ├── components/
 │    ├── login-form.tsx
 │    ├── role-guard.tsx         # Wrapper bảo vệ route theo role
 │    └── permission-check.tsx  # Hiển thị/ẩn UI theo permission
 ├── hooks/
 │    ├── use-auth.ts            # Session, user info, logout
 │    └── use-permissions.ts    # Kiểm tra quyền theo role
 ├── services/
 │    └── auth.service.ts
 └── types/
      └── auth.type.ts          # Role, Permission, Session
```

### `features/dashboard/` [REQ: DASH-01 -> DASH-08]

> Aggregate data từ nhiều domain — không thuộc room hay revenue.

```
features/dashboard/
 ├── components/
 │    ├── stats-overview.tsx     # Grid 4 card: phòng, khách, doanh thu, nợ
 │    ├── occupancy-chart.tsx    # Biểu đồ lấp đầy theo thời gian
 │    ├── revenue-chart.tsx      # Doanh thu theo tháng/quý
 │    ├── overdue-alert.tsx      # Danh sách quá hạn cần xử lý
 │    └── quick-stats-card.tsx  # Card drill-down được
 ├── hooks/
 │    └── use-dashboard.ts      # Fetch tổng hợp, filter theo thời gian
 ├── services/
 │    └── dashboard.service.ts
 └── types/
      └── dashboard.type.ts     # DashboardStats, OccupancyData
```

### `features/room/` [REQ: ROOM-01 -> ROOM-10]

```
features/room/
 ├── components/
 │    ├── room-list.tsx
 │    ├── room-card.tsx
 │    ├── room-detail.tsx
 │    ├── room-form.tsx          # Tạo/cập nhật phòng
 │    ├── room-status-badge.tsx  # Trống / Đang thuê / Bảo trì / ...
 │    ├── utility-input-form.tsx # Nhập chỉ số điện nước đầu/cuối kỳ
 │    ├── utility-history.tsx    # Lịch sử điện nước theo kỳ
 │    └── tenant-history.tsx     # Lịch sử khách từng thuê
 ├── hooks/
 │    ├── use-rooms.ts           # Danh sách, filter, phân trang
 │    ├── use-room-detail.ts
 │    └── use-utility.ts        # CRUD chỉ số điện nước
 ├── services/
 │    └── room.service.ts
 ├── store/
 │    └── room-store.ts         # Filter state, selected room
 └── types/
      └── room.type.ts          # Room, RoomStatus, UtilityReading
```

### `features/customer/` [REQ: CUS-01 -> CUS-08]

```
features/customer/
 ├── components/
 │    ├── customer-list.tsx
 │    ├── customer-form.tsx      # Tạo/cập nhật hồ sơ
 │    ├── customer-detail.tsx
 │    ├── document-upload.tsx   # Upload CCCD/hộ chiếu/visa
 │    ├── document-viewer.tsx   # Xem giấy tờ với phân quyền
 │    ├── customer-status.tsx   # Đang thuê / Hết HĐ / Tiềm năng
 │    └── contract-history.tsx  # Lịch sử hợp đồng của khách
 ├── hooks/
 │    ├── use-customers.ts
 │    ├── use-customer-detail.ts
 │    └── use-customer-documents.ts
 ├── services/
 │    └── customer.service.ts
 ├── store/
 │    └── customer-store.ts
 └── types/
      └── customer.type.ts      # Customer, CustomerStatus, Document
```

### `features/contract/` [REQ: CON-01 -> CON-09]

> Nghiệp vụ phức tạp nhất — sau khi tạo HĐ, trigger cập nhật room + customer + sale.

```
features/contract/
 ├── components/
 │    ├── contract-list.tsx
 │    ├── contract-form.tsx      # Tạo HĐ: chọn phòng + khách + sale
 │    ├── contract-detail.tsx
 │    ├── conflict-checker.tsx  # Cảnh báo trùng lịch thuê
 │    ├── contract-timeline.tsx # Ngày đến → ngày đi, còn bao lâu
 │    ├── expiry-alert.tsx      # HĐ sắp hết hạn 7/15/30 ngày
 │    ├── contract-actions.tsx  # Gia hạn / Kết thúc sớm / Hủy
 │    └── change-history.tsx   # Audit log thay đổi HĐ
 ├── hooks/
 │    ├── use-contracts.ts
 │    ├── use-contract-detail.ts
 │    └── use-contract-form.ts  # Multi-step form logic
 ├── services/
 │    └── contract.service.ts
 ├── store/
 │    └── contract-store.ts
 └── types/
      └── contract.type.ts      # Contract, ContractStatus, ContractChange
```

### `features/payment/` [REQ: GUEST-09 -> GUEST-13; SALE-06 -> SALE-07]

> Core payment engine — dùng bởi `revenue/`, `guest-portal/`, và `sale/`.

```
features/payment/
 ├── components/
 │    ├── qr-payment-modal.tsx  # Modal: sinh QR + countdown 5 phút
 │    ├── payment-countdown.tsx # Timer hiệu lực QR
 │    ├── payment-verify.tsx    # Polling / hiển thị kết quả xác minh
 │    └── payment-result.tsx    # Thành công / Thất bại / Timeout
 ├── hooks/
 │    ├── use-qr-payment.ts     # Sinh QR, quản lý 5 phút timeout
 │    └── use-payment-verify.ts # Auto polling xác minh giao dịch
 ├── services/
 │    └── payment.service.ts    # Gọi bank API / webhook handler
 └── types/
      └── payment.type.ts       # QRPayload, PaymentStatus, Transaction
```

### `features/revenue/` [REQ: REV-01 -> REV-09]

> Invoice + công nợ. Dùng `features/payment/` để xác nhận thanh toán.

```
features/revenue/
 ├── components/
 │    ├── invoice-list.tsx
 │    ├── invoice-detail.tsx
 │    ├── invoice-form.tsx       # Tạo khoản phải thu thủ công
 │    ├── payment-status.tsx    # Chưa trả / Một phần / Đã trả / Quá hạn
 │    ├── partial-payment.tsx   # Ghi nhận thanh toán nhiều đợt
 │    ├── receipt-uploader.tsx  # Upload bằng chứng chuyển khoản
 │    ├── debt-tracker.tsx      # Theo dõi tổng công nợ
 │    └── revenue-report.tsx    # Báo cáo + xuất Excel/PDF
 ├── hooks/
 │    ├── use-invoices.ts
 │    ├── use-revenue-report.ts
 │    └── use-debt-summary.ts
 ├── services/
 │    └── revenue.service.ts
 ├── store/
 │    └── revenue-store.ts      # Filter: thời gian, phòng, trạng thái
 └── types/
      └── revenue.type.ts       # Invoice, InvoiceStatus, RevenueReport
```

### `features/sale/` [REQ: SALE-01 -> SALE-09]

> Quản lý sale và hoa hồng. Dùng `features/payment/` để thanh toán hoa hồng.

```
features/sale/
 ├── components/
 │    ├── sale-list.tsx
 │    ├── sale-form.tsx          # Tạo/cập nhật hồ sơ sale
 │    ├── sale-detail.tsx
 │    ├── commission-table.tsx  # Danh sách hợp đồng + hoa hồng
 │    ├── commission-selector.tsx # Tick chọn nhiều HĐ để thanh toán
 │    └── commission-summary.tsx # Tổng tiền hoa hồng đã chọn
 ├── hooks/
 │    ├── use-sales.ts
 │    ├── use-commissions.ts
 │    └── use-commission-payment.ts # Chọn HĐ → tính tổng → sinh QR
 ├── services/
 │    └── sale.service.ts
 ├── store/
 │    └── sale-store.ts         # Selected contracts, filter state
 └── types/
      └── sale.type.ts          # Sale, Commission, CommissionStatus
```

### `features/guest-portal/` [REQ: GUEST-01 -> GUEST-16]

> Micro-app cho khách thuê — audience khác, flow login riêng, mobile-first.

```
features/guest-portal/
 ├── components/
 │    ├── guest-login-form.tsx  # Đăng nhập bằng số phòng + mật khẩu
 │    ├── change-password.tsx  # Đổi mật khẩu sau lần đầu đăng nhập
 │    ├── room-info-card.tsx   # Thông tin phòng + HĐ của khách
 │    ├── invoice-list.tsx     # Danh sách hóa đơn theo kỳ
 │    ├── invoice-card.tsx     # 1 hóa đơn: số tiền + hạn + trạng thái
 │    ├── pay-button.tsx       # Nút thanh toán → trigger QR modal
 │    ├── complaint-form.tsx   # Gửi khiếu nại / yêu cầu hỗ trợ
 │    └── review-form.tsx      # Đánh giá dịch vụ khi hết HĐ
 ├── hooks/
 │    ├── use-guest-auth.ts    # Login, session, đổi mật khẩu
 │    ├── use-guest-room.ts    # Thông tin phòng + HĐ của khách
 │    ├── use-guest-invoices.ts
 │    └── use-complaint.ts
 ├── services/
 │    └── guest.service.ts
 └── types/
      └── guest.type.ts        # GuestSession, GuestInvoice, Complaint
```

### `features/ai-assistant/` [REQ: AI-01 -> AI-06]

> Priority thấp — tách riêng để bật/tắt mà không ảnh hưởng core.

```
features/ai-assistant/
 ├── components/
 │    ├── ocr-scanner.tsx       # Upload giấy tờ → OCR → preview
 │    ├── ocr-confirm-form.tsx  # Nhân viên kiểm tra + xác nhận data
 │    ├── review-analyzer.tsx   # Phân tích đánh giá theo nhóm vấn đề
 │    └── chatbot-widget.tsx    # Chatbot nổi cho guest portal
 ├── hooks/
 │    ├── use-ocr.ts
 │    └── use-review-analysis.ts
 ├── services/
 │    └── ai.service.ts
 └── types/
      └── ai.type.ts            # OcrResult, ReviewAnalysis, ChatMessage
```

---

## `hooks/` — Shared hooks

```
hooks/
 ├── use-debounce.ts             # Debounce search input
 ├── use-mobile.ts               # Responsive breakpoint detection
 ├── use-theme.ts                # Light/dark mode
 ├── use-pagination.ts           # Shared pagination state
 ├── use-clipboard.ts            # Copy to clipboard
 └── use-file-download.ts       # Trigger download Excel/PDF
```

---

## `lib/` — Infrastructure layer

```
lib/
 ├── axios.ts                    # Axios instance + interceptors
 ├── prisma.ts                   # Prisma client singleton
 ├── auth.ts                     # NextAuth config
 ├── env.ts                      # Type-safe env vars (zod)
 ├── utils.ts                    # cn(), formatDate(), formatCurrency()
 ├── qr.ts                       # QR generation utility
 └── export.ts                   # Excel/PDF export helpers
```

---

## `providers/` — Global providers

```
providers/
 ├── index.tsx                   # Root provider wrapper
 ├── query-provider.tsx          # React Query (TanStack Query)
 ├── session-provider.tsx        # NextAuth session
 └── theme-provider.tsx          # next-themes
```

---

## `constants/` — Shared constants

```
constants/
 ├── routes.ts                   # Route paths (type-safe)
 ├── roles.ts                    # ADMIN | STAFF | ACCOUNTANT | SALE | GUEST
 ├── permissions.ts              # Permission map theo role
 ├── room-status.ts              # VACANT | OCCUPIED | RESERVED | MAINTENANCE
 ├── invoice-status.ts           # UNPAID | PARTIAL | PAID | OVERDUE | CANCELLED
 ├── contract-status.ts          # ACTIVE | EXPIRED | CANCELLED | EXTENDED
 └── qr.ts                       # QR_EXPIRY_SECONDS = 300
```

---

## `types/` — Shared types

```
types/
 ├── api.ts                      # ApiResponse<T>, ApiError, PaginatedResponse<T>
 ├── common.ts                   # ID, Timestamp, Nullable<T>
 └── pagination.ts               # PaginationParams, SortParams
```

---

## `styles/` — Global styling

```
styles/
 ├── globals.css                 # Tailwind base + CSS variables
 └── animations.css              # Shared keyframes
```

---

## Dependency flow

```
app/           → features/
features/      → components/, hooks/, lib/, constants/, types/
features/payment/ ← features/revenue/ + features/sale/ + features/guest-portal/
features/      ✗ không import lẫn nhau (trừ payment là exception có chủ đích)
components/    → lib/, types/
hooks/         → lib/, types/
```

---

## MVP — Thứ tự build

| Phase | Features                        | Ghi chú              |
| ----- | ------------------------------- | --------------------- |
| 1     | `auth`+`dashboard`+`room` | Setup + core views    |
| 2     | `customer`+`contract`       | Business flow chính  |
| 3     | `payment`+`revenue`         | Thu tiền + xác minh |
| 4     | `guest-portal`                | Cổng khách thuê    |
| 5     | `sale`                        | Hoa hồng             |
| 6     | `ai-assistant`                | Nice to have          |

---

## Quy tắc đặt file

| Pattern   | Ví dụ               |
| --------- | --------------------- |
| Component | `kebab-case.tsx`    |
| Hook      | `use-kebab-case.ts` |
| Service   | `domain.service.ts` |
| Store     | `domain-store.ts`   |
| Type      | `domain.type.ts`    |
| Constant  | `domain-status.ts`  |

---

*Tài liệu này dựa trên Requirement_Manage_Multi_Apartment.docx*
