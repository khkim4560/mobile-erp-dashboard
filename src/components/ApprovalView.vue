<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Calendar, 
  ChevronDown, 
  Filter, 
  Lock, 
  Check, 
  X, 
  CheckSquare, 
  Square,
  ArrowUpDown,
  Sparkles,
  Ticket
} from 'lucide-vue-next';
import { Motion, AnimatePresence } from 'motion-v';
import axios from 'axios';
import type { ApprovalRequest } from '../types';

const activePeriod = ref<'today' | 'week' | 'month' | 'calendar'>('today');
const statusFilter = ref<string>('all');
const requests = ref<ApprovalRequest[]>([]);
const selectedIds = ref<string[]>([]);

onMounted(async () => {
  try {
    const res = await axios.get('/api/approvals');
    requests.value = res.data;
  } catch (error) {
    console.error('Failed to fetch approvals:', error);
  }
});

const filteredRequests = computed(() => {
  return requests.value.filter(item => {
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) {
      return false;
    }
    return true;
  });
});

const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
  const item = requests.value.find(r => r.id === id);
  if (!item) return;

  const newStatus = decision === 'approved' ? '승인완료' : '반려됨';
  try {
    const updatedItem = { ...item, status: newStatus };
    await axios.put(`/api/approvals/${id}`, updatedItem);
    requests.value = requests.value.map(r => r.id === id ? updatedItem : r);
  } catch (error) {
    console.error('Failed to update approval:', error);
    alert('상태 변경에 실패했습니다.');
  }
};

const toggleSelect = (id: string) => {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(item => item !== id);
  } else {
    selectedIds.value.push(id);
  }
};

const handleBatchApprove = async () => {
  const pendingsToApprove = filteredRequests.value.filter(
    r => r.status === '결재대기' && (selectedIds.value.length === 0 || selectedIds.value.includes(r.id))
  );

  if (pendingsToApprove.length === 0) {
    alert('결재대기 상태의 대상 문서가 없습니다.');
    return;
  }

  const confirmMsg = selectedIds.value.length > 0 
    ? `선택한 ${selectedIds.value.length}건의 문서들을 승인 처리하시겠습니까?`
    : '모든 결재대기 문서들을 일괄 승인 처리하시겠습니까?';

  if (window.confirm(confirmMsg)) {
    try {
      const updatePromises = pendingsToApprove.map(r => 
        axios.put(`/api/approvals/${r.id}`, { ...r, status: '승인완료' })
      );
      await Promise.all(updatePromises);
      
      const idsToApprove = pendingsToApprove.map(r => r.id);
      requests.value = requests.value.map(item => 
        idsToApprove.includes(item.id) ? { ...item, status: '승인완료' } : item
      );
      selectedIds.value = [];
      alert('일괄 결재 승인이 완료되었습니다.');
    } catch (error) {
      console.error('Failed batch approval:', error);
      alert('일괄 승인 중 오류가 발생했습니다.');
    }
  }
};
</script>

