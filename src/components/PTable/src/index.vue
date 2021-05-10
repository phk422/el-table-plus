<template>
  <el-table
    ref="PTable"
    :data="data"
    v-bind="$attrs"
    :span-method="objectSpanMethod"
    v-on="$listeners"
  >
    <slot />
    <el-table-column v-if="dynamicColumnSetting" :width="Number(iconWidth)">
      <template slot="header">
        <el-popover
          placement="bottom"
          min-width="80"
          trigger="click"
          popper-class="col-setting-popover"
        >
          <el-button
            slot="reference"
            size="small"
            type="text"
            icon="el-icon-setting"
            style="padding:0;"
          />
          <div class="col-setting-title">{{ title }}</div>
          <el-checkbox-group v-model="visibleIndexs" :min="1" class="col-setting-group">
            <el-checkbox
              v-for="colInfo in columnInfos"
              v-show="!colInfo.disabled || showAlwaysShowColumnInCheckbox"
              :key="colInfo.index"
              :label="colInfo.index"
              :disabled="colInfo.disabled"
            >{{ colInfo.label }}</el-checkbox>
          </el-checkbox-group>
        </el-popover>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
import getSpanObj from './utils'
export default {
  name: 'PTable',
  props: {
    // 是否开启动态列设置
    dynamicColumnSetting: Boolean,
    // 列可见性，初始需要设置全true。列下标从 0 开始
    columnVisibles: {
      type: Array,
      default: () => []
    },
    // 初始隐藏的列的下标。列下标从 0 开始
    hidenColumnIndexs: {
      type: Array,
      default: () => []
    },
    // 总是显示的列的下标（不可隐藏的列）。列下标从 0 开始
    alwaysShowColumnIndexs: {
      type: Array,
      default: () => []
    },
    // 总是显示的列是否在checkbox中显示
    showAlwaysShowColumnInCheckbox: {
      type: Boolean,
      default: true
    },
    // 设置列宽度
    iconWidth: {
      type: [Number, String],
      default: 40
    },
    // 字段筛选标题
    title: {
      type: String,
      default: '显示字段筛选'
    },
    // 表格数据
    data: {
      type: Array,
      require: true,
      default: () => []
    },
    // 是否开启相同列的合并
    enableMergeable: Boolean,
    // 需要合并的列: 默认全部
    mergeableColumns: {
      type: Array,
      default: () => []
    },
    // 从第几行开始合并
    startRowIndex: {
      type: [Number, String],
      default: 0
    }
  },
  data() {
    return {
      columnInfos: [], // 所有列的信息
      visibleIndexs: [], // 可见列的下标集合
      spanObj: [] // 相同数据字段记录
    }
  },
  watch: {
    visibleIndexs(newValue, oldValue) {
      let willHideIndexs = []
      let willShowIndexs = []
      willShowIndexs = newValue.filter(index => {
        return oldValue.indexOf(index) === -1
      })
      willHideIndexs = oldValue.filter(index => {
        return newValue.indexOf(index) === -1
      })
      this.oprColumns(willShowIndexs, true)
      this.oprColumns(willHideIndexs, false)
    },
    data: {
      handler(newVal, oldVal) {
        this.data = newVal
        this.getSpanObj()
      },
      deep: true
    }
  },
  created() {
    this.getSpanObj()
  },
  mounted() {
    if (this.dynamicColumnSetting && this.$refs.PTable.$slots.default) {
      let index = 0
      this.$refs.PTable.$slots.default.forEach(columnIns => {
        if (!columnIns.componentOptions) return
        const props = columnIns.componentOptions.propsData
        if (
          props.label === undefined &&
          props.type !== 'selection' &&
          props.type !== 'index'
        ) return
        // 保存所有列的信息
        const label =
            props.type === 'selection'
              ? '多选框'
              : props.type === 'index'
                ? '索引'
                : props.label
        // 默认多选框和索引不可隐藏
        const disabled = !!(props.type === 'selection' || props.type === 'index')
        this.columnInfos.push({
          label: label,
          index: index,
          disabled: disabled
        })
        // 记录初始展示的列的下标
        if (this.hidenColumnIndexs.indexOf(index) === -1) {
          this.visibleIndexs.push(index)
        }
        index++
      })
      // 处理总是显示的列（不可隐藏的列）
      this.alwaysShowColumnIndexs.forEach(index => {
        this.columnInfos[index].disabled = true
      })
      // 处理初始隐藏的列
      this.oprColumns(this.hidenColumnIndexs, false)
    }
  },
  beforeUpdate() {
    this.$nextTick(() => {
      this.$refs.PTable.doLayout()
    })
  },
  methods: {
    getSpanObj() {
      // 动态渲染 请渲染数剧结束后在执行此方法
      if (this.enableMergeable) {
        this.spanObj = getSpanObj(this.data, this.mergeableColumns)
      }
    },
    oprColumns(indexs, isShow) {
      indexs.forEach(index => {
        this.$set(this.columnVisibles, index, isShow)
      })
    },
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (this.enableMergeable) {
        // 列合并
        if (rowIndex >= Number(this.startRowIndex)) {
          const rowspan = this.spanObj[column.property] ? this.spanObj[column.property][rowIndex] : 1
          const colspan = rowspan > 0 ? 1 : 0
          return { rowspan, colspan }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.col-setting-popover {
  min-width: 100px;
  padding: 9px 16px;
  .col-setting-title {
    color: #7f8b93;
    font-size: 12px;
  }
  .col-setting-group {
    .el-checkbox {
      display: block;
      margin-top: 5px;
    }
  }
}
</style>
