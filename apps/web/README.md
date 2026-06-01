# Tổng quan dự án — Nền tảng quản lý Multi-Apartment

---

## 1. Bối cảnh & Mục tiêu

Tài liệu này mô tả các yêu cầu chức năng và phi chức năng cho hệ thống quản lý apartment, nhằm thay thế quy trình quản lý thủ công bằng Excel và nhắn tin kiểm tra thanh toán qua WhatsApp. Hệ thống tập trung vào việc số hóa toàn bộ quy trình vận hành từ lúc khách đặt phòng, tạo hợp đồng, nhận phòng, thanh toán định kỳ, phát sinh công nợ, xử lý khiếu nại đến khi khách trả phòng và đánh giá dịch vụ.

**Phạm vi áp dụng:** Hệ thống phù hợp cho doanh nghiệp/cá nhân đang vận hành nền tảng chuỗi nhiều tòa nhà, apartment (multi-apartment), có nhu cầu quản lý phòng, khách thuê, sale, khoản phải thu, khoản chưa thanh toán và trải nghiệm khách thuê thông qua giao diện riêng.

---

## 2. Tech Stack

| Layer         | Công nghệ                         | Lý do chọn                                |
| ------------- | ----------------------------------- | ------------------------------------------- |
| Framework     | Next.js 14 (App Router)             | SSR + API routes trong 1 repo               |
| Language      | TypeScript                          | Type safety xuyên suốt                    |
| Styling       | Tailwind CSS + shadcn/ui            | Rapid UI, dễ customize                     |
| State         | Zustand                             | Nhẹ, đủ dùng cho management app         |
| Data fetching | TanStack Query (React Query)        | Cache, refetch, optimistic update           |
| ORM           | Prisma                              | Type-safe DB access, migration dễ          |
| Database      | PostgreSQL                          | Relational, phù hợp dữ liệu tài chính |
| Auth          | NextAuth.js                         | Session management, role-based              |
| File upload   | AWS S3 / Cloudflare R2              | Lưu giấy tờ, hình ảnh phòng           |
| QR            | `qrcode` npm package                | Sinh QR thanh toán                         |
| Export        | `exceljs`+`@react-pdf/renderer`       | Xuất báo cáo Excel/PDF                   |
| AI/OCR        | Google Vision API / AWS Textract    | Quét hộ chiếu, CCCD (phase 6)            |

---

## 3. Vai trò người dùng

| Vai trò                         | Mô tả                     | Quyền chính                                       |
| -------------------------------- | --------------------------- | --------------------------------------------------- |
| **Admin/Chủ apartment**          | Người quản lý cao nhất của hệ thống. | Quản lý toàn bộ dữ liệu, cấu hình hệ thống, xem dashboard, doanh thu, công nợ và báo cáo. |
| **Nhân viên vận hành**           | Người phụ trách quản lý phòng, khách và hợp đồng. | Tạo/cập nhật phòng, khách hàng, hợp đồng thuê, nhập điện nước, theo dõi thanh toán. |
| **Kế toán/Thu ngân**             | Người phụ trách khoản phải thu và xác nhận thanh toán. | Theo dõi doanh thu, khoản chưa trả, xác nhận giao dịch, xuất báo cáo. |
| **Sale/Cộng tác viên**           | Người giới thiệu hoặc kiếm hợp đồng thuê. | Xem các hợp đồng do mình kiếm được, hoa hồng tương ứng và trạng thái thanh toán hoa hồng. |
| **Khách thuê**                   | Người đang thuê hoặc từng thuê phòng. | Đăng nhập cổng khách hàng, xem thông tin phòng, khoản phải trả, thanh toán, gửi khiếu nại và đánh giá dịch vụ. |

---

## 4. Danh sách chức năng chính & Các tính năng

