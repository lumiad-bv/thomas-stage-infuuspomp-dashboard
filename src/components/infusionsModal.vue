<script setup>
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { useInfusionsForPdfStore } from '@/stores/infusionsForPdfStore.js'
import InfusionPrintButtons from '@/components/infusionPrintButtons.vue'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Toggle } from 'radix-vue'

// Setup PDF store and fonts
const infusionStore = useInfusionsForPdfStore()
pdfMake.vfs = pdfFonts.default.vfs

// Reactive state for displayed infusions and UI controls
const displayedInfusions = ref([])
const selectedSortKey = ref('')
const isReverseOrder = ref(false)

/**
 * Returns a new array of infusions sorted by the given key or custom comparator.
 */
function getSortedInfusions(infusionArray, sortKey) {
  const cloneArray = infusionArray.slice()

  // Helper: sort pumps within a stack
  function sortPumpStacks(pumps, key, compareFn = null) {
    return pumps.slice().sort((a, b) => (compareFn ? compareFn(a, b) : a[key] > b[key] ? 1 : -1))
  }

  // Calculate the remaining percentage for sort by remainingMl
  function calculateRemainingPercentage(infusion) {
    return parseFloat(((infusion.remainingMl / infusion.totalMl) * 100).toFixed(1))
  }

  // Parse "HH:MM" into total seconds
  function parseTimeToSeconds(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number)
    return hours * 3600 + minutes * 60
  }

  // Normalize time or use large default for non-running infusions
  function calculateTimeRemainingSeconds(infusion) {
    const raw =
      infusion.timeRemaining === 'Infusion not running' ? '9999:59' : infusion.timeRemaining
    const normalized = raw.length < 5 ? `0${raw}` : raw
    return parseTimeToSeconds(normalized)
  }

  // First, sort nested pump stacks if present
  const withSortedPumps = cloneArray.map((item) => {
    if (item.pumps) {
      const comparator =
        sortKey === 'remainingMl'
          ? (a, b) => calculateRemainingPercentage(a) - calculateRemainingPercentage(b)
          : sortKey === 'time'
            ? (a, b) => calculateTimeRemainingSeconds(a) - calculateTimeRemainingSeconds(b)
            : null
      return { ...item, pumps: sortPumpStacks(item.pumps, sortKey, comparator) }
    }
    return item
  })

  // Separate regular infusions and stacks
  const regularInfusions = withSortedPumps.filter((item) => !item.pumps)
  const pumpStackInfusions = withSortedPumps.filter((item) => item.pumps)

  // Sort regular infusions by key or comparator
  let sortedRegularInfusions
  switch (sortKey) {
    case 'remainingMl':
      sortedRegularInfusions = regularInfusions
        .slice()
        .sort((a, b) => calculateRemainingPercentage(a) - calculateRemainingPercentage(b))
      break
    case 'time':
      sortedRegularInfusions = regularInfusions
        .slice()
        .sort((a, b) => calculateTimeRemainingSeconds(a) - calculateTimeRemainingSeconds(b))
      break
    default:
      sortedRegularInfusions = regularInfusions
        .slice()
        .sort((a, b) => (a[sortKey] > b[sortKey] ? 1 : -1))
  }

  return [...sortedRegularInfusions, ...pumpStackInfusions]
}

/**
 * Refreshes the displayedInfusions by pulling from the store,
 * then applying sorting and reverse order if enabled.
 */
function refreshDisplayedInfusions() {
  let baseList = infusionStore.getInfusions.slice()
  if (selectedSortKey.value) {
    baseList = getSortedInfusions(baseList, selectedSortKey.value)
  }
  if (isReverseOrder.value) {
    baseList = baseList.slice().reverse()
  }
  displayedInfusions.value = baseList
}

// Initial load
refreshDisplayedInfusions()

// React to changes: store data, sort key, or reverse toggle
watch(() => infusionStore.getInfusions, refreshDisplayedInfusions, { deep: true })
watch(selectedSortKey, refreshDisplayedInfusions)
watch(isReverseOrder, refreshDisplayedInfusions)

const emit = defineEmits(['close'])
function closeModal() {
  emit('close')
}
function printInfusionDetails() {
  const infusionDoc = {
    content: []
  };

  // --- Header image + title ---
  infusionDoc.content.push({
    alignment: 'right',
    image: 'data:image/png;base64,…', // your existing base64
    width: 150
  });
  infusionDoc.content.push({
    text: 'Here are the requested infusion details',
    fontSize: 18,
    margin: [0, 0, 0, 10]
  });

  // Mapping of attribute keys → human labels + how to read value
  const attributeConfig = {
    id:                    { label: 'ID',                  get: i => i.id },
    department:            { label: 'Department',          get: i => i.department },
    floor:                 { label: 'Floor',               get: i => i.floor },
    ward:                  { label: 'Ward',                get: i => i.ward },
    bed:                   { label: 'Bed',                 get: i => i.bed },
    drug:                  { label: 'Drug',                get: i => i.drug },
    totalMl:               { label: 'Total ml',            get: i => i.totalMl },
    remainingMl:           { label: 'Remaining ml',        get: i => i.remainingMl },
    mlPerHour:             { label: 'ml per hour',         get: i => i.mlPerHour },
    time:                  { label: 'Time remaining',      get: i => i.timeRemaining },
    timeRunning:           { label: 'Time running',        get: i => i.timeRunning },
    softwareVersion:       { label: 'Software Version',    get: i => i.softwareVersion },
    medicalLibraryVersion: { label: 'Medical Library Version', get: i => i.medicalLibraryVersion }
  };

  // For each infusion...
  for (const infusion of displayedInfusions.value) {
    // 1) Decide which keys to include
    const keys = (selectedAttributes.value.length > 0
        ? selectedAttributes.value
        : Object.keys(attributeConfig)
    );

    // 2) Build array of { label, value }
    const defs = keys.map(key => {
      const cfg = attributeConfig[key];
      return {
        label: cfg.label + ':',
        value: String(cfg.get(infusion) ?? '')
      };
    });

    // 3) Push a stack of two-column rows
    infusionDoc.content.push({
      margin: [0, 5, 0, 15], // spacing around each infusion block
      stack: defs.map(def => ({
        columns: [
          {
            width: 100,
            text: def.label,
            bold: true
          },
          {
            width: '*',
            text: def.value
          }
        ],
        columnGap: 10
      }))
    });
  }

  // 4) Download PDF
  const timestamp = Date.now();
  pdfMake.createPdf(infusionDoc).download(`${timestamp}_infusion_details.pdf`);
}

