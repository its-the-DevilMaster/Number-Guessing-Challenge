const DIFFICULTIES = {
  easy: { label: "Easy", min: 1, max: 50, attempts: 10, basePoints: 100 },
  medium: { label: "Medium", min: 1, max: 100, attempts: 7, basePoints: 200 },
  hard: { label: "Hard", min: 1, max: 200, attempts: 5, basePoints: 350 },
};

// DOM Elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const resultScreen = document.getElementById("result-screen");

const difficultySelect = document.getElementById("difficulty-select");
const startBtn = document.getElementById("start-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const changeDiffBtn = document.getElementById("change-diff-btn");

const difficultyBadge = document.getElementById("difficulty-badge");
const bestScoreDisplay = document.getElementById("best-score-display");
const rangeInfo = document.getElementById("range-info");
const attemptsLeftEl = document.getElementById("attempts-left");
const attemptsUsedEl = document.getElementById("attempts-used");

const guessForm = document.getElementById("guess-form");
const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const feedbackMsg = document.getElementById("feedback-msg");
const guessHistoryEl = document.getElementById("guess-history");

const resultBanner = document.getElementById("result-banner");
const resultTitle = document.getElementById("result-title");
const resultSubtitle = document.getElementById("result-subtitle");
const secretNumberReveal = document.getElementById("secret-number-reveal");
const finalAttemptsUsed = document.getElementById("final-attempts-used");
const finalMaxAttempts = document.getElementById("final-max-attempts");
const finalScoreEl = document.getElementById("final-score");
const resultBestScoreEl = document.getElementById("result-best-score");

// Game State
let currentDifficultyKey = "medium";
let secretNumber = 0;
let maxAttempts = 7;
let attemptsLeft = 7;
let attemptsUsed = 0;
let bestScore = 0;
let isGameOver = false;

function showScreen(targetScreen) {
  [startScreen, gameScreen, resultScreen].forEach((screen) => {
    screen.classList.remove("active");
  });
  targetScreen.classList.add("active");
}

function generateSecretNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function setFeedback(message, type = "neutral") {
  feedbackMsg.textContent = message;
  feedbackMsg.className = `feedback ${type}`;
}

function calculateScore(won) {
  if (!won) return 0;
  const config = DIFFICULTIES[currentDifficultyKey];
  // Fewer attempts used -> higher score
  const remainingBonus = attemptsLeft * Math.round(config.basePoints * 0.2);
  return config.basePoints + remainingBonus;
}

function startNewGame(difficultyKey = currentDifficultyKey) {
  currentDifficultyKey = difficultyKey;
  const config = DIFFICULTIES[currentDifficultyKey];

  secretNumber = generateSecretNumber(config.min, config.max);
  maxAttempts = config.attempts;
  attemptsLeft = config.attempts;
  attemptsUsed = 0;
  isGameOver = false;

  difficultyBadge.textContent = config.label;
  bestScoreDisplay.textContent = `Best Score: ${bestScore}`;
  rangeInfo.innerHTML = `Guess a number between <strong>${config.min}</strong> and <strong>${config.max}</strong>.`;
  attemptsLeftEl.textContent = attemptsLeft;
  attemptsUsedEl.textContent = attemptsUsed;

  guessInput.min = config.min;
  guessInput.max = config.max;
  guessInput.value = "";
  guessInput.disabled = false;
  submitBtn.disabled = false;
  guessHistoryEl.innerHTML = "";

  setFeedback(`Enter a number between ${config.min} and ${config.max}.`, "neutral");
  showScreen(gameScreen);
  guessInput.focus();
}

function addGuessChip(guess, direction) {
  const li = document.createElement("li");
  li.className = `guess-chip ${direction}`;
  li.textContent = `${guess} (${direction === "low" ? "Low" : "High"})`;
  guessHistoryEl.prepend(li);
}

function endGame(won) {
  isGameOver = true;
  guessInput.disabled = true;
  submitBtn.disabled = true;

  const score = calculateScore(won);
  if (score > bestScore) {
    bestScore = score;
  }

  resultBanner.className = `result-banner ${won ? "win" : "lose"}`;
  if (won) {
    resultTitle.textContent = "Congratulations! You Won!";
    resultSubtitle.textContent = `You guessed the number in ${attemptsUsed} ${attemptsUsed === 1 ? "attempt" : "attempts"}.`;
  } else {
    resultTitle.textContent = "Game Over!";
    resultSubtitle.textContent = "You used all your attempts without finding the secret number.";
  }

  secretNumberReveal.textContent = secretNumber;
  finalAttemptsUsed.textContent = attemptsUsed;
  finalMaxAttempts.textContent = maxAttempts;
  finalScoreEl.textContent = score;
  resultBestScoreEl.textContent = bestScore;
  bestScoreDisplay.textContent = `Best Score: ${bestScore}`;

  setTimeout(() => {
    showScreen(resultScreen);
  }, 650);
}

function handleGuessSubmit(event) {
  event.preventDefault();
  if (isGameOver) return;

  const config = DIFFICULTIES[currentDifficultyKey];
  const rawValue = guessInput.value.trim();
  const guess = Number(rawValue);

  if (
    rawValue === "" ||
    !Number.isInteger(guess) ||
    guess < config.min ||
    guess > config.max
  ) {
    setFeedback(
      `Please enter a valid whole number between ${config.min} and ${config.max}.`,
      "error"
    );
    guessInput.focus();
    return;
  }

  attemptsUsed += 1;
  attemptsLeft -= 1;
  attemptsLeftEl.textContent = attemptsLeft;
  attemptsUsedEl.textContent = attemptsUsed;
  guessInput.value = "";

  if (guess === secretNumber) {
    setFeedback(`Correct! The secret number was ${secretNumber}.`, "success");
    endGame(true);
    return;
  }

  if (guess < secretNumber) {
    addGuessChip(guess, "low");
    if (attemptsLeft > 0) {
      setFeedback("Too Low! Try a Higher Number.", "hint");
    }
  } else {
    addGuessChip(guess, "high");
    if (attemptsLeft > 0) {
      setFeedback("Too High! Try a Lower Number.", "hint");
    }
  }

  if (attemptsLeft === 0) {
    setFeedback(`Out of attempts! The secret number was ${secretNumber}.`, "error");
    endGame(false);
  } else {
    guessInput.focus();
  }
}

// Event Listeners
startBtn.addEventListener("click", () => {
  startNewGame(difficultySelect.value);
});

guessForm.addEventListener("submit", handleGuessSubmit);

playAgainBtn.addEventListener("click", () => {
  startNewGame(currentDifficultyKey);
});

changeDiffBtn.addEventListener("click", () => {
  showScreen(startScreen);
});