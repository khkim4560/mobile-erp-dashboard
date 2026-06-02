<script setup lang="ts">
import { ref } from 'vue';
import { 
  Building2, 
  User as UserIcon, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Sun, 
  Moon 
} from 'lucide-vue-next';
import { Motion } from 'motion-v';
import type { User } from '../types';

interface Props {
  isDark: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['login', 'theme-toggle']);

const employeeId = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberId = ref(true);
const isLoading = ref(false);
const errorMsg = ref('');

const handleSubmit = () => {
  if (!employeeId.value.trim()) {
    errorMsg.value = '사원번호를 입력하세요.';
    return;
  }
  if (!password.value.trim()) {
    errorMsg.value = '비밀번호를 입력하세요.';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  // Simulate standard ERP gateway ping
  setTimeout(() => {
    isLoading.value = false;
    emit('login', {
      name: employeeId.value.trim().toLowerCase() === 'admin' ? '홍길동 관리자' : '홍길동 대리',
      employeeId: employeeId.value.trim().toUpperCase(),
      roleId: 'GL-104928',
      isLoggedIn: true,
    });
  }, 750);
};
</script>

<template>
  <div class="w-full max-w-md mx-auto flex flex-col space-y-8 py-10 px-4">
    <!-- Logo & Branding Section -->
    <header class="flex flex-col items-center space-y-4">
      <Motion 
        :initial="{ scale: 0.8, opacity: 0 }"
        :animate="{ scale: 1, opacity: 1 }"
        :transition="{ duration: 0.5, ease: 'easeOut' }"
        class="w-20 h-20 bg-blue-900/15 dark:bg-[#003366] rounded-2xl flex items-center justify-center shadow-lg border border-blue-500/10"
      >
        <Building2 class="w-10 h-10 text-[#003366] dark:text-[#a7c8ff]" />
      </Motion>
      
      <div class="text-center">
        <Motion 
          :initial="{ opacity: 0, y: -5 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ delay: 0.1, duration: 0.3 }"
          class="font-bold text-[24px] leading-[32px] text-[#001e40] dark:text-[#a7c8ff] tracking-tight"
        >
          GFR Mobile ERP
        </Motion>
        <Motion 
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 0.8 }"
          :transition="{ delay: 0.2, duration: 0.3 }"
          class="font-normal text-[14px] leading-[20px] text-gray-500 dark:text-[#c3c6d1] mt-1"
        >
          스마트 워크플레이스 통합 관리
        </Motion>
      </div>
    </header>

    <!-- Login Form Section -->
    <Motion 
      :initial="{ y: 20, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :transition="{ delay: 0.2, duration: 0.4 }"
      class="bg-white dark:bg-[#0d1c2d] p-6 rounded-2xl border border-gray-200/80 dark:border-[#43474f]/40 shadow-xl"
    >
      <form @submit.prevent="handleSubmit" class="flex flex-col space-y-4">
        
        <div v-if="errorMsg" class="p-3 text-xs bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg border border-red-200/50 dark:border-red-500/20">
          {{ errorMsg }}
        </div>

        <!-- ID Input Group -->
        <div class="space-y-1.5">
          <label class="font-semibold text-[12px] leading-[16px] text-gray-500 dark:text-[#c3c6d1] px-1" for="employee-id">
            사원번호 (ID)
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-gray-400 dark:text-gray-500">
              <UserIcon class="w-5 h-5" />
            </span>
            <input 
              id="employee-id"
              v-model="employeeId"
              type="text"
              placeholder="사원번호를 입력하세요 (예: admin)"
              class="w-full h-12 pl-12 pr-4 bg-gray-50 dark:bg-[#2c3a4c]/50 border border-gray-200 dark:border-[#43474f] rounded-xl text-[14px] leading-[20px] text-gray-900 dark:text-[#d4e4fa] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:ring-blue-400/30 dark:focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <!-- Password Input Group -->
        <div class="space-y-1.5">
          <label class="font-semibold text-[12px] leading-[16px] text-gray-500 dark:text-[#c3c6d1] px-1" for="password">
            비밀번호 (Password)
          </label>
          <div class="relative flex items-center">
            <span class="absolute left-4 text-gray-400 dark:text-gray-500">
              <Lock class="w-5 h-5" />
            </span>
            <input 
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="비밀번호를 입력하세요"
              class="w-full h-12 pl-12 pr-12 bg-gray-50 dark:bg-[#2c3a4c]/50 border border-gray-200 dark:border-[#43474f] rounded-xl text-[14px] leading-[20px] text-gray-900 dark:text-[#d4e4fa] placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:ring-blue-400/30 dark:focus:border-blue-400 transition-all"
            />
            <button 
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 text-gray-400 hover:text-gray-600 dark:hover:text-[#a7c8ff] transition-colors"
            >
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Remember Me & Utils -->
        <div class="flex items-center justify-between py-1 px-0.5">
          <label class="flex items-center space-x-2 cursor-pointer group select-none">
            <input 
              type="checkbox"
              v-model="rememberId"
              class="w-5 h-5 rounded border-gray-300 dark:border-[#43474f] text-[#003366] dark:text-[#a7c8ff] focus:ring-[#003366] dark:focus:ring-[#a7c8ff] bg-gray-50 dark:bg-[#2c3a4c]/50 transition-all"
            />
            <span class="font-normal text-[14px] leading-[20px] text-gray-500 dark:text-[#c3c6d1] group-hover:text-gray-700 dark:group-hover:text-white transition-colors">
              비밀번호 저장
            </span>
          </label>
          <a 
            href="#forgot-pass"
            @click.prevent="alert('비밀번호 변경/찾기를 위해 시스템 관리자(IT팀 내선 2309)에 문의해 주세요.')"
            class="font-semibold text-[12px] leading-[16px] text-blue-600 dark:text-[#a7c8ff] hover:underline"
          >
            비밀번호 찾기
          </a>
        </div>

        <!-- Login Button -->
        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full h-12 bg-[#001e40] dark:bg-[#a7c8ff] text-white dark:text-[#001b3c] font-bold text-[16px] leading-[24px] rounded-xl active:scale-[0.98] disabled:opacity-50 transition-all duration-150 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg hover:bg-black dark:hover:bg-white"
        >
          <span v-if="isLoading" class="inline-block w-5 h-5 border-2 border-current border-t-transparent animate-spin rounded-full" />
          <template v-else>
            <span>로그인</span>
            <LogIn class="w-5 h-5" />
          </template>
        </button>
      </form>
    </Motion>

    <!-- Visual Anchor / Theme Toggle Card -->
    <Motion 
      :initial="{ y: 20, opacity: 0 }"
      :animate="{ y: 0, opacity: 1 }"
      :transition="{ delay: 0.3, duration: 0.4 }"
      class="bg-gray-100 dark:bg-[#122131] p-4 rounded-2xl border border-gray-200 dark:border-[#43474f]/40 flex items-center justify-between shadow-md transition-colors duration-300"
    >
      <div class="flex items-center space-x-3">
        <Moon class="w-5 h-5 text-blue-900 dark:text-[#a7c8ff]" />
        <span class="font-semibold text-[14px] leading-[20px] text-gray-800 dark:text-[#d4e4fa]">
          테마 설정
        </span>
      </div>
      
      <button 
        @click="$emit('theme-toggle')"
        class="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-[#003366] text-[#001e40] dark:text-[#a7c8ff] rounded-xl font-semibold text-[12px] leading-[16px] hover:opacity-85 transition-colors border border-gray-200 dark:border-[#43474f]/60 shadow-sm"
      >
        <template v-if="isDark">
          <Sun class="w-4 h-4 text-amber-400" />
          <span>라이트 모드 전환</span>
        </template>
        <template v-else>
          <Moon class="w-4 h-4" />
          <span>다크 모드 전환</span>
        </template>
      </button>
    </Motion>

    <!-- Footer Details -->
    <footer class="flex flex-col items-center space-y-1 opacity-60 text-center select-none pt-4">
      <p class="font-normal text-[11px] leading-[16px] text-gray-400 dark:text-[#c3c6d1]">
        © 2026 LOTTE Global Fashion Retail. All rights reserved.
      </p>
    </footer>
  </div>
</template>
