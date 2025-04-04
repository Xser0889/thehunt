// Correct passwords
const passwords = {
    password1: 'clover',
    password2: 'green bear',
    password3: '1983'
};

// Google Sheets Web App URL 
const GOOGLE_SHEETS_URL = 'https://script.google.com/macros/s/AKfycbzTsEdnS-aBXo8dT0morqDiYsItCr-S0Jv1p-272FGsL7chemr_ICrSc36ESNYyarhSXQ/exec';

// Check if user has already completed the challenge
function checkCompletion() {
    return localStorage.getItem('pizzaHuntCompleted') === 'true';
}

// Set user as completed
function setAsCompleted(username) {
    localStorage.setItem('pizzaHuntCompleted', 'true');
    localStorage.setItem('pizzaHuntUsername', username || 'Anonymous Player');
    localStorage.setItem('pizzaHuntCompletionTime', new Date().toLocaleString());
}

// Function to show only title and leaderboard for completed users
function showCompletedView() {
    // Hide the password inputs section
    const inputsContainer = document.querySelector('.space-y-4');
    const usernameContainer = document.querySelector('.mb-6');
    
    if (inputsContainer) inputsContainer.style.display = 'none';
    if (usernameContainer) usernameContainer.style.display = 'none';
    
    // Show a completed message
    const mainContainer = document.querySelector('.bg-white/80.p-8');
    if (mainContainer) {
        const completedMsg = document.createElement('div');
        completedMsg.className = 'text-center py-4 text-green-600 font-bold';
        completedMsg.textContent = `Challenge already completed by ${localStorage.getItem('pizzaHuntUsername')} on ${localStorage.getItem('pizzaHuntCompletionTime')}`;
        mainContainer.appendChild(completedMsg);
    }
}

// Get input and light elements
const inputs = {
    password1: document.getElementById('password1'),
    password2: document.getElementById('password2'),
    password3: document.getElementById('password3')
};

const lights = {
    password1: document.getElementById('light1'),
    password2: document.getElementById('light2'),
    password3: document.getElementById('light3')
};

const usernameInput = document.getElementById('username');
const winMessage = document.getElementById('winMessage');
const rewardMessage = document.getElementById('rewardMessage');
const winTimestamp = document.getElementById('winTimestamp');
const winUsername = document.getElementById('winUsername');
const confettiCanvas = document.getElementById('confettiCanvas');
const leaderboardToggle = document.getElementById('leaderboardToggle');
const leaderboardModal = document.getElementById('leaderboardModal');
const closeLeaderboard = document.getElementById('closeLeaderboard');
const refreshLeaderboard = document.getElementById('refreshLeaderboard');
const leaderboardLoading = document.getElementById('leaderboardLoading');
const leaderboardError = document.getElementById('leaderboardError');
const leaderboardContent = document.getElementById('leaderboardContent');
const leaderboardBody = document.getElementById('leaderboardBody');
const firstWinnerBanner = document.getElementById('firstWinnerBanner');
const firstWinnerName = document.getElementById('firstWinnerName');
const firstWinnerTime = document.getElementById('firstWinnerTime');

// Check if user has already completed the challenge when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (checkCompletion()) {
        showCompletedView();
    }
    
    // Fetch and display the first winner
    fetchFirstWinner();
});

// Track correct passwords
const correctPasswords = {
    password1: false,
    password2: false,
    password3: false
};

// Confetti setup
const confettiContext = confettiCanvas.getContext('2d');
const particles = [];
const particleCount = 100; 

function resizeCanvas() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Confetti particle
class Particle {
    constructor() {
        this.reset();
        this.y = Math.random() * confettiCanvas.height * 1.5 - confettiCanvas.height;
    }
    
