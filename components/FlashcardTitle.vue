<template>
  <div class="space-y-4 px-4">
    <UFormField label="플래시카드 제목" name="title" required>
      <UInput
        v-model="title"
        placeholder="플래시카드 제목을 입력하세요"
        :disabled="disabled"
        class="w-full"
        maxlength="20"
      />
    </UFormField>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
}>();

const title = defineModel<string>({ required: true });
</script>