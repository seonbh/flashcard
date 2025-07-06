<template>
  <UCard :ui="{ body: 'h-full flex flex-col items-start gap-3' }">
    <div class="flex-1 space-y-2">
      <UInput
        v-model="card.front"
        class="w-full"
        placeholder="카드 앞면 내용"
        :disabled="disabled"
        maxlength="50"
      />
      <UTextarea
        v-model="card.back"
        class="w-full"
        placeholder="카드 뒷면 내용"
        :disabled="disabled"
        :rows="2"
        autoresize
        maxlength="100"
      />
    </div>
    <UButton
      block
      color="neutral"
      label="삭제"
      variant="outline"
      :disabled="disabled || !canDelete"
      @click="$emit('remove')"
    />
  </UCard>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean;
  canDelete?: boolean;
}>();

defineEmits<{
  remove: [];
}>();

const card = defineModel<{ front: string; back: string }>({ required: true });
</script>
