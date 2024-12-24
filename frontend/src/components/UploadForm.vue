<template>
  <el-dialog 
    v-model="dialogVisible"
    title="" 
  >
    <div class="upload-form">
      <h3>记录新的成长时刻</h3>
      <el-form @submit="handleSubmit" label-position="top" :rules="rules" :model="formData" ref="uploadForm">
        <el-form-item label="日期">
          <el-date-picker
            v-model="formData.date"
            type="date"
            placeholder="图片会自动带出"
            format="YYYY/MM/DD"
            value-format="YYYY-MM-DD"
            :style="{ width: '100%' }"
          />
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入描述"
          />
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <el-upload
            ref="elUpdate"
            :file-list="formData.image"
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            accept="image/*"
            list-type="picture-card"
            multiple
            drag
          >
            <el-icon ><Plus /></el-icon>
            <div class="el-upload__text">
              Drop file here or <em>click to upload</em>
            </div>
            <template #file="{ file }">
              <div>
                <img class="el-upload-list__item-thumbnail" :src="file.url" alt="" />
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="viewImage(file)"
                  >
                    <el-icon><zoom-in /></el-icon>
                  </span>
                  <span
                    v-if="!disabled"
                    class="el-upload-list__item-delete"
                    @click="imagedelete(file)"
                  >
                    <el-icon><Delete /></el-icon>
                  </span>
                </span>
              </div>
            </template>
          </el-upload>

          <el-dialog v-model="dialogImageVisible">
            <img width="100%" :src="dialogImageUrl" alt="Preview Image"/>
          </el-dialog>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit">保存</el-button>
        </el-form-item>
      </el-form>
    </div>
  </el-dialog>
  
</template>

<script>
import axios from 'axios'
// import imageCompression from 'browser-image-compression'
import {ElForm, ElFormItem,ElDatePicker,ElDialog,ElInput,ElUpload,ElButton,ElIcon} from "element-plus";
import EXIF from 'exif-js'  // 添加这行导入
import { Plus,ZoomIn,Delete } from '@element-plus/icons-vue' 

export default {
  name: 'UploadForm',
  data() {
    return {
      rules: {
        description: [
          { required: true, message: '请输入描述', trigger: 'blur' }
        ],
      },
      formData: {
        date: '',
        title: '',
        description: '',
        image: [],
      },
      dialogVisible: false,
      dialogImageUrl: '',
      dialogImageVisible: false,
    }
  },
  components:{ElForm, ElFormItem,ElDatePicker,ElDialog,ElInput,ElUpload,ElButton,ElIcon,Plus,ZoomIn,Delete},
  methods: {
    onOpen(){
      this.resetForm();
    },
    onClose(){
      this.dialogVisible = false;
    },
    async handleSubmit(event) {
       // 阻止默认表单提交
      event.preventDefault()
      
      // 验证表单
      await this.$refs.uploadForm.validate(async (valid) => {
        if (!valid) {
          return false
        }
        if(!this.formData.date){this.formData.date = new Date()}
        const formData = new FormData()
        formData.append('date', this.formData.date)
        formData.append('title', this.formData.title)
        formData.append('description', this.formData.description)
        for (let i = 0; i < this.formData.image.length; i++) {
          formData.append('image', this.formData.image[i]);  // 'image' 必须匹配后端 upload.array('image', 5) 中的字段名
        }
        // formData.append('image', this.formData.image)
        // console.log(this.formData.image);
        
        try {
          await axios.post('http://localhost:3000/api/events', formData)
          this.$emit('event-added')
          this.resetForm()
          this.onClose();
        } catch (error) {
          console.error('上传失败:', error)
        }
      })
    },
    // 查看大图
    viewImage(file) {
      this.dialogImageUrl = file.url;
      this.dialogImageVisible = true;
    },
    // 删除图片
    imagedelete(file) {
      let fileIndex = this.formData.image.findIndex(img => img.uid == file.uid)
      if(fileIndex > -1){
        this.formData.image.splice(fileIndex, 1);
        this.$refs.elUpdate.handleRemove(file);
      }
    },
    resetForm() {
      this.formData = {
        date: '',
        title: '',
        description: '',
        image: [],
      },
      this.dialogImageUrl = '';
      this.dialogVisible = true;
    },
    async handleFileChange(e) {
      const file = e
      if (!file) return
      console.log(file);
      

      // 获取图片的 EXIF 数据并设置日期
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          // 尝试从 EXIF 数据获取拍摄日期
          try {
            EXIF.getData(img, () => {
              const exifDate = EXIF.getTag(img, "DateTimeOriginal");
              if (exifDate) {
                // 将 EXIF 日期格式转换为 YYYY-MM-DD
                const date = exifDate.split(' ')[0].replace(/:/g, '-');
                
                this.formData.date = date;
              }
            });
          } catch (error) {
            console.error('读取 EXIF 数据失败:', error);
          }
        };
      };
      reader.readAsDataURL(file.raw);
      if (!this.formData.image) {
          this.formData.image = [];
        }
      this.formData.image.push(file.raw || file)

    }
  },

}
</script>
<style  scoped>
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

.filter-controls {
  flex-direction: column;
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
}
:deep(.el-upload-dragger){
  height: 146px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>