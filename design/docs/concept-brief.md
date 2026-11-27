# 設計概念共同規格（給每個概念的實作者）

專案：知行學旅 Fun Horizon Educational Trips（funhtrips.com）首頁改版的設計討論稿。
客戶：台灣教育旅行公司，主要客群是國際學校（IB CAS）老師／協調員、一般學校、大學與企業。
目前網站問題（見 `source/review.md`）：1) 沒有 CTA；2) 行程細節都在圖片裡；3) SEO 幾乎空白。
新首頁要解決這三點：**CTA（詢價表單）、圖片內容改為文字、SEO**。

## 必讀

- `data/content.json` — 唯一內容來源（中英雙語，已修正錯字）。**不要改這個檔**，有問題回報。
- `source/image-text.md` — 圖片轉寫背景說明。
- `shared/seo.mjs`、`shared/inquiry.js`、`build.mjs` — 共用基礎，**不要改**。
- 圖片在 `assets/img/`（檔名見 content.json 的 image 欄位與 images.gallery；也可用 `ls assets/img`）。

## 交付物

只在自己的資料夾 `concepts/<NN-name>/` 內新增：

- `template.mjs`：`export default function render(ctx) { return '<!doctype html>...'; }`
  - `ctx.c` = content.json 物件；`ctx.esc(str)` HTML escape；`ctx.img(file)` 圖片路徑；
    `ctx.head()` 回傳整組 `<meta charset>/viewport/title/description/canonical/hreflang/OG/JSON-LD`（放進 `<head>` 開頭）；
    `ctx.inquiryScript` 共用表單 script tag；`ctx.sdg(n)` → `{n, zh, en, color}`；`ctx.base` = `'../../'`。
- `style.css`（以 `<link rel="stylesheet" href="style.css">` 引用）
- 可選 `script.js`（僅做漸進增強；**所有內容必須已存在於產出的 HTML 文字中**，不可用 JS 渲染內容 — 這是 SEO 重點）
- 建置：在專案根目錄執行 `node build.mjs <NN-name>`，會產生 `concepts/<NN-name>/index.html`。務必跑過且無錯誤。

## 內容必須涵蓋（排列與呈現方式由你的概念決定）

1. Hero：品牌名（中英）、一句定位、主要 CTA「索取客製提案 / Request a proposal」
2. 服務 6 項（services）— 每項可有 `data-prefill-type="<id>"` 的 CTA 按鈕（id 對應 inquiry.types 的 value：cas/service/language/subject/academic/pd）
3. **3 條 CAS 路線完整文字**：地區、天數、主題、C/A/S 活動清單（中英）、SDGs（用 SDG 官方色 + 編號 + 名稱的文字標籤，不要用圖）
4. 語言與文化：華語課程資訊 + **方案 A/B 比較表（真正的 `<table>`）**＋其他活動＋包含項目
5. 科目考察 8 條行程（table 或卡片，皆為文字）＋塑膠循環經濟流程（可簡化）
6. 學術參訪：介紹 + 政治學與歷史範例團（Visit/Explore/Participate/Research）
7. 關於我們／信任：10+ 年經驗、願景使命、stats；（客戶見證目前沒有素材 → 可放一個明確標示「待補：合作學校 logo／老師推薦」的佔位區）
8. **CTA 表單**：`<form data-inquiry>`，欄位 name 必須用：
   - `type`（類型，radio 或 select，選項來自 inquiry.types）— 必填
   - `group_size`（人數，選項來自 inquiry.group_sizes；可用 radio chips / segmented / 或數字 stepper 改送 value 字串）— 必填
   - `grade`（年級，可選）、`month`（預計月份，可選 `<input type="month">` 或文字）、`school`、`name`、`email`（必填, type=email）、`message`（可選）
   - 必須有 `<div data-inquiry-result hidden></div>` 讓共用 script 顯示結果；`<button type="submit">`
   - 頁尾或 `</body>` 前加 `${ctx.inquiryScript}`
   - 樣式需涵蓋 `.inq-ok`, `.inq-err`, `.inq-payload`（pre）
9. Footer：聯絡資訊（地址、電話 `contact.phone_href`、email、LinkedIn 用文字「LinkedIn」不要顯示整串網址）、統編、© 2026；**不要** Webnode 標章
10. 左上或角落一個小連結「← 設計概念總覽」指向 `../../index.html`，並標示「概念 NN・名稱」（設計討論用，不要太搶眼）

## 技術與品質要求

- `<html lang="zh-Hant-TW" data-concept="<NN-name>">`；只有一個 `<h1>`，h2/h3 層級合理；語意化 `<header><nav><main><section><footer>`
- 每張 `<img>` 都要有 alt（用 content.json 的 alt 文字，中文為主），加 `loading="lazy"`（hero 除外）、寬高或 aspect-ratio 避免 layout shift
- 中文為主、英文為輔（雙語並陳的方式也是設計的一部分）
- RWD：手機 375px 寬無水平捲動，16px 左右邊距；桌機 1280px 好看
- 字型只能用 Google Fonts（`<link>`）；不要用其他 CDN；不要框架；純 HTML/CSS/少量 vanilla JS
- 顏色用 CSS 變數；整體品質要像真的設計提案，有明確、獨特的視覺觀點，不要通用模板感
- 不要開瀏覽器測試（其他人同時在用），寫完跑 build 即可；最後回報：設計概念一句話、版面結構、CTA 做法、任何 content.json 的疑問
