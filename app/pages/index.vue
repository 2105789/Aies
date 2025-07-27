<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white" role="main">
    <!-- Camera Permission Modal -->
    <div v-if="showCameraPermissionModal" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
      <div class="bg-white text-gray-900 p-6 sm:p-8 rounded-xl max-w-md w-full text-center shadow-2xl">
        <div class="text-6xl mb-4">📷</div>
        <h2 class="text-xl sm:text-2xl font-bold mb-4">Camera Access Required</h2>
        <p class="text-gray-600 mb-6 text-sm sm:text-base">This Vision Assistant needs access to your camera to analyze your surroundings and provide descriptions.</p>
        
        <!-- HTTPS Warning if not secure -->
        <div v-if="!isSecureContext" class="bg-amber-100 border border-amber-400 text-amber-800 px-4 py-3 rounded mb-4 text-sm">
          <strong>⚠️ HTTPS Required:</strong> Camera access requires a secure connection.<br>
          <strong>Solutions:</strong>
          <ul class="mt-2 text-xs list-disc list-inside">
            <li>Access via <code>https://yourdomain.com</code> instead of <code>http://</code></li>
            <li>Or use <code>localhost</code> (which allows HTTP)</li>
            <li>Or use <code>127.0.0.1</code> instead of your IP address</li>
          </ul>
        </div>
        
        <div class="space-y-4">
          <button 
            @click="requestCameraPermission" 
            :disabled="false"
            class="w-full bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {{ !isSecureContext ? 'Try Camera Access (May Fail)' : 'Grant Camera Access' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Desktop notification -->
    <div v-if="!isMobile" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div class="bg-white text-gray-900 p-8 rounded-xl max-w-md text-center shadow-2xl">
        <div class="text-6xl mb-4">📱</div>
        <h2 class="text-2xl font-bold mb-4">Mobile Experience Required</h2>
        <p class="text-gray-600 mb-6">This Vision Assistant is optimized for mobile devices. Please switch to mobile view or use a mobile device for the best experience.</p>
        <div class="space-y-3 text-sm text-gray-500">
          <p><strong>Chrome/Edge:</strong> Press F12 → Click device icon</p>
          <p><strong>Firefox:</strong> Press F12 → Click responsive design mode</p>
          <p><strong>Safari:</strong> Develop menu → Enter Responsive Design Mode</p>
        </div>
        <button 
          @click="forceMobileView" 
          class="mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Continue Anyway
        </button>
      </div>
    </div>

    <!-- Skip to main content link for screen readers -->
    <a href="#main-controls" class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-black text-white px-3 py-2 rounded z-50">
      Skip to main controls
    </a>
    
    <!-- Header with clear title and status -->
    <header class="text-center mb-4 sm:mb-8 p-4 sm:p-6 bg-white/10 rounded-xl backdrop-blur-md mx-2 sm:mx-4" role="banner">
      <h1 class="text-2xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-lg">Vision Assistant</h1>
      <div class="flex items-center justify-center gap-2 sm:gap-3 text-lg sm:text-xl font-semibold" :class="{ 'text-green-400': isRunning }" aria-live="polite">
        <span>{{ statusText }}</span>
        <div v-if="isRunning" class="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse" aria-hidden="true"></div>
      </div>
    </header>

    <!-- Main content area -->
    <main class="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-8 px-2 sm:px-4">
      <!-- Camera preview (hidden from screen readers but available for sighted users) -->
      <div class="relative w-full max-w-sm sm:max-w-md mx-auto rounded-xl overflow-hidden shadow-2xl" aria-hidden="true">
        <video 
          ref="video" 
          class="w-full h-auto block bg-black aspect-[4/3]" 
          autoplay 
          playsinline
          muted
          aria-hidden="true"
        ></video>
        <div v-if="isRunning" class="absolute inset-0 pointer-events-none">
          <div class="absolute inset-0">
            <div class="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-green-400 to-transparent animate-pulse"></div>
          </div>
        </div>
      </div>

      <!-- Assistant output - main information area -->
      <section class="bg-white/15 rounded-xl p-4 sm:p-8 backdrop-blur-md border border-white/20" aria-live="polite" aria-label="Assistant responses">
        <h2 class="sr-only">Current Information</h2>
        <div class="relative">
          <p class="text-base sm:text-xl leading-relaxed min-h-[3rem] sm:min-h-[4rem] p-3 sm:p-4 bg-white/10 rounded-lg border-l-4 border-green-400" 
             :class="{ 'border-amber-400 bg-amber-400/10': audioSemaphore.isAcquired() }">
            {{ assistantOutput }}
          </p>
          <div v-if="audioSemaphore.isAcquired()" class="flex justify-center gap-1 mt-3 sm:mt-4" aria-hidden="true">
            <div class="w-1 h-4 sm:h-5 bg-amber-400 rounded animate-pulse" style="animation-delay: 0s"></div>
            <div class="w-1 h-4 sm:h-5 bg-amber-400 rounded animate-pulse" style="animation-delay: 0.2s"></div>
            <div class="w-1 h-4 sm:h-5 bg-amber-400 rounded animate-pulse" style="animation-delay: 0.4s"></div>
          </div>
        </div>
      </section>

      <!-- Main controls -->
      <section id="main-controls" class="flex flex-col gap-4 sm:gap-6" aria-label="Main controls">
        <h2 class="sr-only">Main Controls</h2>
        <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button 
            @click="startApp" 
            :disabled="isRunning"
            class="flex flex-col items-center gap-2 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold border-none rounded-xl cursor-pointer transition-all duration-300 w-full sm:min-w-[140px] sm:w-auto bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-amber-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
            :aria-label="isRunning ? 'Vision assistant is running' : 'Start vision assistant'"
            @focus="playButtonFeedback('Start vision assistant')"
          >
            <span class="text-xl sm:text-2xl" aria-hidden="true">👁️</span>
            <span>{{ isRunning ? 'Vision Active' : 'Start Vision' }}</span>
          </button>

          <button 
            @click="stopApp" 
            :disabled="!isRunning"
            class="flex flex-col items-center gap-2 px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold border-none rounded-xl cursor-pointer transition-all duration-300 w-full sm:min-w-[140px] sm:w-auto bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-amber-400 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:transform-none"
            :aria-label="!isRunning ? 'Vision assistant is stopped' : 'Stop vision assistant'"
            @focus="playButtonFeedback('Stop vision assistant')"
          >
            <span class="text-xl sm:text-2xl" aria-hidden="true">⏹️</span>
            <span>Stop Vision</span>
          </button>
        </div>
      </section>

      <!-- Quick actions -->
      <section class="mt-2 sm:mt-4" aria-label="Quick actions">
        <h2 class="sr-only">Quick Actions</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <button 
            @click="captureNow" 
            class="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            :disabled="!isRunning || audioSemaphore.isAcquired()"
            aria-label="Get immediate description of surroundings"
            @focus="playButtonFeedback('Describe now')"
          >
            <span class="text-lg sm:text-xl" aria-hidden="true">📸</span>
            <span>Describe Now</span>
          </button>

          <button 
            @click="repeatLastDescription" 
            class="flex flex-col items-center gap-2 p-3 sm:p-4 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none"
            :disabled="!lastDescription"
            aria-label="Repeat the last description"
            @focus="playButtonFeedback('Repeat last description')"
          >
            <span class="text-lg sm:text-xl" aria-hidden="true">🔄</span>
            <span>Repeat</span>
          </button>
        </div>
      </section>
    </main>

    <!-- Audio status indicator -->
    <div v-if="audioSemaphore.isAcquired()" class="fixed bottom-2 sm:bottom-4 right-2 sm:right-4 bg-black/80 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm z-10" aria-live="assertive" aria-atomic="true">
      <span class="sr-only">Speaking</span>
      <span>🔊 Speaking...</span>
    </div>

    <!-- Keyboard shortcuts help -->
    <div v-if="showKeyboardHelp" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div class="bg-gray-900 text-white p-4 sm:p-8 rounded-xl border-2 border-amber-400 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-400">Keyboard Shortcuts</h3>
        <ul class="space-y-2 sm:space-y-3">
          <li class="flex justify-between items-center py-1 sm:py-2 border-b border-white/10">
            <kbd class="bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm font-mono">Space</kbd>
            <span class="text-xs sm:text-sm">Start/Stop Vision</span>
          </li>
          <li class="flex justify-between items-center py-1 sm:py-2 border-b border-white/10">
            <kbd class="bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm font-mono">D</kbd>
            <span class="text-xs sm:text-sm">Describe Now</span>
          </li>
          <li class="flex justify-between items-center py-1 sm:py-2 border-b border-white/10">
            <kbd class="bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm font-mono">R</kbd>
            <span class="text-xs sm:text-sm">Repeat Last</span>
          </li>
          <li class="flex justify-between items-center py-1 sm:py-2">
            <kbd class="bg-gray-700 px-2 py-1 rounded text-xs sm:text-sm font-mono">?</kbd>
            <span class="text-xs sm:text-sm">Show/Hide Help</span>
          </li>
        </ul>
        <button 
          @click="showKeyboardHelp = false" 
          class="mt-4 sm:mt-6 w-full bg-amber-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-600 text-sm sm:text-base"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue';

