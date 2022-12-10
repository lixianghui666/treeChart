const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
let app = express();


app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: false }));
app.all("*", (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
    next();
});

app.post("/save-data", async (req, res) => {
    let resp = await new Promise(resolve => {
        try {
            let { data } = req.body;
            let stream = fs.createWriteStream(path.resolve(__dirname, "../../chart-data.js"), {
                flags: "w"
            });
            stream.write(decodeURIComponent(data).replace(/\+/igm," "));
            stream.end();
            stream.on("close", () => resolve({ errMsg: "写入成功" }));
        }catch(err){
            resolve({errMsg: "写入失败",err});
        }
    })
    res.send(resp);
})

app.listen(8085);