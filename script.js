const playButton = document.getElementById('playButton');
const instructionsSection = document.getElementById('instructionsSection');
const gameSection = document.getElementById('gameSection');
const numbers = document.querySelectorAll('.number');
const die1 = document.getElementById('die1');
const die2 = document.getElementById('die2');
const rollButton = document.getElementById('rollButton');
const resetButton = document.getElementById('resetButton');
const modal = document.getElementById('sumModal');
const closeBtn = document.getElementsByClassName('close')[0];
const acceptBtn = document.getElementById('acceptSum');
const cancelBtn = document.getElementById('cancelSum');
const sumInput = document.getElementById('sumInput');
const diceSumText = document.getElementById('diceSum');

let currentSum = 0;
let selectedSum = 0;
let canRoll = true;

playButton.addEventListener('click', () => {
    instructionsSection.style.display = 'none';
    gameSection.style.display = 'block';
});

numbers.forEach(number => {
    number.addEventListener('click', () => {
        if (!number.classList.contains('closed') && !canRoll) {
            const value = parseInt(number.dataset.value);
            if (number.classList.contains('selected')) {
                number.classList.remove('selected');
                selectedSum -= value;
            } else {
                if (selectedSum + value > currentSum) {
                    alert(`¡Cuidado! La suma de las casillas seleccionadas no puede exceder ${currentSum}.`);
                } else {
                    number.classList.add('selected');
                    selectedSum += value;
                }
            }
            if (selectedSum === currentSum) {
                closeSelectedNumbers();
            }
        }
    });
});

function getRandomDieValue() {
    return Math.floor(Math.random() * 6) + 1;
}

function updateDieImage(dieElement, value) {
    dieElement.src = `dado${value}.PNG`;
    dieElement.alt = `Dado mostrando ${value}`;
}

function animateDice(callback) {
    const animationDuration = 1000; // 1 second
    const intervalDuration = 50; // 50 milliseconds between updates
    let elapsedTime = 0;

    die1.classList.add('shake');
    die2.classList.add('shake');

    const intervalId = setInterval(() => {
        updateDieImage(die1, getRandomDieValue());
        updateDieImage(die2, getRandomDieValue());

        elapsedTime += intervalDuration;

        if (elapsedTime >= animationDuration) {
            clearInterval(intervalId);
            die1.classList.remove('shake');
            die2.classList.remove('shake');
            callback();
        }
    }, intervalDuration);
}

function showSumModal(dice1Value, dice2Value) {
    diceSumText.textContent = `${dice1Value} + ${dice2Value} =`;
    sumInput.value = '';
    modal.style.display = 'block';
    sumInput.focus();
    sumInput.addEventListener('keydown', handleEnterKey);
}

function hideSumModal() {
    modal.style.display = 'none';
    sumInput.removeEventListener('keydown', handleEnterKey);
}

function showCorrectGif() {
    const gifElement = document.getElementById('correctGif');
    gifElement.style.display = 'block';
    setTimeout(() => {
        gifElement.style.display = 'none';
    }, 1000);
}

function showIncorrectGif() {
    const gifElement = document.getElementById('incorrectGif');
    gifElement.style.display = 'block';
    setTimeout(() => {
        gifElement.style.display = 'none';
        showSumModal(parseInt(die1.alt.split(' ').pop()), parseInt(die2.alt.split(' ').pop()));
    }, 1000);
}

function showGameOverModal() {
    const gameOverModal = document.getElementById('gameOverModal');
    gameOverModal.style.display = 'block';
}

function showVictoryModal() {
    const victoryModal = document.getElementById('victoryModal');
    victoryModal.style.display = 'block';
}

closeBtn.onclick = () => {
    if (confirm('¿Estás seguro de que quieres cerrar? Aún no has ingresado la suma correcta.')) {
        hideSumModal();
    }
};

cancelBtn.onclick = () => {
    if (confirm('¿Estás seguro de que quieres cancelar? Aún no has ingresado la suma correcta.')) {
        hideSumModal();
    }
};

window.onclick = function(event) {
    if (event.target == modal) {
        if (confirm('¿Estás seguro de que quieres cerrar? Aún no has ingresado la suma correcta.')) {
            hideSumModal();
        }
    }
}

function checkPossibleSum(targetSum, availableNumbers) {
    const numbers = Array.from(availableNumbers)
        .filter(num => !num.classList.contains('closed') && !num.classList.contains('selected'))
        .map(num => parseInt(num.dataset.value));

    if (numbers.length === 0) {
        setTimeout(() => {
            showVictoryModal();
        }, 1500);
        return false;
    }

    function findCombinations(array, target, max = 4) {
        const results = [];

        function backtrack(start, combination, sum) {
            if (sum === target && combination.length <= max) {
                results.push([...combination]);
                return;
            }
            if (sum > target || combination.length >= max || start >= array.length) {
                return;
            }

            for (let i = start; i < array.length; i++) {
                combination.push(array[i]);
                backtrack(i + 1, combination, sum + array[i]);
                combination.pop();
            }
        }

        backtrack(0, [], 0);
        return results;
    }

    const combinations = findCombinations(numbers, targetSum);
    return combinations.length > 0;
}

function closeSelectedNumbers() {
    numbers.forEach(number => {
        if (number.classList.contains('selected')) {
            number.classList.remove('selected');
            number.classList.add('closed');
        }
    });
    selectedSum = 0;
    canRoll = true;
    rollButton.disabled = false;
}

function handleSumSubmission() {
    const userSum = parseInt(sumInput.value);
    const correctSum = parseInt(die1.alt.split(' ').pop()) + parseInt(die2.alt.split(' ').pop());
    
    if (userSum === correctSum) {
        hideSumModal();
        showCorrectGif();
        currentSum = correctSum;
        selectedSum = 0;
        canRoll = false;
        rollButton.disabled = true;

        if (!checkPossibleSum(currentSum, numbers)) {
            setTimeout(() => {
                showGameOverModal();
            }, 1500);
        }
    } else {
        hideSumModal();
        showIncorrectGif();
    }
}

function handleEnterKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSumSubmission();
    }
}

acceptBtn.onclick = function() {
    handleSumSubmission();
}

function rollDice() {
    if (canRoll) {
        rollButton.disabled = true;
        resetButton.disabled = true;

        animateDice(() => {
            const roll1 = getRandomDieValue();
            const roll2 = getRandomDieValue();
            updateDieImage(die1, roll1);
            updateDieImage(die2, roll2);
            resetButton.disabled = false;
            
            showSumModal(roll1, roll2);
        });
    }
}

function resetGame() {
    numbers.forEach(number => {
        number.classList.remove('selected', 'closed');
    });
    updateDieImage(die1, 1);
    updateDieImage(die2, 1);
    currentSum = 0;
    selectedSum = 0;
    canRoll = true;
    rollButton.disabled = false;
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('victoryModal').style.display = 'none';
}

rollButton.addEventListener('click', rollDice);
resetButton.addEventListener('click', resetGame);
document.getElementById('gameOverReset').addEventListener('click', function() {
    document.getElementById('gameOverModal').style.display = 'none';
    resetGame();
});

document.getElementById('victoryReset').addEventListener('click', function() {
    document.getElementById('victoryModal').style.display = 'none';
    resetGame();
});
