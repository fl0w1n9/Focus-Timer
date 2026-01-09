// Update script.js

// --- CONFIGURATION (No changes) ---
const musicPlaylist = [
    { name: "Bach Flute Sonata Bmin 3 Presto", file: "Bach_Flute_Sonata_Bmin_3_Presto.ogg" },
    { name: "Bamboo Flute", file: "Bamboo_Flute.m4a" },
    { name: "Chinese Guqin", file: "Chinese_Guqin.m4a" },
    { name: "Chinese Tai Chi", file: "Chinese_Tai_Chi.m4a" },
    { name: "Chinese Zen", file: "Chinese_Zen.m4a" },
    { name: "Chuva da noite", file: "Chuva_da_noite.wav" },
    { name: "City Rain", file: "City_Rain.mp3" },
    { name: "Indian Raga", file: "Indian_Raga.m4a" },
    { name: "Indian Soulful Silence", file: "Indian_Soulful_Silence.mp4" },
    { name: "Japanese Bushido", file: "Japanese_Bushido.m4a" },
    { name: "Japanese Flute", file: "Japanese_Flute.m4a" },
    { name: "Japanese Ryujin", file: "Japanese_Ryujin.m4a" },
    { name: "Japanese Zen", file: "Japanese_Zen.m4a" },
    { name: "Light Rain Distant Thunder", file: "Light_Rain_Distant_Thunder.wav" },
    { name: "Luminous Rain", file: "Luminous_Rain.mp3" },
    { name: "Rain Song Laura Sheeran", file: "Rain_Song_Laura_Sheeran.ogg" },
    { name: "Rain thunder and birds", file: "Rain_thunder_and_birds.ogg" },
    { name: "Rainy Spring Night", file: "Rainy_Spring_Night.ogg" },
    { name: "Sappheiros Rain", file: "Sappheiros_Rain.opus" },
    { name: "The Rain Song", file: "The_Rain_Song.ogg" },
    { name: "The Rain Song 2", file: "The_Rain_Song_2.ogg"}
];

const videoBackgrounds = [
    { desktop: "v1.mp4", mobile: "v1_m.mp4" },
    { desktop: "v2.mp4", mobile: "v2_m.mp4" },
    { desktop: "v3.mp4", mobile: "v3_m.mp4" },
    { desktop: "v4.mp4", mobile: "v4_m.mp4" },
    { desktop: "v5.mp4", mobile: "v5_m.mp4" },
    { desktop: "v6.mp4", mobile: "v6_m.mp4" }
];
const fontList = [
    "TimerFont",
    "ColdaysMemories",
    "Awesome",
    "Harukaze",
    "Hobbiton",
    "Horrible",
    "Kashima",
    "Kelly",
    "Ragnar",
    "Tokyo",
    "Transine"
];

// --- STATE ---
let currentFontIndex = 0;
let currentMusicIndex = 0;
let currentBgIndex = 0;
let isPlaying = false;
let timerId = null;
let selectedDuration = 25; // Default duration in minutes
let timeLeft = selectedDuration * 60;

// --- ELEMENTS ---
const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const trackNameDisplay = document.getElementById('currentTrackName');
const musicList = document.getElementById('musicList');
const musicSelector = document.getElementById('musicSelectorContainer');
const timerDisplay = document.getElementById('timer');
const statusDisplay = document.getElementById('status');
const durationButtons = document.querySelectorAll('.timer-duration-selector button');

// --- INITIALIZATION ---
function init() {
    renderMusicList();
    loadMusic(0, false);
    
    // 1. Target the first video player
    const initialVideo = document.getElementById('bgVideo1');
    const videoPath = getResponsiveVideoPath(0);

    // 2. Set the source
    initialVideo.src = videoPath;
    
    // 3. FORCE VISIBILITY (Crucial step!)
    initialVideo.classList.add('active'); 

    // 4. Debugging (Silent)
    // If it fails, it logs to Console (F12), but doesn't annoy the user
    initialVideo.onerror = () => {
        console.error("Media Error: Could not load video at", videoPath);
    };

    updateDisplay();
    
    // Set initial volume
    audioPlayer.volume = 0.5; 
}

