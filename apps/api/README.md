# API Structure

File này giải thích cấu trúc của `apps/api`, mục đích của từng folder, vì sao chia như vậy, và khi phát triển tiếp thì mỗi chỗ nên chứa những gì.

## Mục tiêu của cấu trúc này

Backend hiện tại được chia theo hướng:

- đủ gọn để bắt đầu nhanh
- đủ rõ để team phát triển dần mà không rối
- tách phần hạ tầng chung ra khỏi phần nghiệp vụ

Hiện tại chưa cố tình chia quá sâu theo clean architecture đầy đủ. Mục tiêu ở giai đoạn này là:

- `config` riêng
- `database` riêng
- `module nghiệp vụ` riêng
- các file bootstrap của NestJS riêng

## Cấu trúc hiện tại

```text
apps/api/
  prisma/
    schema.prisma
    seed.ts
  src/
    config/
    modules/
      health/
    shared/
      database/
    app.module.ts
    main.ts
    swagger.ts
  .env.example
  eslint.config.mjs
  nest-cli.json
  package.json
  tsconfig.json
  tsconfig.build.json
```

## Giải thích từng phần

### `prisma/`

Đây là nơi chứa phần liên quan đến database schema và seed.

Nên đặt ở đây:

- `schema.prisma`
- migration
- `seed.ts`

Không nên đặt ở đây:

- controller
- service nghiệp vụ
- utility chung

Lý do tách riêng:

- Prisma là phần data layer
- dễ tìm schema và migration
- FE không nên quản lý Prisma, chỉ BE quản lý

### `src/`

Đây là source code chính của backend.

Mọi code chạy thật của API nên nằm ở đây, thay vì rải ra ngoài root.

### `src/main.ts`

Đây là entry point của app.

Hiện file này làm các việc:

- tạo Nest app
- đăng ký CORS
- set global prefix `/api`
- bật versioning `/v1`
- bật validation pipe
- setup swagger
- lắng nghe port

Nên giữ file này tập trung vào bootstrap app, không nhét business logic vào đây.

### `src/app.module.ts`

Đây là root module của NestJS.

Nó có nhiệm vụ:

- import `ConfigModule`
- import `DatabaseModule`
- import các module nghiệp vụ như `HealthModule`

Hiểu đơn giản, đây là nơi lắp các module lại với nhau.

Không nên đặt logic xử lý request hay query DB trong file này.

### `src/swagger.ts`

Đây là file setup Swagger.

Tách riêng ra để:

- `main.ts` đỡ dài
- phần cấu hình docs có chỗ riêng
- dễ sửa sau này nếu muốn thêm auth, title, version, tags

### `src/config/`

Folder này chứa phần cấu hình của app.

Hiện có:

- `app.config.ts`
- `database.config.ts`
- `env.validation.ts`

#### `app.config.ts`

Nơi map các env chung của app như:

- app name
- host
- port
- swagger enabled

#### `database.config.ts`

Nơi map env liên quan database như:

- `DATABASE_URL`

#### `env.validation.ts`

Nơi validate biến môi trường bằng `zod`.

Lý do nên có folder `config` riêng:

- mọi thứ dùng `process.env` có chỗ tập trung
- fail sớm nếu env sai
- không phải đọc env rải rác khắp project

Nên để ở đây:

- config cho app
- config DB
- config JWT sau này
- config Redis / mail / storage sau này

Không nên để ở đây:

- DTO request
- service nghiệp vụ
- query database

### `src/shared/`

Folder này chứa phần dùng chung cho nhiều module.

Hiện tại mới có:

- `shared/database`

Lý do có `shared`:

- tránh lặp code chung giữa các module
- gom phần infrastructure/reusable vào một chỗ

Nên để ở đây sau này:

- database
- common decorators
- guards chung
- interceptors chung
- exception filters chung
- utils thật sự dùng nhiều nơi

Không nên để ở đây:

- logic riêng của `rooms`
- logic riêng của `contracts`
- code chỉ một module dùng

Nếu một thứ chỉ phục vụ một module, để ngay trong module đó tốt hơn.