const video = ref(null);
const assistantOutput = ref('Welcome to Vision Assistant. Your AI-powered companion for understanding your surroundings. Press Start Vision to begin continuous monitoring.');
const isRunning = ref(false);
const showKeyboardHelp = ref(false);
const isMobile = ref(true); // Default to mobile view
const cameraPermissionGranted = ref(false);
const showCameraPermissionModal = ref(false);
const permissionCheckAttempts = ref(0);
const isSecureContext = ref(window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost');
const lastDescription = ref('');

let stream = null;
let intervalId = null;
let permissionCheckInterval = null;

// Reactive semaphore system for audio synchronization
const audioSemaphore = reactive({
  isLocked: false,
  queue: [],
  
  async acquire() {
    return new Promise((resolve) => {
      if (!this.isLocked) {
        this.isLocked = true;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  },
  
  release() {
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      next();
    } else {
      this.isLocked = false;
    }
  },
  
  isAcquired() {
    return this.isLocked;
  },
  
  clear() {
    this.isLocked = false;
    this.queue = [];
  }
});

let currentAudio = null; // Track current audio element
let pendingOperations = []; // Queue for pending operations

// Computed property for status text
const statusText = computed(() => {
  if (audioSemaphore.isAcquired()) return 'Speaking...';
  if (isRunning.value) return 'Vision Active';
  return 'Ready';
});

const constraints = {
  video: {
    facingMode: { exact: 'environment' }, // Force rear camera
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }
};

async function startCamera() {
  // Check if we have camera permission first
  if (!cameraPermissionGranted.value) {
    assistantOutput.value = 'Camera permission is required. Please grant access first.';
    showCameraPermissionModal.value = true;
    return;
  }
  
  try {
    // Try rear camera first using our fallback-enabled function
    stream = await getUserMedia(constraints);
    if (video.value) {
      video.value.srcObject = stream;
    }
  } catch (error) {
    console.error('Error accessing rear camera:', error);
    
    // Fallback to any available camera if rear camera fails
    try {
      const fallbackConstraints = {
        video: {
          facingMode: 'environment', // Prefer rear but don't require
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };
      stream = await getUserMedia(fallbackConstraints);
      if (video.value) {
        video.value.srcObject = stream;
      }
      assistantOutput.value = 'Using available camera. For best results, use rear camera if available.';
    } catch (fallbackError) {
      console.error('Error accessing any camera:', fallbackError);
      
      // Check if it's a browser support issue
      if (fallbackError.message.includes('not supported')) {
        assistantOutput.value = 'Camera access is not supported in this browser. Please use a modern browser with HTTPS.';
        return;
      }
      
      assistantOutput.value = 'Error: Could not access the camera. Please grant permission and try again.';
      // Reset permission status and show modal again
      cameraPermissionGranted.value = false;
      showCameraPermissionModal.value = true;
    }
  }
}

function stopCamera() {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  if (video.value) {
    video.value.srcObject = null;
  }
  stream = null;
}

async function captureAndDescribe() {
  if (!video.value) return;
  
  // Wait for audio semaphore to be available
  await audioSemaphore.acquire();
  
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.value.videoWidth;
    canvas.height = video.value.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video.value, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL('image/jpeg').split(',')[1]; // Get base64 data

    assistantOutput.value = 'Analyzing surroundings...';

    const response = await fetch('/api/describe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image: imageData }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    assistantOutput.value = data.response;
    lastDescription.value = data.response;
    
    // Play audio while holding the semaphore
    await playAudioWithSemaphore(data.response);
    
  } catch (error) {
    console.error('Error describing surroundings:', error);
    const errorMessage = 'Sorry, I had trouble analyzing your surroundings. Please try again.';
    assistantOutput.value = errorMessage;
    
    // Play error message while holding the semaphore
    await playAudioWithSemaphore(errorMessage);
  } finally {
    // Always release the semaphore
    audioSemaphore.release();
  }
}

// New accessibility functions
async function captureNow() {
  if (!isRunning.value) {
    await playAudio('Please start the vision assistant first');
    return;
  }
  if (audioSemaphore.isAcquired()) {
    await playAudio('Please wait for current description to finish');
    return;
  }
  await captureAndDescribe();
}

async function repeatLastDescription() {
  if (!lastDescription.value) {
    await playAudio('No previous description to repeat');
    return;
  }
  assistantOutput.value = lastDescription.value;
  await playAudio(lastDescription.value);
}

async function playButtonFeedback(text) {
  // Only play feedback if not currently speaking
  if (!audioSemaphore.isAcquired()) {
    // Use a shorter, quieter feedback without blocking the semaphore
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 0.7;
    utterance.rate = 1.2;
    window.speechSynthesis.speak(utterance);
  }
}

async function startApp() {
  if (isRunning.value) return;
  
  // Try to request camera permission directly first
  if (!cameraPermissionGranted.value) {
    assistantOutput.value = 'Requesting camera permission...';
    
    try {
      // Try to get camera access directly
      const testStream = await getUserMedia({ video: true });
      testStream.getTracks().forEach(track => track.stop());
      cameraPermissionGranted.value = true;
      showCameraPermissionModal.value = false;
    } catch (error) {
      console.error('Camera permission error:', error);
      assistantOutput.value = 'Camera permission is required to start the Vision Assistant.';
      showCameraPermissionModal.value = true;
      await playAudio('Camera permission is required to start the Vision Assistant.');
      return;
    }
  }
  
  assistantOutput.value = 'Starting Vision Assistant...';
  await playAudio('Starting Vision Assistant');
  
  isRunning.value = true;
  await startCamera();
  
  // Only proceed if camera started successfully
  if (stream) {
    // Capture every 8 seconds, but will wait for audio to finish before next capture
    intervalId = setInterval(captureAndDescribe, 8000);
    
    // Take first capture after camera starts
    setTimeout(async () => {
      await playAudio('Vision Assistant is now active and monitoring your surroundings. Descriptions will be provided automatically.');
      setTimeout(captureAndDescribe, 1000);
    }, 2000);
  } else {
    isRunning.value = false;
    assistantOutput.value = 'Failed to start camera. Please check permissions and try again.';
  }
}

async function stopApp() {
  if (!isRunning.value) return;
  
  isRunning.value = false;
  stopCamera();
  
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  // Stop any current audio and clear the semaphore
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  
  // Clear the semaphore and pending operations
  audioSemaphore.clear();
  pendingOperations = [];
  
  assistantOutput.value = 'Vision Assistant stopped. Ready for your next command. Press Start Vision to resume monitoring.';
  await playAudio('Vision Assistant stopped. Ready for your next command.');
}

// Main audio function that acquires semaphore
async function playAudio(text) {
  if (!text) return;
  
  // Acquire semaphore before playing audio
  await audioSemaphore.acquire();
  
  try {
    await playAudioWithSemaphore(text);
  } finally {
    // Always release semaphore
    audioSemaphore.release();
  }
}

// Internal function that plays audio while semaphore is held
async function playAudioWithSemaphore(text) {
  if (!text) return;
  
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TTS API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.audioUrl) {
      const audio = new Audio(data.audioUrl);
      currentAudio = audio; // Track current audio
      
      // Create a promise that resolves when audio finishes playing
      await new Promise((resolve, reject) => {
        audio.onerror = (e) => {
          console.error('Audio playback error:', e);
          currentAudio = null;
          reject(e);
        };
        
        audio.onplay = () => {
          // Audio started playing
        };
        
        audio.onended = () => {
          currentAudio = null;
          resolve();
        };
        
        audio.onpause = () => {
          currentAudio = null;
          resolve();
        };
        
        audio.play().catch((e) => {
          currentAudio = null;
          reject(e);
        });
      });
      
    } else if (data._warning) {
      console.warn('TTS warning:', data._warning);
      // Use browser speech synthesis as fallback
      await useBrowserSpeechWithSemaphore(text);
    } else {
      console.error('No audio URL in TTS response:', data);
      await useBrowserSpeechWithSemaphore(text);
    }
  } catch (error) {
    console.error('Error in playAudio:', error);
    await useBrowserSpeechWithSemaphore(text);
  }
}

async function useBrowserSpeechWithSemaphore(text) {
  return new Promise((resolve) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = resolve;
      utterance.onerror = resolve;
      window.speechSynthesis.speak(utterance);
    } else {
      resolve();
    }
  });
}

