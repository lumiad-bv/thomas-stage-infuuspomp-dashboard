<script setup>
import { RouterView } from 'vue-router'
// import AllInfusions from '@/assets/generated_data_unique_with_time.json'
import PumpStackInfusions from '@/assets/generated_data_with_pumpstacks.json'
import { provide, ref, watch, computed, onMounted } from 'vue'
import { ToggleGroupItem, ToggleGroupRoot, Toggle } from 'radix-vue'
import InfusionButtons from '@/components/InfusionButtons.vue'
import { Icon } from '@iconify/vue'
import { selectedButtoneStore } from '@/stores/selectedButtonStore.js'
import StackButtons from '@/components/StackButtons.vue'

// a test to see if pdfmake works in this application
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'

// ✅ Correct way to access vfs
pdfMake.vfs = pdfFonts.default.vfs

function downloadPdf() {
  const docDefinition = {
    content: [
      { text: 'Hello PDFMake in Vue!', fontSize: 18 },
      { text: 'It works now ✅' }
    ]
  }

  pdfMake.createPdf(docDefinition).download('example.pdf')
}


const currentInfusions = ref([]) // ✅ ref makes it reactive

const amountOfInfusions = computed(() =>
  currentInfusions.value.reduce((total, item) => {
    if (Array.isArray(item.pumps)) {
      return total + item.pumps.length
    } else {
      return total + 1
    }
  }, 0),
)

const amountOfInfusionsWithStacks = computed(() => {
  return currentInfusions.value.filter((infusion) => infusion.pumps && infusion.pumps.length > 0)
    .length
})
function updateInfusions(newInfusions) {
  currentInfusions.value = newInfusions // ✅ assign to .value!
}
updateInfusions(PumpStackInfusions)

const options = [
  'All departments',
  'main floor',
  '1st floor',
  '2nd floor',
  '3rd floor',
  '4th floor',
  '5th floor',
  'Intensive care',
  'Child day treatment',
  'Neonatology',
  'Obstetric Suites',
  'Ophthalmology',
  'ENT (Ear, Nose, Throat)',
  'Mamma Clinic',
  'Gynaecology',
  'Couplet Care',
  'Logopedics',
  'Palliative Care',
  'Gastroenterology',
  'Urology',
  'Orthopaedics',
  'Cardiology',
  'Rehabilitation Medicine',
  'Infectious Disease Prevention',
  'Allergology',
  'Palliative Care',
  'Surgery',
  'Jaw Surgery',
  'Haematology',
  'Rheumatology',
  'Geriatrics',
  'Radiology',
  'Pathology',
  'Pulmonology',
  'Neurology',
  'Neurosurgery',
  'Anaesthesiology',
]
const afdeling = defineModel('afdeling')
provide('afdeling', afdeling)
onMounted(() => {
  // Set the first default value from the list
  afdeling.value = options[0]
  selectedButtoneStore.currentDepartment = 'All departments'
  selectedButtoneStore.currentFloor = 'overview'
})
const sortChoice = ref(null)
// a save location for the previous sorting choice to permit sorting in reverse

// Functions to filter infusions based on afdeling (department)
function filterWithPumpstacks(afdeling) {
  const result = []

  const isFloor = [
    'main floor',
    '1st floor',
    '2nd floor',
    '3rd floor',
    '4th floor',
    '5th floor',
  ].includes(afdeling)

  for (const item of PumpStackInfusions) {
    // Regular infusions
    if (!item.pumps) {
      const match = isFloor
        ? afdeling === 'main floor'
          ? item.floor?.substring(0, 4) === afdeling.substring(0, 4)
          : item.floor?.substring(0, 3) === afdeling.substring(0, 3)
        : item.department === afdeling

      if (match) {
        result.push(item)
      }
    }

    // Pumpstacks
    if (Array.isArray(item.pumps)) {
      const filteredPumps = item.pumps.filter((pump) => {
        return isFloor
          ? afdeling === 'main floor'
            ? pump.floor?.substring(0, 4) === afdeling.substring(0, 4)
            : pump.floor?.substring(0, 3) === afdeling.substring(0, 3)
          : pump.department === afdeling
      })

      if (filteredPumps.length > 0) {
        result.push({
          id_stack_number: item.id_stack_number,
          pumps: filteredPumps,
        })
      }
    }
  }

  return result
}

