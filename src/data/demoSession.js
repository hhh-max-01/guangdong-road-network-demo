// 只保存当前标签页的演示检查点，不恢复执行中的定时器。
const prefix = 'road-demo-v1:'
export function readSession(key, validate = () => true) {
  try { const value = JSON.parse(sessionStorage.getItem(prefix + key)); return value && validate(value) ? value : null } catch { return null }
}
export function writeSession(key, value) {
  try { if (value == null) sessionStorage.removeItem(prefix + key); else sessionStorage.setItem(prefix + key, JSON.stringify(value)) } catch { /* 隐私模式或存储不可用时，继续使用内存演示。 */ }
}