    reset() {
        // Position
        this.x = Math.random() * confettiCanvas.width;
        this.y = -10 - Math.random() * 20; 
        
        // Size
        this.width = Math.random() * 8 + 3;
        this.height = Math.random() * 8 + 2;
        
        // Movement
        this.speed = Math.random() * 3 + 1; 
        this.vx = Math.random() * 1.5 - 0.75; 
        this.vy = this.speed; 
        
        // Swinging motion with randomness
        this.amplitude = Math.random() * 10 + 3;
        this.frequency = Math.random() * 0.02 + 0.01;
        this.swingOffset = Math.random() * Math.PI * 2; 
        
        // Rotation
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 1.5 - 0.75;
        
        // Appearance
        this.color = `hsl(${Math.random() * 360}, ${Math.random() * 40 + 60}%, ${Math.random() * 40 + 50}%)`;
        this.opacity = Math.random() * 0.4 + 0.4;
        this.fadeSpeed = Math.random() * 0.01 + 0.007;
        
        // Shape variation 
        this.shape = Math.random() > 0.3 ? 0 : 1;
        
        // Life counter 
        this.life = 0;
    }
    
    update() {
        this.life += 0.016; // Approximately 1/60 for 60fps
        
        // Vertical movement
        this.y += this.vy;
        
        // Horizontal movement with sine wave for swinging
        this.x += this.vx + Math.sin(this.life * this.frequency + this.swingOffset) * this.amplitude * 0.05;
        
        // Rotation
        this.rotation += this.rotationSpeed;
        
        // Gradual fade out
        if (this.y > confettiCanvas.height * 0.6) {
            this.opacity -= this.fadeSpeed;
        }
        
        // Reset
        if (this.y > confettiCanvas.height || 
            this.x < -50 || 
            this.x > confettiCanvas.width + 50 || 
            this.opacity <= 0) {
            if (confettiRunning) {
                this.reset();
            }
        }
    }
    
    draw() {
        confettiContext.save();
        confettiContext.translate(this.x, this.y);
        confettiContext.rotate(this.rotation * Math.PI / 180);
        confettiContext.globalAlpha = this.opacity;
        confettiContext.fillStyle = this.color;
        
        // Draw different shapes
        if (this.shape === 0) {
            // Rectangle
            confettiContext.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else {
            // Circle
            confettiContext.beginPath();
            confettiContext.arc(0, 0, this.width / 2, 0, Math.PI * 2);
            confettiContext.fill();
        }
        
        confettiContext.restore();
    }
}

function createParticles() {
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }
}

// Add new particles periodically for continuous flow
function addNewParticles() {
    if (!confettiRunning) return;
    
    // Add a small burst of new particles
    for (let i = 0; i < 3; i++) {
        particles.push(new Particle());
    }
    
    setTimeout(addNewParticles, 1500); // Add more every 1.5s
}

let confettiRunning = false;
let animationId;

function startConfetti() {
    confettiCanvas.classList.remove('hidden');
    confettiRunning = true;
    createParticles();
    animateConfetti();
    addNewParticles(); 
}

function animateConfetti() {
    if (!confettiRunning) return;
    
    confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    
    // Apply wind effect occasionally
    if (Math.random() < 0.003) {
        applyWindEffect();
    }
    
    for (let particle of particles) {
        particle.update();
        particle.draw();
    }
    
    // Check if all particles are gone
    const activeParticles = particles.filter(p => p.opacity > 0);
    if (activeParticles.length === 0 && !confettiRunning) {
        stopConfetti();
        return;
    }
    
    animationId = requestAnimationFrame(animateConfetti);
}

// Apply a gentle wind effect to all particles
function applyWindEffect() {
    const windStrength = (Math.random() - 0.5) * 0.2;
    particles.forEach(p => {
        p.vx += windStrength;
    });
}

function stopConfetti() {
    confettiRunning = false;
    // Let animation continue until particles fade away naturally
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        confettiContext.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiCanvas.classList.add('hidden');
        particles.length = 0; // Clear all particles
    }, 1000);
}

// Submit data to Google Sheets
async function submitToGoogleSheets(username, timestamp) {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                timestamp: timestamp
            })
        });
        
        console.log('Data submitted to Google Sheets');
        return true;
    } catch (error) {
        console.error('Error submitting data:', error);
        return false;
    }
}