| Mã module | Tên chức năng | Mục tiêu |
| --------- | ------------- | -------- |
| **DASH** | Dashboard | Cung cấp tổng quan số phòng, lượng khách, doanh thu, khoản chưa trả và tình hình vận hành theo thời gian. |
| **ROOM** | Quản lý phòng | Quản lý tình trạng phòng, giá, diện tích, khách đang thuê, thời gian thuê, điện nước và khoản thanh toán theo kỳ. |
| **CUS** | Quản lý khách hàng | Lưu thông tin khách, giấy tờ, tình trạng thuê, lịch sử hợp đồng và khoản phải trả. |
| **CON** | Quản lý hợp đồng thuê | Tạo và quản lý hợp đồng thuê, ngày đến, ngày đi, thời hạn thuê và điều khoản. |
| **SALE** | Quản lý sale | Theo dõi sale, hợp đồng kiếm được, hoa hồng, thanh toán hoa hồng và mã QR thanh toán. |
| **REV** | Quản lý doanh thu | Theo dõi các khoản phải thu, tiền phòng, chi phí phát sinh, trạng thái đã thanh toán/chưa thanh toán. |
| **GUEST** | Cổng khách hàng | Cho phép khách xem phòng, thanh toán, gửi yêu cầu trợ giúp/khiếu nại và đánh giá dịch vụ. |
| **AI** | Chức năng AI phụ trợ | Phân tích đánh giá khách hàng, chatbot trả lời cơ bản và quét giấy tờ khi tạo hợp đồng. |

---

## 5. Luồng xử lý nghiệp vụ chính

### 5.1. Luồng tạo hợp đồng khi khách đặt phòng
1. Chọn phòng
2. Tạo / chọn hồ sơ khách
3. Nhập thông tin HĐ (ngày đến, ngày đi, giá, cọc, sale nếu có)
4. Kiểm tra xung đột lịch
5. Tạo hợp đồng (nếu hợp lệ)
6. Auto cập nhật trạng thái phòng + trạng thái khách + hoa hồng sale

### 5.2. Luồng khách nhận phòng và truy cập cổng khách hàng
1. Nhận phòng -> Xác nhận trên hệ thống
2. Hệ thống sinh QR truy cập cổng khách
3. Khách quét QR → đăng nhập (số phòng + mật khẩu ddmm)
4. [Lần đầu] Yêu cầu đổi mật khẩu
5. Khách xem phòng, HĐ, hóa đơn

### 5.3. Luồng thanh toán bằng QR (khách)
1. Khách chọn khoản cần trả trên giao diện khách hàng.
2. Hệ thống sinh QR đúng số tiền và số tài khoản nhận tiền (hiệu lực 5 phút).
3. Khách chuyển khoản.
4. Hệ thống kiểm tra xác minh giao dịch trong vòng 5 phút (polling / webhook).
5. [Thành công] Cập nhật Đã trả. [Timeout/Thất bại] Thông báo chưa thành công để khách kiểm tra lại.

### 5.4. Luồng thanh toán hoa hồng sale
1. Quản lý lọc HĐ theo sale + khoảng thời gian
2. Tick chọn các HĐ cần thanh toán hoa hồng
3. Hệ thống tính tổng tiền + sinh QR vào số tài khoản sale
4. Quản lý chuyển khoản
5. Xác nhận → Lưu lịch sử thanh toán → Đánh dấu đã trả (chống trùng)

---

## 6. Mô hình dữ liệu & Yêu cầu dữ liệu chính

| Nhóm dữ liệu | Thông tin cần lưu |
| ------------ | ----------------- |
| **Phòng** | Số phòng, tầng/khu vực, diện tích, giá thuê, trạng thái, tiện ích, hình ảnh, lịch sử khách thuê, chỉ số điện nước, khoản thanh toán |
| **Khách hàng** | Họ tên, ngày sinh, SĐT, email, quốc tịch, hộ chiếu/CCCD, visa, tình trạng thuê, lịch sử hợp đồng, khoản phải trả |
| **Hợp đồng thuê** | Phòng, khách, ngày đến, ngày đi, thời gian thuê, giá thuê, tiền cọc, điều khoản, sale liên quan, trạng thái hợp đồng |
| **Sale** | Tên, số điện thoại, số tài khoản, ngân hàng, hợp đồng kiếm được, hoa hồng, trạng thái thanh toán hoa hồng |
| **Doanh thu** | Loại khoản thu, số tiền, hạn thanh toán, trạng thái thanh toán, bằng chứng thanh toán |
| **Khiếu nại/Hỗ trợ** | Khách gửi, phòng, nội dung, hình ảnh, trạng thái xử lý, người phụ trách |
| **Đánh giá dịch vụ** | Khách đánh giá, hợp đồng liên quan, điểm đánh giá, nội dung phản hồi, nhóm vấn đề do AI phân tích |

