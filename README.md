# demoView

基于Express的预览静态html模板及调试AJAX接口的小工具。解决两种问题：

* 项目初期前端产出静态demo，但file://协议无法进行AJAX调试，本机运行后端API项目又过于笨重或无后端仓库权限
* 业余做兴趣项目希望使用第三方的接口，但是目标接口未必开放跨域

## 安装

```npm install```即可。

## 配置

把```config_example.js```文件改名为```config.js```文件进行配置：

### 本地静态demo文件访问配置

修改```localPath```对象

* localPath.url 为静态demo文件文件夹
* localPath.path 为访问路径

如

```
localPath : {
    url: '/demoView',
    path: '/Users/cuiguojie/Sites/demoView'
},
```

即把本机的```/Users/cuiguojie/Sites/demoView```文件夹映射为```http://localhost:3000/demoView```访问。

### AJAX反向代理配置

修改```proxy```对象

* proxy.url 为本地访问代理地址
* proxy.path 为API接口真实地址

如

```
proxy : {
    url: '/proxy',
    path: 'http://www.abc.com/api'
}

```

即为通过```http://localhost:3000/proxy```接收```http://www.abc.com/api```下的 **所有** 接口，如：

* http://localhost:3000/proxy/getInfo 等于 http://www.abc.com/api/getInfo
* http://localhost:3000/proxy/setInfo 等于 http://www.abc.com/api/setInfo

## 使用

```npm start```