// Mobile detection
function detectMobile() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
  const isSmallScreen = window.innerWidth <= 768;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileDevice || (isSmallScreen && isTouchDevice);
}

function forceMobileView() {
  isMobile.value = true;
  // Also check camera permission when forcing mobile view
  setTimeout(checkCameraPermission, 500);
}

// Check if modern media devices API is available
function isMediaDevicesSupported() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

// Get user media with fallback for older browsers
function getUserMedia(constraints) {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }
  
  // Fallback for older browsers
  const getUserMediaLegacy = navigator.getUserMedia || 
                            navigator.webkitGetUserMedia || 
                            navigator.mozGetUserMedia || 
                            navigator.msGetUserMedia;
  
  if (!getUserMediaLegacy) {
    return Promise.reject(new Error('getUserMedia is not supported in this browser'));
  }
  
  return new Promise((resolve, reject) => {
    getUserMediaLegacy.call(navigator, constraints, resolve, reject);
  });
}

async function requestCameraPermission() {
  try {
    assistantOutput.value = 'Requesting camera access...';
    
    // Request camera permission
    const stream = await getUserMedia({ video: true });
    
    // If successful, stop the stream and mark permission as granted
    stream.getTracks().forEach(track => track.stop());
    
    cameraPermissionGranted.value = true;
    showCameraPermissionModal.value = false;
    assistantOutput.value = 'Camera permission granted! You can now start the Vision Assistant.';
    
    await playAudio('Camera permission granted! You can now start the Vision Assistant.');
    
  } catch (error) {
    console.error('Camera permission denied:', error);
    
    let errorMessage = 'Camera permission was denied. ';
    
    if (error.name === 'NotAllowedError') {
      errorMessage += 'Please allow camera access in your browser settings and refresh the page.';
    } else if (error.name === 'NotFoundError') {
      errorMessage += 'No camera was found on this device.';
    } else if (error.name === 'NotSupportedError') {
      errorMessage += 'Camera access is not supported in this browser or requires HTTPS.';
    } else {
      errorMessage += 'Please check your camera settings and try again.';
    }
    
    assistantOutput.value = errorMessage;
    await playAudio(errorMessage);
  }
}

