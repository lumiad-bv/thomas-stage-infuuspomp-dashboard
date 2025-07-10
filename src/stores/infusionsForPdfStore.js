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
      console.log('Infusion removed:', infusion)
      if (this.infusions.includes(infusion)) {
        this.infusions.splice(this.infusions.indexOf(infusion), 1)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion removed:', infusion)
      }
      console.log('current infusions:', this.getInfusions)
    },
    setInfusions(newInfusions) {
      this.infusions = newInfusions
    },
    removeInfusionById(infusionId) {
      const index = this.infusions.findIndex((infusion) => infusion.id === infusionId)
      if (index !== -1) {
        this.infusions.splice(index, 1)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion removed by ID:', infusionId)
      } else {
        console.log('Infusion with ID not found:', infusionId)
      }
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
