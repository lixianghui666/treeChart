const config = require("./webpack.config.js")({mode: "development"});
const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");

const compiler = webpack(config);


const server = new webpackDevServer({
    hot: true,
    open: true,
    port: 3306,
    liveReload: true
},compiler);

server.start();