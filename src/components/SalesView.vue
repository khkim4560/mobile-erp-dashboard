<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  TrendingUp, 
  ChevronDown, 
  Calendar, 
  HelpCircle,
  Building2,
  TrendingDown
} from 'lucide-vue-next';
import { Motion } from 'motion-v';
import axios from 'axios';
import type { StoreSales } from '../types';

const selectedPeriod = ref<'today' | 'week' | 'month' | 'custom'>('today');
const selectedBrand = ref('전체 브랜드');
const selectedChannel = ref('유통형태');
const storeSales = ref<StoreSales[]>([]);

onMounted(async () => {
  try {
    const res = await axios.get('/api/stores');
    storeSales.value = res.data;
  } catch (error) {
    console.error('Failed to fetch store sales:', error);
  }
});

const filteredSalesList = computed(() => {
  return storeSales.value.filter(item => {
    const matchBrand = selectedBrand.value === '전체 브랜드' || item.brand === selectedBrand.value;
    const matchChannel = selectedChannel.value === '유통형태' || item.channel === selectedChannel.value;
    return matchBrand && matchChannel;
  });
});

const totalRevenue = computed(() => {
  const sum = filteredSalesList.value.reduce((acc, current) => acc + current.actualSales, 0);
  if (selectedPeriod.value === 'week') return sum * 7;
  if (selectedPeriod.value === 'month') return sum * 30;
  return sum;
});

const trendRate = computed(() => {
  if (selectedBrand.value === '브랜드 A') return '15.8% 증가';
  if (selectedBrand.value === '브랜드 B') return '7.2% 증가';
  if (selectedBrand.value === '브랜드 C') return '4.1% 감소';
  return '12.4% 증가';
});

const trendIsPositive = computed(() => !trendRate.value.includes('감소'));
</script>

