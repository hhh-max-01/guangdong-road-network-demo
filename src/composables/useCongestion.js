import { ref, computed, onBeforeUnmount, watch } from 'vue'
import { analysisEvent } from '../data/events'
import { analysisSteps, analysisMessages, currentCongestion, clearCongestion, saveCongestion } from '../data/traffic'
export function useCongestion() {
  const step = ref(-1), running = ref(false)
  const complete = computed(() => Boolean(currentCongestion.value) && !running.value)
  let timer, generation = 0
  function cancel() { generation++; clearTimeout(timer); running.value = false }
  function reset() { cancel(); step.value = -1; clearCongestion() }
  function start() {
    if (running.value) return
    reset()
    const run = generation, event = analysisEvent.value
    running.value = true; step.value = 0
    const advance = () => {
      if (run !== generation) return
      if (step.value < analysisSteps.length - 1) { step.value++; timer = setTimeout(advance, 900) }
      else { saveCongestion(event); running.value = false; step.value = 5 }
    }
    timer = setTimeout(advance, 900)
  }
  watch(analysisEvent, reset)
  onBeforeUnmount(cancel)
  return { step, running, complete, start, reset, message: computed(() => running.value ? analysisMessages[step.value] : complete.value ? '分析完成' : '待分析') }
}
