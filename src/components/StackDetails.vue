<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PumpStackInfusions from '@/assets/generated_data_with_pumpstacks.json'
const pumpStack = ref(null)
const allInfusions = PumpStackInfusions
const route = useRoute() // Get the current route to access the params

function findStackById(id) {
  console.log('function activated with id:', id)
  for (const item of allInfusions) {
    console.log(item)
    if (item.id_stack_number === id) pumpStack.value = item
  }

  return null // Not found
}

// Watch for changes in the route's infusionId parameter
watch(
  () => route.params.stackId,
  (newId) => {
    findStackById(newId)
  },
)

// Initial fetch when component is mounted
onMounted(() => {
  const id = route.params.stackId
  findStackById(id)
})
</script>

<template>
  <div class="grid grid-cols-1 static">
    <div class="xl:col-span-3 grid grid-cols-1 gap-2" v-if="pumpStack">
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">id_stack_number</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ pumpStack.id_stack_number }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">softwareVersion</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ pumpStack.softwareVersion }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-full m-1 p-1">medicalLibraryVersion</div>
        <div class="bg-gray-300 rounded-full m-1 p-1">{{ pumpStack.medicalLibraryVersion }}</div>
      </div>
    </div>
  </div>
</template>
