const path = require("path")
const TerserPlugin = require("terser-webpack-plugin")
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const FileManagerPlugin = require("filemanager-webpack-plugin");

module.exports = (env) => ({
    entry: path.resolve(__dirname, "./index.ts"),
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "index.js",
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            },
            {
                test: /\.ts$/,
                use: "ts-loader"
            }
        ]
    },
    resolve: {
        extensions: [".js",".ts",".css"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname,"./index.html"),
            inject: "body"
        }),
        new MiniCssExtractPlugin({
            filename: "./css/main.css",
            insert: "head"
        }),
        new TerserPlugin({
            parallel: true,
            extractComments: true,
            terserOptions: {
                ecma: undefined,
                warnings: false,
                parse: {},
                compress: {
                    drop_console: true,
                    drop_debugger: true,
                    // pure_funcs: ['console.log'] // 移除console
                }
            }
        }),
        new FileManagerPlugin({
            events: {
                onEnd: {
                    copy: [
                        {source: path.resolve(__dirname,"./md"),destination: path.resolve(__dirname,"./dist/md")}
                    ]
                }
            }
        })
    ],
    mode: env.mode,
    optimization: {
        minimize: true,
        minimizer: [
            new CssMinimizerPlugin()
        ]
    }
})