async function checkCameraPermission() {
  if (!isMediaDevicesSupported()) {
    assistantOutput.value = 'Camera access is not supported in this browser. Please use a modern browser with HTTPS.';
    return;
  }

  try {
    // Try to get camera permission status
    if (navigator.permissions) {
      const permission = await navigator.permissions.query({ name: 'camera' });
      
      if (permission.state === 'granted') {
        cameraPermissionGranted.value = true;
        showCameraPermissionModal.value = false;
      } else if (permission.state === 'denied') {
        showCameraPermissionModal.value = true;
        assistantOutput.value = 'Camera permission is required. Please grant access to use the Vision Assistant.';
      } else {
        // Permission state is 'prompt' - show modal to request permission
        showCameraPermissionModal.value = true;
      }
    } else {
      // Fallback: try to access camera directly
      try {
        const stream = await getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        cameraPermissionGranted.value = true;
        showCameraPermissionModal.value = false;
      } catch (error) {
        showCameraPermissionModal.value = true;
      }
    }
  } catch (error) {
    console.error('Error checking camera permission:', error);
    showCameraPermissionModal.value = true;
  }
}

// Keyboard navigation
function handleKeydown(event) {
  // Don't interfere if user is typing in an input
  if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
  
  switch (event.key.toLowerCase()) {
    case ' ':
      event.preventDefault();
      if (isRunning.value) {
        stopApp();
      } else {
        startApp();
      }
      break;
    case 'd':
      event.preventDefault();
      captureNow();
      break;
    case 'r':
      event.preventDefault();
      repeatLastDescription();
      break;
    case '?':
      event.preventDefault();
      showKeyboardHelp.value = !showKeyboardHelp.value;
      break;
    case 'escape':
      if (showKeyboardHelp.value) {
        showKeyboardHelp.value = false;
      }
      break;
  }
}

onMounted(() => {
  // Detect if mobile device
  isMobile.value = detectMobile();
  
  document.addEventListener('keydown', handleKeydown);
  
  // Add resize listener to re-detect mobile on window resize
  window.addEventListener('resize', () => {
    if (!isMobile.value) {
      isMobile.value = detectMobile();
    }
  });
  
  // Check camera permission on mount
  setTimeout(checkCameraPermission, 1000);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  
  // Stop camera stream
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }
  
  // Clear intervals
  if (intervalId) {
    clearInterval(intervalId);
  }
  if (permissionCheckInterval) {
    clearInterval(permissionCheckInterval);
  }
  
  // Stop any current audio
  if (currentAudio) {
    currentAudio.pause();
  }
  
  // Clear audio semaphore
  audioSemaphore.clear();
});
</script>