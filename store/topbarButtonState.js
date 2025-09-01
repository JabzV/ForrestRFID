import { defineStore } from 'pinia'

export const useTopbarButtonState = defineStore('topbarButtonState', {
    state: () => ({
        buttonLabel: '',
        buttonFunction: null,
    }),
    actions: {
        setButtonState(label = '', buttonFn = null) {
            this.buttonLabel = label
            this.buttonFunction = buttonFn
        },
        triggerButtonFunction() {
            if (this.buttonFunction) {
                this.buttonFunction()
            }
        },
    },
})