// radio button attributes adn functions
const attributes = [
  { value: 'department', label: 'Department' },
  { value: 'floor', label: 'Floor' },
  { value: 'ward', label: 'Ward' },
  { value: 'bed', label: 'Bed' },
  { value: 'drug', label: 'Drug' },
  { value: 'totalMl', label: 'Total ml' },
  { value: 'remainingMl', label: 'Remaining ml' },
  { value: 'timeRemaining', label: 'Time remaining' },
  { value: 'id', label: 'ID' },
  { value: 'softwareVersion', label: 'Software Version' },
  { value: 'medicalLibraryVersion', label: 'Medical Library Version' },
]

const selectedAttributes = ref([])
</script>

<template>
  <div class="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
    <div
      class="bg-white shadow-2xl overflow-x-auto flex flex-col max-w-3xl w-full rounded-md h-[90vh]"
    >
      <!-- Header -->
      <header
        class="flex justify-between items-center px-4 py-3 border-b border-gray-200 text-blue-600 font-semibold"
      >
        <slot name="header">{{ infusionStore.getAmountOfPDF }} infusions selected</slot>
        <button
          type="button"
          @click="closeModal"
          class="text-blue-600 font-bold text-xl p-2 hover:text-blue-800 transition cursor-pointer"
        >
          ×
        </button>
      </header>

      <!-- Infusion items -->
      <div
        class="4xl:m-2 md:m-1 m-1 4xl:h-[80vh] xl:h-[70vh] md:h-[70.2vh] h-[71.3vh] border-1 border-b-gray-600 overflow-auto"
      >
        <div
          v-for="item in displayedInfusions"
          :key="item.id || item.id_stack_number"
          class="mb-2 px-4"
        >
          <InfusionPrintButtons
            v-if="!item.pumps"
            :department="item.department"
            :floor="item.floor"
            :ward="item.ward"
            :bed="item.bed"
            :drug="item.drug"
            :totalMl="item.totalMl"
            :remainingMl="item.remainingMl"
            :mlPerHour="item.mlPerHour"
            :time-running="item.timeRunning"
            :timeRemaining="item.timeRemaining"
            :id="item.id"
            :softwareVersion="item.softwareVersion"
            :medicalLibraryVersion="item.medicalLibraryVersion"
          />
        </div>
      </div>

      <!-- Body slot -->
      <section class="px-4 py-5 text-gray-700 grid grid-cols-14">
        <slot name="body" class="">
          Sort by
          <select
            v-model="selectedSortKey"
            class="border border-gray-300 rounded px-2 py-1 col-span-11"
          >
            <option value="department">Department</option>
            <option value="floor">Floor</option>
            <option value="ward">Ward</option>
            <option value="bed">Bed</option>
            <option value="drug">Drug</option>
            <option value="totalMl">Total ml</option>
            <option value="remainingMl">Remaining ml</option>
            <option value="timeRemaining">Time remaining</option>
            <option value="id">ID</option>
            <option value="softwareVersion">Software Version</option>
            <option value="medicalLibraryVersion">Medical Library Version</option>
          </select>
          <div class="col-span-1"></div>
          <Toggle
            v-model:pressed="isReverseOrder"
            aria-label="Toggle reverse order"
            class="hover:bg-gray-200 col-span-1 text-black data-[state=on]:bg-blue-500 data-[state=on]:text-white flex items-center justify-center rounded bg-gray-50 border border-gray-300"
          >
            <Icon icon="radix-icons:caret-sort" class="color-black" />
          </Toggle>

          <fieldset class="p-1 bg-white rounded-lg shadow-sm col-span-12">
            <legend class="mb-1">Choose attributes</legend>
            <div class="grid grid-cols-2 auto-cols-auto grid-flow-row gap-x-3">
              <label v-for="opt in attributes" :key="opt.value" class="flex items-center space-x-2">
                <input
                  type="checkbox"
                  v-model="selectedAttributes"
                  :value="opt.value"
                  class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-400"
                />
                <span class="text-gray-800">{{ opt.label }}</span>
              </label>
            </div>
          </fieldset>
        </slot>
      </section>

      <!-- Footer -->
      <footer class="flex flex-col gap-2 px-4 py-4 border-t border-gray-200">
        <slot name="footer"></slot>

        <button
          type="button"
          class="text-white bg-blue-600 border border-blue-600 rounded px-4 py-2 hover:bg-blue-500 transition cursor-pointer"
          @click="printInfusionDetails"
        >
          Print Infusion Details
        </button>

        <button
          type="button"
          class="text-white bg-[#ec1010] border border-[#ec1010] rounded px-4 py-2 hover:bg-red-500 transition cursor-pointer"
          @click="closeModal"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
