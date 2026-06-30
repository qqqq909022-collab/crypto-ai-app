# Crypto AI 部署教學

這份文件教你把這個 App 部署到網路上，讓它能拿到真正的即時加密貨幣數據，
並且可以加到手機主畫面、像原生 App 一樣使用。

整個過程約 10-15 分鐘，不需要任何程式背景。

---

## 第一步：建立 GitHub 帳號（如果還沒有）

1. 打開 https://github.com/signup
2. 輸入信箱、密碼，跟著畫面指示完成註冊

---

## 第二步：建立一個新的 Repository（專案倉庫）

1. 登入 GitHub 後，點右上角「+」→「New repository」
2. Repository name 填：`crypto-ai-app`
3. 設成 Public（公開）即可，免費方案足夠使用
4. 點「Create repository」

---

## 第三步：把檔案上傳上去

最簡單的方式不用裝任何軟體：

1. 在剛建好的 repository 頁面，點「uploading an existing file」這個連結
2. 把這個資料夾裡的所有檔案拖進去上傳：
   - `index.html`
   - `app.js`
   - `manifest.webmanifest`
   - `sw.js`
   - `icon-192.png`
   - `icon-512.png`
   - `vercel.json`
3. 最下面點「Commit changes」

---

## 第四步：部署到 Vercel（免費）

1. 打開 https://vercel.com/signup
2. 選擇「Continue with GitHub」，用剛剛的 GitHub 帳號登入並授權
3. 登入後點「Add New...」→「Project」
4. 在列表中找到 `crypto-ai-app`，點「Import」
5. 設定畫面全部保持預設值，直接點「Deploy」
6. 等待約 30-60 秒，跑完後會看到「Congratulations」畫面

部署完成後，Vercel 會給你一個網址，類似：
```
https://crypto-ai-app-xxxx.vercel.app
```

這個網址就是你的 App，而且因為跑在真正的網路主機上，
不會再有手機沙盒擋外部數據連線的問題，可以拿到真正的即時報價。

---

## 第五步：加到手機主畫面

### iPhone (Safari)
1. 用 Safari 打開你的 Vercel 網址（一定要用 Safari，不能用 Chrome）
2. 點下方分享按鈕（方框+箭頭圖示）
3. 往下滑，點「加入主畫面」
4. 點右上角「新增」

### Android (Chrome)
1. 用 Chrome 打開你的 Vercel 網址
2. 點右上角「⋮」選單
3. 點「新增至主畫面」或「安裝應用程式」
4. 確認安裝

完成後，桌面會出現一個獨立的 App 圖示，
點開會全螢幕運行、沒有網址列，跟原生 App 體驗一致。

---

## 之後要更新內容怎麼辦？

如果之後想修改功能或請我（Claude）幫你調整程式碼：
1. 我會給你新的檔案內容
2. 回到 GitHub 該檔案頁面，點鉛筆圖示編輯，貼上新內容，Commit
3. Vercel 會自動偵測到變更並重新部署，約 30 秒後手機重新整理就會看到新版本

---

## 常見問題

**Q: 部署後價格還是抓不到？**
A: 等 1-2 分鐘讓部署完全生效，並確認手機有連網。若持續失敗，可能是
CoinGecko API 當下流量限制，App 仍會自動回退顯示離線快照，不會卡住。

**Q: 通知功能在 iPhone 上沒反應？**
A: iOS 需要 16.4 以上版本，且必須先「加入主畫面」變成獨立 App 後，
通知權限才會生效，直接在 Safari 分頁內無法收到推播通知。

**Q: 完全免費嗎？**
A: 是的，GitHub 和 Vercel 的免費方案對個人使用完全足夠，不需要信用卡。
