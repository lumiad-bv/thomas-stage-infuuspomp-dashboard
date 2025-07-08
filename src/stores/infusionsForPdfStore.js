import { defineStore } from 'pinia'

export const useInfusionsForPdfStore = defineStore('infusionsForPdf', {
  state: () => ({
    infusions: [],
    amountOfPDF: 0,
  }),
  getters: {
    getInfusions: (state) => state.infusions,
    getAmountOfPDF: (state) => state.amountOfPDF,
    hasId: (state) => (id) => state.infusions.some((infusion) => infusion.id === id),
  },
  actions: {
    addInfusion(infusion) {
      if (!this.infusions.includes(infusion)) {
        this.infusions.push(infusion)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion added:', infusion)
      }
    },
    removeInfusion(infusion) {
      if (this.infusions.includes(infusion)) {
        this.infusions.splice(this.infusions.indexOf(infusion), 1)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion removed:', infusion)
      }
    },
    setInfusions(newInfusions) {
      this.infusions = newInfusions
    },
    containsId(infusionId) {
      return this.infusions.some((infusion) => infusion.id === infusionId)
    },
    addToPdfCount() {
      this.amountOfPDF += 1
    },
    setAmountOfPDF(value) {
      this.amountOfPDF = value
    },
  },
})
