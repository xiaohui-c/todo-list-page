<template>
  <div id="app">
    <!-- 导航标题 -->
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="6">
        <p class="headline">导航</p>
      </el-col>
    </el-row>
    <!-- 展示表格文字按钮 -->
    <el-row>
      <el-col :span="2"></el-col>
      <el-col :span="6">
        <p class="navigation" @click="getall" title="点击弹出任务列表">
          任务列表界面
        </p>
      </el-col>
    </el-row>
    <!-- 动态化表格 -->
    <transition name="slide-fade">
      <div class="table-box" v-if="show">
        <el-divider content-position="center">任务列表</el-divider>
        <el-row>
          <el-col :span="2"></el-col>
          <el-col :span="6">
            <el-button class="newadd" @click="addtoggle" type="primary"
              >新增</el-button
            >
          </el-col>
          <el-col :span="15">
            <!-- 筛选区域 -->
            <el-dropdown :hide-on-click="false">
              <div class="filter">
                <img src="./assets/筛选 .png" alt />
              </div>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item>
                  <el-radio v-model="radio" label="-1" @change="change"
                    >全部</el-radio
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-radio v-model="radio" label="1" @change="change"
                    >待办</el-radio
                  >
                </el-dropdown-item>
                <el-dropdown-item>
                  <el-radio v-model="radio" label="2" @change="change"
                    >完成</el-radio
                  >
                </el-dropdown-item>
                <!-- <el-dropdown-item>
                  <el-radio v-model="radio" label="4" @change="change">删除</el-radio>
                </el-dropdown-item>-->
                <el-divider class="dialog_liner"></el-divider>
                <div class="dialog_btn">
                  <el-button type="text" @click="statusComfirm">确定</el-button>
                  <el-button type="text" @click="Statusreset">重置</el-button>
                </div>
              </el-dropdown-menu>
            </el-dropdown>
          </el-col>
        </el-row>
        <!-- 表格区域 -->
        <el-table
          :data="rows"
          border
          style="width: 90%"
          v-if="total > 0"
          v-loading="loading"
        >
          <el-table-column
            v-for="(item, index) in columns"
            :key="index"
            :prop="item.prop"
            :label="item.label"
            :width="item.width"
            align="center"
            :fixed="item.label == 'ID' ? true : false"
          ></el-table-column>
          <el-table-column label="截止时间" align="center" width="200">
            <template slot-scope="scope">
              <p>{{ scope.row.deadline.slice(0, 10) }}</p>
            </template>
          </el-table-column>
          <el-table-column label="状态" align="center" width="100">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status === 2"
                type="success"
                class="statusnewadd"
                >完成</el-button
              >
              <el-button
                v-if="scope.row.status === 1"
                type="warning"
                class="statusnewadd"
                >待办</el-button
              >
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <!-- 作用域插槽，获取该行数据 ,会覆盖prop -->
            <template slot-scope="scope">
              <el-button
                class="control-btn"
                @click="editoggle(scope.row)"
                type="primary"
                v-show="scope.row.status === 1"
                >编辑</el-button
              >
              <el-button
                class="control-btn"
                v-show="scope.row.status === 1"
                @click="Statuschange(scope.row.id)"
                >完成</el-button
              >

              <el-button
                class="control-btn"
                type="danger"
                @click="detele(scope.row.id)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页区域 -->
        <el-row>
          <el-col :span="15"></el-col>
          <el-col :span="9">
            <el-pagination
              :page-size="3"
              background
              layout="prev, pager, next"
              :total="total"
              @current-change="handleCurrentChange"
              v-show="total > 3"
            ></el-pagination>
          </el-col>
        </el-row>
        <!-- 侧边栏区域 -->
        <el-drawer
          :title="title"
          :visible.sync="drawer"
          :direction="direction"
          @close="close"
        >
          <el-divider class="liner"></el-divider>
          <el-form
            :model="ruleForm"
            :rules="rules"
            ref="ruleForm"
            label-width="100px"
            class="demo-ruleForm"
            :label-position="labelPosition"
          >
            <el-form-item label="任务名称:" prop="name">
              <el-input v-model="ruleForm.name"></el-input>
            </el-form-item>
            <el-form-item
              label="任务截止日期:"
              prop="deadline"
              style="cursor: pointer"
            >
              <el-date-picker
                type="date"
                placeholder="选择日期"
                style="width: 100%"
                v-model="ruleForm.deadline"
                :picker-options="end_Date"
              ></el-date-picker>
            </el-form-item>
            <el-form-item label="任务内容:" prop="content">
              <el-input type="textarea" v-model="ruleForm.content"></el-input>
            </el-form-item>
          </el-form>
          <el-row class="btn-box">
            <el-button
              type="primary"
              @click="suredialog('ruleForm')"
              v-show="flag === 1"
              >保存</el-button
            >
            <el-button
              type="primary"
              @click="sureEdit('ruleForm')"
              v-show="flag === 2"
              >保存</el-button
            >
            <el-button @click="resetFormDate('ruleForm')">重置</el-button>
            <el-button type="warning" @click="resetForm('ruleForm')"
              >取消</el-button
            >
          </el-row>
        </el-drawer>
        <!-- 确认添加dialog -->
        <el-dialog title="添加任务" :visible.sync="dialogVisible" width="30%">
          <p>确定添此任务吗?</p>
          <span slot="footer" class="dialog-footer">
            <el-button @click="dialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="confirmAdd">确 定</el-button>
          </span>
        </el-dialog>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      columns: [
        { prop: "id", label: "ID", width: 60 },
        { prop: "name", label: "标题", width: 240 },
        { prop: "content", label: "内容" },
        // { prop: "deadline", label: "截止日期", width: 200 }
        // { prop: "status", label: "状态", width: 100 }
      ],
      rows: [],
      drawer: false,
      direction: "rtl",
      labelPosition: "left",
      ruleForm: {
        name: "",
        deadline: "",
        content: "",
      },
      rules: {
        name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
        deadline: [
          {
            // type: "date",
            required: true,
            message: "请选择日期",
            trigger: "blur",
          },
        ],
        content: [
          { required: true, message: "请输入任务内容", trigger: "blur" },
        ],
      },
      radio: "-1",
      show: false,
      lock: false,
      end_Date: {
        disabledDate: (time) => {
          // if (this.ruleForm.deadline) {
          //   return time.getTime() < new Date(this.ruleForm.deadline).getTime();
          // } else {
          //还没有选择结束时间的时候，让他只能选择今天之后的时间包括今天
          return time.getTime() < Date.now() - 8.64e7;
          // }
        },
      },
      title: "",
      total: 0,
      dialogVisible: false,
      momentPage: 1,
      flag: 1,
      editId: 0,
    };
  },

  created() {},
  computed: {
    // 当数据请求回来的时候才结束loading
    loading: {
      get: function () {
        return this.rows.length > 0 ? false : true;
      },
    },
  },

  methods: {
    // 新增按钮弹出事件
    addtoggle() {
      this.drawer = true;
      this.title = "新增任务";
      this.flag = 1;
    },
    // 编辑按钮弹出事件
    editoggle(value) {
      this.drawer = true;
      this.title = "编辑任务";
      this.flag = 2;
      this.ruleForm = value;
    },
    // 获取列表
    getall() {
      this.show = true;
      if(this.lock==true) return
      this.getData();
    },
    // 使用ES6函数参数配置默认参数
  async  getData(status = -1, page = 1) {
      const {data:res} = await this.$http.get(`list/${status}/${page}`)
        if (res.status == 200) {
          this.lock = true;
          this.rows = res.list.rows;
          this.total = res.list.count;
        }

    },
    // 打开确认dialog
    suredialog(formName) {
      // 验证表单填写情况
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.dialogVisible = true;
        } else {
          return false;
        }
      });
    },
    // 正式向后台发送添加的数据
  async  confirmAdd() {
      let data = {
          name: this.ruleForm.name,
          deadline: this.ruleForm.deadline,
          content: this.ruleForm.content,
        }
      const {data:res} = await this.$http.post('create',data)
      
        if (res.status === 200) {
          this.drawer = false;
          setTimeout(() => {
            this.dialogVisible = false;
          }, 200);
          this.open1();
          this.handleCurrentChange(this.momentPage);
          this.clearObj(this.ruleForm);
        } else {
          this.open2();
        }
    },
    // 点击重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields();
      this.drawer = false;
    },
    // 修改时间格式
    timeFormate(value) {
      let day = value.getDate();
      let mouth = value.getMonth() + 1;
      let year = value.getFullYear();
      return year + "-" + mouth + "-" + day;
    },
    // 通知成功
    open1(message) {
      this.$notify({
        title: "成功",
        message: message,
        type: "success",
      });
    },
    //  通知错误
    open2() {
      this.$notify.error({
        title: "错误",
        message: "任务添加失败",
      });
    },
    // 请求不同页数数据
    handleCurrentChange(val) {
      this.momentPage = val;
      this.getData(undefined, val);
    },

    // 删除数据
    detele(id) {
      let content = "此操作将永久删除该任务, 是否继续?";
      this.open(content, "delete", id);
    },
    // 确认弹窗的复用
    open(content, way, id) {
     let confirmResult = this.$confirm(`${content}`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })

      confirmResult.then(async () => {
        const {data:res} = await this.$http.get('/',{params:{way,id}})

            if (res.status == 200) {
              this.$message({
                type: "success",
                message: res.message,
              });
              this.handleCurrentChange(this.momentPage);
            } else {
              this.$message.error("操作失败");
            }
         
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消操作",
          });
        });
    },
    // 获取选中的label值
    change() {
      // console.log(this.radio);
    },
    // 根据状态查询列表
    statusComfirm() {
      this.getData(this.radio, undefined);
    },
    // 重置状态为默认状态，即全部
    Statusreset() {
      this.radio = "-1";
      this.getData(this.radio, undefined);
    },
    // 状态修改
    Statuschange(id) {
    const confirmResult =  this.$confirm("此操作将修改该任务状态为完成, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
      confirmResult.then( async ()=>{
        let data = {
              id: id,
              status: 2,
            }
        const {data:res} = await this.$http.post('update_status',data)
            if (res.status === 200) {
              this.open1(res.message);
              this.handleCurrentChange(this.momentPage);
            } else {
              this.$message.error("任务状态修改失败");
            }
      }).catch(() => {
          this.$message({
            type: "info",
            message: "已取消修改",
          });
        });
    },
    // 数据更新
    sureEdit(formName) {
      // 验证表单填写情况
      this.$refs[formName].validate((valid) => {
        if (valid) {
          let newForm = {};
          Object.assign(newForm, this.ruleForm);
          // newForm.deadline = this.timeFormate(newForm.deadline);
          // newForm.id = this.editId;
        const confirmResult =  this.$confirm("确认修改所选任务吗？", "提示", {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          })

          confirmResult.then(async () => {
            let data = {
                name: newForm.name,
                deadline: newForm.deadline,
                content: newForm.content,
                id: newForm.id,
              }
            const {data:res} = await this.$http.post('update',data)
            
            if (res.status == 200) {
              this.open1(res.message);
              this.handleCurrentChange(this.momentPage);
              this.drawer = false;
            } else {
              this.$message.error("操作失败");
            }
          });
          
        } else {
          alert("mistake");
          return false;
        }
      });
    },
    // 重置表单
    resetFormDate(formName) {
      this.$refs[formName].resetFields();
    },
    // 清空对象
    clearObj(value) {
      for (const key in value) {
        delete value[key];
      }
    },
    // 监听侧边栏关闭事件
    close() {
      this.clearObj(this.ruleForm);
    },
  },
};
</script>

