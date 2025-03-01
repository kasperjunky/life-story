// Version 4.6 Final – Now using GPT-3.5-Turbo-0125 & Ensuring Question Load

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

// Fetch insights from GPT-3.5-Turbo-0125
async function getInsightsFromChatGPT(answers, includeAdvice, insightType) {
  try {
    console.log(`📡 Fetching ${insightType} insights from GPT-3.5-Turbo-0125...`);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer YOUR_OPENAI_API_KEY`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo-0125",  // Explicitly using GPT-3.5-Turbo-0125
        messages: [
          { role: "system", content: "You are an AI assistant providing life story insights." },
          { role: "user", content: answers.join(" ") }
        ],
        temperature: 0.7
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
  if (insights?.choices?.[0]?.message?.content) {
    let summary = insights.choices[0].message.content;
    summary = summary.replace(/questionnaire answers provided/gi, "your answers")
                     .replace(/this user/gi, "you")
                     .replace(/the user/gi, "you")
                     .replace(/\byou's\b/gi, "you")
                     .replace(/you has/gi, "you have")
                     .trim();
    storySummary.textContent = summary;
  } else {
    storySummary.textContent = "No summary available.";
  }

  // Agent 2: Encouraging Rewrite
  setTimeout(async () => {
    encouragingRewriteHeading.style.display = "block";
    showLoading();
    const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
    hideLoading();
    if (rewriteInsights?.choices?.[0]?.message?.content) {
      let rewriteText = rewriteInsights.choices[0].message.content;
      rewriteText = rewriteText.replace(/^(Rewritten Life Story:|Reframed positively,)\s*/i, "").trim();
      encouragingRewrite.textContent = rewriteText;
    } else {
      encouragingRewrite.textContent = "No rewritten version available.";
    }
    setTimeout(() => {
      downloadButton.style.display = "block";
    }, 500);
  }, 1500);
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: Initialization on Page Load
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  if (typeof questions === "undefined") {
    console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html.");
    return;
  }
  displayQuestion();
});
