import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { currentCongestion, simulationTimeline, simulationCompletion, clearSimulationCompletion, finishSimulation } from '../data/traffic'

export function useSimulation() {
  const index = ref(simulationCompletion.value ? 3 : 0), step = ref(simulationCompletion.value ? 5 : -1), mode = ref(simulationCompletion.value ? 'complete' : 'idle')
  const running = computed(() => mode.value === 'running')
  let timer, generation = 0
  const frames = computed(() => simulationTimeline.map((frame, i) => ({ ...frame,
    ...(i === 0 && currentCongestion.value ? { speed: currentCongestion.value.speed, congestionLength: currentCongestion.value.congestionLength, queueLength: currentCongestion.value.queueLength, flow: currentCongestion.value.flow } : {}),
  })))
  const frame = computed(() => frames.value[index.value])
  const spreadRate = computed(() => frame.value.minutes ? ((frame.value.congestionLength - frames.value[0].congestionLength) / frame.value.minutes).toFixed(2) : '0.00')
  function cancel() { generation++; clearTimeout(timer) }
  function reset() { cancel(); clearSimulationCompletion(); index.value = 0; step.value = -1; mode.value = 'idle' }
  function select(value) {
    if (!currentCongestion.value || !Number.isInteger(value) || value < 0 || value > 3) return
    cancel(); index.value = value; step.value = -1; mode.value = 'preview'
  }
  function start() {
    if (running.value || !currentCongestion.value) return
    reset(); mode.value = 'running'; step.value = 0
    const run = generation
    let tick = 0
    const advance = () => {
      if (run !== generation) return
      tick++; step.value = tick === 6 ? 5 : Math.min(tick, 4); index.value = Math.min(Math.floor(tick / 2), 3)
      if (tick === 6) { mode.value = 'complete'; finishSimulation(); return }
      timer = setTimeout(advance, 900)
    }
    timer = setTimeout(advance, 900)
  }
  watch(currentCongestion, reset, { flush: 'sync' })
  onBeforeUnmount(cancel)
  return { index, step, mode, running, frames, frame, spreadRate, reset, select, start }
}
