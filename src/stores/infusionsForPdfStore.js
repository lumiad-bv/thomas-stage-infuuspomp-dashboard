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
      if (!this.infusions.some((i) => i.id === infusion.id)) {
        this.infusions.push(infusion)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion added:', infusion)
      } else {
        console.log('Infusion with this ID already exists:', infusion.id)
      }
    },
    removeInfusion(infusion) {
      const index = this.infusions.findIndex((i) => i.id === infusion.id)
      if (index !== -1) {
        this.infusions.splice(index, 1)
        this.setAmountOfPDF(this.infusions.length)
        console.log('Infusion removed:', infusion)
      } else {
        console.log('Cannot remove infusion, it is not in the list:', infusion)
      }
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
