import { defineStore } from 'pinia'

export const useSelectedButtonStore  = defineStore('selectedButton', {
  state: () => ({
    pressedButtonId: '',
    currentDepartment: '',
    currentFloor: '',
  }),

  getters: {
    getPressedButtonId(state) {
      return state.pressedButtonId
    },
    getCurrentDepartment(state) {
      return state.currentDepartment
    },
    getCurrentFloor(state) {
      return state.currentFloor
    },
  },

  actions: {
    setPressedButtonId(id) {
      this.pressedButtonId = id
    },
    setCurrentDepartment(department) {
      this.currentDepartment = department
    },
    setCurrentFloor(floor) {
      this.currentFloor = floor
    },
    reset() {
      this.pressedButtonId = ''
      this.currentDepartment = ''
      this.currentFloor = ''
    }
  }
})
