# Tổng quan dự án — Hệ thống quản lý Apartment

---

## Bối cảnh & mục tiêu

Hệ thống thay thế quy trình quản lý thủ công bằng Excel và nhắn tin kiểm tra thanh toán qua WhatsApp. Mục tiêu số hóa toàn bộ vòng đời vận hành:

```
Đặt phòng → Hợp đồng → Nhận phòng → Thanh toán định kỳ → Phát sinh công nợ → Khiếu nại → Trả phòng → Đánh giá
```

**Đối tượng sử dụng:** Doanh nghiệp/cá nhân vận hành một hoặc nhiều apartment.

---

## Tech stack

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
| QR            | `qrcode`npm package               | Sinh QR thanh toán                         |
| Export        | `exceljs`+`@react-pdf/renderer` | Xuất báo cáo Excel/PDF                   |
| AI/OCR        | Google Vision API / AWS Textract    | Quét hộ chiếu, CCCD (phase 6)            |

---

## Vai trò người dùng

| Vai trò                         | Mô tả                     | Quyền chính                                       |
| -------------------------------- | --------------------------- | --------------------------------------------------- |
| **Admin**                  | Chủ apartment              | Toàn quyền — config, báo cáo, doanh thu        |
| **Nhân viên vận hành** | Staff quản lý hàng ngày | Phòng, khách, hợp đồng, điện nước          |
| **Kế toán**              | Thu ngân, đối soát      | Khoản phải thu, xác nhận thanh toán, báo cáo |
| **Sale**                   | Cộng tác viên            | Xem HĐ + hoa hồng của mình                      |
| **Khách thuê**           | Tenant                      | Cổng khách: xem phòng, thanh toán, khiếu nại  |

---

## Modules & độ ưu tiên MVP

### 🔴 Ưu tiên cao — Phase 1–4

#### DASH — Dashboard

Tổng quan vận hành theo thời gian thực.

* Tổng phòng / đang thuê / trống / sắp hết HĐ / bảo trì
* Tỷ lệ lấp đầy theo ngày, tháng, quý
* Doanh thu theo thời gian
* Tổng công nợ chưa trả
* Danh sách quá hạn cần xử lý
* Drill-down: nhấn vào chỉ số → xem danh sách chi tiết

#### ROOM — Quản lý phòng

* CRUD phòng: số phòng, tầng, diện tích, giá, tiện ích, hình ảnh
* 6 trạng thái: `Trống` `Đang thuê` `Đã đặt trước` `Sắp trả` `Bảo trì` `Ngừng sử dụng`
* Nhập chỉ số điện nước đầu/cuối kỳ → tự động tính chi phí
* Cảnh báo chỉ số bất hợp lệ (cuối kỳ < đầu kỳ)
* Xem lịch sử khách từng thuê phòng
* Auto cập nhật trạng thái khi tạo hợp đồng

#### CUS — Quản lý khách hàng

* Hồ sơ: họ tên, ngày sinh, SĐT, email, quốc tịch, CCCD/hộ chiếu/visa
* Upload & lưu giấy tờ (phân quyền chặt)
* 4 trạng thái: `Đang thuê` `Hết HĐ` `Đã hủy` `Tiềm năng`
* Lịch sử hợp đồng + khoản phải trả
* Tìm kiếm theo tên, SĐT, CCCD, số phòng

#### CON — Quản lý hợp đồng

* Tạo HĐ: phòng + khách + ngày đến/đi + giá + cọc + điều khoản + sale
* Kiểm tra xung đột lịch trước khi tạo
* Sau khi tạo: auto cập nhật trạng thái phòng + khách + hoa hồng sale
* Gia hạn / kết thúc sớm / hủy HĐ
* Audit log mọi thay đổi (ai, lúc nào, thay đổi gì)
* Cảnh báo HĐ sắp hết hạn: 7 / 15 / 30 ngày (configurable)

#### PAY — Payment engine

* Sinh QR thanh toán: đúng số tiền + đúng tài khoản + nội dung CK duy nhất
* QR có hiệu lực **5 phút**
* Auto xác minh giao dịch qua bank webhook/API đối soát
* Nếu timeout → thông báo thất bại, yêu cầu thử lại
* Dùng bởi: `revenue/`, `sale/`, `guest-portal/`

#### REV — Doanh thu & khoản phải thu

* Tạo hóa đơn theo kỳ (tiền phòng + điện + nước + phí phát sinh)
* 5 trạng thái: `Chưa trả` `Thanh toán một phần` `Đã trả` `Quá hạn` `Đã hủy`
* Ghi nhận nhiều lần thanh toán (partial payment)
* Lưu bằng chứng: ảnh chuyển khoản, mã giao dịch
* Lọc theo thời gian / phòng / khách / trạng thái / loại khoản
* Xuất báo cáo Excel/PDF

#### GUEST — Cổng khách hàng

* Đăng nhập: số phòng + mật khẩu mặc định `ddmm` (ngày sinh)
* Bắt buộc đổi mật khẩu sau lần đăng nhập đầu tiên
* Xem thông tin phòng + HĐ + hóa đơn theo kỳ
* Thanh toán bằng QR (5 phút timeout)
* Gửi khiếu nại / yêu cầu hỗ trợ
* Đánh giá dịch vụ khi thanh toán khoản cuối cùng trước khi hết HĐ

---

### 🟡 Ưu tiên trung bình — Phase 5

#### SALE — Quản lý sale & hoa hồng

* Hồ sơ sale: tên, SĐT, số tài khoản, ngân hàng
* Gắn sale vào từng HĐ khi tạo
* Tính hoa hồng theo công thức/số tiền được cấu hình
* Tick chọn nhiều HĐ → tính tổng hoa hồng → sinh QR chuyển khoản
* Lịch sử thanh toán hoa hồng, chống trả trùng

