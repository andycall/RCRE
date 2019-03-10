# Text 文本

用于展示纯文本，不支持显示HTML字符串

## 代码演示

{{demo}}

## API

| 属性        | 说明     | 类型               | 是否必须  | 默认值   |
| --------- | ------ | ---------------- | ----- | ----- |
| text      | 显示的文本  | string           | true  | -     |
| textType  | 文本类型   | text,link,strong | false | text  |
| href      | 跳转链接   | string           | false | -     |
| thousands | 添加千分位符 | boolean          | false | false | 
| rawHtml | 采用innerHTML的方式, 警告： 会有xss注入风险 | boolean | false | false |
|style | CSS内联属性 | CSSProperties | false |-|
|className | class Class | string | false | -|
| rightAddon | 右侧添加额外的文字 | string | false | - |


