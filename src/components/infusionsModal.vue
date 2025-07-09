<script setup>
import pdfMake from 'pdfmake/build/pdfmake'
import * as pdfFonts from 'pdfmake/build/vfs_fonts'
import { useInfusionsForPdfStore } from '@/stores/infusionsForPdfStore.js'
import InfusionPrintButtons from '@/components/icons/infusionPrintButtons.vue'
import { ref, watch } from 'vue'
import { Icon } from '@iconify/vue'
import { Toggle } from 'radix-vue'

const infusionsForPdfStore = useInfusionsForPdfStore()
const infusions = infusionsForPdfStore.getInfusions
const emit = defineEmits(['close'])
pdfMake.vfs = pdfFonts.default.vfs
const currentInfusions = ref([])
function close() {
  emit('close')
}
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
function updateInfusions(newInfusions) {
  currentInfusions.value = newInfusions // ✅ assign to .value!
}
updateInfusions(infusions)
function reverse() {
  updateInfusions(currentInfusions.value.reverse())
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
    case 'floor':
      sortInfusionsBy('floor')
      return
    case 'ward':
      sortInfusionsBy('ward')
      return
    case 'bed':
      sortInfusionsBy('bed')
      return

    case 'drug':
      sortInfusionsBy('drug')
      return
    case 'totalMl':
      sortInfusionsBy('totalMl')
      return
    case 'id':
      sortInfusionsBy('id')
      return
    case 'medicalLibraryVersion':
      sortInfusionsBy('medicalLibraryVersion')
      return

    case 'softwareVersion':
      sortInfusionsBy('softwareVersion')
      return


  }
}

