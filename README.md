#### **NodeJs + cheerio + axios 爬取图片**

首先安装cheerio 

```javascript
npm install cheerio 
npm install axios
```

引入需要用到的模块

```javascript
const cheerio =  require("cheerio");
const path = require('path');
const axios = require('axios');	 // 下载图片
const fs = require("fs");		//  获取到图片需要下载到本地，会引用fs的写入
```

因为接下来会多次使用axios去获取页面内容，所以这里封装一下

```javascript
function getPageContent (url, option='') {
	return new Promise ((resolve, reject) => {
        axios.get(url, option).then((res) => {
            if (res) {
                resolve(res)
            } else {
                reject('获取失败')
            }
        })
    })
}
```

全部代码内容：

```javascript
// 获取HTML文档的内容，内容的获取跟jquery一样
let httpUrl = 'https://www.doutula.com/article/list/?page=1';

// 获取首页列表的名称和详情页URL
(
    async function getAllUrl () {
    
        let res = await getContent(httpUrl);
    
        // cheerio解析html文档
        let $ = cheerio.load(res)
    
        // 获取当前页面的所有表情链接
        $('#home .col-sm-9>a').each((i, element) => {
            let pageUrl = $(element).attr('href');
            let title = $(element).find('.random_title').text();
            let reg = /(.*?)\d/igs;
            title = reg.exec(title)[1];
            fs.mkdir('./img/' + title, (err) => {
                if (err) {
                    console.log(err);
                } else{
                    console.log('创建目录成功：' + './img/' + title)
                }
            })
            // 进入详情页下载图片
            parsePage(pageUrl, title)
        })
    }
)();

// 详情页下载图片
async function parsePage (url, title) {
    let res = await getContent(url);
    let $ = cheerio.load(res);
    $(".pic-content img").each((i, el) => {
        let imgUrl = $(el).attr('src');
        let extName = path.extname(imgUrl);
        // 图片写入的路径和名字
        let imgPath = `./img/${title}/${title}-${i}${extName}`
        // 创建图片流
        let ws = fs.createWriteStream(imgPath);
        getContent(imgUrl, {responseType: 'stream'}).then((res) => {
            res.pipe(ws)
            console.log('图片加载完成：：' + imgPath)
            res.on('close', () => {
                ws.close()
            })
        })
    
    })
}

function getContent (url, option = '') {
    return new Promise ((resolve, reject) => {
        axios.get(url, option).then((res) => {
            if (res) {
                resolve(res.data);
            } else {
                reject('系统报错');
            }
        })
    })
}
```

ps: 爬取音乐有demo，有兴趣可以git clone下来瞧瞧