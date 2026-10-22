# 粘惠青｜雲端競選總部

靜態網站，可直接使用 GitHub Pages 發布。`index.html` 是網站首頁，`game.html` 是「阿青跑福興」遊戲。

## 遊戲操作

- ← / → 或 A / D：左右換道。
- ↑、W 或空白鍵：跳過施工路障。
- ↓ 或 S：滑過標示「滑行」的高架牌。
- P / Escape：暫停或繼續。切換分頁會自動暫停。
- 手機：上下左右滑動遊戲畫面，或點選底部按鈕。
- 汽車、機車、乳牛須換道閃避；共三次碰撞機會。
- 愛心 +5、牛奶 +8、稻穗 +3、蚵仔 +6。總分為距離整數加道具分數。
- 最高分保存在目前瀏覽器；音效預設關閉，可自行開啟。

## 本機預覽與測試

在專案目錄執行 `python3 -m http.server 8000`，然後開啟 `http://localhost:8000/`。

執行 `node runner-core.test.cjs` 可驗證計分、碰撞、動作、暫停與車道生成。

## 檔案與素材

- `runner-core.js`：與畫面分離的遊戲規則。
- `game.js`：Phaser 畫面、輸入、介面與音效。
- `game.css`：響應式遊戲介面。
- `aqing-sprites.png`、`fuxing-road.png`：使用者提供的原始圖片。動作圖以座標讀取，保留原圖透明度。
- `phaser-3.90.min.js`：Phaser 3.90.0 本地引擎，不依賴外部 CDN；授權見 `PHASER-LICENSE.md`。
