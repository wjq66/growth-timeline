<template>
    <div class="timeline-container">
      <!-- 筛选控件 -->
      <div class="filter-section">
        <div class="filter-controls">
          <div class="date-filter">
            <el-date-picker
              v-model="filters.startDate"
              type="date"
              placeholder="Pick a day"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
            />
            <span>至</span>
            <el-date-picker
              v-model="filters.endDate"
              type="date"
              placeholder="Pick a day"
              format="YYYY/MM/DD"
              value-format="YYYY-MM-DD"
            />
          </div>
          <el-select
            v-model="filters.sortOrder"
            style="width: 240px"
          >
            <el-option value="desc" label="最新在前">最新在前</el-option>
            <el-option value="asc" label="最早在前">最早在前</el-option>
          </el-select>
        </div>
  
        <el-dropdown>
          <button class="add-button">
            添加新记录<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="$refs.uploadform.onOpen()">本地上传</el-dropdown-item>
              <el-dropdown-item @click="generateQRCode">手机上传</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-dialog v-model="qrcodevisible">
          <h3>手机和电脑在同一局域网下，用手机扫描二维码打开手机端</h3>
          <vue-qrcode :value="qrCodeValue" :size="qrCodeSize"></vue-qrcode>
        </el-dialog>
      </div>
  
      <!-- 上传表单 -->
      <transition name="slide-fade">
        <upload-form 
          ref="uploadform"
          @event-added="handleEventAdded"
          @close="showUploadForm = false"
        />

      </transition>
  
      <!-- 时间线 -->
      <div class="timeline" v-if="filteredEvents.length > 0">
        <transition-group name="list">
          <timeline-item
            v-for="(event, index) in filteredEvents"
            :key="event.id"
            :event="event"
            :index="index"
            :theme = "theme"
            :line="event.line"
            @event-updated="refreshTimeline"
            @event-deleted="refreshTimeline"
          />
        </transition-group>
      </div>
  
      <!-- 空状态 -->
      <div v-else class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>还没有记录哦，快来添加第一条成长记录吧！</p>
      </div>
  
      <!-- 加载状态 -->
      <div class="loading-overlay" v-if="loading">
        <div class="loading-spinner"></div>
      </div>

      <el-backtop :right="100" :bottom="100" />
    </div>
  </template>
  
  <script>
  import TimelineItem from './TimelineItem.vue'
  import UploadForm from './UploadForm.vue'
  import axios from 'axios'
  import VueQrcode from 'vue-qrcode'