### `src/shared/database/`

Đây là nơi chứa code kết nối DB dùng chung.

Hiện có:

- `database.module.ts`
- `prisma.service.ts`

#### `prisma.service.ts`

Nơi tạo `PrismaClient` và expose cho toàn app.

Mục đích:

- chỉ có một cách dùng Prisma thống nhất
- module nào cần DB thì inject `PrismaService`
- không tạo `new PrismaClient()` lung tung ở nhiều chỗ

#### `database.module.ts`

Wrap `PrismaService` thành Nest module để import/export gọn hơn.

### `src/modules/`

Đây là nơi chứa các module nghiệp vụ.

Hiện chỉ có:

- `health`

Về sau bạn sẽ thêm dần như:

- `auth`
- `users`
- `apartments`
- `rooms`
- `contracts`
- `payments`

Lý do tách `modules`:

- mỗi domain có chỗ riêng
- team dễ chia việc
- controller/service/dto của feature nào nằm gần nhau

### `src/modules/health/`

Đây là module nhỏ nhất để check hệ thống còn sống không.

Hiện có:

- `health.controller.ts`
- `health.module.ts`

`health.controller.ts`:

- trả về status app
- check DB bằng Prisma query đơn giản

`health.module.ts`:

- khai báo controller cho module health

Mục đích của module này:

- test API khởi động đúng
- test DB kết nối được
- làm ví dụ đơn giản nhất cho cách tạo module mới

## Các file ở root `apps/api`

### `.env.example`

File mẫu để mọi người biết API cần env gì.

Nên commit file này.
Không commit `.env` thật.

### `package.json`

Chứa dependency và scripts của API.

Ví dụ:

- `dev`
- `build`
- `start`
- `lint`
- `typecheck`
- `db:seed`

### `nest-cli.json`

Config cho Nest CLI.

### `eslint.config.mjs`

Config lint cho API.

### `tsconfig.json`

TypeScript config dùng cho IDE và typecheck.

### `tsconfig.build.json`

TypeScript config dùng cho build Nest.

Tách riêng file build config để:

- IDE vẫn thấy cả `prisma/seed.ts`
- build chỉ compile phần cần chạy của app trong `src`

## Vì sao phải chia như vậy

Nếu không chia:

- env nằm rải rác
- DB connection bị tạo lung tung
- feature này lẫn vào feature khác
- file bootstrap phình to
- sau này nhiều người làm rất khó tìm code

Chia như hiện tại giúp:

- rõ nơi đặt code
- dễ thêm feature mới
- không over-engineer quá sớm
- đủ kỷ luật để codebase lớn dần lên

## Khi thêm module mới thì nên làm thế nào

Ở giai đoạn hiện tại, giữ module đơn giản theo pattern này là đủ:

```text
src/modules/rooms/
  dto/
    create-room.dto.ts
    update-room.dto.ts
  rooms.controller.ts
  rooms.service.ts
  rooms.module.ts
```

Ý nghĩa:

- `controller`: nhận request / trả response
- `service`: xử lý nghiệp vụ
- `dto`: validate input
- `module`: gom các thành phần của feature

Đây là mức chia hợp lý để làm dần.

Chưa cần tách thêm `application`, `domain`, `infrastructure` cho mọi module nếu team chưa cần đến mức đó.

## Quy tắc nên giữ

- `prisma/` chỉ chứa schema, migration, seed
- `config/` chỉ chứa config và env validation
- `shared/` chỉ chứa phần thật sự dùng chung
- `modules/` là nơi đặt business features
- không query DB trực tiếp trong `main.ts` hoặc `app.module.ts`
- không để logic của nhiều feature khác nhau vào cùng một service lớn

## Gợi ý mở rộng tiếp theo

Nếu làm dần, thứ tự hợp lý là:

1. `auth`
2. `users`
3. `apartments`
4. `rooms`
5. `customers`
6. `contracts`

Mỗi lần thêm một module, cứ bám đúng form:

- `module`
- `controller`
- `service`
- `dto`

Làm vậy codebase sẽ lớn dần lên nhưng vẫn giữ được trật tự.