// --- MUSIC LOGIC ---
function renderMusicList() {
    musicList.innerHTML = "";
    musicPlaylist.forEach((track, index) => {
        const div = document.createElement('div');
        div.className = `music-item ${index === currentMusicIndex ? 'active' : ''}`;
        div.innerText = track.name;
        div.onclick = () => loadMusic(index, true);
        musicList.appendChild(div);
    });
}

function loadMusic(index, autoPlay) {
    currentMusicIndex = index;
    audioPlayer.src = `assets/music/${musicPlaylist[index].file}`;
    trackNameDisplay.innerText = musicPlaylist[index].name;
    const items = document.querySelectorAll('.music-item');
    items.forEach((item, i) => {
        if (i === index) item.classList.add('active');
        else item.classList.remove('active');
    });
    if(items[index]) {
        items[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    if (autoPlay || isPlaying) {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerText = "⏸";
    }
}

function togglePlay(event) {
    event.stopPropagation();
    if (isPlaying) {
        audioPlayer.pause();
        playBtn.innerText = "▶";
        isPlaying = false;
    } else {
        audioPlayer.play();
        playBtn.innerText = "⏸";
        isPlaying = true;
    }
}

// --- VOLUME LOGIC ---
function setVolume(value) {
    const audio = document.getElementById('audioPlayer');
    audio.volume = value;
}

function changeTimerFont(direction) {
    // Update index (looping logic)
    currentFontIndex += direction;
    
    // Loop back to start if at end
    if (currentFontIndex >= fontList.length) currentFontIndex = 0;
    // Loop to end if at start
    if (currentFontIndex < 0) currentFontIndex = fontList.length - 1;

    // Apply the new font
    timerDisplay.style.fontFamily = fontList[currentFontIndex];
}

/// --- BACKGROUND LOGIC (Smooth Cross-fade) ---
function nextBackground() {
    // 1. Calculate the next index
    currentBgIndex = (currentBgIndex + 1) % videoBackgrounds.length;
    const nextVideoFile = screenCheck(currentBgIndex);

    // 2. Find which video player is currently active, and which is inactive
    const video1 = document.getElementById('bgVideo1');
    const video2 = document.getElementById('bgVideo2');
    
    let activeVideo, inactiveVideo;

    if (video1.classList.contains('active')) {
        activeVideo = video1;
        inactiveVideo = video2;
    } else {
        activeVideo = video2;
        inactiveVideo = video1;
    }

    // 3. Load the new source into the INACTIVE video
    inactiveVideo.src = nextVideoFile;
    
    // 4. Wait for the new video to be ready to play
    inactiveVideo.oncanplay = () => {
        // Start playing the new video (it's still invisible)
        inactiveVideo.play();

        // 5. Fade it in (add active), and Fade the old one out (remove active)
        inactiveVideo.classList.add('active');
        activeVideo.classList.remove('active');
        
        // Clean up the 'oncanplay' listener so it doesn't fire again unnecessarily
        inactiveVideo.oncanplay = null;
    };
}
// --- BACKGROUND LOGIC (Determines Screen Type) ---
function screenCheck(index) {
    const isMobile = window.innerWidth <= 768; // Check if mobile
    const videoObj = videoBackgrounds[index];
    
    // Return the correct path based on screen size
    if (isMobile) {
        return `assets/video/mobile/${videoObj.mobile}`;
    } else {
        return `assets/video/${videoObj.desktop}`;
    }
}

// --- MOBILE MENU LOGIC ---
function openMobileMenu() {
    if (window.innerWidth <= 768) {
        musicSelector.classList.remove('hidden-mobile');
        musicSelector.classList.add('mobile-active');
    }
}

function toggleMobileMenu() {
    musicSelector.classList.remove('mobile-active');
    musicSelector.classList.add('hidden-mobile');
}

// --- TIMER LOGIC ---
// Grab the button to change its text
const startBtn = document.getElementById('startBtn');
let sequenceTimeouts = []; // To track and cancel animations if needed
// New function to set timer duration
function setTimerDuration(minutes) {
    if (timerId !== null) {
        // Ask user if they want to reset the current timer
        if (!confirm("Timer is running. Do you want to reset it?")) {
            return;
        }
        clearInterval(timerId);
        timerId = null;
    }
    
    selectedDuration = minutes;
    timeLeft = selectedDuration * 60;
    statusDisplay.innerText = "Ready to focus?";
    updateDisplay();
    startBtn.innerText = "Start"; // Reset button text

    // Update active button style
    durationButtons.forEach(btn => {
        if (parseInt(btn.innerText) === minutes) {
            btn.classList.add('active-duration');
        } else {
            btn.classList.remove('active-duration');
        }
    });
}


function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timerDisplay.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// THE TOGGLE FUNCTION
function toggleTimer() {
    if (timerId === null) {
        // CASE: Timer is stopped, we need to start/resume it
        
        // Checks if this is a "Resume" or a fresh "Start"
        // Does button currently says "Resume"
        if (startBtn.innerText === "Resume") {
            resumeSequence(); // Run the "Break Over..."
        } else {
            statusDisplay.innerText = "Focus time..."; // Standard start text
        }
        // Timer is NOT running -> START it
        startTimerLogic();
        startBtn.innerText = "Pause"; // Change text to Pause
    } else {
        // Timer IS running -> PAUSE it
        clearInterval(timerId);
        timerId = null;
        // Clear any text animation that still might be running
        clearSequence();
        startBtn.innerText = "Resume"; // Change text to Resume
        statusDisplay.innerText = "A Short Break!";
        
        // Optional: Pause music when timer pauses
        if (isPlaying) {
            audioPlayer.pause();
            isPlaying = false;
            playBtn.innerText = "▶";
        }
    }
}
// Animation Sequence Function
function resumeSequence() {
    const status = document.getElementById('status');
    
    // Clear any old sequences first
    clearSequence();

    // Sequence Step 1: "Break Over..." (Immediate)
    status.innerText = "Break Over...";
    
    // Sequence Step 2: Fade out after 1.5 seconds
    let t1 = setTimeout(() => {
        status.classList.add('fade-out');
    }, 1500);

    // Sequence Step 3: Change text to "Now it's" and Fade In
    let t2 = setTimeout(() => {
        status.innerText = "Now it's";
        status.classList.remove('fade-out');
    }, 2000); // 1.5s + 0.5s fade time

    // Sequence Step 4: Fade out again
    let t3 = setTimeout(() => {
        status.classList.add('fade-out');
    }, 3500);

    // Sequence Step 5: Finally "Focus Time..."
    let t4 = setTimeout(() => {
        status.innerText = "Focus Time...";
        status.classList.remove('fade-out');
    }, 4000);

    // Store IDs to cancel them if user clicks Pause immediately
    sequenceTimeouts = [t1, t2, t3, t4];
}

function clearSequence() {
    sequenceTimeouts.forEach(id => clearTimeout(id));
    sequenceTimeouts = [];
    document.getElementById('status').classList.remove('fade-out');
}

// Internal function to handle the actual counting
function startTimerLogic() {
    // Auto-play music if not already playing
    if (!isPlaying) {
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerText = "⏸";
    }

    timerId = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft === 0) {
            // Time is up!
            clearInterval(timerId);
            timerId = null;
            clearSequence(); // Ensures no animation overwrite this
            statusDisplay.innerText = "Time for a break!";
            startBtn.innerText = "Start"; // Reset button for next round
            
            // Stop music
            audioPlayer.pause();
            isPlaying = false;
            playBtn.innerText = "▶";
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    // Reset to the selected duration, not always 25
    timeLeft = selectedDuration * 60;
    statusDisplay.innerText = "Ready to focus?";
    updateDisplay();
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.innerText = "▶"
    } // Stop music on reset
}

// Run init
init();