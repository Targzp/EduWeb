<script lang="tsx" setup>
import type { RoleId } from '@vben/types';

import type { MenuAccessRole } from '#/types';

import { computed, ref, watch } from 'vue';

import {
  ElButton,
  ElCheckbox,
  ElDialog,
  ElMessage,
  ElTable,
  ElTableColumn,
} from 'element-plus';

import { getRoleAccessListApi, updateRoleAccessApi } from '#/api/core/roles';
import { formatTableCell } from '#/utils';

import { SysRoleCodes } from './role-codes';

const props = defineProps<{
  roleId?: RoleId;
  visible: boolean;
}>();

const emit = defineEmits(['update:visible', 'submitSuccess']);

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emit('update:visible', val);
  },
});

const roleAccessCodes = ref<string[]>([]);

const getRoleAccessCodes = async (roleId: RoleId) => {
  try {
    const res = await getRoleAccessListApi(roleId);
    if (res) {
      roleAccessCodes.value = res;
    }
  } catch (error) {
    console.error('获取角色功能权限失败:', error);
  }
};

/**
 * 设置已勾选的功能权限
 */
const setCheckedRoleAccessCodes = (roleCodes: MenuAccessRole[]) => {
  roleCodes.forEach((item) => {
    if (item.accessCodes.length > 0) {
      item.accessCodes.forEach((accessCodeItem) => {
        if (roleAccessCodes.value.includes(accessCodeItem.actionCode)) {
          accessCodeItem.check = true;
        }
      });
    }
    if (item.children && item.children.length > 0) {
      setCheckedRoleAccessCodes(item.children);
    }
  });
};

watch(dialogVisible, async (val) => {
  if (val) {
    await getRoleAccessCodes(props.roleId!);
    setCheckedRoleAccessCodes(tableData.value);
  }
});

/**
 * 格式化可勾选功能权限
 */
const formatCheckableRoleCodes = (roleCodes: MenuAccessRole[]) => {
  roleCodes.forEach((item) => {
    if (item.accessCodes.length > 0) {
      item.accessCodes.forEach((accessCodeItem) => {
        accessCodeItem.check = false;
      });
    }
    if (item.children && item.children.length > 0) {
      formatCheckableRoleCodes(item.children);
    }
  });
  return roleCodes;
};

const tableData = ref<MenuAccessRole[]>(formatCheckableRoleCodes(SysRoleCodes));

const loading = ref(false);

/**
 * 提取勾选的功能权限
 */
const handleExtractAccessCode = (
  menuRoleCode: MenuAccessRole[],
  codes: string[],
) => {
  menuRoleCode.forEach((item) => {
    if (item.accessCodes.length > 0) {
      item.accessCodes.forEach((accessCodeItem) => {
        if (accessCodeItem.check) {
          codes.push(accessCodeItem.actionCode);
        }
      });
    }
    if (item.children && item.children.length > 0) {
      handleExtractAccessCode(item.children, codes);
    }
  });
};

const handleConfirm = async () => {
  try {
    loading.value = true;
    const accessCodes: string[] = [];
    handleExtractAccessCode(tableData.value, accessCodes);
    const params = {
      roleId: props.roleId!,
      codes: accessCodes,
    };
    const res = await updateRoleAccessApi(params);
    if (res) {
      ElMessage({
        message: '更新功能权限成功',
        type: 'success',
      });
      dialogVisible.value = false;
      emit('submitSuccess');
    }
  } catch (error) {
    console.error('更改功能权限失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  tableData.value = formatCheckableRoleCodes(SysRoleCodes);
};
</script>

<template>
  <ElDialog
    v-model="dialogVisible"
    width="800"
    title="功能权限"
    :show-close="false"
    :draggable="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    @close="handleClose"
  >
    <div class="px-5">
      <ElTable
        :data="tableData"
        row-key="id"
        border
        header-cell-class-name="tableHeader"
        default-expand-all
      >
        <ElTableColumn prop="menuName" label="菜单" width="150" />
        <ElTableColumn prop="accessCodes" label="功能权限">
          <template #default="{ row }">
            <tempalte v-if="row.accessCodes.length > 0">
              <ElCheckbox
                v-for="codeItem in row.accessCodes"
                :key="codeItem.actionCode"
                v-model="codeItem.check"
                :label="codeItem.actionName"
              />
            </tempalte>
            <span v-else>{{
              formatTableCell(null, null, row.accessCodes)
            }}</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <template #footer>
      <ElButton @click="dialogVisible = false">取消</ElButton>
      <ElButton type="primary" :loading="loading" @click="handleConfirm">
        确认
      </ElButton>
    </template>
  </ElDialog>
</template>