```
Platform / Organization
 └── Apartment / Building (1-n)
      └── Room (1-n)
           └── Contract (1-n)
                ├── Customer (n-1)
                ├── Sale (n-1, optional)
                └── Invoice (1-n)
                     └── PaymentRecord (1-n)

Customer
 └── Document (1-n)       # CCCD, hộ chiếu, visa

Sale
 └── Commission (1-n)     # Hoa hồng theo từng HĐ

Room
 └── UtilityReading (1-n) # Chỉ số điện nước theo kỳ

Customer
 └── Complaint (1-n)      # Khiếu nại / yêu cầu hỗ trợ
 └── Review (1-n)         # Đánh giá dịch vụ
```

---

## 7. Yêu cầu phi chức năng

| Mã yêu cầu | Nhóm | Yêu cầu |
| ---------- | ---- | ------- |
| **NFR-01** | Bảo mật | Hệ thống phải mã hóa mật khẩu người dùng và không lưu mật khẩu dạng văn bản thuần. |
| **NFR-02** | Bảo mật | Thông tin hộ chiếu, visa, CCCD, hợp đồng và dữ liệu thanh toán phải được phân quyền truy cập chặt chẽ. |
| **NFR-03** | Bảo mật | Khách hàng chỉ được xem dữ liệu của phòng/hợp đồng thuộc về mình. |
| **NFR-04** | Bảo mật | Mã QR thanh toán của khách phải có thời hạn hiệu lực 5 phút để hạn chế thanh toán sai/dùng lại. |
| **NFR-05** | Hiệu năng | Các màn hình danh sách phải hỗ trợ tìm kiếm, lọc và phân trang (không load all). |
| **NFR-06** | Dễ sử dụng | Giao diện cần đơn giản, dễ thao tác, phù hợp với người quen dùng Excel. |
| **NFR-07** | Tương thích | Hoạt động tốt trên desktop và mobile, đặc biệt là giao diện khách hàng. |
| **NFR-08** | Audit log | Lưu lịch sử các thao tác quan trọng: tạo hợp đồng, sửa khoản thu, xác nhận/thanh toán hoa hồng. |
| **NFR-09** | Backup | Dữ liệu hệ thống nên được sao lưu định kỳ. |
| **NFR-10** | Mở rộng | Kiến trúc đa cơ sở (Multi-tenant) hỗ trợ mạnh mẽ việc duy trì/mở rộng nhiều tòa nhà (apartment). |

---

## 8. MVP – Phạm vi ưu tiên phát triển

| Khu vực | Ưu tiên | Chức năng (Mã chức năng) |
| ------- | ------- | ------------------------ |
| **DASH** | **Cao** | Tổng quan số phòng, lấp đầy, doanh thu, nợ chưa thu theo thời gian |
| **ROOM** | **Cao** | Quản lý & trạng thái phòng (Trống, Đang thuê...) |
| **CUS** | **Cao** | Quản lý hồ sơ, giấy tờ khách hàng cơ bản |
| **CON** | **Cao** | Khởi tạo, theo dõi và quản lý hợp đồng thuê |
| **REV / PAY** | **Cao** | Quản lý khoản phải thu, công nợ, tạo QR thanh toán và đối soát |
| **GUEST** | **Cao** | Cổng khách hàng (login số phòng & mật khẩu ddmm đổi lần đầu) |
| **SALE** | Trung bình | Quản lý sale và hoa hồng sale |
| **ROOM** | Trung bình | Ghi nhận/tính toán điện nước |
| **GUEST** | Trung bình | Giao diện gửi khiếu nại trợ giúp từ khách hàng |
| **AI** | Thấp | AI review analyzer (nhận diện phàn nàn) |
| **AI** | Thấp | AI Chatbot trả lời câu hỏi cơ bản |
| **AI** | Thấp | OCR tự động điền giấy tờ hộ chiếu, CCCD (cần con người verify) |

---

## Ghi chú kỹ thuật quan trọng

- **Mật khẩu & Mã QR:** 
  - Mật khẩu `ddmm` chỉ giới hạn cho đăng nhập lần đầu. Yêu cầu đổi!
  - Mã QR thanh toán cần sinh riêng cho từng giao dịch (ID duy nhất), timeout cực kỹ <= 5 phút.
- **Xác minh thanh toán:** Phụ thuộc vào NH hoặc cổng trung gian. Cần webhook đối soát trong 5 phút.
- **Giấy tờ cá nhân:** Cần phân quyền xem/tải xuống nghiêm ngặt, khuyến khích mã hóa.
- **Dữ liệu AI:** Toàn bộ text xuất ra từ AI hay OCR **không được tự động lưu trực tiếp** vào database. Luôn cần giao diện confirm hiển thị để nhân viên xác nhận.
