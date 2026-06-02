<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Search, 
  Scan, 
  QrCode, 
  SlidersHorizontal, 
  Building2, 
  Plus, 
  Minus,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-vue-next';
import { Motion, AnimatePresence } from 'motion-v';
import axios from 'axios';
import type { InventoryItem } from '../types';

const searchTerm = ref('');
const storeFilter = ref<'mine' | 'others'>('mine');
const inventoryList = ref<InventoryItem[]>([]);
const isScannerOpen = ref(false);
const scanType = ref<'barcode' | 'qr'>('barcode');
const scannedFeedback = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await axios.get('/api/inventory');
    inventoryList.value = res.data;
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
  }
});

const filteredInventory = computed(() => {
  return inventoryList.value.filter(item => {
    const locationMatch = storeFilter.value === 'mine' 
      ? item.location === '강남본점' 
      : item.location !== '강남본점';

    const searchLower = searchTerm.value.toLowerCase();
    const codeMatch = item.code.toLowerCase().includes(searchLower);
    const nameMatch = item.productName.toLowerCase().includes(searchLower);
    const brandMatch = item.brand.toLowerCase().includes(searchLower);

    return locationMatch && (codeMatch || nameMatch || brandMatch);
  });
});

const adjustStock = async (id: string, field: 'currentStock' | 'availableStock', delta: number) => {
  const item = inventoryList.value.find(i => i.id === id);
  if (!item) return;

  const newVal = Math.max(0, item[field] + delta);
  let newStatus = item.status;

  if (field === 'availableStock') {
    if (newVal <= 2) {
      newStatus = '재고부족';
    } else if (newVal > 2 && item.availableStock <= 2) {
      newStatus = '예약 가능';
    }
  }

  try {
    const updatedItem = { ...item, [field]: newVal, status: newStatus };
    await axios.put(`/api/inventory/${id}`, updatedItem);
    inventoryList.value = inventoryList.value.map(i => i.id === id ? updatedItem : i);
  } catch (error) {
    console.error('Failed to update stock:', error);
    alert('재고 수정에 실패했습니다.');
  }
};

const triggerSimulationScan = () => {
  const mockBarcodes = ['PT-2024-DENIM-L', 'TS-2024-BLACK-M', 'JK-2024-WOOL-XL'];
  const randomBarcode = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)];
  
  scannedFeedback.value = `기기 바코드 스캔 완료: [${randomBarcode}]`;
  
  setTimeout(() => {
    searchTerm.value = randomBarcode;
    isScannerOpen.value = false;
    scannedFeedback.value = null;
  }, 1500);
};
</script>

