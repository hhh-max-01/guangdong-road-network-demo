# 公网部署说明

## 当前状态

已准备 Render 静态站点配置，尚未创建云端站点，没有正式公网网址。
GitHub公共仓库已创建：https://github.com/hhh-max-01/guangdong-road-network-demo 。Render站点尚待创建及验收。

## 推荐配置：GitHub + Render Static Site

1. 在自己的 GitHub 账号中新建专用仓库 `guangdong-road-network-demo`，本次使用 Public（公共）。
2. 上传应用源码：src、public、index.html、package.json、package-lock.json、vite.config.js、render.yaml。源文件必须在仓库根目录，不能再套一层压缩包目录。
3. 在 Render 登录后，选择 New → Static Site，连接该仓库，只授权需要发布的仓库。
4. 配置 Build Command：`npm ci --include=dev && npm run build`；Publish Directory：`dist`；环境变量 NODE_VERSION：`22`。Root Directory 留空。无需 Start Command。
5. 创建静态站点后等待构建成功，使用控制台实际生成的 HTTPS 地址。不推测网址。也可通过 Blueprint 读取根目录 render.yaml。

只需静态站点，不创建 Web Service、数据库或付费计算实例。若页面要求购买或付费，先停止并核对配置。静态站点服务没有 compute plan 字段。

## 上传范围

仅上传上述应用文件和必要使用说明。不上传招标原始文档目录、node_modules、.qa、截图、个人附件、凭据或环境变量文件。public 下内容均会公开，本项目目前只有图标与无视频时使用的模拟画面。

已准备部署源码压缩包与dist产物压缩包，均位于deployment-artifacts。源码包用于解压上传GitHub；dist包可交给支持直接上传的静态托管服务，不能把压缩包本身当成Render源码仓库。

## 路由及视频

现有Vite base为相对路径，采用Hash路由，网址形式为`https://实际域名/#/smart-patrol`。无需添加所有路径返回index.html的重写，避免缺失视频被错误返回HTML。

视频可选：在public/videos放入cam001.mp4至cam004.mp4后重新构建发布。没有对应文件时继续使用模拟画面。

## 国内访问验收

Render静态站点通过全球CDN提供，不可选择国内区域；GitHub Pages和Render默认域名均不能在此承诺国内各网络稳定访问。必须取得真实站点网址后，使用目标现场的国内宽带和手机移动网络分别检查。控制台无法打开不等同于所有已发布站点均无法访问，也不能反过来证明站点可以访问。

检查首页、四个业务页、刷新、完整演示、重置、控制台和静态资源。如现场网络无法稳定访问，应改用国内云静态托管并按供应商要求准备账号和域名，不把未验证的境外地址作为唯一演示入口。

公网首次加载需要网络；页面业务不调用外部API。保留本地npm run dev作为现场备用。公网访问者各自保存浏览器会话，不共享编目修改和事件状态。

官方参考：
- https://render.com/docs/static-sites
- https://render.com/docs/blueprint-spec
- https://render.com/docs/regions
