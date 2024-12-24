const express = require('express');
const multer = require('multer')
const path = require('path');
const fs = require('fs');
const router = express.Router(); // 使用路由器而不是完整的Express应用实例


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

router.get('/api/theme', (req, res) => {
  try {
    const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'theme.json');
    let theme = "";

    // 读取现有事件
    if (fs.existsSync(eventsFile)) {
      theme = JSON.parse(fs.readFileSync(eventsFile, 'utf8')); // 添加'utf8'编码参数
    }
    console.log("151515",fs.readFileSync(eventsFile, 'utf8'))

    res.json(theme);
  } catch (error) { // 捕获错误对象
    console.error('获取事件范围失败:', error);
    res.status(500).json({ error: '获取事件范围失败' });
  }
});
 
router.post('/api/theme', async (req, res) => {
  try {

    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme value is required' });
    }
    const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'theme.json');

    // 读取现有事件
    const fileData = JSON.parse(fs.promises.readFile(eventsFile, 'utf8'))
    const jsonData = fileData;
    
    // Update the theme property
    jsonData.theme = theme;
    await fs.writeFile(filePath, JSON.stringify(jsonData, null, 2));
    res.json({ message: 'Theme updated successfully', theme });
  } catch (error) { // 捕获错误对象
    console.error('获取事件范围失败:', error);
    res.status(500).json({ error: '获取事件范围失败' });
  }
});
router.post('/api/theme', async (req, res) => {
  try {
    const { theme } = req.body;
    
    if (!theme) {
      return res.status(400).json({ error: 'Theme value is required' });
    }
    const eventsFile = path.join(path.resolve(__dirname, '..'), 'data', 'theme.json');

    // 确保文件存在，如果不存在则创建一个空对象
    let jsonData = {};
    try {
      const fileData = await fs.promises.readFile(eventsFile, 'utf8');
      jsonData = JSON.parse(fileData);
    } catch (err) {
      if (err.code === 'ENOENT') {
        // 如果文件不存在，使用空对象继续
        await fs.promises.writeFile(eventsFile, JSON.stringify({}, null, 2));
      } else {
        throw err; // 其他错误则抛出
      }
    }
    
    // Update the theme property
    jsonData.theme = theme;
    await fs.promises.writeFile(eventsFile, JSON.stringify(jsonData, null, 2));
    
    res.json({ message: 'Theme updated successfully', theme });
  } catch (error) {
    console.error('主题更新失败:', error);
    res.status(500).json({ error: '主题更新失败' });
  }
});



module.exports = router; // 导出路由器实例
