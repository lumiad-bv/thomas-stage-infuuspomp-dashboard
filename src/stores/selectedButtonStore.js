import { reactive } from 'vue'

export const selectedButtoneStore = reactive({
  pressedButtonId: String,
  currentDepartment: String,
  currentFloor: String,
})
