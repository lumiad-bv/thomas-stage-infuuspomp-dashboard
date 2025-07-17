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
    if (item.id_stack_number === id) pumpStack.value = item
    console.log(pumpStack.value)
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
        <div class="bg-blue-500 text-white rounded-md m-1 p-1">id_stack_number</div>
        <div class="bg-gray-300 rounded-md m-1 p-1">{{ pumpStack.id_stack_number }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-md m-1 p-1">softwareVersion</div>
        <div class="bg-gray-300 rounded-md m-1 p-1">{{ pumpStack.softwareVersion }}</div>
      </div>
      <div class="text-center grid grid-cols-2 relative">
        <div class="bg-blue-500 text-white rounded-md m-1 p-1">medicalLibraryVersion</div>
        <div class="bg-gray-300 rounded-md m-1 p-1">{{ pumpStack.medicalLibraryVersion }}</div>
      </div>
      <div class="text-center grid grid-cols-1 relative">
        <div class="bg-blue-500 text-white rounded-md m-1 p-1">Drugs in pumpstack</div>
        <div class="bg-gray-300 rounded-md m-1 p-1">
          <table
            class="w-full text-sm text-left rtl:text-right text-black dark:text-white"
            v-if="pumpStack.pumps && pumpStack.pumps.length"
          >
            <thead
              class="text-xs text-white uppercase bg-blue-500 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th class="border border-gray-800 px-4 py-2">Pump id</th>
                <th class="border border-gray-800 px-4 py-2">Drug</th>
                <th class="border border-gray-800 px-4 py-2">Amount left</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="infusion in pumpStack.pumps" :key="infusion.id">
                <td class="border border-gray-800 px-4 py-2">{{ infusion.id }}</td>
                <td class="border border-gray-800 px-4 py-2">{{ infusion.drug }}</td>
                <td class="border border-gray-800 px-4 py-2">{{ infusion.remainingMl }} ml</td>
              </tr>
            </tbody>
          </table>
          <div v-else>No infusions found.</div>
        </div>
      </div>
    </div>
  </div>
</template>