// Update the openLeaderboard function:
function openLeaderboard() {
    // First make it visible but with 0 opacity
    leaderboardModal.style.display = 'flex';
    leaderboardModal.style.opacity = '0';
    
    // Get the leaderboard content element using the class
    const leaderboardContent = leaderboardModal.querySelector('.leaderboard-content');
    if (leaderboardContent) {
        leaderboardContent.style.transform = 'scale(0.8) translateY(-50px)';
        leaderboardContent.style.opacity = '0';
    }
    
    // Animate the background fade in
    setTimeout(() => {
        leaderboardModal.style.opacity = '1';
        
        // Then animate the content bouncing in
        if (leaderboardContent) {
            setTimeout(() => {
                leaderboardContent.style.transform = 'scale(1) translateY(0)';
                leaderboardContent.style.opacity = '1';
            }, 200);
        }
    }, 50);
}

// Update the closeLeaderboardWithAnimation function:
function closeLeaderboardWithAnimation() {
    // Get the leaderboard content element using the class
    const leaderboardContent = leaderboardModal.querySelector('.leaderboard-content');
    
    // First animate the content bouncing out
    if (leaderboardContent) {
        leaderboardContent.style.transform = 'scale(0.8) translateY(50px)';
        leaderboardContent.style.opacity = '0';
    }
    
    // Then fade out the background
    setTimeout(() => {
        leaderboardModal.style.opacity = '0';
        
        // Finally hide the modal
        setTimeout(() => {
            leaderboardModal.style.display = 'none';
            
            // Reset the transform for next opening
            if (leaderboardContent) {
                leaderboardContent.style.transform = 'scale(0.8) translateY(-50px)';
            }
        }, 300);
    }, 200);
}

// Fetch and display the first winner
async function fetchFirstWinner() {
    try {
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getLeaderboard`);
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
            // The first entry is the first winner (assuming data is sorted by timestamp)
            const firstWinner = data[0];
            
            // Display the first winner
            firstWinnerName.textContent = firstWinner.username;
            firstWinnerTime.textContent = firstWinner.timestamp;
            
            // Show the banner
            firstWinnerBanner.classList.remove('hidden');
            
            return true;
        } else {
            // No winners yet
            firstWinnerBanner.classList.add('hidden');
            return false;
        }
    } catch (error) {
        console.error('Error fetching first winner data:', error);
        firstWinnerBanner.classList.add('hidden');
        return false;
    }
}

// Fetch leaderboard data from Google Sheets
async function fetchLeaderboardData() {
    try {
        showLeaderboardLoading();
        
        const response = await fetch(`${GOOGLE_SHEETS_URL}?action=getLeaderboard`);
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
            displayLeaderboardData(data);
            
            // Also update the first winner banner
            if (data.length > 0) {
                const firstWinner = data[0];
                firstWinnerName.textContent = firstWinner.username;
                firstWinnerTime.textContent = firstWinner.timestamp;
                firstWinnerBanner.classList.remove('hidden');
            } else {
                firstWinnerBanner.classList.add('hidden');
            }
            
            return true;
        } else {
            showLeaderboardError();
            firstWinnerBanner.classList.add('hidden');
            return false;
        }
    } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        showLeaderboardError();
        firstWinnerBanner.classList.add('hidden');
        return false;
    }
}

// Display leaderboard data
function displayLeaderboardData(data) {
    leaderboardBody.innerHTML = '';
    
    if (data.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="3" class="p-4 text-center text-gray-500 border border-green-200">
                No entries yet. Be the first to solve the challenge!
            </td>
        `;
        leaderboardBody.appendChild(row);
    } else {
        
        data.forEach((entry, index) => {
            const row = document.createElement('tr');
            row.className = index % 2 === 0 ? 'bg-white' : 'bg-green-50';
            row.innerHTML = `
                <td class="p-2 border border-green-200">${index + 1}</td>
                <td class="p-2 border border-green-200">${entry.username}</td>
                <td class="p-2 border border-green-200">${entry.timestamp}</td>
            `;
            leaderboardBody.appendChild(row);
        });
    }
    
    // Show leaderboard content
    leaderboardLoading.classList.add('hidden');
    leaderboardError.classList.add('hidden');
    leaderboardContent.classList.remove('hidden');
}

