# 知行學旅 funhtrips.com 改版：設計概念

這個 repo 是 [funhtrips.com](https://funhtrips.com/) 首頁改版的設計討論稿，針對三個面向：**CTA**、**圖片資料轉成文本**、**SEO**。規劃內容請看 [docs/plan.md](docs/plan.md)。

## 結構

repo 根目錄：`index.html` 是網站首頁（採用概念 03，由 build 產生）、`plan/` 是網站健檢、`design/` 是本資料夾。

```
data/content.json        唯一內容來源（原站文字 + 圖片轉寫，中英、已修正錯字）
shared/seo.mjs           共用 SEO：meta、hreflang、OG、JSON-LD
shared/inquiry.js        共用詢價表單行為（後端 endpoint 之後再接）
build.mjs                由 content.json 產生各概念的靜態 HTML
concepts/0N-*/           五個設計概念（template.mjs + style.css → index.html）
assets/img/              網頁用照片（已壓縮、檔名語意化）
source/                  原始資料：原站存檔、健檢存檔、圖片轉寫、原圖
docs/                    規劃文件與概念規格
index.html               概念總覽頁
（build 時也會把概念 03 輸出成 repo 根目錄的 ../index.html）
```

## 使用

```bash
cd design
node build.mjs                 # 重建全部概念＋根目錄首頁
node build.mjs 02-audience     # 只重建單一概念
node scripts/serve.mjs         # 打開 http://localhost:4173（repo 根目錄）
```

修改內容時只要改 `data/content.json`，再重新 build。

## 詢價表單後端

在 `<form data-inquiry>` 加上 `data-endpoint="https://..."`，或在全域設定 `window.FH_INQUIRY_ENDPOINT`，表單就會以 JSON POST 送出。目前沒有設定 endpoint，送出時只會在頁面顯示收集到的資料，並提供 mailto 備援。
