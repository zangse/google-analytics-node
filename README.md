### google-analytics-node
![image](https://github.com/zangse/google-analytics-node/blob/master/screenshots/WX20180427-104057.png)
![image](https://github.com/zangse/google-analytics-node/blob/master/screenshots/WX20180427-104111.png)
#### 1.注册谷歌分析
注:以下操作基本需要翻墙，请自备梯子。
登录你的谷歌账户,注册[谷歌分析](http://www.google.cn/intl/zh-CN_ALL/analytics/learn/setupchecklist.html)
![image](https://github.com/zangse/google-analytics-node/blob/master/screenshots/WX20180427-102210.png)
然后设置自己的账户基本信息
![image](https://github.com/zangse/google-analytics-node/blob/master/screenshots/WX20180427-102256.png)
获取跟踪Id,同意协议。
#### 2.给网站加上谷歌分析代码
登陆后便有全站跟踪代码，复制带有跟踪Id的代码到你的项目里。
   [使用入门](http://www.google.cn/intl/zh-CN_ALL/analytics/learn/setupchecklist.html) 
 给您的网站安装跟踪代码
 [示例](https://developers.google.com/analytics/devguides/collection/gtagjs/)
安装跟踪代码后，你就可以发布你的网站了，在这个管理后台你就可以查看您的网站访问数据了。
本篇完   :)

等等，我只是开个玩笑，以上只是基本操作，完成上述操作，才能继续下面的步骤，让你本地的服务能获取谷歌分析的数据。
#### 3.查看谷歌api
如果你想在自己的网站里展示这些数据，每次只用自己本地登录后台查看，该怎么实现呢？
[戳这里](https://developers.google.com/analytics/devguides/reporting/core/v3/reference#metrics)
谷歌提供了api接口，供你自由配置指标来查询你的网站访问数据，并且提供了[各种客户端库](https://developers.google.com/analytics/devguides/reporting/realtime/v3/libraries)的查询支持。
#### 4.api调用demo
本篇使用的后台技术是NodeJs,使用的是express框架+redis技术实现。2018年4月27日星期五
项目目录结构，项目代码放在[github](https://github.com/zangse/google-analytics-node)上，适当修改配置，安装依赖，就可以应用于自己的网站了。
```
├── README.md
├── app
│   ├── config
│   │   ├── index.js  //配置文件
│   │   └── key.json  //查询api的jwt验证key
│   ├── controllers
│   │   └── google.analytics.js  //获取数据的api
│   ├── middleware
│   │   └── redis.middleware.js  //使用redis作中间存储
│   ├── routes
│   │   ├── google.js //路由文件
│   │   └── index.js
│   └── utils
│       └── index.js //小工具
├── app.js
├── index.js  
├── package-lock.json
└── package.json
```
这个项目里，使用了官方的nodejs api的npm包 `googleapis`。
使用redis的部分是为了缓存access_token和部分数据，目前把部分接口的数据先缓存23小时(不想去频繁请求接口)。
#### 5.配置您的个人项目
项目里需要配置的地方，第一个是数据视图id，这个在创建账户的时候就生成了，在账户管理的`数据视图`里可以看到，点击`数据视图设置`，就可以获取数据视图id
```
  viewId: 'ga:你的数据视图id'
```
##### 设置key
打开[谷歌api控制台](https://console.developers.google.com/)，先创建一个项目，然后点击`启用API`,搜索google analytics，启用`Google Analytics Reporting API`，再启用`Analytics API`。
![image](https://github.com/zangse/google-analytics-node/blob/master/screenshots/WX20180427-123143.png)
##### 创建凭据
然后创建凭据，点击 `凭据`-->`创建凭据`-->选择`服务账号密钥`-->选择新的服务账号，并设置角色，输入名称，点击`创建`，保存您的密钥文件。
将这个key复制到项目的`app/config`目录下并修改名称为 `key.json`。
##### 最后一步，为这个账户添加访问数据的权限
打开注册谷歌分析的数据控制台（注册的时候可以查看数据的那个）,点击`管理`-->`媒体资源`-->`用户管理`-->`添加新用户`，输入api控制台的 `凭据`-->列表又上角`管理服务账号`，复制这个服务账号id,粘贴到电子邮箱地址栏，并设置权限（可只设置读取和分析的权限）。这个控制台也可以设置过滤规则和白名单之类的，如有需要，可以研究研究。
到这一步，大功告成。去你的网站上点点吧，如果在谷歌分析的数据控制台能看到数据，可以启动我的项目文件，调用api接口，就可以获取json数据。
##### ps
在这个[api参考](https://developers.google.com/analytics/devguides/reporting/core/v3/reference#metrics)里，你可以自由设置你想要的数据，修改demo的接口就好。
##### 项目路由文件注释
```
router.get('/userChart',...);//用户浏览数据
router.get('/cityChart', ...);//用户国家地区分布
router.get('/deviceChart',...);//用户设备分布
router.get('/pageViewData', ...);//单页面访问统计
router.get('/pageTimeData',...);//24小时访问数统计
router.get('/pageAreaData',..);//地区统计
//可以自由设置更多数据
```
至于文章开头的图表，来自于接口返回的数据，经过前端处理后使用echart展示的结果。
如有疑问，可以在项目里提issues。如有遗漏或错误的地方，欢迎指正。

