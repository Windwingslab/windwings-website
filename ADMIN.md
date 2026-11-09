# 作品后台使用说明（鹏哥）

线上入口（部署完成后）：

[https://windwingslab.github.io/windwings-website/admin](https://windwingslab.github.io/windwings-website/admin)

官网首页：

[https://windwingslab.github.io/windwings-website/](https://windwingslab.github.io/windwings-website/)

## 它做什么

- 列出 `content/projects.json` 里的作品
- 改标题、英文名、分类、简介、占位标记
- 上传 / 替换封面 `cover.jpg`、现场图 `live-cover.jpg`、影片 `film.mp4`
- 新增作品（新 id 文件夹 + JSON 条目）
- 保存后直接提交到仓库 `main`，GitHub Actions 约 **1–2 分钟** 后更新线上

## 第一次：创建 Fine-grained PAT

1. 打开 GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate
2. Token name 随便，例如 `windwings-admin`
3. Resource owner 选有权的账号 / 组织
4. Repository access → **Only select repositories** → 只勾 `Windwingslab/windwings-website`
5. Permissions → Repository permissions → **Contents: Read and write**
6. 生成后复制 token（只显示一次）

注意：

- **不要把 PAT 发到微信 / 聊天 / 群里**
- PAT 只粘贴进后台登录框，存在浏览器 **sessionStorage**；关掉标签页就没了
- 客户商业素材上线前，确认甲方允许公开展示

## 打开后台并登录

1. 浏览器打开 `/admin`
2. 粘贴 PAT →「连接仓库」
3. 左侧选作品，右侧改文案或选文件
4. 点「保存并推送到 main」
5. 等 1–2 分钟，强刷官网看结果

## 替换「徐良演唱会」占位图

1. 后台选 `xuliang-concert`
2. 上传新的 `cover.jpg`、`live-cover.jpg`（有片再传 `film.mp4`）
3. 改简介，需要时取消「占位案例」
4. 保存

素材也会落在仓库：

`public/works/xuliang-concert/`

## 新增一个作品

1. 点「新增」
2. 改 `id`（只能小写字母、数字、连字符，例如 `city-walk-2026`）
3. 填标题 / 英文 / 分类 / 简介
4. 上传封面、现场图、影片
5. 保存

## 大视频本机兜底

浏览器上传特别大的 `film.mp4` 可能慢或不稳。可改用本机：

```bash
mkdir -p staging/works/xuliang-concert
# 放入 cover.jpg / live-cover.jpg / film.mp4
node scripts/publish-works.mjs xuliang-concert
git add public/works content/projects.json
git commit -m "content: replace xuliang-concert media"
GIT_HTTP_VERSION=HTTP/1.1 git push origin HEAD
```

## 内容存在哪

| 用途 | 路径 |
| --- | --- |
| 作品文案列表 | `content/projects.json` |
| 线上可访问媒体 | `public/works/<id>/` |
| 原始备份（勿删） | `作品素材/` |

站点构建时会读 JSON，并把 `public/works` 拷进 Pages。后台改的是仓库文件，不是浏览器本地草稿。

## 构建时媒体同步

`npm run build` 会先跑 `scripts/sync-works.mjs`：若 `public/works/<id>/` 缺少文件，就从 `作品素材/<id>/` 补齐（不覆盖已有文件）。后台新上传的文件写在 `public/works/`，优先于原始备份。
