// 文档：https://fjc0k.github.io/yapi-to-typescript/handbook/config.html

import { defineConfig } from 'yapi-to-typescript'

// 注意: 接口文档跑不全原因可能为 tags里面配置的不全,导致获取接口文档数据有问题
/*
 * 根据接口地址，获取文件路径,过滤小程序和app
 * @param {String} val
 * @return {String}
 */
function name(path) {
  const parts = path.split('/')

  return parts.slice(1, 3)
}

/**
 * 生成Api接口名称  Interface和ChangeCase数据类型参见node_modules\yapi-to-typescript\lib\esm\index.d.ts定义
 * @param interfaceInfo : Interface
 * @param changeCase:ChangeCase
 * @returns 请求响应接口名称--pascal命名
 */
function genApiInterfaceName(interfaceInfo, changeCase) {
  // 全路径
  const parts = `${interfaceInfo.parsedPath.dir}/${interfaceInfo.parsedPath.name}`
  const filePathArr = name(parts)

  // ts接口名
  return filePathArr?.map(item => changeCase.pascalCase(item)).join('')
}
function config(serviceName, serverUrl) {
  return {
    serverUrl,
    serverType: 'swagger' as const, // 这里必须写，不然的话，默认是yapi的应该，无法生成swagger专属的文档
    typesOnly: true, // 是否只生成接口请求内容和返回内容的 TypeSript 类型，是则请求文件和请求函数都不会生成。
    reactHooks: {
      enabled: false,
    },
    jsonSchema: {
      enabled: false,
    },
    comment: {
      tag: false, // 去掉标签
      updateTime: false, // 去掉更新时间
      requestHeader: false, // 去掉请求头
      extraTags: ii => [
        {
          name: '请求方法',
          value: ii.method,
        },
        {
          name: '接口路径',
          value: ii.path,
        },
      ],
    },
    prodEnvName: '联调', // 生产环境名称。用于获取生产环境域名

    // 数据过滤器 - 只有返回 true 的接口才会被处理
    preproccessInterface(interfaceInfo) {
      const filePathArr = name(interfaceInfo.path)
      const firstPart = filePathArr[0]

      // 过滤掉不需要的前缀
      // 判断是否是小程序和app接口
      return (firstPart.startsWith('mini-')
        || firstPart.startsWith('app-')
        || firstPart.startsWith('feign'))
        ? false
        : interfaceInfo
    },

    // 将生成文件路径转化成小驼峰命名方式
    outputFilePath: (interfaceInfo, changeCase) => {
      // 文件夹名称取api-url路径末尾2个
      const filePathArr = name(interfaceInfo.path)

      const filePath = filePathArr
        ?.map(item => changeCase.paramCase(item))
        .join('/')

      return `src/api/types/${serviceName}/${filePath}.ts`
    },

    // 生成ts文件中请求参数interface名称,将下划线命名转换成pascal命名
    getRequestDataTypeName: (interfaceInfo, changeCase) => {
      return `${genApiInterfaceName(interfaceInfo, changeCase)}Req`
    },

    // 生成ts文件中请求响应数据interface名称,将下划线命名转换成pascal命名
    getResponseDataTypeName: (interfaceInfo, changeCase) => {
      return `${genApiInterfaceName(interfaceInfo, changeCase)}Res`
    },

    // 响应数据中要生成ts数据类型的键名
    dataKey: 'data',
    projects: [
      {
        // token获取方式： 在yapi-设置-token配置中查看,对于基于 Swagger 的项目，置空即可
        token: '', // 项目token
        // 分类id查找方式: 点击接口左侧的分类菜单,查看url地址栏最后面的数字获取
        // 分类id配置特别重要,配置错了无法生成对应的ts数据类型定义文件
        categories: [
          {
            id: [0], // 分类 ID，可以设置多个。设为 0 时表示全部分类。如果需要获取全部分类，同时排除指定分类，可以这样：[0, -20, -21]，分类 ID 前面的负号表示排除。获取方式：打开项目 -> 点开分类 -> 复制浏览器地址栏 /api/cat_ 后面的数字。
          },
        ],
      },
    ],
  }
}
export default defineConfig([
  config('workflow-service', 'http://192.168.196.231:6990/workflow-service/v3/api-docs'), // 工作流
  // 多个服务就在此处放多个
])
