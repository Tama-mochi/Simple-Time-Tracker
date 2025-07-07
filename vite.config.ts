import { defineConfig } from 'vite'
import path from 'node:path' // 'node:' プレフィックスを付けるのが推奨されています
import react from '@vitejs/plugin-react'
// 'vite-plugin-electron' ではなく 'vite-plugin-electron/simple' をインポートします
import electron from 'vite-plugin-electron/simple'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      // ここからがElectronの統合設定
      main: {
        // Electronのメインプロセスのエントリーファイルを指定
        entry: 'electron/main.ts',
      },
      preload: {
        // プリロードスクリプトのエントリーファイルを指定
        input: path.join(__dirname, 'electron/preload.ts'),
      },
    }),
  ],
  // レンダラープロセス用の設定
  build: {
    outDir: 'dist',
  },
  // resolveエイリアスの設定はそのまま残します
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
})