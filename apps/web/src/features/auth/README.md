# Auth Module

Mô-đun quản lý xác thực người dùng.

## Cấu trúc thư mục

```
auth/
├── components/
│   ├── LoginForm.tsx      # Form đăng nhập
│   └── index.ts           # Export components
├── types/
│   └── index.ts           # Định nghĩa types
├── services/              # (Sẽ tạo sau) - API calls
├── hooks/                 # (Sẽ tạo sau) - Custom hooks
└── README.md              # File này
```

## Hiện tại có sẵn

### Components
- **LoginForm** - Form đăng nhập với:
  - Validation email & password
  - Error handling
  - Loading state
  - Responsive design (Tailwind CSS)

### Types
- `IUser` - Thông tin người dùng
- `ILoginRequest` - Dữ liệu gửi đăng nhập
- `IAuthResponse` - Response từ server
- `IApiResponse` - Wrapper response chung
- `ILoginFormErrors` - Validate errors
- `ILoginFormValues` - Form values

## Cách sử dụng LoginForm

```tsx
import { LoginForm } from '@/features/auth/components';

export default function LoginPage() {
  const handleLogin = async (values) => {
    // Gọi API đăng nhập
    console.log('Login:', values);
  };

  return (
    <LoginForm 
      onSubmit={handleLogin}
      isLoading={false}
      submitError={undefined}
    />
  );
}
```

## Props của LoginForm

| Prop | Type | Default | Mô tả |
|------|------|---------|-------|
| `onSubmit` | `(values: ILoginFormValues) => Promise<void>` | undefined | Callback khi submit form |
| `isLoading` | `boolean` | false | Trạng thái loading |
| `submitError` | `string` | undefined | Lỗi từ server |

## Tiếp theo

- [ ] Tạo `services/authService.ts` - Xử lý API calls
- [ ] Tạo `hooks/useAuth.ts` - Custom hook để quản lý auth state
- [ ] Tạo `hooks/useLogin.ts` - Hook xử lý logic login
- [ ] Tạo Auth Context để share state toàn app
- [ ] Route bảo vệ (Protected Routes)
