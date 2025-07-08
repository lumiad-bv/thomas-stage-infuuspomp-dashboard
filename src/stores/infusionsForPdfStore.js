import { defineStore } from 'pinia'

export const useInfusionsForPdfStore = defineStore('infusionsForPdf', {
  state: () => ({
    infusions: [],
    amountOfPDF: 0,
  }),
  getters: {
    getInfusions: (state) => state.infusions,
    getAmountOfPDF: (state) => state.amountOfPDF,
  },
  actions: {
    setInfusions(newInfusions) {
      this.infusions = newInfusions
    },
    setAmountOfPDF(value) {
      this.amountOfPDF = value
    },
  },
})