<template>
  <div class="space-y-5">
    <!-- Search Filter Box -->
    <section class="bg-white dark:bg-[#0d1c2d] p-4 rounded-2xl border border-gray-200/80 dark:border-[#43474f]/40 space-y-4 shadow-sm transition-colors duration-200">
      <div class="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
        <button 
          v-for="p in ['today', 'week', 'month'] as const"
          :key="p"
          @click="selectedPeriod = p"
          class="px-4 py-2 shrink-0 rounded-full font-sans font-semibold text-xs transition-colors duration-150"
          :class="selectedPeriod === p
            ? 'bg-blue-600 dark:bg-[#a7c8ff] text-white dark:text-[#001e40] shadow-sm'
            : 'bg-gray-100 dark:bg-[#1c2b3c] text-gray-500 dark:text-[#c3c6d1] hover:bg-gray-200 dark:hover:bg-[#273647]'"
        >
          {{ p === 'today' ? '오늘' : p === 'week' ? '1주일' : '1개월' }}
        </button>
        
        <button 
          @click="selectedPeriod = 'custom'; alert('캘린더 기간선택 기능은 모바일 기기 기본 날짜조율기를 연동합니다.')"
          class="flex items-center gap-1.5 px-4 py-2 shrink-0 rounded-full font-sans font-semibold text-xs transition-colors duration-150"
          :class="selectedPeriod === 'custom'
            ? 'bg-blue-600 dark:bg-[#a7c8ff] text-white dark:text-[#001e40] shadow-sm'
            : 'bg-gray-100 dark:bg-[#1c2b3c] text-gray-500 dark:text-[#c3c6d1] hover:bg-gray-200 dark:hover:bg-[#273647]'"
        >
          <Calendar class="w-3.5 h-3.5" />
          <span>캘린더</span>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-3 pb-1">
        <div class="relative">
          <select 
            v-model="selectedBrand"
            class="w-full h-11 pl-3 pr-8 bg-gray-50 dark:bg-[#122131]/60 text-gray-800 dark:text-[#d4e4fa] border border-gray-200 dark:border-[#43474f] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
          >
            <option value="전체 브랜드">전체 브랜드</option>
            <option value="브랜드 A">브랜드 A</option>
            <option value="브랜드 B">브랜드 B</option>
            <option value="브랜드 C">브랜드 C</option>
          </select>
          <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>

        <div class="relative">
          <select 
            v-model="selectedChannel"
            class="w-full h-11 pl-3 pr-8 bg-gray-50 dark:bg-[#122131]/60 text-gray-800 dark:text-[#d4e4fa] border border-gray-200 dark:border-[#43474f] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
          >
            <option value="유통형태">유통형태</option>
            <option value="직영점">직영점</option>
            <option value="백화점">백화점</option>
            <option value="아울렛">아울렛</option>
          </select>
          <span class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>
    </section>

    <!-- Aggregate Total Card -->
    <section class="bg-white dark:bg-[#010f1f] border border-gray-200 dark:border-[#43474f]/35 p-6 rounded-2xl shadow-sm text-center">
      <div class="flex flex-col items-center">
        <span class="text-[12px] font-sans font-bold text-gray-400 dark:text-[#c3c6d1] tracking-wider mb-1.5 uppercase">
          선택 기간 총 매출액
        </span>
        
        <div class="flex items-baseline justify-center space-x-1">
          <h2 class="font-sans font-bold text-[32px] leading-[40px] text-blue-900 dark:text-[#a7c8ff] tracking-tight">
            {{ totalRevenue.toLocaleString() }}
          </h2>
          <span class="font-sans font-semibold text-base text-gray-800 dark:text-[#d4e4fa]">원</span>
        </div>

        <div class="mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1 bg-[#d5e3ff]/60 dark:bg-[#1f477b]/30 text-[#001b3c] dark:text-[#a7c8ff] rounded-full">
          <TrendingUp v-if="trendIsPositive" class="w-4 h-4 text-[#00714d] dark:text-[#7bd0ff]" />
          <TrendingDown v-else class="w-4 h-4 text-red-500" />
          <span class="font-mono text-xs font-bold leading-none select-none">
            전월 동기 대비 {{ trendRate }}
          </span>
        </div>
      </div>
    </section>

    <!-- Shop List Section -->
    <section class="space-y-3">
      <div class="flex justify-between items-center mb-1 px-1">
        <h3 class="font-sans font-bold text-sm text-gray-900 dark:text-white tracking-tight">
          매출 상세 내역
        </h3>
        <span class="text-xs font-semibold text-gray-400">총 {{ filteredSalesList.length }}건</span>
      </div>

      <div v-if="filteredSalesList.length === 0" class="py-12 bg-white dark:bg-[#0d1c2d] text-center rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-400 dark:text-[#c3c6d1] text-xs">
        해당 조건의 필터 매출 결과가 존재하지 않습니다.
      </div>
      <div v-else class="space-y-3">
        <Motion 
          v-for="shop in filteredSalesList"
          :key="shop.id"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          while-hover="{ scale: 1.01 }"
          class="bg-white dark:bg-[#0d1c2d] p-4.5 border border-gray-200/80 dark:border-[#2c3a4c] rounded-2xl relative overflow-hidden flex flex-col space-y-3 shadow-sm select-none"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="shop.completedRate >= 100 ? 'bg-[#006c49] dark:bg-[#4edea3]' : 'bg-red-600 dark:bg-rose-500'"></div>
          
          <div class="flex justify-between items-start pl-2">
            <div>
              <div class="flex items-center space-x-1.5">
                <span class="text-[10px] text-gray-400 font-semibold tracking-tight uppercase">{{ shop.brand }}</span>
                <span class="text-[10px] bg-gray-150 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-1.5 py-0.2 rounded font-semibold font-mono">{{ shop.channel }}</span>
              </div>
              <p class="font-sans font-bold text-[14px] text-gray-500 dark:text-[#c3c6d1] mt-0.5">{{ shop.storeName }}</p>
              <h4 class="font-sans font-extrabold text-[18px] text-gray-900 dark:text-white tracking-tight mt-1">
                {{ shop.actualSales.toLocaleString() }}원
              </h4>
            </div>

            <div>
              <span class="inline-block px-2.5 py-1 rounded font-mono text-[11px] font-bold border"
                :class="shop.completedRate >= 100 ? 'bg-emerald-50 dark:bg-[#005236]/30 text-[#00714d] dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-[#93000a]/20 text-red-600 dark:text-rose-400 border-red-200/40 dark:border-red-500/20'"
              >
                달성율 {{ shop.completedRate }}%
              </span>
            </div>
          </div>

          <div class="flex justify-between items-end border-t border-gray-100 dark:border-gray-800/60 pt-3 pl-2">
            <div>
              <p class="text-[11px] font-semibold text-gray-400 dark:text-[#c3c6d1] uppercase">Stretch Goal</p>
              <p class="font-mono text-xs font-bold text-gray-700 dark:text-[#d4e4fa] mt-0.5">
                {{ shop.stretchGoal.toLocaleString() }}원
              </p>
            </div>

            <div class="w-28 relative">
              <div class="flex justify-between items-center text-[9px] text-gray-400 font-mono mb-1">
                <span>achieved</span>
                <span>{{ shop.completedRate }}%</span>
              </div>
              <div class="w-28 h-2 bg-gray-100 dark:bg-[#1a2a3c] rounded-full overflow-hidden">
                <Motion 
                  class="h-full"
                  :class="shop.completedRate >= 100 ? 'bg-[#006c49] dark:bg-[#4edea3]' : 'bg-red-600 dark:bg-rose-500'"
                  :initial="{ width: 0 }"
                  :animate="{ width: `${Math.min(shop.completedRate, 100)}%` }"
                  :transition="{ duration: 0.6 }"
                />
              </div>
            </div>
          </div>
        </Motion>
      </div>
    </section>
  </div>
</template>