function print() {
  const infusionDoc = {
    content: [],
  }
  infusionDoc.content.push({
    alignment: 'right',
    image:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAjAAAAGICAYAAABfgNrqAAAACXBIWXMAAAsTAAALEwEAmpwYAAALrGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNy4yLWMwMDAgNzkuNTY2ZWJjNSwgMjAyMi8wNS8wOS0wNzoyMjoyOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIzLjAgKE1hY2ludG9zaCkiIHhtcDpDcmVhdGVEYXRlPSIyMDIxLTEyLTA5VDEyOjAzOjQ4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDIyLTA2LTIxVDE2OjM0OjIyKzAyOjAwIiB4bXA6TW9kaWZ5RGF0ZT0iMjAyMi0wNi0yMVQxNjozNDoyMiswMjowMCIgZGM6Zm9ybWF0PSJpbWFnZS9wbmciIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6MDc1NGNjZjMtYjEzYS03NTRiLTg1N2QtZDdmZjMwZWI4NDYyIiB4bXBNTTpEb2N1bWVudElEPSJhZG9iZTpkb2NpZDpwaG90b3Nob3A6YTdjZjYxZGYtZmFkNS0wYTQ3LWJiZjAtMzdkOWM5YjZhNjZkIiB4bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ9InhtcC5kaWQ6ODk5NDllM2QtMTcyZS00OWRhLTk4MWMtNzM5ZTg2ZDdmYjA3IiBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIiB0aWZmOk9yaWVudGF0aW9uPSIxIiB0aWZmOlhSZXNvbHV0aW9uPSI3MjAwMDAvMTAwMDAiIHRpZmY6WVJlc29sdXRpb249IjcyMDAwMC8xMDAwMCIgdGlmZjpSZXNvbHV0aW9uVW5pdD0iMiIgZXhpZjpDb2xvclNwYWNlPSIxIiBleGlmOlBpeGVsWERpbWVuc2lvbj0iNTYwIiBleGlmOlBpeGVsWURpbWVuc2lvbj0iMzkyIj4gPHhtcE1NOkhpc3Rvcnk+IDxyZGY6U2VxPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY3JlYXRlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo4OTk0OWUzZC0xNzJlLTQ5ZGEtOTgxYy03MzllODZkN2ZiMDciIHN0RXZ0OndoZW49IjIwMjEtMTItMDlUMTI6MDM6NDgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDo1MDgyZWI0NC1lMGU0LTRmMjItOGM3My0zYTIyMGNmMTg5NWQiIHN0RXZ0OndoZW49IjIwMjEtMTItMDlUMTI6MTk6MjgrMDE6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy4wIChNYWNpbnRvc2gpIiBzdEV2dDpjaGFuZ2VkPSIvIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJzYXZlZCIgc3RFdnQ6aW5zdGFuY2VJRD0ieG1wLmlpZDoyNjI1YzQ3Yi0zZmYyLThlNDYtYmY5OS0zZmVkYmJjZmRiZDgiIHN0RXZ0OndoZW49IjIwMjItMDYtMjFUMTY6MzQ6MjIrMDI6MDAiIHN0RXZ0OnNvZnR3YXJlQWdlbnQ9IkFkb2JlIFBob3Rvc2hvcCAyMy40IChXaW5kb3dzKSIgc3RFdnQ6Y2hhbmdlZD0iLyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0iY29udmVydGVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJmcm9tIGFwcGxpY2F0aW9uL3ZuZC5hZG9iZS5waG90b3Nob3AgdG8gaW1hZ2UvcG5nIi8+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJkZXJpdmVkIiBzdEV2dDpwYXJhbWV0ZXJzPSJjb252ZXJ0ZWQgZnJvbSBhcHBsaWNhdGlvbi92bmQuYWRvYmUucGhvdG9zaG9wIHRvIGltYWdlL3BuZyIvPiA8cmRmOmxpIHN0RXZ0OmFjdGlvbj0ic2F2ZWQiIHN0RXZ0Omluc3RhbmNlSUQ9InhtcC5paWQ6MDc1NGNjZjMtYjEzYS03NTRiLTg1N2QtZDdmZjMwZWI4NDYyIiBzdEV2dDp3aGVuPSIyMDIyLTA2LTIxVDE2OjM0OjIyKzAyOjAwIiBzdEV2dDpzb2Z0d2FyZUFnZW50PSJBZG9iZSBQaG90b3Nob3AgMjMuNCAoV2luZG93cykiIHN0RXZ0OmNoYW5nZWQ9Ii8iLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjI2MjVjNDdiLTNmZjItOGU0Ni1iZjk5LTNmZWRiYmNmZGJkOCIgc3RSZWY6ZG9jdW1lbnRJRD0iYWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOmI1NzRjMDJhLTcxZDUtOWM0Ny05MWU3LTJlYjFhNjYxYmNmYSIgc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPSJ4bXAuZGlkOjg5OTQ5ZTNkLTE3MmUtNDlkYS05ODFjLTczOWU4NmQ3ZmIwNyIvPiA8cGhvdG9zaG9wOkRvY3VtZW50QW5jZXN0b3JzPiA8cmRmOkJhZz4gPHJkZjpsaT5hZG9iZTpkb2NpZDpwaG90b3Nob3A6M2U2OWViNWItZDlhNS0wMTRhLTg3ZmQtY2RkYTM2MDE5YTQzPC9yZGY6bGk+IDxyZGY6bGk+YWRvYmU6ZG9jaWQ6cGhvdG9zaG9wOjk5MGY5NjBhLWYzZTgtMTg0MS05YWFhLTk5YTgwNjJmZjEwZjwvcmRmOmxpPiA8cmRmOmxpPmFkb2JlOmRvY2lkOnBob3Rvc2hvcDplN2UxYzBlMi0yYTVjLWUxNGMtOTY3Ny04OTIwNmIzNzA1MzQ8L3JkZjpsaT4gPC9yZGY6QmFnPiA8L3Bob3Rvc2hvcDpEb2N1bWVudEFuY2VzdG9ycz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7jsKdSAAAbQElEQVR4nO3dT3Ibx7Yn4OOOO394K7jwCi40QQdHLq0A1IhDUyuQtAJLKxC1AtFDjUyuwPAIHZwYXoHxVtDoFagHlbRoWn8AVBYKB/i+CIYdNivzEASrfsjKrPzu48ePAQCQyf8augAAgG0JMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkI4AAwCkI8AAAOkIMABAOgIMAJCOAAMApCPAAADpCDAAQDoCDACQjgADAKQjwAAA6QgwAEA6AgwAkM/Hjx97+9rVdLZo6v2EAHzOdLYYTWeL8dB1cLz6zBj/GvqHK2FlEhH/Kf+clP/13SAFARypR+fbJiLGEfEmIl4PVBLsbK8B5ithBYCKprPFJP5+vm2Gqwbq6zXATGeLy4j4IYQVgF5NZ4vzaM+z9+fc0XDVQP/6HoH5MaR+gH34ZegCYJ+sQgIA0hl8Ei8cozLfq4l2OP+h3yJieXd7drPnkgCOigADFZV5CG+jXd3xOU35vlVEvBJkAHbjFhJUMp0t3kY7D2G8wbePI+KX6Wzxvs+aAI6VAAMVTGeLlxHxcodDL6ezxeuqxQCcAAEGOprOFqOI+KlDEz95GirAdgQY6O4yuj9z40X3MgBOhwAD3T1eabSLSYU2AE6GAAPdjSq00VRoA+BkCDAAQDoCDByG9dAFAGQiwEB3qwptLCu0AXAyBBjo7vZA2gA4GQIMdFS2A1h2aGIdEdcVSgE4GQIM1PE8dp/H8vzu9mzXYwFOkgADFdzdni0j4mlsF2LW0YaXm/oVARw3AQYqKSHm+9jsdtB1RDy5uz3b5HsBeORfQxcAx6TcCno+nS1eRftwusmjb1lGxNwtI4BuBBjoQQkoN+ULgMrcQgIA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDS8STeEzSdLSYRMY5/Pub+3jIiVmVvn72ZzhajaGuaRMToC982j4i4uz2b918RXzOdLZov/T+/ny/70uvmNaOWZn4xik9bmfwn2vPpJP55Xl1Gu6nsMiL+iIj5vPmw6r3ASr77+PFjb43/7/P/82u0L+LW7m7Pvtu13wcXwl2s933hjuhcc0QbOFZfafs8Imbln9u4iYjbiLjpY/+e6WxxHm1dTbShahvLaAPNb0Pv6DydLcaxff33vvi7G1r5uZpof7Yfyj/HWzSxjk8nyT/Kvy8P9eetqXxQaKK9gIxj83PhPCJWUV6vTYPNdLbY9WT+5u727PWOx3IgSmg5j4gfY8frbrGK9rz/87z5sOxWVUSfGeNYR2AmEfHrjsfOI+JptUo2N4nda46IeBMRrx/+hxJcXkbEi/jyiMa3nJevt9PZ4l1EXHUNMg/q+jF2v+hHfBqteTmdLdbR7vD8bqCL42VE/LTjsf/43Q2phMofov29jzs2N4pPJ9PzB32sog0zt9Fubrnq2M9BeBDIz2P3v7nmUZvraM9LvX2QIK9mfjGO9txzWanJcbTn55fN/GIebZC5rtR2VccaYE7edLZ4Ge2belSpyVFp78V0tnhzd3t2dSB13RtF+aObzhbXEfHKiX5zZaTlMrqHyk2Ny9d56X8ZET9He4Fe7aH/akogv4z2g8K4hy5G8emDxPvpbHETET8PPerIsMqIy9uoF1w+201ENM384kVEvJo3H+Y99rU1AebIlJNpn2/qUbSjMbOIeLZpSCgXyF+i222yTV1GxHmXoHUqyu+l5qe3XU3K19tMF+jpbPE6uo1w7uI82vf3KtrQ13lUlFya+cV5RLyP/b3vJhHxazO/uImI5/Pmw3pP/X6VVUhHpISXX2M/F6MmIn4v9/m/qgyr/x77CS/3RtFeDN+X14UHprPFqFx8f4/hw8tj5xHxy3S2+HM6W1wOXMtnTWeLZjpb/Bn9jCZualz6/7P8Ljlyzfxi1Mwv3kf7YXA0QAnnEfF7M7+YDND3Pwgwx+O/og0vkz32OY6IX78WYsoFaKg/toj24vyrEPNJWQXzewx78d3EONpbJgcVZKazxdto/9bGA5dybxS7z78iiTLXZV8fUL9mHG2IGboOAeaIvIz9hpd7o/hCQCgXnfd7rudzJiHERMRftzwO6eK7iXG0Qeb3ry3d7lsZtfo92r812Jsy4rHvUexveT90iBFgqGEUj1ZQldtGhxBe7k2i2yqv1MrF933k/qQ+iTaIvt13GC2jjH/GYV1AOAElvPwahzlaOmiIEWCoZVKG1u8nhh5SeLn3V42nZM9zo/bhZbTzr5p9dFbCy6FeQDhiZaXRPifr7mKwECPAUNPLclE55D+4l2V06CQ8CC+TYSupbhztaMzrPjsRXk5PmSjbPPiaDFjOvlZudvV2iNfJMmpqG3LC7qbeTmeL+YksPc1yAtzVT9PZ4j93t2fPajf8IPyNarfN4XjwBNv7J4KPPvM9EZ+e/F3lCbUb1PU6uj1Rd59GEfFLM794ss8l1kZgqG00dAEbGMcJTMQsc16aoevYg/Oe2hVejlgzvxiXJcn/N9pR4/P4+u97EuX2ZTO/+LPP2yZlNCPbfLVx7LlmIzCnYx4Rv8WnfWnuTSLi3/Fp46+hrKOt8Y/yz3vj8jWLuvW9mM4WR/sAsLIC7HIPXa3K12OTSHzxL3OlJj13s4727/Gh0R76PXnN/OJldHuMwDjauR8/Rvtgt1WVwj7JOlfvZTO/2MsIVYQAc+zWEfGt/Yvm9/8y0FNZ1xHxKr69x8vryvWNSjtXFdo6KOV16usEeBNtEJ5vsunpg00um2g3NWziwINNmcf1soemV/Fpc9Tl197v5XWbRLsnVRNCTRUPJsWe12oy2hGZ5/Pmw02VBtuRnaZGWwN5G3vaT1CAOV7LaB/1v9r0gPK9z8umjb9E/88KuY4t9ix6UN/PUWeuzYs4wgAT9SdRr+PbQfizyu9sFX8PyufRfcPDPtVeQTePdsfn+aYHPHjdbiL+tlfVvrct6E0JE5NH/3nZ1xyK0l8fE9pH0c7/eF5p08Nst44ea5r5RbOPfZMEmON0fXd79nzXg+9uz5bT2eJJ9Lt65dWu+xTd3Z7Np7PF0+g+R2E8nS0mm4wkZFHCQVOxyTdRea+dssfRzXS2eBXdd0uvqqxqGldqbhXt+/yma0Ml0LyOdiTyMtqL3Lhru/tWQsRltJuGTr7wPcuIeNfDDsh9T2h/38wvVl0u3M38oomEv9fPeBF/nwrQC5N4j8+yS3i5Vy5YT+Pv82Vqueq6yWIJHTWGKX+s0MYhqXXraBURT+5uz173NU/o7vZsfXd79joivo8DGAkrq45eVGruJtrX76ZSe3+5uz27jogn0YbLNMoGhH9G+x6dfOVbJ9GGgT9rLc1t5hdvYz+3ZX4pj/zfVa3339DOO74OGxFgjss6IqotJy0Xrs5h6JH53e3ZqxoNlRDT9STedK/kMJRP5uMKTS2jvfguK7T1TSXIvIrhQ8zLqDMSdH13e7bxTu27eBD+nsQ/JwIfnLIkeNvbvuOosOdOGdV42aWNLYxix1uQD5ZzH4vzvjsQYI7Lu23mvGyifIKcV2yyaiAqJ/FVhyYmR7RHUo1758uIeDrQ6qz/N0CfEVF19KXT7dttPRiJvN5Xn9t6sOJnV12f9LrvOSVNCU3bOq9cx9BmfXcgwByXq57a/blSO9e1A1bRtb5JjSKGVFbOjDs2s47hwsvQzqP76Mt8n+HlXhmN2Xu/mygX8hq3Nd/uckui9N9U6H9bu4SmH6pXMaym7w4EmONx3eOF56ZSO33ds7/qeHxToYah1ZjL0+ttjwPXdfRlHRVv3x6RWiu6RrFbKBhqjluzQ+Ca9FDHoHYcidqYAHM8/qevhstFbd6xmWVPoy816vt3nUqGUW5/XHZs5mqbZb7H5MEzV7p4fsLh77PKpN1xxSYvdwgF5xX739a2fU96qGFoTZ+NCzBs6reOx9e6DfUlXeob1ypiIOcdj19HshUtlZ13PH7ex2qjI9DHHIjzTb+xfPof9VDDpjb++fseqRjQf/XZuADDppYDH/8t8w7HjivVMJSu987fnfjoQdcL7SmHv69pemhzm9/VpIf+tzF0/4dg0mfjAgybWnc5eA+3J1Ydjh1XqmEoTcfjryrUkFnT4djlqd5628B44DZHPfS/jW36H/dUw1ETYNjUaqBjN9LX/JpD92CvoV31Ofn74JXVW128q1EHGxsPXUBPxkMXkJEAw0Y6BoQux25jvad+Dsmk4/G3NYpIrOl4/E2FGtjceugCOBwCDMdkOXQBA5h0Odjk0/hPh2O/tYM69S2HLqAn66ELyEiAgdy6XIDntYpIbNTh2D9qFXGk5j20ueyhzUOwHLqAjAQYyG3U4diuS+OPQdPh2HmlGo5VH7cnt2lz3kP/2xi6/0Ow6rNxAQZym3Q4dlmphlO1HLqAA3cddW+NrObNh/kW37+s2Pcutul/m+/NpLcHrEYIMJDdqMOx60o11NLldtjWygquXa3Nf/m6efNhHXVXaW2131Pp/6Zi/9vaeLSo1LrqrZLhLPtsXICB07UcuoBHRnvub9zh2GWlGqqosBy8F/Pmw+uocyvlesvRl3tDrbLbdrQo4sDeU5XM+2xcgIETZQSBPXkW3S7O1/Pmw067bc+bD9cxzMjGLk9nPrY5acsystQbAQY4FOOhC0hsNHQBX1IuYk+jnROzratdw8sD+97qYVWC07ZuKtcxtHnfHQgwwKEYD11AYpOhC/iaefNhXYLI09jswnYTEU/mzYdXFfq+3rDPWnYdLVrFcd1G6nsD3/hX3x0AfMt0tpgMXUNye50AvasyL2TezC/G0e4s/e/4FL5+i/Z2z7xczGt6FhG/R/8h+c2Oc3XuvYuI95VqGdJy3nxY9t2JAAMcgvHQBSQ3HrqAbZSAcrXH/tbN/OJZRPwa/d1uuy6Tlnc2bz5cN/OLt3HAtwQ3tJc9wtxC+qfR0AXAPnRcRlzbZN8dHssu0tPZYhQHfgvpEJQRgafRz6TeGnN17mXfIHTXOUBbE2D+aTJ0AbCFVYdjx5VqqOGHoQvYUjN0AQ80QxeQRQkxT6LehNl1RDyrMVfngavI/UyYvU2aPtYAsxq6ANiTVYdjx5VqqKEZqN/1rgeWkY9DkC38DapMKH4W7byYVYemriPi+3nz4aZCWX8pq7ZqBqJ9mu9r9CXiSAPM3e3ZaugaYE/WHY49iImf09nifMDulx2OnVSqoavzoQvIaN58uJk3H76PNsjcxGZ/S8toRxi+nzcfnvf1nJMSim76aLtH69hxBdauTOL9jOlsMfKQL5L4I3a/gE3qldHJbMC+1x2ObWLgDfvK6q3xkDVk9zAsNPOLSbR/F+PH3xZ7eDDbI8+/UMuhetXD6rGvOuYAs47dJ+ROYv8npsme++M4LDsc2wwd1sttmPOh+o9uAfAQRrBeDF3AMSlzZJYDlxERe1s5Vcv1Pm8d3TvKW0jFcugCtvTj0AWQ0rLj8U2FGro4j2FPzvMOx54POQ/mAMIfPSuB6tDnw+y81UNXxxxgumj22VlZzjrZZ58chzLfa92hiaGD808D97/sePx5hRp29TIO/5M5HZWRjUECwgYGCy8Rxx1gumyMte+h4cs998dxuelw7PlQz4OZzhaXMfD9/XL7bNmhiUECYPmduX10IkqIeRbdPqzUNmh4iTjuALPqcOykUg3fVIaBnYjoousutnsfBSnv+6FHX+7NOxzbTGeLplId2ziGp7WyhTLZuK8H8W3r1dDhJUKA+ZLxHvdmeRlORHRz0/H4ywFGYX6Kw1ldkSoAlmXn5/vsk8Pw4EF81wOVsIqIp/Pmw9VA/f/N0QaYCo8J731o2DAwNZTbIDcdm9nbBnLlAvxyX/19y93t2U10XE49nS1eVinmG8oHq2PY7I8dPdrZe7XHrt9Eu0P4fI99ftXRBphi3uHYy0o1fM37MPpCHbcdj2+ms0XvF8YDvgDfdDz+p75Hbcttt1/COYNod/YuD+J7Hv0GmetoH9z3es/PwfmmYw8wXYaGR9PZ4nWtQh4rF4umr/Y5LXe3Z9fRfYLfZZlY24tygT/UZ1p03UBvFBG/9hViymjtr3E4t904EPPmw/WjJwrXsIx2+fZ/lycOryq1W9WxB5ibjse/6OOEVMLLZe12OXk1drF938dITAlGhxpe4u72bBndH145ih5CTJkk/Ht41AJfUbZGeBYR/x1tmLmKzd/Ty2hHWl5FO9ryZN58uDq0EZfHjvlJvHF3e7aczhbr2P2kOYr2hP60xtNKyxDw2xBe6MdVtHOqRh3buSwX4Vdd55KV9/z7yDHp9E10HxUdRcTv09niTURcdTlvPFip9bJjTZyQEjpu4tEH+GZ+0Xzm21eHOrqyiaMOMMV1dDsBTCLiz+ls8azLybx8inobPkXRk7vbs/V0tngXdVbFTKIdTZhHxLsy0XVj5ZbHZdQJVHtxd3s2Lz9vU6G5nyLix/L7uN4myGR87Th8hzT5tpZTCDDvovsnmFG0J/PraE/my00PLCsuXoT5LuzHVbQr6MaV2muineC7jvYT3R/RDjevH/4dlBGbUfn+WeQN6jVGYe6No/3Q8nY6W9xE+9rN43hfO9irow8wd7dnq4qfqi6jHV5fRXsi+p8oJ/MH3zOK9gT0n9LnqEK/sJEyCvM82vkmNY3i0a3P6WxRuYvhlVGYq6h/2+a8fP0UcZyvHezb0QeYouanqoj2k9Vlxfagmh4vwn2bx2GMVL6JNmyMhy1jK/M4jNcO9ubYVyFFxF8PtZsPXAbs05vItSP7VXR/Im4VZb7K4I9J38I6ctULVZxEgCmex2FthAW9KRfhQ9v87UtW0Qaug1E+9GQJBa/KruRwUk4mwJQ/8IM6ST6yHLoAjkt5zz+Nww4x64h4VuMxBbWVhwNeD1zGt1yXOuHknEyAiYi4uz27isM8IS2jfYAQVFVWuxxyiHm+zaq+fbu7PXseh3nOiGjDS5ZRIqjupAJMxF8npOXQdTywjPYCA70oAeFJHNb7PqINLzdDF/Et5ZxxaKO3wgsn7+QCTPE06u0Z0cUyIqo85Re+5sHtpOthK4mIT7eNrgeuY2N3t2ev43DmFF0JL3CiAebu9mx9d3t2v1fEUG5CeGGPyvv+eQx7IV5F+76/Gaj/nZWan8RwKxrX0QY/t5shTjTA3CsngqfR71bkj62jXTVwkBMXOX7lQvx9tLdF1nvs+ioinhzynJdvubs9W93dnj2NNgSu9tj1dUR8nzH4QV9OOsBEtMsl727P9nUyv472BH7Vcz/wVWU05nV8CjKrHrubR/u+f3Usof3u9uymnDf6nlM3j3bE6vmxvHZQy6k8ifebysn89XS2uIx2P5LzSk2vo71d9MazGjg05aL4Otr3/nm07/0muj+Fdh0n8L6/X2pd9jP6Meo8wXcV7Wv37phfO+iq7wDzKpLtBfTghDSK9kQ+iYgfoj0pjTdoYh3tJ7LfImK5xZDvMrqtRlp1OHZTu9a3rlnEVwz5fruO3edGrKpV0UF5r95E/LXB4CTaPb0m8WmPry9ZRvtz/BER8x13br+OpE/MLrfFlhHxquwm3cTmr9082r+R36J97ZY7lrHr3+dqx+NgUN99/Pixv8a/+663todSgs3kM/9rnfnePgDU1mvG6LNxAIA+nPwkXgAgHwEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDSEWAAgHQEGAAgHQEGAEhHgAEA0hFgAIB0BBgAIB0BBgBIR4ABANIRYACAdAQYACAdAQYASEeAAQDS+f90ZIF6Foc6mwAAAABJRU5ErkJggg==',
    width: 150,
  })
  console.log(sortBy.value)
  infusionDoc.content.push({ text: 'Here are the requested infusion details', fontSize: 18 })
  for (const item of currentInfusions.value) {
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
const toggleState = ref(false)
const sortBy = ref('')

watch(sortBy, (newSortChoice) => {
  sortInfusions(newSortChoice)
})
watch(toggleState, () => {
  reverse()
})
</script>

<template>
  <div class="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
    <div class="bg-white shadow-2xl overflow-x-auto flex flex-col max-w-3xl w-full rounded-md">
      <!-- Header -->
      <header
        class="flex justify-between items-center px-4 py-3 border-b border-gray-200 text-blue-600 font-semibold"
      >
        <slot name="header">{{infusionsForPdfStore.getAmountOfPDF}} infusions selected</slot>
        <button
          type="button"
          @click="close"
          class="text-blue-600 font-bold text-xl p-2 hover:text-blue-800 transition"
        >
          ×
        </button>
      </header>

      <!-- Infusion items -->
      <div v-for="item in currentInfusions" :key="item.id || item.id_stack_number" class="mb-2 px-4">
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

      <!-- Body slot -->
      <section class="px-4 py-5 text-gray-700 grid grid-cols-14">
        <slot name="body" class="">
          Sort by
          <select v-model="sortBy"  class="border border-gray-300 rounded px-2 py-1 col-span-11">
            <option value="department">Department</option>
            <option value="floor">Floor</option>
            <option value="ward">Ward</option>
            <option value="bed">Bed</option>
            <option value="drug">Drug</option>
            <option value="totalMl">Total ml</option>
            <option value="remainingMl">Remaining ml</option>
            <option value="time">Time remaining</option>
            <option value="id">ID</option>
            <option value="softwareVersion">Software Version</option>
            <option value="medicalLibraryVersion">Medical Library Version</option>
          </select>
          <div class="col-span-1"></div>
          <Toggle
            v-model:pressed="toggleState"
            aria-label="Toggle italic"
            class="hover:bg-gray-200 col-span-1 text-black data-[state=on]:bg-blue-500 data-[state=on]:text-white flex items-center justify-center rounded bg-gray-50 border border-gray-300"
          >
            <Icon icon="radix-icons:caret-sort" class="color-black" />
          </Toggle>
        </slot>

      </section>

      <!-- Footer -->
      <footer class="flex flex-col gap-2 px-4 py-4 border-t border-gray-200">
        <slot name="footer"></slot>

        <button
          type="button"
          class="text-white bg-blue-600 border border-blue-600 rounded px-4 py-2 hover:bg-blue-500 transition"
          @click="print"
        >
          Print Infusion Details
        </button>

        <button
          type="button"
          class="text-white bg-[#ec1010] border border-[#ec1010] rounded px-4 py-2 hover:bg-red-500 transition"
          @click="close"
        >
          Close
        </button>
      </footer>
    </div>
  </div>
</template>

<style scoped></style>