import { ElDatePicker,ElSelect ,ElOption,ElDropdown,ElDropdownMenu,ElDropdownItem,ElDialog,ElIcon, ElBacktop} from 'element-plus'
import {ArrowDown} from "@element-plus/icons-vue"
  
  export default {
    name: 'time-line',
    
    components: {
      TimelineItem,
      UploadForm,
      ElDatePicker,
      ElSelect,ElOption,
      VueQrcode,
      ArrowDown,
      ElDropdown,
      ElDropdownMenu,
      ElDropdownItem,ElDialog,ElIcon,
      ElBacktop
    },

    props: {
      theme: {
        Default: '',
        type: String,
      }
    },
    
    data() {
      return {
        events: [],
        loading: false,
        showUploadForm: false,
        filters: {
          startDate: '',
          endDate: '',
          sortOrder: 'desc'
        },
        error: null,
        qrCodeValue: '', // 二维码的内容
        qrCodeSize: 150, // 二维码的尺寸，单位是像素
        qrcodevisible: false,
        baseURL: `${window.location.protocol}//${window.location.hostname}:3000`,
      }
    },
  
    computed: {
      filteredEvents() {
        let filtered = [...this.events]
  
        // 日期筛选
        if (this.filters.startDate) {
          filtered = filtered.filter(event => 
            event.date >= this.filters.startDate
          )
        }
        if (this.filters.endDate) {
          filtered = filtered.filter(event => 
            event.date <= this.filters.endDate
          )
        }
  
        // 排序
        filtered.sort((a, b) => {
          const comparison = new Date(a.date) - new Date(b.date)
          return this.filters.sortOrder === 'desc' ? -comparison : comparison
        })
  
        return filtered
      }
    },
    watch: {
      filters:{
        handler() {
          this.filterEvents();
        },
        deep: true
      }
    },
  
    methods: {
      async fetchEvents() {
        this.loading = true
        this.error = null
        
        try {
          const response = await axios.get(`${this.baseURL}/api/events`)
          this.events = response.data
          this.handleData();
        } catch (error) {
          console.error('获取事件失败:', error)
          this.error = '获取数据失败，请稍后重试'
        } finally {
          this.loading = false
        }
      },
  
      filterEvents() {
        // 如果需要从服务器筛选，可以在这里发起请求
        if (this.filters.startDate && this.filters.endDate) {
          this.fetchEventsByDateRange()
        }
      },
  
      async fetchEventsByDateRange() {
        this.loading = true
        try {
          const response = await axios.get(
            `${this.baseURL}/api/events/range/${this.filters.startDate}/${this.filters.endDate}`
          )
          this.events = response.data
        } catch (error) {
          console.error('获取日期范围事件失败:', error)
          this.error = '筛选数据失败，请稍后重试'
        } finally {
          this.loading = false
        }
      },
  
      handleEventAdded() {
        this.showUploadForm = false
        this.refreshTimeline()
      },

      handleData(){
        // this.events.forEach(item => {
        //   if(item.)
        // })
        if (this.events.length < 2) return;
        
        const processedEvents = [];
        for (let i = 0; i < this.events.length - 1; i++) {
          const currentEvent = {
            ...this.events[i],
            line: true,
          };
          const nextEvent = this.events[i + 1];
          
          processedEvents.push(currentEvent);
          
          // Get years from the dates
          const currentYear = new Date(currentEvent.date).getFullYear();
          const nextYear = new Date(nextEvent.date).getFullYear();
          
          // If years are different, add a separator object
          if (currentYear !== nextYear) {
            processedEvents.push({
              id: `year-separator-${currentYear}`,
              date: `${currentYear}-01-01`,
              line: false,
              title: `${currentYear}`,
              type: 'year-separator'
            });
          }
        }
        // Don't forget to add the last event
        processedEvents.push({...this.events[this.events.length - 1],line:true});
        
        this.events = processedEvents;
        
        
      },
  
      refreshTimeline() {
        this.fetchEvents()
      },

      generateQRCode() {
        this.qrcodevisible = true;
        this.qrCodeValue = 'http://172.20.10.3:8086/'; // 设置二维码内容
      },
  
      // 重置筛选条件
      resetFilters() {
        this.filters = {
          startDate: '',
          endDate: '',
          sortOrder: 'desc'
        }
        this.fetchEvents()
      }
    },

  
    mounted() {
      this.fetchEvents()
      console.log(this.theme);
      
    }
  }
  </script>
  
  <style scoped>
  .timeline-container {
    padding: 20px;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
    min-height: 400px;
  }
  
  /* 筛选区域样式 */
  .filter-section {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 20px;
  }
  
  .filter-controls {
    display: flex;
    gap: 20px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .date-filter {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  
  .date-input,
  .sort-select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    transition: border-color 0.3s ease;
  }
  
  .date-input:focus,
  .sort-select:focus {
    border-color: #4ecdc4;
    outline: none;
  }
  
  .add-button {
    background: linear-gradient(45deg, #4ecdc4, #45b7b0);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  
  .add-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  .add-button:focus-visible{
    outline-color: #f5f5f5;
  }
  
  /* 时间线样式 */
  .timeline {
    position: relative;
    padding: 20px 0;
  }
  
  .timeline::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
    background: linear-gradient(to bottom, #ff6b6b, #4ecdc4);
  }
  
  /* 空状态样式 */
  .empty-state {
    text-align: center;
    padding: 40px;
    color: #666;
  }
  
  .empty-state i {
    font-size: 48px;
    margin-bottom: 20px;
    color: #ddd;
  }
  
  /* 加载状态样式 */
  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #4ecdc4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  /* 过渡动画 */
  .slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  
  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1.0, 0.5, 0.8, 1.0);
  }
  
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateY(-20px);
    opacity: 0;
  }
  
  .list-enter-active,
  .list-leave-active {
    transition: all 0.5s ease;
  }
  
  .list-enter-from {
    opacity: 0;
    transform: translateY(30px);
  }
  
  .list-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  
  /* 响应式设计 */
  @media (max-width: 1024px) {
    .timeline-container {
      padding: 15px;
    }
  }
  
  @media (max-width: 768px) {
    .filter-section {
      flex-direction: column;
      align-items: stretch;
    }
  
    .filter-controls {
      flex-direction: column;
      align-items: stretch;
    }
  
    .date-filter {
      flex-direction: column;
    }
  
    .add-button {
      width: 100%;
      justify-content: center;
    }
  
    .timeline::before {
      left: 30px;
    }
  }
  
  @media (max-width: 480px) {
    .timeline-container {
      padding: 10px;
    }
  
    .filter-section {
      padding: 15px;
    }
  }
  </style>