<style lang="less">
body {
  margin: 0;
}
#app {
  font-family: "Microsoft YaHei";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 40px;
}
.el-col {
  margin-top: 10px;
}
.navigation {
  position: relative;
  top: -30px;
  color: #5698c3;
  cursor: pointer;
}
.headline {
  font-size: 18px;
  font-weight: 600;
}
.el-divider--horizontal {
  margin: 0 0 40px 0;
}
.newadd {
  margin-bottom: 30px;
  padding: 5px 15px;
}
.statusnewadd {
  padding: 5px 15px;
}
.el-divider__text.is-center {
  font-size: large;
}
.el-table {
  margin: 0 auto;
}
th {
  background: #f5f7fa !important;
}
el-button {
  border: none;
  outline: none;
  margin-right: 10px;
}
.control-btn {
  padding: 5px 10px;
}
.el-dropdown {
  display: flex;
  justify-content: flex-end;
}
.filter img {
  height: 30px;
  width: 30px;
}
.el-drawer__header {
  margin-bottom: 20px;
  /deep/ span {
    font-weight: bolder !important;
    outline: none;
    color: #000;
    font-size: 20px;
  }
}
.el-form-item__label {
  width: 140px !important;
  margin-left: 40px;
  color: #000;
  font-weight: bold;
}
.el-form-item__content {
  margin: 0 53px !important;
}
.el-dialog__close {
  display: none;
}
.liner {
  margin-bottom: 10px !important;
}
.btn-box {
  display: flex;
  justify-content: space-between;
  margin-top: 50px;
}
.btn-box .el-button {
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.el-dropdown-menu {
  width: 150px;
  transform: translateX(20%);
}
.dialog_liner {
  margin: 0;
}
.dialog_btn {
  display: flex;
  justify-content: space-evenly;
}
.el-radio {
  width: 100%;
  transform: translateX(25%);
}
// 组件进入
.slide-fade-enter-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
// 组件离开
.slide-fade-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active for below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
::-webkit-scrollbar {
  //隐藏滚动条
  display: none;
}
</style>
