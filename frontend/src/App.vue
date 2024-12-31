<template>
  <div id="apps">
    <Header :theme="theme" @update:theme="handleThemeChange"></Header>
    
    <main :class="['main-content',`bg${theme}`]">
      <Timeline :theme="theme"/>
    </main>
    
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} 成长记录本</p>
    </footer>
  </div>
</template>

<script>
import Timeline from './components/Timeline.vue'
import Header from "./components/header.vue"
import axios from 'axios'
import VConsole from 'vconsole'

export default {
  name: 'app',
  components: {
    Timeline,Header
  },
  data(){
    return { 
      theme: '',
      headerSrc: '',
      headerName: '',
      baseURL: `${window.location.protocol}//${window.location.hostname}:3000`,
    }
  },
  mounted(){
    this.getTheme();
    new VConsole()
  },
  methods: {
    async getTheme(){
      this.loading = true
        try {
          const response = await axios.get(`${this.baseURL}/api/theme`)
          this.theme = response.data.theme
          console.log(window.theme); 
        } catch (error) {
          console.error('获取主题失败:', error) 
        } finally {
          this.loading = false
        }
    },
    async handleThemeChange(newTheme) {
      this.theme = newTheme
      
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

#apps {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  flex:1;
}



.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
}

.footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {

  .header h1 {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 1rem;
  }
}

/* 添加到现有样式中 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from {
  transform: translateX(50px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateX(-50px);
  opacity: 0;
}
.bg1{background: #e6c4ff42;}
.bg2{background: #ffffe875;}
.bg3{background: #e7ffe74d;}
.bg4{background: #ffcce41f;}
.bg5{
  background: #ecf8ff;
}
</style>