function filterAllInfusionsNoMap(afdeling) {
  selectedButtoneStore.currentDepartment = afdeling
  updateInfusions(filterWithPumpstacks(afdeling))
}

function returnToAllInfusions() {
  updateInfusions(PumpStackInfusions)
  selectedButtoneStore.currentDepartment = 'All departments'
  selectedButtoneStore.currentFloor = 'overview'
}

// Watchers to handle changes in afdeling and selectedButtoneStore
watch(selectedButtoneStore.currentDepartment, (newAfdeling) => {
  if (newAfdeling === 'All departments') {
    returnToAllInfusions()
    return
  }
  filterAllInfusionsNoMap(newAfdeling)
})

watch(afdeling, (newAfdeling) => {
  if (newAfdeling === 'All departments') {
    returnToAllInfusions()

    return
  }
  filterAllInfusionsNoMap(newAfdeling)
  excecuteFilters()
})

// Function to filter current infusions with stack support
function filterCurrentInfusionsWithStackSupport(predicateFn) {
  const result = []

  for (const item of currentInfusions.value) {
    if (Array.isArray(item.pumps)) {
      const filteredPumps = item.pumps.filter(predicateFn)
      if (filteredPumps.length > 0) {
        result.push({
          id_stack_number: item.id_stack_number,
          pumps: filteredPumps,
        })
      }
    } else {
      if (predicateFn(item)) {
        result.push(item)
      }
    }
  }

  return result
}

//filter functions of the current 3 buttons
function FilterNonRun() {
  updateInfusions(
    filterCurrentInfusionsWithStackSupport(
      (infusion) => infusion.timeRemaining === 'Infusion not running',
    ),
  )

  if (currentInfusions.value.length === 0) {
    console.warn('No non-running infusions found.')
  }
}

function FilterBelow10() {
  updateInfusions(
    filterCurrentInfusionsWithStackSupport(
      (infusion) => infusion.totalMl / infusion.remainingMl > 10,
    ),
  )
}

function FilterLessThenHour() {
  updateInfusions(
    filterCurrentInfusionsWithStackSupport((infusion) => {
      if (infusion.timeRemaining === 'Infusion not running') return false
      const [hours] = infusion.timeRemaining.split(':')
      return Number(hours) < 1
    }),
  )
}

function FilterStacksOnly() {
  updateInfusions(
    currentInfusions.value.filter((infusion) => infusion.pumps && infusion.pumps.length > 0),
  )
  if (currentInfusions.value.length === 0) {
    console.warn('No pump stacks found.')
  }
}

function FilterNoStacks() {
  updateInfusions(
    currentInfusions.value.filter((infusion) => !infusion.pumps),
  )
  if (currentInfusions.value.length === 0) {
    console.warn('No pump stacks found.')
  }
}

//function to execute the filters based on the toggle state
function excecuteFilters() {
  toggleStateMultiple.value.forEach(filterIt)
}
function filterIt(value) {
  switch (true) {
    case value === 'nonRun':
      FilterNonRun()
      return
    case value === 'below10':
      FilterBelow10()
      return
    case value === '1hour':
      FilterLessThenHour()
      return
    case value === 'stacks':
      FilterStacksOnly()
      return
    case value === 'nostacks':
      FilterNoStacks()
      return
    case value === 'reset':
      if (afdeling.value === 'All departments') {
        returnToAllInfusions()
      } else {
        filterAllInfusionsNoMap(afdeling.value)
      }
  }
}

