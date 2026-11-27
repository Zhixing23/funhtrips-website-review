# 知行學旅新網站規劃：CTA・圖片轉文本・SEO

依據：`source/review.md`（網站健檢）＋ `source/original-site.md`（原站 6 頁存檔）＋ `source/image-text.md`（圖片轉寫）
日期：2026-11-27

健檢的結論：網站的內容方向正確，但現在比較像「線上名片」，還沒辦法幫忙接案。三個最大的問題正好對應這次規劃的三個面向。

| 健檢問題 | 規劃面向 | 這次設計稿怎麼處理 |
|---|---|---|
| 1. 沒有讓客戶行動的入口 | **CTA** | 每個概念都有詢價表單，欄位共用，後端之後再接 |
| 2. 行程細節都放在圖片裡 | **圖片 → 文本** | 11 張含文字的圖已轉成結構化資料 `data/content.json` |
| 3. Google 幾乎讀不到內容 | **SEO** | 共用 `shared/seo.mjs`：title、description、hreflang、OG、JSON-LD；所有內容輸出成靜態 HTML |

---

## 1. CTA：詢價表單

### 目標
讓國際學校老師在 **1 分鐘內** 送出需求，不用自己抄 email。

### 欄位（各概念共用，`shared/inquiry.js`）

| name | 說明 | 必填 | 形式 |
|---|---|---|---|
| `type` | 行程類型：cas / service / language / subject / academic / pd / unsure | ✔ | 卡片或 chips |
| `group_size` | 人數：1-15 / 16-30 / 31-60 / 60+（或 stepper 送數字） | ✔ | chips／segmented／stepper |
| `email` | 回覆信箱 | ✔ | email |
| `grade` | 年級 | | 文字或選單 |
| `month` | 預計月份 | | month |
| `school` | 學校／單位 | | 文字 |
| `name` | 聯絡人 | | 文字 |
| `message` | 學習目標、其他需求 | | textarea |

自動附加：`page`、`concept`、`submitted_at`。

- **門檻設計**：只有 3 個必填（類型、人數、email），其餘選填。健檢建議的「學校、人數、年級、預計月份、學習目標」都有涵蓋。
- **預選**：任何按鈕加上 `data-prefill-type="cas"`，點了就會預選類型並捲到表單；網址加 `?type=cas` 也會預選。這樣路線頁、廣告或 email 連結都能直接帶入類型。
- **追蹤**：送出時會發出 `inquiry:submitted` 事件，之後可以接 GA4 的 `generate_lead`。

### 後端（之後再決定）
`<form data-inquiry data-endpoint="https://...">` 設定好 endpoint，就會以 JSON POST 送出。沒有設定時，目前會在頁面上顯示送出的資料，並提供 mailto 備援。可以考慮的接法：

| 方案 | 成本 | 適合情境 |
|---|---|---|
| Formspree／Basin／Getform | 免費到低價、零維運 | 最快上線 |
| Google Apps Script → Google Sheet + 寄信 | 免費 | 團隊習慣用試算表追案 |
| Cloudflare Worker / Netlify Function → email + CRM（HubSpot Free） | 低 | 之後要做名單管理、自動回信 |

建議先用 Formspree 或 Apps Script 上線，等詢價量穩定之後再接 CRM。

### 其他 CTA 位置
- Hero 的主按鈕「索取客製提案」
- 每個服務／路線都有「以這個方案詢問」
- 手機版的 sticky 底部列（概念 02）
- Footer 的 email 與電話（`tel:` 可以直接撥號）

---

## 2. 圖片資料匯出文本

### 已轉寫（詳見 `source/image-text.md`）

| 圖 | 內容 | 結構化位置 |
|---|---|---|
| CAS Taoyuan／Chiayi／Kaohsiung Program（3 張） | 地點、重點、C/A/S 各 3–4 項活動、SDGs | `cas_routes[]` |
| 語言與文化團方案（中／英 2 張） | 方案 A／B 七列比較 | `language.compare[]` |
| 科目考察（中／ENG 2 張） | 8 條行程 × 6 欄 | `subject_trips[]` |
| 塑膠循環經濟 | 5 步流程 + 3 個事實 | `circular_economy` |
| Academic 政治歷史團 | 地點、天數、SDGs、4 個區塊 | `academic.sample` |
| 首頁 Hero／關於我們示意圖 | 標語、合作網絡 | `site.tagline_*`、`about.partners` |

### 轉寫時順便修正的錯字
Meninong → Meinong、Middle Taiwan → Central Taiwan、such us → such as、亦提供亦提供、PET Vellets → pellets、THEMETIC → THEMATIC、Service Leaning → Learning、East Riff → Rift、Chayi／Chaiyi → Chiayi、電話改成國際格式 +886-911-747-378。