---

### 🟢 Ưu tiên thấp — Phase 6

#### AI — Chức năng AI phụ trợ

* **OCR:** Quét hộ chiếu/CCCD/visa khi tạo khách — nhân viên xác nhận trước khi lưu
* **Review analyzer:** Phân tích đánh giá khách theo nhóm vấn đề (vệ sinh, tiếng ồn, bảo trì, WiFi...)
* **Chatbot:** Trả lời câu hỏi cơ bản cho khách (phòng, thanh toán, nội quy); không xử lý được → tạo ticket

> ⚠️ AI chỉ hỗ trợ, **không tự động lưu** dữ liệu quan trọng. Luôn cần nhân viên xác nhận.

---

## Luồng nghiệp vụ chính

### 1. Đặt phòng & tạo hợp đồng

```
Chọn phòng
    ↓
Tạo / chọn hồ sơ khách
    ↓
Nhập thông tin HĐ (ngày đến, ngày đi, giá, cọc, sale nếu có)
    ↓
Kiểm tra xung đột lịch
    ↓ [hợp lệ]
Tạo hợp đồng
    ↓
Auto cập nhật: trạng thái phòng + trạng thái khách + hoa hồng sale
```

### 2. Nhận phòng & truy cập cổng khách

```
Nhân viên xác nhận nhận phòng
    ↓
Hệ thống sinh QR truy cập cổng khách
    ↓
Khách quét QR → đăng nhập (số phòng + mật khẩu ddmm)
    ↓
[Lần đầu] Yêu cầu đổi mật khẩu
    ↓
Khách xem phòng, HĐ, hóa đơn
```

### 3. Thanh toán bằng QR (khách)

```
Khách chọn khoản cần trả
    ↓
Hệ thống sinh QR (số tiền + tài khoản + nội dung duy nhất)
    ↓
QR hiệu lực 5 phút
    ↓
Khách chuyển khoản
    ↓
Hệ thống auto xác minh (polling / webhook) trong 5 phút
    ↓ [thành công]           ↓ [timeout]
Cập nhật: Đã trả       Thông báo thất bại
                        Yêu cầu thử lại
```

### 4. Thanh toán hoa hồng sale

```
Admin vào màn hình sale
    ↓
Lọc HĐ theo sale + khoảng thời gian
    ↓
Tick chọn các HĐ cần trả hoa hồng
    ↓
Hệ thống tính tổng + sinh QR (tài khoản của sale)
    ↓
Admin chuyển khoản
    ↓
Xác nhận → Lưu lịch sử → Đánh dấu đã trả (chống trả trùng)
```

---

## Mô hình dữ liệu

```
Apartment
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

## Yêu cầu phi chức năng

| Nhóm                 | Yêu cầu                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Bảo mật**   | Mã hóa mật khẩu (bcrypt). Phân quyền chặt cho giấy tờ nhạy cảm. Khách chỉ xem dữ liệu của mình. QR hết hạn sau 5 phút |
| **Hiệu năng** | Danh sách phải có filter + sort + phân trang. Không load all records                                                                 |
| **Responsive**  | Hoạt động tốt trên desktop và mobile — đặc biệt guest portal                                                                    |
| **Audit log**   | Lưu lịch sử mọi thao tác quan trọng: tạo HĐ, sửa khoản thu, xác nhận thanh toán                                              |
| **Backup**      | Sao lưu dữ liệu định kỳ                                                                                                             |
| **Scalability** | Thiết kế hỗ trợ nhiều apartment / chi nhánh trong tương lai                                                                       |

---

## Ghi chú kỹ thuật quan trọng

**QR Payment**
Mỗi QR phải có nội dung chuyển khoản duy nhất (ví dụ: `HDAPT-{contractId}-{invoiceId}-{timestamp}`) để hệ thống đối soát chính xác. Không dùng chung 1 QR cho nhiều giao dịch.

**Xác minh thanh toán tự động**
Phụ thuộc vào ngân hàng/cổng thanh toán tích hợp. Cần chọn sớm: VietQR + webhook từ MB Bank / VPBank / Vietcombank, hoặc dùng trung gian như SePay / PayOS.

**Mật khẩu khách thuê**
Mật khẩu `ddmm` chỉ dùng lần đầu. Bắt buộc đổi mật khẩu ngay sau đăng nhập đầu tiên. Không gửi mật khẩu qua tin nhắn/email dạng plain text.

**Giấy tờ cá nhân**
CCCD, hộ chiếu, visa là dữ liệu nhạy cảm. Giới hạn quyền xem + download. Nên encrypt file trước khi upload lên S3.

**AI/OCR**
Data trích xuất từ AI không được tự động lưu. Luôn hiển thị để nhân viên review và xác nhận trước khi commit vào database.

---

## Kế hoạch phát triển

| Phase | Nội dung                               | Ước tính |
| ----- | --------------------------------------- | ----------- |
| 1     | Setup project + Auth + Dashboard + Room | 2–3 tuần  |
| 2     | Customer + Contract                     | 2–3 tuần  |
| 3     | Payment engine + Revenue                | 2–3 tuần  |
| 4     | Guest portal                            | 1–2 tuần  |
| 5     | Sale & hoa hồng                        | 1–2 tuần  |
| 6     | AI/OCR + Review analyzer + Chatbot      | 2–4 tuần  |

---

*Tài liệu này tổng hợp từ Requirement_Manage_Apartment.docx*
*Cập nhật lần cuối: 2026*
