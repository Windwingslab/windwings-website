# 作品后台使用说明（鹏哥）

[打开官网](https://windwingslab.github.io/windwings-website/) · [打开作品后台](https://windwingslab.github.io/windwings-website/admin/)

后台修改 `content/projects.json` 和 `public/works/<id>/`；保存后单次提交到 `main`，GitHub Actions 通常约 **1–2 分钟** 更新官网。完成提交与完成部署是两个状态；可在仓库 Actions 查看部署结果。

## 第一次登录

1. GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens** → Generate。
2. Repository access → **Only select repositories** → `Windwingslab/windwings-website`。
3. Permissions → Repository permissions → **Contents: Read and write**；不要添加其他不需要的权限。
4. 把生成的 PAT 粘贴进后台，点「连接仓库」。

PAT 仅存于本标签页的 **sessionStorage**；关闭标签页或点「退出」会清除。不要发送到聊天、微信或提交到仓库。连接成功只代表账号与仓库可读取；写权限不足或分支保护会在保存时给出 GitHub 错误，不会发布部分媒体。

## 修改现有作品

1. 左侧选作品，编辑标题、英文展示名、分类、简介和三张图的路径、描述、图注。
2. 选择要替换的 JPEG 图片或 MP4 影片。已有作品 id 固定，避免改名后丢失媒体关联。
3. 点「保存并推送到 main」，看到提交 SHA 后，等待 Actions 部署。

图片路径写 `works/<id>/cover.jpg`，不含 `public/` 和 `/windwings-website/`。图 3 的独立静帧可用 `works/<id>/detail-01.jpg`，通过下方本机流程添加。所有作品文案只放在 `content/projects.json`。

## 新增作品

1. 点「新增」，填写唯一 id（小写字母、数字，单个连字符连接，例如 `city-walk-2026`）。
2. 填写标题、英文展示名、分类、简介，至少选择封面。
3. 确认客户允许公开展示后保存。素材还未确认时留在本机，不要提交到公开仓库。

只上传一张封面时，三个空图片位置会使用这张封面，不会生成不存在的现场图路径。重复 id、已存在的同名媒体目录、空白文案、无效路径会阻止保存。每个文件会先校验格式与大小。

## 上传格式和限制

| 内容 | 文件名与格式 | 网页限制 |
| --- | --- | --- |
| 封面 | `cover.jpg`，真实 JPEG | 每文件 ≤40MiB |
| 现场图 | `live-cover.jpg`，真实 JPEG | 每文件 ≤40MiB |
| 影片 | `film.mp4`，建议 H.264 视频 + AAC 音频 | 每文件 ≤40MiB |

PNG/WebP 图片请先导出 JPEG；WebM/MOV 影片请先转为 MP4。只改扩展名会被拒绝。网页检查容器格式，编码是否可播放仍须在浏览器预览确认。

## 保存冲突 / 中断

- 页面载入后，仓库有任何新提交（包括只替换媒体），旧页面保存会被阻止。先复制当前文案，再点「重新加载」，重新编辑并选择本机文件。
- 媒体与 JSON 先暂存为 Git 对象，再一次快进更新 main。上传中断、权限错误或保存期间的并发提交不会只发布一半，也不会强推覆盖他人。
- 若保存响应中断，请先看 GitHub 提交记录和 Actions，再决定是否重试。
- 切换作品、新增、重新加载、退出前会提示未保存更改；提交期间这些按钮与编辑字段会锁定。

## 大文件或独立静帧：本机流程

浏览器每文件超过 40MiB 时，使用：

```bash
cd "/Users/huangruxia/Documents/公司项目管理/WINDWINGS官网"
git pull --ff-only origin main
git switch -c content/replace-xuliang-media
mkdir -p staging/works/xuliang-concert
# 放入已确认可公开的 cover.jpg / live-cover.jpg / film.mp4 / detail-01.jpg
node scripts/publish-works.mjs xuliang-concert
# 需要改路径或文案时，只编辑 content/projects.json
npm run build && npm run check
git add public/works content/projects.json
git commit -m "content: replace xuliang-concert media"
GIT_HTTP_VERSION=HTTP/1.1 git push origin HEAD
# 创建 PR，合并到 main 后自动部署
```

`staging/` 已忽略，不会自动进仓库。脚本只接受规范 id、JPEG 和 MP4；全批次预检通过后，先准备完整副本，再切换目录；切换异常会回滚。被强行终止时不要提交，先检查 public/works/.publish-*/ 中的恢复备份。任何文件达到 GitHub 普通文件 **100MiB** 限制会被拒绝，建议压缩到 **90MiB 以下**；本机流程也不能绕过 GitHub 文件大小限制。脚本不会自行提交或上线。

## 替换「徐良演唱会」占位案例

正式素材可公开后，选 `xuliang-concert`，上传该项目的封面、现场图和影片，修改三张图引用与文案，再取消「占位案例」。目前没有正式素材，继续保留占位标记和借图说明。

## 内容与原始备份

| 用途 | 路径 |
| --- | --- |
| 作品文案与图片引用 | `content/projects.json` |
| 部署媒体 | `public/works/<id>/` |
| 本机待处理文件 | `staging/works/<id>/` |
| 原始备份（不要删） | `作品素材/<id>/` |

构建先运行 `scripts/sync-works.mjs`：仅从备份补齐 `public/works/` 中缺少的文件，不覆盖后台新上传或本机替换的文件。

## 开发回归

先运行 `npm run build && npm run check`（包含19项自动测试）。完整后台浏览器回归需已安装 Playwright/Chrome 并开启开发服务：

```bash
npm run dev -- --port 5173
# 另一个终端
PLAYWRIGHT_MODULE=/path/to/playwright npm run check:browser
```

浏览器测试使用假 PAT，拦截全部 GitHub API，不向真实仓库写测试案例。默认开发地址 5173，可用 `SITE_ORIGIN` 指定其他端口。
