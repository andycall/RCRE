import {notification} from 'antd';

export function showNotice({params}) {
  notification.success({
    message: '已成功发送username:' + params.username
  });
}