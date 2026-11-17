import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { message } from 'antd';
import { request } from '@/services/request';

export default function LoginPage() {
  return (
    <LoginForm
      title="API 拨测系统"
      onFinish={async (values) => {
        try {
          const result = await request<{ token: string }>('/api/v1/admin/login', {
            method: 'POST',
            data: values,
          });
          localStorage.setItem('token', result.token);
          window.location.assign('/');
          return true;
        } catch (error) {
          message.error(error instanceof Error ? error.message : '登录失败');
          return false;
        }
      }}
    >
      <ProFormText name="username" label="用户名" rules={[{ required: true }]} />
      <ProFormText.Password name="password" label="密码" rules={[{ required: true }]} />
    </LoginForm>
  );
}
