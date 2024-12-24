<template>
    <div class="header-banner">
        <div class="animated-banner"></div>
        <!-- <header :class="['header', `bg${theme}`]">
            <span></span>
            <h1>{{title}}</h1>
            <el-dropdown trigger="click">
                <span class="el-dropdown-link" style="outline: none;cursor: pointer;">
                    <span style="vertical-align: super;">主题</span>
                    <el-icon class="el-icon--right">
                        <arrow-down />
                    </el-icon>
                </span>
                <template #dropdown>
                <el-dropdown-menu>
                    <el-dropdown-item v-for="(theme,index) in themes" :key="index" :class="`bg${index+1}`" @click="changeTheme(index)">{{theme.name}}</el-dropdown-item> 
                </el-dropdown-menu>
                </template>
            </el-dropdown>
        </header> -->
    </div>
</template>

<script>
import {ElAvatar} from "element-plus"
import {ElForm, ElFormItem,ElDatePicker,ElDialog,ElInput,ElUpload,ElButton,ElDropdown,ElDropdownMenu,ElDropdownItem} from "element-plus";
import {ArrowDown} from "@element-plus/icons-vue"
import axios from 'axios'
export default {
  name: 'Header',
  data() { 
    return { 
        title: '成长记录',
        themes: [
            {name:'主题1',id:'1'},
            {name:'主题2',id:'2'},
            {name:'主题3',id:'3'},
            {name:'主题4',id:'4'},
            {name:'主题5',id:'5'},
        ]
    }
  },
  components:{ElAvatar,ElForm, ElFormItem,ElDatePicker,ElDialog,ElInput,ElUpload,ElButton,ArrowDown,ElDropdown,ElDropdownMenu,ElDropdownItem},
  props: {
    theme: {
        type: Number, // 修改类型为 Number
        default: 1    // 设置默认值
    },
  },
  methods: {
     
  },
  mounted() { 
    
  },
  methods:{
    changeTheme(index){
        this.loading = true
        const newTheme = index + 1
        this.$emit('update:theme', newTheme) 
        // try {
        //     const response = await axios.post("http://localhost:3000/api/theme", {theme: index+1})
        //     this.theme = response.data.theme
        //     console.log(window.theme); 
        // } catch (error) {
        //     console.error('获取主题失败:', error) 
        // } finally {
        //     this.loading = false
        // }
    }
  }
 }
</script>

<style scoped>


.header{
    
}


/* .header {
  background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
  color: white;
  padding: 1rem 2rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between; 
  align-items: center;
}
.bg1{background: linear-gradient(to right, #ffccff, #ccbbff);color:#003c8b}
.bg2{background: linear-gradient(to right, #ffffcc, #ffffff);color:#773904}
.bg3{background: linear-gradient(to right, #ccffcc, #ffffff);color:#7c7c7c}
.bg4{background: linear-gradient(to right, #ffcccb, #6f98f1);color:#fff}
.bg5{background: linear-gradient(to right, #cceeff, #ffffff);color:#004995}
.header h1 {
  font-size: 2rem;
  font-weight: 600;
}
:deep(.el-avatar--circle){
    background: rgb(214 214 214 / 50%);
}
.el-dropdown svg{
    width: 20px;
    height: 20px;
} */
</style>