//function to calculate the percentage of remaining IV fluid
function calculatePercentage(infusion) {
  return parseFloat(((infusion.remainingMl / infusion.totalMl) * 100).toFixed(1))
}

//function to show remaining time of infusion
function timeToSeconds(time) {
  // Ensure the time has a valid format like HH:SS
  const [hours, seconds] = time.split(':').map(Number)

  // Calculate the total time in minutes (convert to seconds if needed)
  return hours * 60 + seconds // Convert to total minutes (HH treated as minutes)
}

function sortInfusions(newSortChoice) {
  function sortPumpsArray(pumps, key, customSortFn = null) {
    return pumps.slice().sort((a, b) => {
      if (customSortFn) return customSortFn(a, b)
      return a[key] > b[key] ? 1 : -1
    })
  }

  function calculateTimeValue(infusion) {
    const time =
      infusion.timeRemaining === 'Infusion not running' ? '9999:59' : infusion.timeRemaining
    const normalized = time.length < 5 ? `0${time}` : time
    return timeToSeconds(normalized)
  }

  function sortInfusionsBy(key, compareFn = null) {
    updateInfusions(
      currentInfusions.value.map((item) => {
        if (item.pumps) {
          return {
            ...item,
            pumps: sortPumpsArray(item.pumps, key, compareFn),
          }
        } else {
          return item
        }
      }),
    )

    const regulars = currentInfusions.value.filter((i) => !i.pumps)
    const stacks = currentInfusions.value.filter((i) => i.pumps)

    const sortedRegulars = compareFn
      ? regulars.slice().sort(compareFn)
      : regulars.slice().sort((a, b) => (a[key] > b[key] ? 1 : -1))

    updateInfusions([...sortedRegulars, ...stacks])
    if (toggleState.value === true) reverse()
  }

  switch (newSortChoice) {
    case 'remainingMl':
      sortInfusionsBy(null, (a, b) => calculatePercentage(a) - calculatePercentage(b))
      return

    case 'time':
      sortInfusionsBy(null, (a, b) => calculateTimeValue(a) - calculateTimeValue(b))
      return

    case 'department':
      sortInfusionsBy('department')
      return

    case 'bed':
      sortInfusionsBy('bed')
      return

    case 'drug':
      sortInfusionsBy('drug')
      return
  }
}

watch(sortChoice, (newSortChoice) => {
  sortInfusions(newSortChoice)
})

const toggleStateMultiple = ref(['reset'])
const toggleState = ref(false)

watch(toggleState, () => {
  reverse()
})

watch(toggleStateMultiple, (newToggleStateMultiple) => {
  excecuteFilters(newToggleStateMultiple)
})

function reverse() {
  updateInfusions(currentInfusions.value.reverse())
}
const toggleGroupItemClasses =
  'hover:bg-gray-200  data-[state=on]:bg-blue-500 data-[state=on]:text-white  flex h-[35px] xl:w-[20vw] md:w-[35vw] w-[30vw] items-center justify-center bg-white text-base leading-4 first:rounded-l last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none dark:bg-gray-300  dark:border-gray-600 dark:hover:bg-gray-400 dark:data-[state=on]:bg-gray-400 '


</script>

