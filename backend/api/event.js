const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const router = express.Router(); 

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
        fileSize: 100 * 1024 * 1024 // 限制30MB
    }
}) 

// 获取所有事件
router.get('/api/events', (req, res) => {
    const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
    try {
        if (!fs.existsSync(eventsFile)) {
            return res.json([])
        }
        const events = JSON.parse(fs.readFileSync(eventsFile))
        res.json(events)
    } catch (error) {
        console.error('读取事件失败:', error)
        res.status(500).json({ error: '读取事件失败' })
    }
})
// 添加新事件
router.post('/api/events', upload.array('image', 5), (req, res) => {
    try {
        const { date, title, description } = req.body
        const imageUrls = req.files ? req.files.map(file => `/uploads/${file.filename}`) : []
        console.log('80',req.files);
        
        const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
        let events = []
        
        // 读取现有事件
        if (fs.existsSync(eventsFile)) {
            events = JSON.parse(fs.readFileSync(eventsFile))
        }

        // 创建新事件
        const newEvent = {
            id: Date.now(),
            date,
            title,
            description,
            imageUrls,
            createdAt: new Date().toISOString()
        }

        events.push(newEvent)

        // 按日期排序
        events.sort((a, b) => new Date(b.date) - new Date(a.date))

        // 保存到文件
        fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
        
        res.status(201).json(newEvent)
    } catch (error) {
        console.error('创建事件失败:', error)
        res.status(500).json({ error: '创建事件失败' })
    }
})

// 更新事件
router.put('/api/events/:id', upload.single('image'), (req, res) => {
    try {
        const { id } = req.params
        const { date, title, description } = req.body
        const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
        
        if (!fs.existsSync(eventsFile)) {
            return res.status(404).json({ error: '没有找到事件数据' })
        }

        let events = JSON.parse(fs.readFileSync(eventsFile))
        const eventIndex = events.findIndex(e => e.id === parseInt(id))
        
        if (eventIndex === -1) {
            return res.status(404).json({ error: '事件不存在' })
        }

        // 更新事件数据
        const updatedEvent = {
            ...events[eventIndex],
            date,
            title,
            description,
            updatedAt: new Date().toISOString()
        }

        // 如果上传了新图片
        if (req.file) {
            // 删除旧图片
            if (events[eventIndex].imageUrls) {
                let imgs = events[eventIndex].imageUrls;
                for(let i = 0; i < imgs.length ; i++){
                    const oldImagePath = path.join(path.resolve(__dirname, '..'), imgs[i])
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath)
                    }
                }
                
            }
            for(let j = 0; j < req.file ; j++){
                updatedEvent.imageUrls.push(`/uploads/${req.file[j].filename}`)
            }
            
        }

        events[eventIndex] = updatedEvent

        // 重新排序
        events.sort((a, b) => new Date(b.date) - new Date(a.date))

        // 保存更新
        fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
        
        res.json(updatedEvent)
    } catch (error) {
        console.error('更新事件失败:', error)
        res.status(500).json({ error: '更新事件失败' })
    }
})

// 删除事件
router.delete('/api/events/:id', (req, res) => {
    try {
        const { id } = req.params
        const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
        
        if (!fs.existsSync(eventsFile)) {
            return res.status(404).json({ error: '没有找到事件数据' })
        }

        let events = JSON.parse(fs.readFileSync(eventsFile))
        const eventIndex = events.findIndex(e => e.id === parseInt(id))
        
        if (eventIndex === -1) {
            return res.status(404).json({ error: '事件不存在' })
        }

        // 删除关联的图片文件
        let imageUrls = events[eventIndex].imageUrls
        if(imageUrls){
            for(let i= 0;i<imageUrls.length ;i++){
                let url = imageUrls[i];
                if (url) {
                    const imagePath = path.join(path.resolve(__dirname, '..'), url)
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath)
                    }
                }
            }
        }
        
        

        // 删除事件
        events.splice(eventIndex, 1)
        fs.writeFileSync(eventsFile, JSON.stringify(events, null, 2))
        
        res.json({ message: '删除成功' })
    } catch (error) {
        console.error('删除事件失败:', error)
        res.status(500).json({ error: '删除事件失败' })
    }
})

// 获取单个事件
router.get('/api/events/:id', (req, res) => {
    try {
        const { id } = req.params
        const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
        
        if (!fs.existsSync(eventsFile)) {
            return res.status(404).json({ error: '没有找到事件数据' })
        }

        const events = JSON.parse(fs.readFileSync(eventsFile))
        const event = events.find(e => e.id === parseInt(id))
        
        if (!event) {
            return res.status(404).json({ error: '事件不存在' })
        }

        res.json(event)
    } catch (error) {
        console.error('获取事件失败:', error)
        res.status(500).json({ error: '获取事件失败' })
    }
})

// 按日期范围获取事件
router.get('/api/events/range/:startDate/:endDate', (req, res) => {
    try {
        const { startDate, endDate } = req.params
        const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'events.json')
        
        if (!fs.existsSync(eventsFile)) {
            return res.json([])
        }

        const events = JSON.parse(fs.readFileSync(eventsFile))
        const filteredEvents = events.filter(event => {
            const eventDate = new Date(event.date)
            return eventDate >= new Date(startDate) && eventDate <= new Date(endDate)
        })

        res.json(filteredEvents)
    } catch (error) {
        console.error('获取事件范围失败:', error)
        res.status(500).json({ error: '获取事件范围失败' })
    }
})

module.exports = router;