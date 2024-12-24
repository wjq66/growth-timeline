<template>
    <div class="timeline-item" :class="{ 'left': isLeft }">
      <!-- 时间线节点 -->
      <div class="timeline-dot">
        <div class="dot-content" :class="`bg${theme}`"></div>
      </div>
  
      <!-- 内容卡片 -->
      <div v-if="line" class="timeline-content">
        <div class="content-card">
          <!-- 操作按钮 -->
          <div class="action-buttons" v-if="!isEditing">
            <button class="edit-btn" @click="startEdit" title="编辑">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-btn" @click="confirmDelete" title="删除">
              <i class="fas fa-trash"></i>
            </button>
          </div>
  
          <!-- 编辑模式 -->
          <div v-if="isEditing" class="edit-form">
            <div class="form-group">
              <label>日期：</label>
              <input type="date" v-model="editForm.date" required>
            </div>
            
            <div class="form-group">
              <label>标题：</label>
              <input type="text" v-model="editForm.title" required>
            </div>
            
            <div class="form-group">
              <label>描述：</label>
              <textarea v-model="editForm.description" required></textarea>
            </div>
            
            <div class="form-group">
              <label>更新图片：</label>
              <input type="file" @change="handleFileChange" accept="image/*">
            </div>
            
            <div class="edit-buttons">
              <button class="save-btn" @click="saveEdit">保存</button>
              <button class="cancel-btn" @click="cancelEdit">取消</button>
            </div>
          </div>
  
          <!-- 显示模式 -->
          <template v-else>
            <div class="date">{{ formatDate(event.date) }}</div>
            <h3 class="title">{{ event.title }}</h3>
            
            <!-- 图片 -->
            <div class="image-container" v-if="event.imageUrls">
 
              <el-carousel :interval="4000" type="card" height="200px" :autoplay="false">
                <el-carousel-item v-for="(img,index) in event.imageUrls" :key="img">
                  <img   
                    :src="'http://localhost:3000'+img"
                    :alt="event.title"
                    @click="showFullImage(index)"
                  >
                  <!-- <h3>{{img}}</h3> -->
                </el-carousel-item>
              </el-carousel>
            </div>
            
            <!-- 描述 -->
            <p class="description">{{ event.description }}</p>
          </template>
        </div>
      </div>
      <template v-else>
        <div class="timeline-content yearContent">
          <div class="content-card yearCard">
             {{ event.title }}
          </div>
        </div>
      </template>
  
      <!-- 全屏图片预览 -->

      <teleport to="body">
        <div 
          class="fullscreen-image" 
          v-if="isFullscreen" 
          @click="hideFullImage"
        >
          <div class="fullscreen-content">
            <img :src="'http://localhost:3000'+event.imageUrls[clickIndex]" :alt="event.title">
            <button class="close-btn" @click="hideFullImage">×</button>
          </div>
        </div>
      </teleport>
      
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  import imageCompression from 'browser-image-compression'
  import {ElCarousel, ElCarouselItem} from "element-plus"
  export default {
    name: 'TimelineItem',
    props: {
      event: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      theme: {
        Default: '',
        type: String,
      },
      line: {
        Default: true,
        type: Boolean,
      }
    },
    components:{ElCarousel, ElCarouselItem},
    
    data() {
      return {
        theme:window.theme,
        isFullscreen: false,
        isEditing: false,
        editForm: {
          date: '',
          title: '',
          description: '',
          image: null
        },
        clickIndex: 0,
      }
    },
    
    computed: {
      isLeft() {
        return this.index % 2 === 0
      }
    },
    
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      },
      
      showFullImage(indx) {
        this.isFullscreen = true
        this.clickIndex = indx;
        document.body.style.overflow = 'hidden'
      },
      
      hideFullImage() {
        this.isFullscreen = false
        document.body.style.overflow = 'auto'
      },
      
      startEdit() {
        this.editForm = {
          date: this.event.date,
          title: this.event.title,
          description: this.event.description,
          image: null
        }
        this.isEditing = true
      },
      
      async handleFileChange(e) {
        const file = e.target.files[0]
        if (!file) return
  
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true
        }
  
        try {
          const compressedFile = await imageCompression(file, options)
          this.editForm.image = compressedFile
        } catch (error) {
          console.error('图片压缩失败:', error)
        }
      },
      
      async saveEdit() {
        try {
          const formData = new FormData()
          formData.append('date', this.editForm.date)
          formData.append('title', this.editForm.title)
          formData.append('description', this.editForm.description)
          if (this.editForm.image) {
            formData.append('image', this.editForm.image)
          }
          
          await axios.put(`http://localhost:3000/api/events/${this.event.id}`, formData)
          this.$emit('event-updated')
          this.isEditing = false
        } catch (error) {
          console.error('更新失败:', error)
          alert('更新失败，请重试')
        }
      },
      
      cancelEdit() {
        this.isEditing = false
        this.editForm = {
          date: '',
          title: '',
          description: '',
          image: null
        }
      },
      
      async confirmDelete() {
        if (confirm('确定要删除这条记录吗？')) {
          try {
            await axios.delete(`http://localhost:3000/api/events/${this.event.id}`)
            this.$emit('event-deleted')
          } catch (error) {
            console.error('删除失败:', error)
            alert('删除失败，请重试')
          }
        }
      }
    },
    mounted(){
      console.log(this.line);
      
    }
  }
  </script>
  
  <style scoped>
  .timeline-item {
    position: relative;
    margin: 2rem 0;
    width: 100%;
    display: flex;
    justify-content: center;
    opacity: 0;
    animation: fadeIn 0.5s ease forwards;
  }

  .year-tag {
  position: relative;
  background: #95a5a6; /* 灰色背景 */
  color: white;
  padding: 5px 15px;
  display: inline-block;
}

