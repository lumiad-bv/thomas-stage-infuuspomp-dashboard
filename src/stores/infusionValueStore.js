import { defineStore } from 'pinia';

  export const useInfusionValueStore = defineStore('infusionValue', {
    state: () => ({
      infusionValues: [],
    }),
    actions: {
      setInfusionValues(values) {
        this.infusionValues = values;
      },
      getInfusionValues() {
        return this.infusionValues;
      },
      getInfusionValuesByAttribute(attribute) {
        return this.infusionValues[attribute] || [];
      }
    },
  });