<template>
  <body class="bg-white dark:bg-black">
    <header class="md:flex h-[8vh] bg-blue-500 p-6 md:overflow-hidden">
      <img
        src="./assets/LumiadLogo.svg"
        alt="logo"
        class="md:mr-[69vw] md:h-[2vw] md:visible invisible"
      />
      <h1
        class="text-white font-script font-bold text-bold text-4xl left-[46vw] md:top-4 absolute md:mr-[28vw] mr-[4vw] md:visible invisible h-[3vw]"
      >
        {{ afdeling }} , {{ amountOfInfusions }} infusions,
        {{ amountOfInfusionsWithStacks }} Pumpstacks
      </h1>
      <select
        v-model="afdeling"
        class="md:flex md:static absolute top-3 left-18 w-[70vw] md:w-full md:h-[4vh] bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
      >
        <option
          v-for="(option, index) in options"
          :value="option"
          :key="index"
          v-bind:selected="index === 0"
        >
          {{ option }}
        </option>
      </select>
    </header>
    <section class="md:flex 4xl:h-[88.9vh] md:h-[85vh] dark:bg-black">
      <div
        class="w-[100vw] h-[90vh] m-3 xl:static bg-gray-200 dark:bg-gray-500 md:rounded-[1vw] rounded-[3vw] p-2 overflow-x-hidden"
      >
        <div>
          <ToggleGroupRoot v-model="toggleStateMultiple" type="multiple" class="flex">
            <ToggleGroupItem value="nonRun" :class="toggleGroupItemClasses">
              Non-running
            </ToggleGroupItem>
            <ToggleGroupItem value="below10" :class="toggleGroupItemClasses">
              Below 10%
            </ToggleGroupItem>
            <ToggleGroupItem value="1hour" :class="toggleGroupItemClasses">
              Less then 1 hour
            </ToggleGroupItem>
            <ToggleGroupItem value="stacks" :class="toggleGroupItemClasses">
              Pumpstacks only
            </ToggleGroupItem>
            <ToggleGroupItem value="nostacks" :class="toggleGroupItemClasses">
              No pumpstacks
            </ToggleGroupItem>
          </ToggleGroupRoot>
        </div>
        <div class="grid grid-cols-8">
          <select
            v-model="sortChoice"
            class="hover:bg-gray-200 w-[78vw] col-span-7 xl:w-full bg-gray-50 border border-gray-300  text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
          >
            <option selected disabled>Sort by</option>
            <option value="remainingMl">remaining %IV</option>
            <option value="time">Remaining time</option>
            <option value="department">Department</option>
            <option value="bed">bed</option>
            <option value="drug">Drug</option>
          </select>
          <Toggle
            v-model:pressed="toggleState"
            aria-label="Toggle italic"
            class="hover:bg-gray-200 text-black data-[state=on]:bg-blue-500 data-[state=on]:text-white flex items-center justify-center rounded bg-gray-50 border border-gray-300"
          >
            <Icon icon="radix-icons:caret-sort" class="color-black" />
          </Toggle>
        </div>

        <div
          class="4xl:m-3 md:m-1 m-2 4xl:h-[80vh] xl:h-[70vh] md:h-[70.2vh] h-[71.3vh] overflow-auto "
        >
          <div v-for="item in currentInfusions" :key="item.id || item.id_stack_number" class="mb-2">
            <!-- Regular infusion -->
            <InfusionButtons
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

            <!-- Stacked infusions -->

              <StackButtons
                v-else
              :id_stack_number="item.id_stack_number"
              :medical-library-version="item.medicalLibraryVersion"
              :software-version="item.softwareVersion"
              :pumps="item.pumps"
              />

            </div>

        </div>
      </div>

      <div
        class="xl:m-3 xl:static h-[90vh] 4XL:w-[100vw] xl:w-[100vw] flex-initial rounded-[3vw] bg-white dark:bg-gray-500"
      >
        <div
          id="infuusDetails"
          class="bg-gray-200 xl:static h-[65vh] flex-initial overflow-hidden rounded-[1vw] p-5 font-[Open_Sans] text-2xl text-ellipsis [&::-webkit-scrollbar]:[width:10px] [&::-webkit-scrollbar]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-400"
        >
          <RouterView />
        </div>
        <div class="bg-gray-200 static flex-initial p-5 mt-2 h-[24vh] rounded-[1vw]">
          <button class=" flex justify-center items-center bg-blue-400 cursor-pointer hover:bg-blue-500 hover:text-white rounded-2xl w-44 h-44" @click="downloadPdf">Download PDF</button>
        </div>
      </div>
    </section>
  </body>
</template>

<style scoped></style>
