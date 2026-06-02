<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Menu, 
  Bell, 
  Sun, 
  Moon, 
  Home, 
  TrendingUp, 
  Package, 
  Ticket,
  LogOut,
  Building2,
  X,
  User as UserIcon,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-vue-next';
import { Motion, AnimatePresence } from 'motion-v';
import type { ActiveTab, User } from './types';
import LoginView from './components/LoginView.vue';
import DashboardView from './components/DashboardView.vue';
import SalesView from './components/SalesView.vue';
import InventoryView from './components/InventoryView.vue';
import ApprovalView from './components/ApprovalView.vue';

const user = ref<User | null>(null);
const activeTab = ref<ActiveTab>('home');
const isDark = ref(true);
const isMenuOpen = ref(false);
const isAlertsOpen = ref(false);

const handleThemeToggle = () => {
  isDark.value = !isDark.value;
  updateTheme();
};

const updateTheme = () => {
  if (isDark.value) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
};

onMounted(() => {
  const storedTheme = localStorage.getItem('theme');
  const shouldBeDark = storedTheme === null ? true : storedTheme === 'dark';
  
  isDark.value = shouldBeDark;
  updateTheme();
  
  const savedUser = localStorage.getItem('user_session');
  if (savedUser) {
    try {
      user.value = JSON.parse(savedUser);
    } catch (e) {
      localStorage.removeItem('user_session');
    }
  }
});
const handleLogin = (newUser: User) => {
  user.value = newUser;
  localStorage.setItem('user_session', JSON.stringify(newUser));
  activeTab.value = 'home';
};

