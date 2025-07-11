<script setup>
import axios from 'axios'
import { RouterView, useRoute } from 'vue-router'
// import AllInfusions from '@/assets/generated_data_unique_with_time.json'
import PumpStackInfusions from '@/assets/generated_data_with_pumpstacks.json'
import { provide, ref, watch, computed, onMounted } from 'vue'
import { ToggleGroupItem, ToggleGroupRoot, Toggle } from 'radix-vue'
import InfusionButtons from '@/components/InfusionButtons.vue'
import { Icon } from '@iconify/vue'
import { useSelectedButtonStore } from '@/stores/selectedButtonStore'
const selectedButtoneStore = useSelectedButtonStore()
import { useInfusionsForPdfStore } from '@/stores/infusionsForPdfStore'
const pdfStore = useInfusionsForPdfStore()
import StackButtons from '@/components/StackButtons.vue'
const route = useRoute()
// a test to see if pdfmake works in this application
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
const inBasket = ref(false)
// ✅ Correct way to access vfs
pdfMake.vfs = pdfFonts.default.vfs
const currentSelectedInfusion = ref(null)

import infusionsModal from '@/components/infusionsModal.vue'

const isModalVisible = ref(false)

function showModal() {
  isModalVisible.value = true
}

function closeModal() {
  isModalVisible.value = false
}
watch(
  () => pdfStore.infusions, // this is reactive
  (newInfusions) => {
    console.log('infusion added to basket')
    const isSelectedInBasket = newInfusions.some(
      (infusion) => infusion.id === selectedButtoneStore.getPressedButtonId,
    )
    if (isSelectedInBasket) {
      inBasket.value = true
    }
  },
  { deep: true }, // ensures it tracks changes inside the array
)

watch(
  () => route.params.infusionId,
  (newId) => {
    console.log('watch activated with id:', newId)
    findInfusionById(newId)
    if (pdfStore.containsId(newId)) {
      console.log(newId, ' already in download list')
      inBasket.value = true
    } else {
      inBasket.value = false
    }
  },
)
function findInfusionById(id) {
  for (const item of PumpStackInfusions) {
    // Regular infusion
    if (item.id === id) currentSelectedInfusion.value = item

    // Pumpstack
    if (Array.isArray(item.pumps)) {
      const found = item.pumps.find((pump) => pump.id === id)
      if (found) currentSelectedInfusion.value = found
    }
  }

  return null // Not found
}

function downloadPdf() {
  const infusionDoc = {
    content: [],
  }
  infusionDoc.content.push({
    alignment: 'right',
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAGICAYAAABfgNrqAAAACXBIWXMAAAsTAAALEwEAmpwYAAALrGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuNTY2ZWJjNSwgMjAyMi8wNS8wOS0wNzoyMjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTEyLTA5VDEyOjAzOjQ4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTA2LTIxVDE2OjM0OjIyKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wNi0yMVQxNjozNDoyMiswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDc1NGNjZjMtYjEzYS03NTRiLTg1N2QtZDdmZjMwZWI4NDYyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YTdjZjYxZGYtZmFkNS0wYTQ3LWJiZjAtMzdkOWM5YjZhNjZkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ODk5NDllM2QtMTcyZS00OWRhLTk4MWMtNzM5ZTg2ZDdmYjA3IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSIxIiBleGlmOlBpeGVsWERpbWVuc2lvbj0iNTYwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMzkyIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OTk0OWUzZC0xNzJlLTQ5ZGEtOTgxYy03MzllODZkN2ZiMDciIHN0RXZ0OndoZW49IjIwMjEtMTItMDlUMTI6MDM6NDgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1MDgyZWI0NC1lMGU0LTRmMjItOGM3My0zYTIyMGNmMTg5NWQiIHN0RXZ0OndoZW49IjIwMjEtMTItMDlUMTI6MTk6MjgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNjI1YzQ3Yi0zZmYyLThlNDYtYmY5OS0zZmVkYmJjZmRiZDgiIHN0RXZ0OndoZW49IjIwMjItMDYtMjFUMTY6MzQ6MjIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy40IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDc1NGNjZjMtYjEzYS03NTRiLTg1N2QtZDdmZjMwZWI4NDYyIiBzdEV2dDp3aGVuPSIyMDIyLTA2LTIxVDE2OjM0OjIyKzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjMuNCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI2MjVjNDdiLTNmZjItOGU0Ni1iZjk5LTNmZWRiYmNmZGJkOCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmI1NzRjMDJhLTcxZDUtOWM0Ny05MWU3LTJlYjFhNjYxYmNmYSIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjg5OTQ5ZTNkLTE3MmUtNDlkYS05ODFjLTczOWU4NmQ3ZmIwNyIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5j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',
    width: 150,
  })
  infusionDoc.content.push({ text: 'Lumiad-Arcomed', style: 'anotherStyle' })
  infusionDoc.content.push({ text: 'Here are the requested infusion details', fontSize: 18 })
  for (const item of pdfStore.getInfusions) {
    console.log(item)
    infusionDoc.content.push({
      layout: 'lightHorizontalLines',
      margin: [20, 10, 20, 10],
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          ['Field', 'Value'], // Header row

          ['Department:', item.department],
          ['Floor:', item.floor],
          ['Ward:', item.ward],
          ['Bed:', item.bed],
          ['Drug:', item.drug],
          ['Total ml:', item.totalMl],
          ['Remaining ml:', item.remainingMl],
          ['ml per hour:', item.mlPerHour],
          ['Time running:', item.timeRunning],
          ['Time remaining:', item.timeRemaining],
          ['ID:', item.id],
          ['Software Version:', item.softwareVersion],
          ['Medical Library Version:', item.medicalLibraryVersion],
        ],
      },
    })
  }
  let title = Date.now()
  pdfMake.createPdf(infusionDoc).download(`${title}_infusion_details.pdf`)
}

