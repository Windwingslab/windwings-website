# WINDWINGS — 风翮视觉

风翮设计实验室的 React 作品站。线上地址：https://windwingslab.github.io/windwings-website/

## 开发与构建

Node.js 22+。使用 `npm install` 安装，`npm run dev` 本地预览，`npm run build` 进行 TypeScript 检查和生产构建，`npm run check` 核验构建资产。`npm run preview` 预览生产版本。

Vite `base` 固定为 `/windwings-website/`。请访问开发服务器对应子路径，不能直接双击 HTML。`main` 推送后由 `.github/workflows/deploy.yml` 构建 `dist` 并部署 GitHub Pages；仓库 Pages 的 Build and deployment / Source 应为 GitHub Actions。

## 页面与文件

- `src/sections/`：Hero → Marquee → About → Services → Projects，联系方式位于 Projects 尾部。
- `src/components/`：FadeIn、Magnet、AnimatedText、两种按钮、图片降级显示、原生项目视频弹窗。
- `src/data.ts`：五项服务、三个案例、联系信息；图片和视频直接引用原有 `作品素材/`，由 Vite 输出带 hash 的资源。
- `public/assets/`：20 个已下载参考 GIF、临时头像和四个 About 装饰。GIF 总体积较大，仅接近视口的图片会挂载解码；系统开启减少动态效果时显示静态占位。
- `archive/index.legacy.html`：原始单文件页面备份。原 Markdown/CSV/JSON 与全部案例素材保留。

## 尚需替换的素材

1. **头像**：使用指定的参考 3D 人像，本地化成功。TODO：替换为风翮工作室照片或品牌形象。
2. **Marquee**：21 个 URL 中 20 个下载成功。`hero-celestia-preview-0yO3jXO8.gif` 返回 404，保留 URL 于清单，并显示 420×270 的同尺寸占位；没有运行时远程 GIF 请求。动态视觉参考标注为 MotionSites 灵感，未冒充风翮案例。
3. **About 装饰**：moon、p59、lego、group 四张全部本地化，无缺失。
4. **作品图片**：《友情出演》第三张为裁切复用，待补 1 张；徐良演唱会全部 3 张借用《友情出演》，待补正式图和影片；EN 第二、第三张为同图裁切，待补 2 张。对应图片说明与源码 TODO 已标明。

## 动效与交互

FadeIn：`motion.create` + `whileInView`，默认 0.8 秒、y=40、ease `[0.22, 1, 0.36, 1]`、仅进入一次；服务条目间隔 0.08 秒。Magnet：padding 150、strength 3、spring stiffness 100 / damping 20。AnimatedText：逐字符随滚动从 opacity 0.15 到 1。Marquee：被动 scroll 监听 + requestAnimationFrame，两排相反方向，11/10 分组。项目堆叠：`1 - (count - index) * 0.05`，sticky top 随序号增加 24px；矮屏及减少动态模式改为自然文档流。

完整参考提示词/源代码未随任务提供，因此未声称逐行匹配其 classNames 或精确动效时序；实现以任务列出的布局、色值和组件行为为依据。

Live Project 打开原生 dialog，支持 Esc 关闭、键盘焦点约束及关闭后焦点恢复。两项正式案例可播放本地完整影片；演唱会占位只展示待补状态。ContactButton 使用 `mailto:Jp404685320@gmail.com`，微信：`windwingslab`。