<template>
  <div class="space-y-4">
    <section class="bg-white dark:bg-[#0d1c2d] p-4.5 rounded-2xl border border-gray-200/80 dark:border-[#43474f]/40 transition-colors duration-200">
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <span class="font-sans font-bold text-xs text-blue-700 dark:text-[#a7c8ff] tracking-tight">조회 필터</span>
          <Filter class="w-4 h-4 text-gray-450 text-xs" />
        </div>

        <div class="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <button 
            v-for="p in (['today', 'week', 'month'] as const)"
            :key="p"
            @click="activePeriod = p"
            class="px-4 py-2 shrink-0 rounded-full font-semibold text-xs tracking-tight transition-all duration-150"
            :class="activePeriod === p ? 'bg-blue-600 dark:bg-[#a7c8ff] text-white dark:text-[#001e40] shadow-sm' : 'bg-gray-100 dark:bg-[#1c2b3c] text-gray-500 dark:text-[#c3c6d1]'"
          >
            {{ p === 'today' ? '오늘' : p === 'week' ? '1주일' : '1개월' }}
          </button>
          <button 
            @click="activePeriod = 'calendar'; alert('연도별/월간 세부 카테고리는 캘린더 모듈에서 기안됩니다.')"
            class="flex items-center gap-1 px-4 py-2 shrink-0 rounded-full font-semibold text-xs tracking-tight transition-all duration-150"
            :class="activePeriod === 'calendar' ? 'bg-blue-600 dark:bg-[#a7c8ff] text-white dark:text-[#001e40] shadow-sm' : 'bg-gray-100 dark:bg-[#1c2b3c] text-gray-500 dark:text-[#c3c6d1]'"
          >
            <Calendar class="w-3.5 h-3.5" />
            <span>캘린더</span>
          </button>
        </div>

        <div class="relative mt-1">
          <select 
            v-model="statusFilter"
            class="w-full h-11 pl-4 pr-10 bg-gray-50 dark:bg-[#122131]/60 text-gray-800 dark:text-[#d4e4fa] border border-gray-200 dark:border-[#43474f] rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer appearance-none"
          >
            <option value="all">승인상태 (전체)</option>
            <option value="결재대기">결재대기</option>
            <option value="승인완료">승인완료</option>
            <option value="반려됨">반려</option>
          </select>
          <span class="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown class="w-4 h-4" />
          </span>
        </div>
      </div>
    </section>

    <div class="flex justify-between items-center px-1">
      <h2 class="font-bold text-xs text-gray-400 dark:text-[#c3c6d1] uppercase select-none">
        요청 현황 <span class="text-blue-600 dark:text-[#a7c8ff] font-extrabold ml-1 font-mono">{{ filteredRequests.length }}</span>건
      </h2>
      <button @click="handleBatchApprove" class="flex items-center gap-1.5 text-blue-600 dark:text-[#a7c8ff] font-bold text-xs transition-colors hover:opacity-80">
        <Sparkles class="w-3.5 h-3.5" />
        <span>대기중 일괄 승인</span>
      </button>
    </div>

    <div v-if="filteredRequests.length === 0" class="py-16 bg-white dark:bg-[#0d1c2d] text-center rounded-2xl border border-gray-100 dark:border-gray-855 text-gray-450 text-xs">
      현재 선택된 조건에 해당하는 결재 문서 가래가 없습니다.
    </div>
    <div v-else class="space-y-4 pb-14">
      <AnimatePresence>
        <Motion 
          v-for="req in filteredRequests"
          :key="req.id"
          :initial="{ opacity: 0, y: 10 }"
          :animate="{ opacity: 1, y: 0 }"
          :exit="{ opacity: 0, scale: 0.95 }"
          class="bg-white dark:bg-[#0d1c2d] border border-gray-200/80 dark:border-[#2c3a4c] rounded-2xl p-4.5 relative overflow-hidden flex flex-col space-y-3 shadow-md"
        >
          <div class="absolute left-0 top-0 bottom-0 w-1.5" :class="req.status === '승인완료' ? 'bg-emerald-600 dark:bg-emerald-500' : req.status === '반려됨' ? 'bg-gray-400 dark:bg-gray-650' : 'bg-red-600 dark:bg-rose-500'"></div>

          <div class="pl-3.5 flex justify-between items-start">
            <div class="space-y-0.5">
              <div class="flex items-center space-x-2">
                <button v-if="req.status === '결재대기'" @click="toggleSelect(req.id)" class="text-gray-400 dark:text-gray-500 hover:text-blue-500 cursor-pointer">
                  <CheckSquare v-if="selectedIds.includes(req.id)" class="w-4 h-4 text-blue-600 dark:text-[#a7c8ff]" />
                  <Square v-else class="w-4 h-4" />
                </button>
                <span class="font-mono text-[10px] text-gray-400 dark:text-[#c3c6d1] font-semibold">{{ req.reqCode }}</span>
              </div>
              <h3 class="font-sans font-extrabold text-[15px] text-gray-800 dark:text-white leading-tight">{{ req.title }}</h3>
            </div>
            <span class="inline-block px-2.5 py-1 rounded font-mono text-[10px] font-bold"
              :class="req.status === '승인완료' ? 'bg-emerald-50 dark:bg-[#005236]/35 text-[#00714d] dark:text-emerald-400' : req.status === '반려됨' ? 'bg-gray-50 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400' : 'bg-red-50 dark:bg-red-950/20 text-red-600'"
            >
              {{ req.status }}
            </span>
          </div>

          <div class="pl-3.5 grid grid-cols-2 gap-y-2.5 border-t border-b border-gray-100/80 dark:border-gray-800/40 py-2.5 text-xs">
            <div>
              <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">사용여부</p>
              <p class="font-sans font-bold text-gray-800 dark:text-[#d4e4fa] mt-0.5">{{ req.usageStatus }}</p>
            </div>
            <div>
              <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">요청자</p>
              <p class="font-sans font-bold text-gray-800 dark:text-[#d4e4fa] mt-0.5">{{ req.requesterName }} {{ req.requesterRole }}</p>
            </div>
            <div class="col-span-2">
              <p class="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase">신청 기간</p>
              <p class="font-mono text-gray-800 dark:text-[#d4e4fa] mt-0.5">{{ req.startDate }} ~ {{ req.endDate }}</p>
            </div>
          </div>

          <div class="pl-3.5 pt-1">
            <div v-if="req.status === '결재대기'" class="flex gap-2">
              <button @click="handleDecision(req.id, 'rejected')" class="flex-1 h-11 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-[#c3c6d1] hover:bg-gray-50 dark:hover:bg-[#1c2b3c] font-semibold text-xs rounded-xl active:scale-95 transition-transform">반려</button>
              <button @click="handleDecision(req.id, 'approved')" class="flex-1 h-11 bg-blue-600 dark:bg-[#a7c8ff] text-white dark:text-[#001e40] font-bold text-xs rounded-xl active:scale-95 transition-transform shadow-md">승인</button>
            </div>
            <button v-else disabled class="w-full h-10 border border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-not-allowed bg-gray-50/50 dark:bg-[#122131]/20">
              <Lock class="w-3.5 h-3.5 opacity-60" />
              <span>결재 완료됨</span>
            </button>
          </div>
        </Motion>
      </AnimatePresence>
    </div>

    <AnimatePresence>
      <Motion 
        v-if="filteredRequests.some(r => r.status === '결재대기')"
        initial="{ scale: 0, opacity: 0 }"
        animate="{ scale: 1, opacity: 1 }"
        exit="{ scale: 0, opacity: 0 }"
        while-tap="{ scale: 0.9 }"
        @click="handleBatchApprove"
        class="fixed bottom-24 right-5 w-14 h-14 bg-amber-500 dark:bg-[#ffb95f] text-white dark:text-[#4b2d00] rounded-full shadow-xl flex items-center justify-center z-40 cursor-pointer border border-amber-600/10"
      >
        <Check class="w-6 h-6 stroke-[3]" />
      </Motion>
    </AnimatePresence>
  </div>
</template>