<template>
  <div class="space-y-4">
    <section class="space-y-3.5">
      <div class="flex gap-2">
        <div class="relative flex-1 group">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
            <Search class="w-5 h-5" />
          </span>
          <input 
            v-model="searchTerm"
            type="text"
            placeholder="품번 또는 상품명 검색"
            class="w-full h-12 pl-11 pr-4 bg-white dark:bg-[#0d1c2d] text-gray-800 dark:text-[#d4e4fa] border border-gray-200 dark:border-[#43474f] rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 transition-all placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
          />
          <button 
            v-if="searchTerm"
            @click="searchTerm = ''"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold text-xs"
          >
            Clear
          </button>
        </div>

        <button 
          @click="scanType = 'barcode'; isScannerOpen = true"
          class="w-12 h-12 flex items-center justify-center bg-[#001e40] dark:bg-[#a7c8ff] text-white dark:text-[#001b3c] rounded-xl active:scale-95 transition-transform cursor-pointer shadow-md"
        >
          <Scan class="w-5 h-5 animate-pulse" />
        </button>
        
        <button 
          @click="scanType = 'qr'; isScannerOpen = true"
          class="w-12 h-12 flex items-center justify-center bg-gray-100 dark:bg-[#122131] text-gray-700 dark:text-[#d4e4fa] border border-gray-200 dark:border-[#43474f] rounded-xl active:scale-95 transition-transform cursor-pointer shadow-sm hover:bg-gray-200"
        >
          <QrCode class="w-5 h-5" />
        </button>
      </div>

      <div class="flex items-center gap-2 select-none">
        <button 
          v-for="f in (['mine', 'others'] as const)"
          :key="f"
          @click="storeFilter = f"
          class="flex-1 h-10 rounded-full font-semibold text-xs tracking-tight border transition-all"
          :class="storeFilter === f
            ? 'bg-[#002113]/5 text-blue-800 dark:text-[#a7c8ff] border-blue-500 dark:border-blue-400 dark:bg-[#a7c8ff]/10 font-bold'
            : 'bg-gray-100 dark:bg-[#0d1c2d] text-gray-500 dark:text-[#c3c6d1] border-transparent'"
        >
          {{ f === 'mine' ? '자기매장 (강남본점)' : '타매장 필터' }}
        </button>
      </div>
    </section>

    <div class="flex justify-between items-center pt-2">
      <h2 class="font-bold text-sm text-gray-900 dark:text-white mb-1 tracking-tight select-none">
        재고 현황 
        <span class="text-blue-600 dark:text-[#a7c8ff] text-xs font-normal ml-1.5 font-mono">총 {{ filteredInventory.length }}건</span>
      </h2>
      <button 
        @click="searchTerm = ''; storeFilter = 'mine'"
        class="text-[11px] text-gray-400 hover:text-blue-500 font-semibold"
      >
        필터 초기화
      </button>
    </div>

    <div v-if="filteredInventory.length === 0" class="py-16 bg-white dark:bg-[#0d1c2d] text-center rounded-2xl border border-gray-100 dark:border-gray-800 text-gray-450 text-xs">
      검색 및 필터 조건에 부합하는 재고가 없습니다. <br />
      <span class="text-[10px] text-gray-400 block mt-2">상단의 '자기매장 / 타매장' 칩을 전환해 보세요.</span>
    </div>
    <div v-else class="space-y-3 pb-8">
      <Motion 
        v-for="item in filteredInventory"
        :key="item.id"
        :initial="{ opacity: 0, scale: 0.98 }"
        :animate="{ opacity: 1, scale: 1 }"
        class="bg-white dark:bg-[#0d1c2d] border border-gray-200/80 dark:border-[#43474f]/45 rounded-2xl p-4.5 relative overflow-hidden flex flex-col space-y-3.5 shadow-sm select-none"
      >
        <div class="absolute left-0 top-0 bottom-0 w-1.5" 
          :class="item.status === '재고부족' || item.availableStock === 0 ? 'bg-red-600 dark:bg-rose-500' : item.status === '시즌 신상품' ? 'bg-emerald-600 dark:bg-[#4edea3]' : 'bg-blue-600 dark:bg-[#7bd0ff]'"
        ></div>

        <div class="pl-2 flex justify-between items-baseline">
          <div class="space-y-0.5">
            <div class="flex items-center space-x-1.5">
              <span class="font-mono text-[10px] font-bold text-blue-600 dark:text-[#a7c8ff] tracking-tight">{{ item.code }}</span>
              <span class="text-[9px] bg-gray-150 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 px-1 py-0.2 rounded font-mono font-medium">{{ item.brand }}</span>
            </div>
            <span class="text-[11px] bg-[#6cf8bb]/10 dark:bg-emerald-950/30 text-emerald-700 dark:text-[#6ffbbe] px-2 py-0.5 rounded font-bold">{{ item.location }}</span>
          </div>

          <span class="font-sans font-bold text-[11px] px-2 py-0.5 rounded"
            :class="item.status === '재고부족' || item.availableStock === 0 ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-rose-400' : item.status === '시즌 신상품' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-[#6ffbbe]' : 'bg-blue-50 dark:bg-blue-900/20 text-[#006c49] dark:text-[#7bd0ff]'"
          >
            {{ item.status }}
          </span>
        </div>

        <p class="pl-2 font-sans font-semibold text-[13px] text-gray-800 dark:text-white leading-normal">{{ item.productName }}</p>

        <div class="pl-2 grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 dark:border-gray-800/40">
          <div class="bg-gray-50 dark:bg-[#122131]/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-855 flex flex-col justify-between">
            <div>
              <p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">현재고</p>
              <p class="font-sans font-extrabold text-[15px] text-blue-900 dark:text-[#7bd0ff] tracking-tight mt-0.5">
                {{ item.currentStock }} <span class="text-[10px] font-medium text-gray-400">EA</span>
              </p>
            </div>
            <div class="flex items-center space-x-2 mt-2 select-none self-end">
              <button @click="adjustStock(item.id, 'currentStock', -1)" class="w-6 h-6 rounded-full bg-white dark:bg-[#2c3a4c] flex items-center justify-center text-xs border border-gray-200 dark:border-gray-700 font-bold active:scale-90 hover:bg-gray-100">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <button @click="adjustStock(item.id, 'currentStock', 1)" class="w-6 h-6 rounded-full bg-white dark:bg-[#2c3a4c] flex items-center justify-center text-xs border border-gray-200 dark:border-gray-700 font-bold active:scale-90 hover:bg-gray-100">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div class="bg-[#6cf8bb]/5 dark:bg-[#2c3a4c]/30 p-2.5 rounded-xl border border-emerald-500/10 dark:border-emerald-500/5 flex flex-col justify-between">
            <div>
              <p class="text-[10px] font-bold text-emerald-800 dark:text-[#6ffbbe] uppercase">가용재고</p>
              <p class="font-sans font-extrabold text-[15px] text-[#00714d] dark:text-[#6ffbbe] tracking-tight mt-0.5">
                {{ item.availableStock }} <span class="text-[10px] font-medium text-emerald-700/60 dark:text-[#aeb9d0]/60">EA</span>
              </p>
            </div>
            <div class="flex items-center space-x-2 mt-2 select-none self-end">
              <button @click="adjustStock(item.id, 'availableStock', -1)" class="w-6 h-6 rounded-full bg-white dark:bg-[#2c3a4c] flex items-center justify-center text-xs border border-gray-200 dark:border-gray-700 font-bold active:scale-90 hover:bg-gray-100">
                <Minus class="w-3.5 h-3.5" />
              </button>
              <button @click="adjustStock(item.id, 'availableStock', 1)" class="w-6 h-6 rounded-full bg-white dark:bg-[#2c3a4c] flex items-center justify-center text-xs border border-gray-200 dark:border-gray-700 font-bold active:scale-90 hover:bg-gray-100">
                <Plus class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </Motion>
    </div>

    <AnimatePresence>
      <div v-if="isScannerOpen" class="fixed inset-0 bg-black/85 z-50 flex flex-col items-center justify-center p-6 text-white">
        <Motion 
          initial="{ opacity: 0, scale: 0.9 }"
          animate="{ opacity: 1, scale: 1 }"
          exit="{ opacity: 0, scale: 0.9 }"
          class="w-full max-w-sm flex flex-col items-center text-center space-y-6"
        >
          <div>
            <h3 class="font-sans font-bold text-lg text-white">
              {{ scanType === 'barcode' ? '바코드 스마트 원 판독기' : 'QR 코드 리스너 및 디코더' }}
            </h3>
            <p class="text-xs text-gray-400 mt-1">모바일 카메라 화각 내 포커스를 위치하세요</p>
          </div>

          <div class="w-64 h-64 border-2 border-dashed border-blue-400 rounded-3xl relative overflow-hidden bg-gray-900/30 flex items-center justify-center shadow-2xl">
            <div class="absolute left-6 right-6 top-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-scan-line"></div>
            <Scan class="w-16 h-16 text-blue-300 opacity-20" />
          </div>

          <div v-if="scannedFeedback" class="p-3 bg-blue-900/40 text-blue-300 border border-blue-500/30 text-xs rounded-xl font-semibold flex items-center space-x-1.5 animate-bounce">
            <Sparkles class="w-4 h-4" />
            <span>{{ scannedFeedback }}</span>
          </div>
          <div v-else class="space-y-2 w-full">
            <button @click="triggerSimulationScan" class="w-full h-11 bg-blue-600 text-white font-bold text-xs rounded-xl active:scale-95 transition-transform">스캔 모의 작동 (시뮬레이터)</button>
            <p class="text-[10px] text-gray-500">* AI Studio Sandbox 환경에서 웹캠 권한 없이 작동하기 위한 자동 디코더 시뮬레이터입니다.</p>
          </div>

          <button @click="isScannerOpen = false" class="px-6 py-2 border border-gray-600 rounded-lg text-xs font-semibold text-gray-300 hover:text-white">닫기</button>
        </Motion>
      </div>
    </AnimatePresence>
  </div>
</template>
