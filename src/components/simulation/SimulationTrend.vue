<script setup>
import { computed } from 'vue'
import ChartPanel from '../ChartPanel.vue'
const props = defineProps({ frames: Array, index: Number })
const axis = { axisLine: { show:false }, axisTick:{show:false}, axisLabel:{color:'#88a0b8',fontSize:11}, nameTextStyle:{color:'#88a0b8',fontSize:10}, splitLine:{lineStyle:{color:'#24384f',type:'dashed'}} }
const option = computed(() => ({ animationDuration:250, animationDurationUpdate:250, tooltip:{trigger:'axis',backgroundColor:'#14263c',borderColor:'#365169',textStyle:{color:'#e4edf7'}},grid:{left:42,right:44,top:28,bottom:25},xAxis:{...axis,type:'category',data:props.frames.map(f=>f.time)}, yAxis:[{...axis,type:'value',name:'km',min:0,max:8},{...axis,type:'value',name:'km/h',min:0,max:20,splitLine:{show:false}}],series:[
  {name:'拥堵 / 排队长度（km）',type:'line',yAxisIndex:0,lineStyle:{color:'#f26679',width:3},itemStyle:{color:'#f26679'},data:props.frames.map((f,i)=>({value:f.congestionLength,symbolSize:i===props.index?13:6,itemStyle:{borderColor:i===props.index?'#fff':'#f26679',borderWidth:i===props.index?2:0}}))},
  {name:'平均速度（km/h）',type:'line',yAxisIndex:1,lineStyle:{color:'#4cbbec',width:2},itemStyle:{color:'#4cbbec'},data:props.frames.map((f,i)=>({value:f.speed,symbolSize:i===props.index?13:6,itemStyle:{borderColor:i===props.index?'#fff':'#4cbbec',borderWidth:i===props.index?2:0}}))},
]}))
</script>
<template><ChartPanel :option="option" :label="`关键指标趋势，当前高亮${frames[index].time}：拥堵及排队长度${frames[index].congestionLength}km，平均速度${frames[index].speed}km/h`" /></template>
