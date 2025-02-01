// Version 1 - Fixing Loading Animation and Insights Display

// Clear previous cache or local storage
function clearCache() {
  localStorage.clear();
  sessionStorage.clear();
}
clearCache();

const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html");
}

// 🟢 FUNCTION TO DISPLAY QUESTIONS
function displayQuestion() {
  if (!questions || !questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
    showResults();
    return;
  }

  const currentQuestion = questions[currentLanguage][currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";
  nextButton.disabled = true;

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.onclick = () => handleAnswer(button, index);
    optionsContainer.appendChild(button);
  });
}

// 🟢 HANDLING ANSWER SELECTION
function handleAnswer(selectedButton, selectedIndex) {
  document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
  nextButton.disabled = false;
}

// 🟢 MOVING TO THE NEXT QUESTION OR RESULTS PAGE
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions[currentLanguage].length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    showResults();
  }
});

// 🟢 SWITCHING LANGUAGE
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
  document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
  selectedAnswers = [];
  currentQuestionIndex = 0;
  displayQuestion();
});

// 🟢 FUNCTION TO DISPLAY RESULTS PAGE WITH LOADING ANIMATION
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Create loading animation if not already added
  let insightLoader = document.getElementById("insight-loader");
  if (!insightLoader) {
    insightLoader = document.createElement("div");
    insightLoader.id = "insight-loader";
    insightLoader.innerHTML = '<div class="spinner"></div><p>Generating insights, please wait...</p>';
    resultContainer.prepend(insightLoader);
  }
  insightLoader.style.display = "block";
  adviceButton.style.display = "none";
  downloadButton.style.display = "none";

  try {
    console.log("⏳ Fetching insights...");
    const insights = await getInsightsFromChatGPT(selectedAnswers, false);
    console.log("📜 Insights received:", insights);

    insightLoader.style.display = "none";

    storySummary.textContent = insights.storySummary || "⚠ No summary available.";
    encouragingRewrite.textContent = insights.encouragingRewrite && insights.encouragingRewrite.trim() !== ""
      ? insights.encouragingRewrite.replace(/This user|The user|They/g, "You")
      : "⚠ No rewritten version available.";

    console.log("✅ Insights displayed successfully.");
    downloadButton.style.display = "block";
    adviceButton.style.display = "inline-block";
  } catch (error) {
    console.error("❌ Error fetching insights:", error);
    insightLoader.style.display = "none";
    storySummary.textContent = "⚠ Error fetching insights. Please try again.";
  }
}

// 🟢 INITIATING FIRST QUESTION (AFTER QUESTIONS FILE LOADS)
document.addEventListener("DOMContentLoaded", () => {
  if (typeof questions !== "undefined") {
    displayQuestion();
  } else {
    console.error("❌ Questions data is missing!");
  }
});
