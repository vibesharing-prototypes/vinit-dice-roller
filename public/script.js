// Dice faces configuration with proper dot positions
const diceFaces = {
    1: [{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }],
    2: [
        { top: '25%', left: '25%' },
        { bottom: '25%', right: '25%' }
    ],
    3: [
        { top: '25%', left: '25%' },
        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        { bottom: '25%', right: '25%' }
    ],
    4: [
        { top: '25%', left: '25%' },
        { top: '25%', right: '25%' },
        { bottom: '25%', left: '25%' },
        { bottom: '25%', right: '25%' }
    ],
    5: [
        { top: '25%', left: '25%' },
        { top: '25%', right: '25%' },
        { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        { bottom: '25%', left: '25%' },
        { bottom: '25%', right: '25%' }
    ],
    6: [
        { top: '25%', left: '25%' },
        { top: '50%', left: '25%', transform: 'translateY(-50%)' },
        { bottom: '25%', left: '25%' },
        { top: '25%', right: '25%' },
        { top: '50%', right: '25%', transform: 'translateY(-50%)' },
        { bottom: '25%', right: '25%' }
    ]
};

// Rotation angles for each face
const rotations = {
    1: 'rotateY(0deg) rotateX(0deg)',
    2: 'rotateY(180deg) rotateX(0deg)',
    3: 'rotateY(90deg) rotateX(0deg)',
    4: 'rotateY(-90deg) rotateX(0deg)',
    5: 'rotateX(-90deg) rotateY(0deg)',
    6: 'rotateX(90deg) rotateY(0deg)'
};

// Statistics tracker
let rollHistory = [];
let rollCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

// DOM elements
const dice = document.getElementById('dice');
const rollBtn = document.getElementById('rollBtn');
const result = document.getElementById('result');
const statsDiv = document.getElementById('stats');

// Initialize dice faces with dots
// Face order in HTML: front, back, right, left, top, bottom
// Maps to: 1, 6, 3, 4, 5, 2
function initializeDice() {
    const faces = document.querySelectorAll('.face');
    // CRITICAL: This mapping MUST match the rotations object
    // front (index 0) = 1, back (index 1) = 6, right (index 2) = 3
    // left (index 3) = 4, top (index 4) = 5, bottom (index 5) = 2
    const faceMapping = [1, 6, 3, 4, 5, 2];

    faces.forEach((face, index) => {
        const faceNumber = faceMapping[index];
        const dots = diceFaces[faceNumber];

        // Verify the face number is valid
        if (!dots || faceNumber < 1 || faceNumber > 6) {
            console.error(`Invalid face number: ${faceNumber} at index ${index}`);
            return;
        }

        dots.forEach(dotPos => {
            const dot = document.createElement('div');
            dot.className = 'dot';
            Object.assign(dot.style, dotPos);
            dot.style.position = 'absolute';
            face.appendChild(dot);
        });
    });
}

// Cryptographically secure random number generation
function getSecureRandomNumber() {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    // Map the random value to 1-6 range with proper bounds checking
    const value = (randomBuffer[0] % 6) + 1;

    // Validation: MUST be between 1 and 6 inclusive
    if (value < 1 || value > 6 || !Number.isInteger(value)) {
        console.error(`Invalid dice value generated: ${value}`);
        // Fallback - this should never happen but safety first
        return Math.floor(Math.random() * 6) + 1;
    }

    return value;
}

// Roll the dice with proper randomness
function rollDice() {
    // Disable button during animation
    rollBtn.disabled = true;
    result.textContent = 'Rolling...';

    // Add rolling animation
    dice.style.transition = 'transform 0.6s ease-out';
    dice.style.transform = `rotateX(${Math.random() * 360}deg) rotateY(${Math.random() * 360}deg)`;

    setTimeout(() => {
        // Generate truly random number using crypto API
        const diceValue = getSecureRandomNumber();

        // CRITICAL VALIDATION: Ensure dice value is valid before proceeding
        if (diceValue < 1 || diceValue > 6 || !Number.isInteger(diceValue)) {
            console.error(`CRITICAL ERROR: Invalid dice value: ${diceValue}`);
            result.textContent = 'Error: Invalid roll. Please try again.';
            rollBtn.disabled = false;
            return;
        }

        // Verify rotation exists for this value
        if (!rotations[diceValue]) {
            console.error(`CRITICAL ERROR: No rotation defined for value: ${diceValue}`);
            result.textContent = 'Error: Invalid roll. Please try again.';
            rollBtn.disabled = false;
            return;
        }

        // Update statistics - verify before incrementing
        if (rollCounts[diceValue] !== undefined) {
            rollCounts[diceValue]++;
        } else {
            console.error(`CRITICAL ERROR: No count tracker for value: ${diceValue}`);
            rollBtn.disabled = false;
            return;
        }

        rollHistory.push(diceValue);

        // Apply final rotation to show the result
        dice.style.transform = rotations[diceValue];

        // Display result with verification
        result.textContent = `You rolled: ${diceValue}`;

        // Verify rollHistory matches sum of rollCounts
        const historyTotal = rollHistory.length;
        const countsTotal = Object.values(rollCounts).reduce((sum, count) => sum + count, 0);
        if (historyTotal !== countsTotal) {
            console.error(`DATA INTEGRITY ERROR: History length (${historyTotal}) doesn't match counts total (${countsTotal})`);
        }

        // Update statistics display
        updateStats();

        // Re-enable button
        rollBtn.disabled = false;
    }, 600);
}

// Update statistics display with validation
function updateStats() {
    const totalRolls = rollHistory.length;

    if (totalRolls === 0) {
        statsDiv.innerHTML = '<p style="color: #999;">Roll the dice to see statistics</p>';
        return;
    }

    // Verify data integrity
    const countsTotal = Object.values(rollCounts).reduce((sum, count) => sum + count, 0);
    if (totalRolls !== countsTotal) {
        console.error(`STATS ERROR: History (${totalRolls}) ≠ Counts (${countsTotal})`);
    }

    let statsHTML = '';
    let verificationSum = 0;

    for (let i = 1; i <= 6; i++) {
        const count = rollCounts[i];

        // Validate count
        if (count === undefined || count < 0 || !Number.isInteger(count)) {
            console.error(`Invalid count for ${i}: ${count}`);
            continue;
        }

        verificationSum += count;
        const percentage = totalRolls > 0 ? ((count / totalRolls) * 100).toFixed(1) : '0.0';

        statsHTML += `
            <div class="stat-item">
                <div class="stat-number">${i}</div>
                <div>${count} (${percentage}%)</div>
            </div>
        `;
    }

    // Final verification
    if (verificationSum !== totalRolls) {
        console.error(`VERIFICATION FAILED: Sum (${verificationSum}) ≠ Total (${totalRolls})`);
        statsHTML += `<div style="grid-column: 1/-1; color: red; font-size: 0.8em;">Warning: Data mismatch detected</div>`;
    }

    statsDiv.innerHTML = statsHTML;
}

// Event listeners
rollBtn.addEventListener('click', rollDice);
dice.addEventListener('click', rollDice);

// Initialize on page load
initializeDice();
updateStats();
dice.style.transform = rotations[1];
