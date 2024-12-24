const express = require('express')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const app = express()

const theme = require("./api/theme")
const events = require("./api/event")

// 中间件配置
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static('uploads'))
app.use('',theme)
app.use('',events)

// 确保上传目录存在
const uploadsDir = path.join(__dirname, 'uploads')
const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir)
}
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir)
}

// 配置文件上传
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
        cb(null, true)
    } else {
        cb(new Error('只允许上传图片文件！'), false)
    }
}

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 限制5MB
    }
})

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: err.message || '服务器内部错误' })
}
// 使用错误处理中间件
app.use(errorHandler)

// 启动服务器
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`)
})

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，准备关闭服务器')
    server.close(() => {
        console.log('服务器已关闭')
        process.exit(0)
    })
})