.year-tag::after {
  content: '';
  position: absolute;
  right: -10px; /* 控制箭头突出的距离 */
  top: 0;
  width: 0;
  height: 0;
  border-top: 13px solid transparent; /* 调整箭头高度的一半 */
  border-bottom: 13px solid transparent;
  border-left: 10px solid #95a5a6; /* 箭头颜色需要和主体背景色相同 */
}
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  /* 时间线节点样式 */
  .timeline-dot {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 40px;
    height: 40px;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .dot-content {
    width: 20px;
    height: 20px;
    background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
    border-radius: 50%;
    transition: transform 0.3s ease;
  }
  .bg1{
    background: linear-gradient(45deg, #feccff, #4ecdc4);
  }
  .bg2{
    background: linear-gradient(45deg, #ffffd7, #773903);
  }
  .bg3{
    background: linear-gradient(45deg, #cdffcd, #4cc9c0);
  }
  .bg4{
    background: linear-gradient(45deg, #ffcccd, #1e80ff);
  }
  .bg5{
    background: linear-gradient(45deg, #cfefff, #f1faff);
  }

  
  .timeline-item:hover .dot-content {
    transform: scale(1.2);
  }
  
  /* 内容卡片样式 */
  .timeline-content {
    width: 45%;
    position: relative;
  }
  
  .content-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }
  
  .timeline-item:hover .content-card {
    transform: translateY(-5px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  /* 左右布局 */
  .timeline-item.left .timeline-content {
    margin-right: 55%;
  }
  
  .timeline-item:not(.left) .timeline-content {
    margin-left: 55%;
  }
  
  /* 连接线样式 */
  .timeline-item::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 50%;
    width: calc(5% + 20px);
    height: 2px;
    background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
  }
  
  .timeline-item.left::before {
    transform: translateX(-100%);
  }
  
  .timeline-item:not(.left)::before {
    transform: translateX(0);
  }
  
  /* 内容样式 */
  .date {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .title {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
  
  .description {
    color: #666;
    line-height: 1.6;
  }
  
  /* 图片容器 */
  .image-container {
    margin: 1rem 0;
    overflow: hidden;
    border-radius: 4px;
    width: auto;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: nowrap;
    flex-direction: row;
    overflow-x: scroll;
  }
  
  .image-container img {
    max-width: 100%;
    max-height: 250px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .image-container img:hover {
    transform: scale(1.05);
  }
  
  /* 操作按钮 */
  .action-buttons {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .content-card:hover .action-buttons {
    opacity: 1;
  }
  
  .edit-btn, 
  .delete-btn {
    padding: 8px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #f5f5f5;
  }
  
  .edit-btn:hover { 
    background: #4ecdc4; 
    color: white;
  }
  
  .delete-btn:hover { 
    background: #ff6b6b; 
    color: white;
  }
  
  /* 编辑表单 */
  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  
  .form-group label {
    font-weight: 500;
    color: #666;
  }
  
  .form-group input,
  .form-group textarea {
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }
  
  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  .edit-buttons {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    margin-top: 10px;
  }
  
  .save-btn,
  .cancel-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .save-btn {
    background: #4ecdc4;
    color: white;
  }
  
  .cancel-btn {
    background: #f5f5f5;
  }
  
  .save-btn:hover {
    background: #45b7b0;
  }
  
  .cancel-btn:hover {
    background: #e5e5e5;
  }
  
  /* 全屏图片预览 */
  .fullscreen-image {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    cursor: pointer;
  }
  
  .fullscreen-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
  }
  
  .fullscreen-image img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
  }
  
  .close-btn {
    position: absolute;
    top: -40px;
    right: -40px;
    background: none;
    border: none;
    color: white;
    font-size: 30px;
    cursor: pointer;
    padding: 10px;
  }
  
  /* 响应式设计 */
  @media (max-width: 1024px) {
    .timeline-content {
      width: 60%;
    }
  }
  
  @media (max-width: 768px) {
    .timeline-content {
      width: 80%;
    }
    
    .timeline-item.left .timeline-content,
    .timeline-item:not(.left) .timeline-content {
      margin: 0 0 0 20%;
    }
  
    .timeline-dot {
      left: 10%;
    }
  
    .timeline-item::before {
      left: 10%;
      width: 10%;
    }
  
    .action-buttons {
      opacity: 1;
    }
  }
  
  @media (max-width: 480px) {
    .timeline-content {
      width: 90%;
    }
  
    .content-card {
      padding: 1rem;
    }
  
    .action-buttons {
      position: relative;
      top: 0;
      right: 0;
      margin-bottom: 10px;
    }
  
    .fullscreen-content .close-btn {
      top: -30px;
      right: 0;
    }
  }

  .el-carousel__item img {
  color: #475669;
  opacity: 0.75;
  line-height: 200px;
  margin: 0;
  text-align: center;
}
:deep(.el-carousel){
  width: 100% !important;
}
:deep(.el-carousel__container){ 
  width: 100%;
  height: 200px;
}
.el-carousel__item{
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px; /* 设置容器的高度 */
  overflow: hidden; 
  background-color: #f5f5f5;
}

.yearCard{
  width: 7rem;
  height: 50px;
  line-height: 50px;
  padding: 0 12px;
  text-align: center;
  border-radius: 89% 0;
  background: #47bcb6c7;
  font-size: 18px;
  font-weight: 600;
  top: -23px;
}
.timeline-item.left .yearContent{
  margin-left: 33%;
} 

.timeline-item.left .yearCard{
  border-radius: 0 89%;
}
  </style>