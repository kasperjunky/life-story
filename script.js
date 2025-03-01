// Version 4.5 Final – Fixes for Agent 2, Font Consistency, and API Warm-Up Removal

// ─────────────────────────────────────────────────────────────
// SECTION 1: Initialization & Global Variables
// ─────────────────────────────────────────────────────────────

function clearCache() {
  localStorage.clear();
  sessionStorage.clear();
  console.log("Cache cleared.");
}
clearCache();

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// DOM Element References
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const practicalAdviceHeading = document.getElementById("practical-advice-heading");
const encouragingRewriteHeading = document.querySelector("#result-container h2:nth-of-type(2)");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

// Check if questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html.");
}

// Initially hide certain elements
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";
encouragingRewriteHeading.style.display = "none";

// ─────────────────────────────────────────────────────────────
// SECTION 2: Utility Functions
// ─────────────────────────────────────────────────────────────

// Functions to show/hide loading spinner
function showLoading() {
  loadingContainer.style.display = "block";
  loadingContainer.innerHTML = '<div class="loading-spinner"></div>';
}

function hideLoading() {
  loadingContainer.style.display = "none";
  loadingContainer.innerHTML = "";
}

// Fetch insights from ChatGPT with specified prompts
async function getInsightsFromChatGPT(answers, includeAdvice, insightType) {
  try {
    console.log(`📡 Fetching ${insightType} insights...`);
    const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: currentLanguage,
        answers,
        includeAdvice,
        prompts: {
          storySummary: "Summarize the user's answers objectively without added encouragement. Use only second-person language. The response must start exactly with: 'Based on your answers, you are a person who values' followed by a clear, factual summary.",
          encouragingRewrite: "Rewrite the user's life story in a supportive, empowering tone. Use only second-person language. Begin with: 'Here's an empowering way to view your story: ' followed by a detailed insight about your journey, personal growth, and resilience. **Do not include any extraneous labels or headers like 'Rewritten Life Story:' or 'Reframed positively:'.**",
          practicalAdvice: "Provide 3-5 specific, actionable steps that are concrete and easy to implement to empower your inner story. The response must begin exactly with: 'Here are a few practical ways to keep on empowering your inner story:' followed by the steps. Each step should include a specific example (e.g., 'Meditate for 1 minute every day by setting a timer on your phone and focusing on your breath.'). Use only second-person language and avoid extraneous introductory phrases."
        }
      })
    });
    console.log(`✅ ${insightType} insights received.`);
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${insightType}:`, error);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: Core Logic Functions (Quiz Flow & Insights)
// ─────────────────────────────────────────────────────────────

// Display the current question
function displayQuestion() {
  if (!questions || !questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
    console.error("❌ No questions available for the selected language!");
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

// Handle answer selection
function handleAnswer(selectedButton, selectedIndex) {
  document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
  nextButton.disabled = false;
}

// Move to next question or show results
nextButton.addEventListener("click", () => {
  if (currentQuestionIndex < questions[currentLanguage].length - 1) {
    currentQuestionIndex++;
    displayQuestion();
  } else {
    showResults();
  }
});

// Show final results (fetch insights from all agents)
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Agent 1: Your Life Story
  showLoading();
  const insights = await getInsightsFromChatGPT(selectedAnswers, false, "Your Life Story");
  hideLoading();
  if (insights?.storySummary) {
    let summary = insights.storySummary;
    summary = summary.replace(/questionnaire answers provided/gi, "your answers")
                     .replace(/this user/gi, "you")
                     .replace(/the user/gi, "you")
                     .replace(/\byou's\b/gi, "you")
                     .replace(/you has/gi, "you have")
                     .trim();
    storySummary.textContent = summary;
  } else {
    storySummary.textContent = currentLanguage === "en" ? "No summary available." : "אין סיכום זמין.";
  }

  // Agent 2: Encouraging Rewrite
  setTimeout(async () => {
    encouragingRewriteHeading.style.display = "block";
    showLoading();
    const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
    hideLoading();
    if (rewriteInsights?.encouragingRewrite) {
      let rewriteText = rewriteInsights.encouragingRewrite;
      rewriteText = rewriteText.replace(/^(Rewritten Life Story:|Reframed positively,)\s*/i, "").trim();
      encouragingRewrite.textContent = rewriteText;
    } else {
      encouragingRewrite.textContent = currentLanguage === "en" ? "No rewritten version available." : "אין גרסה מחודשת זמינה.";
    }
    setTimeout(() => {
      downloadButton.style.display = "block";
    }, 500);
  }, 1500);
});
