const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 1. 获取歌曲列表信息
// 2. 下载歌曲到本地文件夹

let targetUrl = 'http://www.app-echo.com/api/rank/sound-hot?periods=daily&limit=20'

(
    async function getMusic () {
        let res = await axios.get(targetUrl);
        res.data.lists.daily.forEach(element => {
            let mp3Url = element.source;
            let title = path.parse(element.source).name;
            // console.log(path.parse(element.source));
            download(mp3Url, title);
        });
    }
)();

async function download (mp3Url, title) {
    await axios.get(mp3Url, {responseType: 'stream'}).then(function (res) {
        let ws = fs.createWriteStream(`./mp3/${title}.mp3`);
        res.data.pipe(ws);
        res.data.on('data', function (err) {
            if (err) {
                console.log(err)
            } else {
                console.log('写入中::' + title)
            }
        })
        
        res.data.on('close', function (err) {
            ws.close()
        })
    })
}