// Show loading state
function showLeaderboardLoading() {
    leaderboardLoading.classList.remove('hidden');
    leaderboardError.classList.add('hidden');
    leaderboardContent.classList.add('hidden');
}

// Show error state
function showLeaderboardError() {
    leaderboardLoading.classList.add('hidden');
    leaderboardError.classList.remove('hidden');
    leaderboardContent.classList.add('hidden');
}

// Check passwords for each input
Object.keys(inputs).forEach(key => {
    inputs[key].addEventListener('change', function() {
        const inputValue = this.value.toLowerCase().trim();
        
        if (inputValue === passwords[key]) {
            this.classList.remove('border-gray-300', 'border-red-500');
            this.classList.add('border-green-500');
            this.classList.add('animate-bounce-small');
            setTimeout(() => {
                this.classList.remove('animate-bounce-small');
            }, 300);
            

            lights[key].classList.remove('bg-red-500');
            lights[key].classList.add('bg-green-500');
            
            correctPasswords[key] = true;
        } else {

            this.classList.remove('border-green-500');
            this.classList.add('border-red-500');
            this.classList.add('animate-shake');
            setTimeout(() => {
                this.classList.remove('animate-shake');
            }, 500);

            lights[key].classList.remove('bg-green-500');
            lights[key].classList.add('bg-red-500');
            
            correctPasswords[key] = false;
        }

        // Check if all passwords are correct
        if (Object.values(correctPasswords).every(val => val === true)) {
            // Get username
            const username = usernameInput.value.trim() || 'Anonymous Player';
            
            // Get current date and time
            const now = new Date();
            const formattedDateTime = now.toLocaleString('en-US', {
                //timeZone: 'America/Monterrey',
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit'
            });

            const nowdate = new Date();
            const formDateTime = nowdate.toLocaleString('en-US', {
                //timeZone: 'America/Monterrey',
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit'
            });

            // Set username and timestamp in the win message
            winTimestamp.textContent = formattedDateTime;
            winUsername.textContent = username;

            // Save completion status to localStorage
            setAsCompleted(username);

            // Submit data to Google Sheets
            submitToGoogleSheets(username, formDateTime);

            // Wait 1 second before showing win message and confetti
            setTimeout(() => {
                // Slight delay before showing win message after confetti starts
                setTimeout(() => {
                    winMessage.classList.remove('hidden');
                    startConfetti(); // Start confetti
                    
                    // Wait another 3 seconds before showing reward message
                    setTimeout(() => {
                        rewardMessage.style.transform = 'translateY(0)';
                        
                        // After submission, refresh the first winner banner
                        setTimeout(() => {
                            fetchFirstWinner();
                        }, 2000);
                    }, 3000);
                }, 500);
            }, 800);
        }
    });
});

// Close win message on click but keep confetti running
winMessage.addEventListener('click', function() {
    this.classList.add('hidden');
});

// Close reward message on click
rewardMessage.addEventListener('click', function() {
    this.style.transform = 'translateY(100%)';
});

// Leaderboard toggle button
leaderboardToggle.addEventListener('click', function() {
    // Use animation to open leaderboard
    openLeaderboard();
    fetchLeaderboardData(); // Load leaderboard data when opened
});

// Close leaderboard button
closeLeaderboard.addEventListener('click', function() {
    closeLeaderboardWithAnimation();
});

// Refresh leaderboard button
refreshLeaderboard.addEventListener('click', function() {
    fetchLeaderboardData();
});

// Close leaderboard when clicking outside the modal content
leaderboardModal.addEventListener('click', function(event) {
    if (event.target === this) {
        closeLeaderboardWithAnimation();
    }
});