const handleLogout = () => {
  if (window.confirm('정말 ERP 시스템에서 로그아웃 하시겠습니까?')) {
    user.value = null;
    localStorage.removeItem('user_session');
    isMenuOpen.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-[#051424] text-gray-900 dark:text-[#d4e4fa] transition-colors duration-300">
    
    <!-- 1. Unauthorized State -->
    <LoginView 
      v-if="!user || !user.isLoggedIn"
      @login="handleLogin" 
      :is-dark="isDark" 
      @theme-toggle="handleThemeToggle" 
    />

    <!-- 2. Authorized Corporate Dashboard Workspace -->
    <div v-else class="relative pb-24 md:pb-28">
      
      <!-- Top Integrated App Header -->
      <header class="fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 h-14 bg-white dark:bg-[#051424] border-b border-gray-200 dark:border-[#43474f]/35 shadow-sm transition-colors duration-200">
        <div class="flex items-center space-x-3">
          <button 
            @click="isMenuOpen = true"
            class="p-1.5 hover:bg-gray-100 dark:hover:bg-[#1c2b3c] active:scale-95 rounded-xl transition-all text-[#003366] dark:text-[#a7c8ff]"
          >
            <Menu class="w-5.7 h-5.7" />
          </button>
          <h1 class="font-sans font-extrabold text-[18px] text-blue-900 dark:text-[#a7c8ff] tracking-tight">
            ERP 시스템
          </h1>
        </div>

        <div class="flex items-center space-x-2">
          <button 
            @click="handleThemeToggle"
            class="p-2 hover:bg-gray-100 dark:hover:bg-[#1c2b3c] rounded-xl text-[#003366] dark:text-[#a7c8ff] transition-all"
            :title="isDark ? '라이트 모드로 전환' : '다크 모드로 전환'"
          >
            <Sun v-if="isDark" class="w-5 h-5 text-amber-400" />
            <Moon v-else class="w-5 h-5" />
          </button>

          <button 
            @click="isAlertsOpen = true"
            class="p-2 hover:bg-gray-100 dark:hover:bg-[#1c2b3c] rounded-xl text-[#003366] dark:text-[#a7c8ff] transition-all relative"
          >
            <Bell class="w-5 h-5" />
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-bounce"></span>
          </button>
        </div>
      </header>

      <!-- Core App Main Frame Screen Viewport Container -->
      <main class="max-w-md mx-auto pt-18 px-4">
        <AnimatePresence mode="wait">
          <Motion
            v-if="activeTab === 'home'"
            key="home"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.25 }"
          >
            <DashboardView 
              :user="user" 
              @navigate="activeTab = $event" 
              :is-dark="isDark" 
            />
          </Motion>

          <Motion
            v-else-if="activeTab === 'sales'"
            key="sales"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.25 }"
          >
            <SalesView />
          </Motion>

          <Motion
            v-else-if="activeTab === 'inventory'"
            key="inventory"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.25 }"
          >
            <InventoryView />
          </Motion>

          <Motion
            v-else-if="activeTab === 'approvals'"
            key="approvals"
            :initial="{ opacity: 0, y: 10 }"
            :animate="{ opacity: 1, y: 0 }"
            :exit="{ opacity: 0, y: -10 }"
            :transition="{ duration: 0.25 }"
          >
            <ApprovalView />
          </Motion>
        </AnimatePresence>
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 w-full z-40 flex justify-around items-center h-16 bg-white dark:bg-[#122131] border-t border-gray-200 dark:border-[#43474f]/40 md:h-18 transition-colors duration-200">
        <button 
          v-for="tab in (['home', 'sales', 'inventory', 'approvals'] as ActiveTab[])"
          :key="tab"
          @click="activeTab = tab"
          class="flex flex-col items-center justify-center w-20 transition-all font-sans select-none cursor-pointer"
          :class="activeTab === tab ? 'text-emerald-800 dark:text-[#6ffbbe]' : 'text-gray-400 dark:text-[#c3c6d1] hover:text-gray-600'"
        >
          <div :class="activeTab === tab ? 'bg-[#6cf8bb]/15 dark:bg-[#005236] rounded-full px-4 py-1 flex flex-col items-center' : 'flex flex-col items-center'">
            <component 
              :is="tab === 'home' ? Home : tab === 'sales' ? TrendingUp : tab === 'inventory' ? Package : Ticket"
              class="w-5 h-5"
              :class="{ 'opacity-70': activeTab !== tab }"
            />
            <span class="text-[11px] mt-0.5" :class="activeTab === tab ? 'font-bold' : 'font-semibold'">
              {{ tab === 'home' ? '홈' : tab === 'sales' ? '매출조회' : tab === 'inventory' ? '재고조회' : '할인결재' }}
            </span>
          </div>
        </button>
      </nav>

      <!-- Sidebar Menu -->
      <AnimatePresence>
        <div v-if="isMenuOpen" class="fixed inset-0 z-50">
          <Motion
            initial="{ opacity: 0 }"
            animate="{ opacity: 0.5 }"
            exit="{ opacity: 0 }"
            @click="isMenuOpen = false"
            class="absolute inset-0 bg-black cursor-pointer"
          />
          <Motion
            initial="{ x: '-100%' }"
            animate="{ x: 0 }"
            exit="{ x: '-100%' }"
            :transition="{ type: 'spring', damping: 25, stiffness: 220 }"
            class="absolute top-0 bottom-0 left-0 w-72 bg-white dark:bg-[#0d1c2d] text-gray-900 dark:text-[#d4e4fa] shadow-2xl flex flex-col justify-between border-r border-gray-200 dark:border-gray-800"
          >
            <div class="p-5 space-y-6">
              <div class="flex justify-between items-center">
                <div class="flex items-center space-x-2">
                  <Building2 class="w-5 h-5 text-blue-600 dark:text-[#a7c8ff]" />
                  <span class="font-bold text-sm text-blue-900 dark:text-[#a7c8ff]">GFR Mobile Gateway</span>
                </div>
                <button @click="isMenuOpen = false">
                  <X class="w-5 h-5 text-gray-400 hover:text-gray-600 dark:hover:text-white" />
                </button>
              </div>

              <div class="p-4 bg-gray-50 dark:bg-[#122131] rounded-xl flex items-center space-x-3.5 border border-gray-100 dark:border-gray-850">
                <div class="bg-blue-100 dark:bg-[#1c2b3c] p-2 rounded-lg">
                  <UserIcon class="w-5 h-5 text-[#003366] dark:text-[#a7c8ff]" />
                </div>
                <div>
                  <p class="font-bold text-sm text-gray-900 dark:text-white">{{ user?.name }}</p>
                  <p class="text-[10px] text-gray-400 font-semibold font-mono mt-0.5">{{ user?.employeeId }}</p>
                </div>
              </div>

              <div class="space-y-2 text-xs">
                <p class="font-bold text-gray-400 dark:text-[#c3c6d1] uppercase text-[10px]">계정 보안 등급</p>
                <div class="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-500/5 p-2 rounded-lg">
                  <ShieldCheck class="w-4 h-4" />
                  <span>통합 ERP 인증완료 (인증코드: {{ user?.roleId }})</span>
                </div>
              </div>
            </div>

            <div class="p-5 border-t border-gray-150 dark:border-gray-800">
              <button 
                @click="handleLogout"
                class="w-full h-11 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer dark:bg-rose-950/10 dark:text-rose-400"
              >
                <LogOut class="w-4 h-4" />
                <span>ERP 로그아웃</span>
              </button>
            </div>
          </Motion>
        </div>
      </AnimatePresence>

      <!-- Notifications Modal -->
      <AnimatePresence>
        <div v-if="isAlertsOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <Motion
            initial="{ opacity: 0 }"
            animate="{ opacity: 0.5 }"
            exit="{ opacity: 0 }"
            @click="isAlertsOpen = false"
            class="absolute inset-0 bg-black cursor-pointer"
          />
          <Motion
            initial="{ scale: 0.95, opacity: 0 }"
            animate="{ scale: 1, opacity: 1 }"
            exit="{ scale: 0.95, opacity: 0 }"
            class="bg-white dark:bg-[#0d1c2d] rounded-2xl w-full max-w-sm border border-gray-200 dark:border-gray-800 p-5 shadow-2xl relative z-10 text-gray-800 dark:text-[#d4e4fa]"
          >
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-sm text-gray-900 dark:text-white">ERP 긴급 알림공지</h3>
              <button @click="isAlertsOpen = false">
                <X class="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-white" />
              </button>
            </div>

            <div class="space-y-3.5 text-xs text-gray-600 dark:text-gray-300">
              <div class="p-3 bg-blue-50 dark:bg-[#122131] border border-blue-150/40 dark:border-blue-800/40 rounded-xl flex items-start space-x-2.5">
                <CheckCircle class="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">결재 요청 피드백 공무</p>
                  <p class="text-[11px] text-gray-400 mt-1">대기 중인 [여름 휴가철 특별 할인권] 결재 상신되었습니다.</p>
                </div>
              </div>

              <div class="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-150/40 dark:border-amber-900/30 rounded-xl flex items-start space-x-2.5">
                <HelpCircle class="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p class="font-semibold text-gray-900 dark:text-white">가용재고 부족 알림</p>
                  <p class="text-[11px] text-gray-400 mt-1">[PT-2024-DENIM-L] 모델의 가용재고 수량이 위험 범위(3개 미만)에 도달했습니다.</p>
                </div>
              </div>
            </div>

            <button 
              @click="isAlertsOpen = false"
              class="w-full h-11 bg-gray-100 hover:bg-gray-200 dark:bg-[#1c2b3c] dark:text-gray-300 text-gray-800 font-semibold text-xs rounded-xl mt-4 max-w-full"
            >
              내용 확인 완료
            </button>
          </Motion>
        </div>
      </AnimatePresence>

    </div>
  </div>
</template>
