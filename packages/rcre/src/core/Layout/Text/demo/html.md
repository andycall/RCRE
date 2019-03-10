## 渲染原生HTML

设置`rawHtml`为true可以使用原生HTML的模式渲染

```json
{
    "body": [
        {
            "type": "text",
            "text": "<iframe src=\"http://www.baidu.com\" width=\"600\" height=\"300\" />",
            "rawHtml": true
        }
    ]
}
```