import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VueRouterAutoImports, getPascalCaseRouteName } from 'unplugin-vue-router'
import VueRouter from 'unplugin-vue-router/vite'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import MetaLayouts from 'vite-plugin-vue-meta-layouts'
import autoprefixer from 'autoprefixer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Docs: https://github.com/posva/unplugin-vue-router
    // ℹ️ This plugin should be placed before vue plugin
    VueRouter({
      getRouteName: routeNode => {
        return getPascalCaseRouteName(routeNode)
          .replace(/([a-z\d])([A-Z])/g, '$1-$2')
          .toLowerCase()
      }
    }),
    vue(),
    vueDevTools(),
    vueJsx(),

    // Docs: https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin
    vuetify({
      styles: {
        configFile: 'src/assets/styles/variables/_vuetify.scss', // 指定 Vuetify 的 SCSS 变量定义文件;可以在这个文件中覆盖 Vuetify 的默认样式变量；Vuetify 会读取这个文件，让你可以自定义
      },
    }),

    // Docs: https://github.com/dishait/vite-plugin-vue-meta-layouts?tab=readme-ov-file
    MetaLayouts({
      target: './src/layouts',
      defaultLayout: 'default',
    }),

    // Docs: https://github.com/antfu/unplugin-vue-components#unplugin-vue-components
    Components({
      dirs: [
        './src/components/**/*',
        './src/views/**/*',
        './src/router/**/*',
        './src/i18n/**/*',
      ],
      dts: true, // 自动生成 TypeScript 类型声明文件（auto-imports.d.ts）
      // 解析器：指定哪些组件会被自动导入
      resolvers: [
        componentName => {
        // Auto import `VueApexCharts`
          if (componentName === 'VueApexCharts')
            return { name: 'default', from: 'vue3-apexcharts', as: 'VueApexCharts' }
        },
      ],
    }),

    // Docs: https://github.com/antfu/unplugin-auto-import#unplugin-auto-import
    AutoImport({
      imports: [
        'vue',
        VueRouterAutoImports,
        'vue-i18n',
        '@vueuse/core',
        '@vueuse/math',
        'pinia',
      ],

      // 目录：指定哪些目录下的导出函数/变量会被自动导入
      dirs: [
        './src/composables/**/*',
        './src/stores/**/*',
        './src/utils/**/*',
        './src/components/**/*',
        './src/views/**/*',
        './src/router/**/*',
        './src/i18n/**/*',
      ],

      // Vue 模板中启用自动导入
      vueTemplate: true,

      // ℹ️ Disabled to avoid confusion & accidental usage
      ignore: ['useCookies', 'useStorage'],
    }),

    // Docs: https://github.com/intlify/bundle-tools/tree/main/packages/unplugin-vue-i18n#readme
    VueI18nPlugin({
      runtimeOnly: false, // 启用运行时编译（仅用于生产环境）
      compositionOnly: false, // 启用组合式 API
      include: [
        fileURLToPath(new URL('./src/plugins/i18n/locales/**', import.meta.url)),
      ],
    }),
  ],
  define: { 'process.env': {} }, // 一些第三方库（如旧版的 Axios、Lodash 等）会使用 process.env.SOME_VAR 来判断环境,例如：process.env.NODE_ENV === 'production'；通过 define 配置，可以将这些变量替换为实际值，让代码正常运行
  resolve: {
    // 路径别名配置
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)), // 将 @ 路径别名指向 src 目录
    },
  },
  css: {
    postcss: {
      plugins: [autoprefixer],
    },
    devSourcemap: true,
  },
  build: {
    sourcemap: true, // 生成单独的 sourcemap 文件
    chunkSizeWarningLimit: 5000, // 分包大小警告阈值（单位：KB）
  },
})
