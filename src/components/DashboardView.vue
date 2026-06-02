<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { 
  TrendingUp, 
  Package, 
  Ticket, 
  Users, 
  Bell, 
  Mail, 
  CreditCard, 
  CalendarDays,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-vue-next';
import { Motion } from 'motion-v';
import axios from 'axios';
import type { ActiveTab, User, BrandPerformance } from '../types';

interface Props {
  user: User;
  isDark: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['navigate']);

const currentDateTime = ref('');
const selectedBrandFilter = ref('전체 브랜드');
const dailyPerformance = ref<BrandPerformance[]>([]);
const monthlyPerformance = ref<BrandPerformance[]>([]);
const brandMetrics = ref<Record<string, BrandPerformance[]>>({});

let timer: any;

const updateTime = () => {
  const now = new Date();
  const years = now.getFullYear();
  const idMonth = now.getMonth() + 1;
  const days = now.getDate();
  const weekDays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekName = weekDays[now.getDay()];
  
  const rawHours = now.getHours();
  const ampm = rawHours >= 12 ? '오후' : '오전';
  const displayHours = rawHours % 12 === 0 ? 12 : rawHours % 12;
  const formattedHours = String(displayHours).padStart(2, '0');
  const formattedMinutes = String(now.getMinutes()).padStart(2, '0');
  const formattedSeconds = String(now.getSeconds()).padStart(2, '0');

  currentDateTime.value = `${years}년 ${idMonth}월 ${days}일 ${weekName} ${ampm} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
};

onMounted(async () => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  // Fetch data from db.json
  try {
    const [dailyRes, monthlyRes, metricsRes] = await Promise.all([
      axios.get('/api/daily_performance'),
      axios.get('/api/monthly_performance'),
      axios.get('/api/brand_metrics')
    ]);
    dailyPerformance.value = dailyRes.data;
    monthlyPerformance.value = monthlyRes.data;
    brandMetrics.value = metricsRes.data;
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error);
  }
});

onUnmounted(() => {
  clearInterval(timer);
});

const quickMenus = [
  { label: 'Sales Inquiry', korean: '매출조회', icon: TrendingUp, tab: 'sales' as ActiveTab, color: 'text-[#7bd0ff] bg-sky-500/10' },
  { label: 'Inventory Inquiry', korean: '재고조회', icon: Package, tab: 'inventory' as ActiveTab, color: 'text-emerald-500 bg-emerald-500/10' },
  { label: '할인권 결재', korean: '할인 결재', icon: Ticket, tab: 'approvals' as ActiveTab, color: 'text-amber-500 bg-amber-500/10' },
  { label: 'Member Mgmt', korean: '회원관리', icon: Users, toast: '준비 중인 기업 전용 CRM 기능입니다.', color: 'text-purple-500 bg-purple-500/10' },
  { label: 'Notice', korean: '공지사항', icon: Bell, toast: '신규 공지: 2026 하반기 통합 ERP 보안 인증 강화 안내', color: 'text-indigo-500 bg-indigo-500/10' },
  { label: 'Mail', korean: '기안함 / 메일', icon: Mail, toast: '도착한 미결재 메일 3건이 존재합니다.', color: 'text-pink-500 bg-pink-500/10' },
  { label: 'Settlement', korean: '정산관리', icon: CreditCard, toast: '마감 정산 금액 매칭 완료되었습니다.', color: 'text-teal-500 bg-teal-500/10' },
  { label: 'Schedule', korean: '업무일정', icon: CalendarDays, toast: '오후 2시: 패션리테일 신상품 품평회 (대회의실)', color: 'text-rose-500 bg-rose-500/10' },
];

const handleQuickMenuClick = (menu: typeof quickMenus[0]) => {
  if (menu.tab) {
    emit('navigate', menu.tab);
  } else if (menu.toast) {
    alert(menu.toast);
  }
};

const currentDailyPerformance = computed(() => {
  return brandMetrics.value[selectedBrandFilter.value] || dailyPerformance.value;
});
</script>

<template>
  <div class="space-y-6 pb-12">
    <!-- Welcome Section -->
    <section class="py-2">
      <Motion 
        :initial="{ opacity: 0, x: -10 }"
        :animate="{ opacity: 1, x: 0 }"
        :transition="{ duration: 0.4 }"
        class="flex flex-col"
      >
        <div class="flex items-center space-x-2">
          <h2 class="font-sans font-bold text-[24px] leading-[32px] text-gray-900 dark:text-white">
            {{ user.name }}님, 반갑습니다!
          </h2>
          <span class="text-xs bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono">
            ONLINE
          </span>
        </div>
        <div class="flex items-center space-x-1.5 text-gray-500 dark:text-[#c3c6d1] mt-1">
          <Clock class="w-3.5 h-3.5" />
          <p class="font-mono text-sm">
            {{ currentDateTime || '2026년 5월 29일 금요일 오후 5:43' }}
          </p>
        </div>
      </Motion>
    </section>

    <!-- Brand filter -->
    <section class="flex items-center space-x-2 bg-gray-100 dark:bg-[#122131]/60 p-1 rounded-xl scroll-x border border-gray-200/50 dark:border-gray-800/45">
      <button
        v-for="b in ['전체 브랜드', '브랜드 A', '브랜드 B', '브랜드 C']"
        :key="b"
        @click="selectedBrandFilter = b"
        class="flex-1 text-center py-2 text-xs font-semibold rounded-lg transition-all"
        :class="selectedBrandFilter === b 
          ? 'bg-white dark:bg-[#1c2b3c] text-blue-700 dark:text-[#a7c8ff] shadow-sm'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white'"
      >
        {{ b }}
      </button>
    </section>

    <!-- Performance Grid -->
    <div class="grid grid-cols-1 gap-5">
      <!-- Card 1: 당일 실적 -->
      <Motion 
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.1, duration: 0.4 }"
        class="bg-white dark:bg-[#0d1c2d] border border-gray-200/80 dark:border-[#43474f]/40 rounded-2xl overflow-hidden shadow-sm relative"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 dark:bg-[#a7c8ff]"></div>
        
        <div class="p-5 pl-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <div class="flex items-center space-x-1.5">
                <h3 class="font-headline-sm text-lg font-bold text-gray-900 dark:text-[#d4e4fa]">
                  당일 실적
                </h3>
                <span class="text-[10px] bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded-md font-semibold">
                  {{ selectedBrandFilter }}
                </span>
              </div>
              <p class="text-xs text-gray-500 dark:text-[#c3c6d1] mt-0.5">
                오늘의 영업 성과 및 달성 통계
              </p>
            </div>

            <!-- Progress Circle -->
            <div class="relative w-16 h-16 flex items-center justify-center">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" class="stroke-[#eff4ff] dark:stroke-[#1c2b3c]" stroke-width="5" fill="transparent" />
                <Motion 
                  tag="circle"
                  cx="32" 
                  cy="32" 
                  r="26" 
                  class="stroke-blue-600 dark:stroke-[#7bd0ff]" 
                  stroke-width="5" 
                  fill="transparent" 
                  :stroke-dasharray="163.3"
                  :initial="{ strokeDashoffset: 163.3 }"
                  :animate="{ strokeDashoffset: 163.3 * (1 - 0.93) }"
                  :transition="{ delay: 0.3, duration: 0.8 }"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute flex flex-col items-center">
                <span class="font-mono font-bold text-sm text-blue-700 dark:text-[#7bd0ff]">93%</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto select-none mt-2">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-[#43474f]/30">
                  <th class="py-2.5 text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">브랜드</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">목표 (건)</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">실적 (건)</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">달성율</th>
                </tr>
              </thead>
              <tbody class="text-xs text-gray-800 dark:text-[#d4e4fa] divide-y divide-gray-50 dark:divide-gray-800/10">
                <tr v-for="(metric, idx) in currentDailyPerformance" :key="idx" class="hover:bg-gray-50/50 dark:hover:bg-[#122131]/30 transition-colors">
                  <td class="py-3 font-semibold text-gray-900 dark:text-white">{{ metric.brand }}</td>
                  <td class="py-3 text-right font-mono">{{ metric.target.toLocaleString() }}</td>
                  <td class="py-3 text-right font-mono font-medium">{{ metric.actual.toLocaleString() }}</td>
                  <td class="py-3 text-right">
                    <span class="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                      :class="metric.rate >= 90 ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-[#7bd0ff]' : metric.rate >= 75 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'"
                    >
                      {{ metric.rate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Motion>

      <!-- Card 2: 월 누계 실적 -->
      <Motion 
        :initial="{ opacity: 0, y: 15 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ delay: 0.2, duration: 0.4 }"
        class="bg-white dark:bg-[#0d1c2d] border border-gray-200/80 dark:border-[#43474f]/40 rounded-2xl overflow-hidden shadow-sm relative"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600 dark:bg-[#bcc7de]"></div>
        
        <div class="p-5 pl-6">
          <div class="flex justify-between items-center mb-4">
            <div>
              <h3 class="font-headline-sm text-lg font-bold text-gray-900 dark:text-[#d4e4fa]">
                월 누계 실적
              </h3>
              <p class="text-xs text-gray-500 dark:text-[#c3c6d1] mt-0.5">
                당월 누계 패션 영업 총체 현황
              </p>
            </div>

            <div class="relative w-16 h-16 flex items-center justify-center">
              <svg class="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" class="stroke-[#eff4ff] dark:stroke-[#1c2b3c]" stroke-width="5" fill="transparent" />
                <Motion 
                  tag="circle"
                  cx="32" 
                  cy="32" 
                  r="26" 
                  class="stroke-[#00714d] dark:stroke-[#bcc7de]" 
                  stroke-width="5" 
                  fill="transparent" 
                  :stroke-dasharray="163.3"
                  :initial="{ strokeDashoffset: 163.3 }"
                  :animate="{ strokeDashoffset: 163.3 * (1 - 0.78) }"
                  :transition="{ delay: 0.4, duration: 0.8 }"
                  stroke-linecap="round"
                />
              </svg>
              <div class="absolute flex flex-col items-center">
                <span class="font-mono font-bold text-sm text-[#00714d] dark:text-[#bcc7de]">78%</span>
              </div>
            </div>
          </div>

          <div class="overflow-x-auto select-none mt-2">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-100 dark:border-[#43474f]/30">
                  <th class="py-2.5 text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">브랜드</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">목표 (천원)</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">실적 (천원)</th>
                  <th class="py-2.5 text-right text-[11px] font-mono tracking-wider font-semibold text-gray-400 dark:text-gray-500 uppercase">달성율</th>
                </tr>
              </thead>
              <tbody class="text-xs text-gray-800 dark:text-[#d4e4fa] divide-y divide-gray-50 dark:divide-gray-800/10">
                <tr v-for="(metric, idx) in monthlyPerformance" :key="idx" class="hover:bg-gray-50/50 dark:hover:bg-[#122131]/30 transition-colors">
                  <td class="py-3 font-semibold text-gray-900 dark:text-white">{{ metric.brand }}</td>
                  <td class="py-3 text-right font-mono">{{ metric.target.toLocaleString() }}</td>
                  <td class="py-3 text-right font-mono font-medium">{{ metric.actual.toLocaleString() }}</td>
                  <td class="py-3 text-right">
                    <span class="inline-block px-2 py-0.5 rounded-full font-mono text-[10px] font-bold"
                      :class="metric.rate >= 90 ? 'bg-emerald-50 dark:bg-emerald-950/20 text-[#00714d] dark:text-emerald-400' : metric.rate >= 75 ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400' : 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'"
                    >
                      {{ metric.rate }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Motion>
    </div>

    <!-- Quick Menu Section -->
    <section class="space-y-3 pt-2">
      <div class="flex justify-between items-center">
        <h3 class="font-sans font-bold text-base text-gray-900 dark:text-white tracking-tight">
          Quick Menu
        </h3>
        <span class="text-[11px] text-gray-400 font-medium">자주찾는 기안업무</span>
      </div>
      
      <div class="grid grid-cols-4 gap-3">
        <Motion 
          tag="button"
          v-for="(menu, idx) in quickMenus"
          :key="idx"
          @click="handleQuickMenuClick(menu)"
          class="flex flex-col items-center justify-center p-3.5 bg-white dark:bg-[#122131] border border-gray-100 dark:border-[#43474f]/35 rounded-xl transition-all duration-200 shadow-sm hover:bg-gray-50 dark:hover:bg-[#1c2b3c] group text-center cursor-pointer"
        >
          <div class="p-2.5 rounded-lg mb-2 group-hover:scale-105 transition-transform" :class="menu.color">
            <component :is="menu.icon" class="w-5 h-5" />
          </div>
          <span class="font-mono text-[10px] text-gray-400 leading-tight block truncate w-full">
            {{ menu.label }}
          </span>
          <span class="font-sans font-semibold text-[11px] text-gray-700 dark:text-[#d4e4fa] leading-normal block mt-0.5 truncate w-full">
            {{ menu.korean }}
          </span>
        </Motion>
      </div>
    </section>
  </div>
</template>