### 需要客戶確認
- 台南・嘉義・南投行程的適合學齡：中文版寫「小學至高中」，英文版寫「Secondary」，兩個版本不一致
- 塑膠循環經濟寫的是「Our company possesses patented technology」，主詞應該是合作夥伴而不是知行學旅
- 花蓮行程的英文名稱寫成「Geography Trip to Taipei & Hualien」，要確認行程是否包含台北
- Email 的網域（funhorizonedutrips.com）和網站網域（funhtrips.com）不同，建議統一

### 原則
- **內容和版型分開**：`data/content.json` 是唯一的內容來源，`build.mjs` 會產生靜態 HTML。之後改行程只要改 JSON，不用重做圖片。
- 圖片只拿來呈現氛圍（照片），資訊一律用文字。表格用真正的 `<table>`，手機上可以讀、可以複製，也能翻譯。
- 未來如果要換成 CMS（Decap CMS、Notion、Google Sheet），只要換掉資料來源，版型不用動。

---

## 3. SEO

### 已做（`shared/seo.mjs`，五個概念共用）
- `<title>`：「知行學旅｜台灣 IB CAS 服務學習與教育旅行規劃」（原本是 funhtrips.com）
- meta description：約 110 字，含核心關鍵字（原本只有「Home」）
- canonical、`hreflang`（zh-Hant-TW／en／x-default）
- Open Graph／Twitter card（分享到 LINE、FB、LinkedIn 會有圖和標題）
- JSON-LD：`EducationalOrganization` + `TravelAgency`（地址、電話、統編、LinkedIn），3 條路線標成 `TouristTrip` 並附 itinerary
- 每張圖都有中文 alt，照片檔名改成有意義的英文，例如 `taoyuan-coast-algal-reef.jpg`（原本是 `IMG_8225.jpeg`、`A445C33A-....jpeg`）
- 一頁只有一個 h1，標題層級合理，使用語意化標籤
- 照片壓縮到最長邊 1600px，hero 以外都用 lazy load
- 設計稿加了 `noindex`，避免和正式站搶索引（正式上線時要拿掉）

### 目標關鍵字（建議）
| 語言 | 關鍵字 |
|---|---|
| EN | Taiwan CAS trip, IB CAS Taiwan, service learning trip Taiwan, Taiwan school trip, Chinese language camp Taiwan, STEAM trip Taiwan |
| 中 | 台灣遊學 國際學校、教育旅行規劃、服務學習行程、IB CAS 行程、華語營、SDGs 教育旅行 |

### 上線時要做
1. **網址結構**：中英拆成兩個語言版本（`/` 與 `/en/`），每條路線各一頁，例如 `/cas/taoyuan/`、`/en/cas/taoyuan/`。這份設計稿先把所有內容放在首頁，方便討論。
2. 原本 6 頁的 Webnode 網址要做 301 轉址到新網址：`/servicelearning/` → `/cas/`、`/language-culture/` → `/language/` 等。
3. 送出 Google Search Console 與 sitemap.xml。
4. 建立 Google 商家檔案（桃園地址）。
5. 內容行銷：每次出團寫一篇「行程故事」，附照片、引言和 SDG 成果，同時補上健檢提到缺少的案例和見證。
6. 平台：建議用靜態網站（這套 build ＋ GitHub Pages／Cloudflare Pages），速度快、SEO 完全可控、沒有平台廣告標章。

---

## 4. 五個設計概念（討論用）

| # | 名稱 | 一句話 | CTA 形式 |
|---|---|---|---|
| 01 | 田野筆記 Field Notes | 老師的旅行筆記本，溫度與專業感 | 填空信表單 |
| 02 | 三秒分流 Audience Router | 先問「你是誰」，3 秒內找到自己的那一頁 | sticky 底部列＋低門檻精簡表單 |
| 03 | 島嶼路線圖 Island Map | 用台灣地圖探索所有路線（亮色大地森林色：羊皮紙底、森林墨綠字、赭陶路線；英文品牌名用人文襯線） | 規劃路線表單（含地區） |
| 04 | 永續色塊 SDG Grid | 以 SDG 官方色為唯一色彩系統的瑞士網格 | 色塊磁磚＋人數 stepper |
| 05 | 提案精靈 Proposal Builder | 首頁本身就是逐步組行程的配置器 | 多步驟表單＋即時提案草稿 |

### 討論建議
- 先選出「主軸」（敘事型 01／分流型 02／探索型 03／品牌型 04／轉換型 05），再從其他概念借元素。例如可以用 02 的分流架構，搭配 05 的表單，再加上 04 的 SDG 色彩系統。
- 每個概念都用同一份內容和同一套 SEO，比較時只要看版面和 CTA 的差異。