function addToDownloadList() {
  console.log(currentSelectedInfusion.value.id, 'added to download list')
  pdfStore.addInfusion(currentSelectedInfusion.value)
  findInfusionById(currentSelectedInfusion.value.id)
  inBasket.value = true
}

function removeFromDownloadList() {
  console.log(currentSelectedInfusion.value.id, 'removed from download list')
  pdfStore.removeInfusion(currentSelectedInfusion.value)
  findInfusionById(currentSelectedInfusion.value.id)
  inBasket.value = false
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
  selectedButtoneStore.setCurrentDepartment('All departments')
  selectedButtoneStore.setCurrentFloor('overview')
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
  selectedButtoneStore.setCurrentDepartment(afdeling)
  updateInfusions(filterWithPumpstacks(afdeling))
}

function returnToAllInfusions() {
  updateInfusions(PumpStackInfusions)
  selectedButtoneStore.setCurrentDepartment('All departments')
  selectedButtoneStore.setCurrentFloor('overview')
}

// Watchers to handle changes in afdeling and selectedButtoneStore
watch(selectedButtoneStore.getCurrentDepartment, (newAfdeling) => {
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
  updateInfusions(currentInfusions.value.filter((infusion) => !infusion.pumps))
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
  'hover:bg-gray-200  data-[state=on]:bg-blue-500 data-[state=on]:text-white  flex h-[35px] xl:w-[20vw] md:w-[35vw] w-[30vw] items-center justify-center bg-white text-base leading-4 first:rounded-l  last:rounded-r focus:z-10 focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none dark:bg-gray-300 border-1 border-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:data-[state=on]:bg-gray-400 '



const axiosInfusionPumps = ref([])

const fetchInfusionPumps = async () => {
  try {
    const res = await axios.get('/api/infusionpumps')
    axiosInfusionPumps.value = res.data
    console.log(res.data)
  } catch (error) {
    console.error('Fout bij ophalen infusionpumps:', error)
  }
}

onMounted(() => {
  fetchInfusionPumps()
})
console.log(axiosInfusionPumps)
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
        class="text-white font-script font-bold text-bold text-4xl left-[23vw] md:top-8 w-[40vw] absolute md:mr-[24vw] mr-[4vw] md:visible invisible h-[3vw]"
      >
        {{ afdeling }}
      </h1>
      <h1
        class="text-white font-script font-bold text-bold text-4xl left-[43vw] md:top-8 w-[40vw] absolute md:mr-[24vw] mr-[4vw] md:visible invisible h-[3vw]"
      >
        {{ amountOfInfusions }} infusions, {{ amountOfInfusionsWithStacks }} Pumpstacks
      </h1>
      <select
        v-model="afdeling"
        class="md:flex md:static absolute top-3 left-18 w-[70vw] md:w-full md:h-[5vh] bg-gray-50 border border-gray-300 hover:bg-gray-100 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

      <div
        class="bg-green-600 hover:bg-green-400 w-[20vw] h-[5vh] mr-2 ml-2 items-center justify-center rounded-2xl flex text-white cursor-pointer"
        @click="showModal"
      >
        {{ pdfStore.getAmountOfPDF }}
      </div>
      <button
        class="flex justify-center items-center w-[20vw] h-[5vh] bg-red-700 cursor-pointer hover:bg-red-500 text-white rounded-2xl"
        @click="downloadPdf"
      >
        to PDF
      </button>
    </header>

    <infusionsModal v-show="isModalVisible" @close="closeModal" />
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
            class="hover:bg-gray-200 w-[78vw] col-span-7 xl:w-full bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-300 dark:border-gray-600 dark:hover:bg-gray-400 dark:placeholder-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500"
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
          class="4xl:m-3 md:m-1 m-2 4xl:h-[80vh] xl:h-[70vh] md:h-[70.2vh] h-[71.3vh] overflow-auto"
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

      </div>
    </section>
  </body>
</template>

<style scoped></style>
