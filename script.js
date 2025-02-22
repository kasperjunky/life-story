// Version 4.4 Final – Optimized Code with Loading Spinner & Divider Fix

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

// Warm-Up API Function (Optional: comment out if endpoint unavailable)
async function warmUpAPI() {
  try {
    // Comment out this call if your backend doesn't support /api/keepalive
    await fetch("https://interactive-backend.onrender.com/api/keepalive", { method: "GET" });
    console.log("API warmed up!");
  } catch (error) {
    console.error("API warm-up failed:", error);
  }
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
          encouragingRewrite: "Rewrite the user's life story in a supportive, empowering tone. Use only second-person language. Begin with: 'Here's an empowering way to view your story: ' followed by a detailed insight about your journey, personal growth, and resilience. Do not include any extraneous labels or headers like 'Rewritten Life Story:'.",
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
    const desiredPrefix = "Based on your answers, you are a person who values";
    summary = summary.replace(new RegExp("^(?:" + desiredPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\s*)+", "i"), desiredPrefix + " ");
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
      // Remove unwanted prefixes and fix pronouns
      rewriteText = rewriteText.replace(/^Reframed[^,]*,\s*/i, "")
                               .replace(/^Reframing.*?light,?\s*/i, "")
                               .replace(/you is/gi, "you are")
                               .replace(/This user|The user/gi, "you")
                               .replace(/they/gi, "you")
                               .trim();
      encouragingRewrite.textContent = rewriteText;
    } else {
      encouragingRewrite.textContent = currentLanguage === "en" ? "No rewritten version available." : "אין גרסה מחודשת זמינה.";
    }
    setTimeout(() => {
      downloadButton.style.display = "block";
    }, 500);
  }, 1500);

  // Agent 3: Practical Advice
  adviceButton.addEventListener("click", async () => {
    practicalAdvice.style.display = "block";
    practicalAdviceHeading.style.display = "block";
    adviceButton.style.display = "none";
    showLoading();
    const insights = await getInsightsFromChatGPT(selectedAnswers, true, "Practical Advice");
    hideLoading();
    if (insights?.practicalAdvice && insights.practicalAdvice.length > 0) {
      const adviceList = insights.practicalAdvice.slice(0, 5);
      const desiredIntro = "Here are a few practical ways to keep on empowering your inner story:";
      const formattedAdvice = adviceList.map((advice, index) => {
        let processed = advice.replace(/This individual has/gi, "You have")
                              .replace(/the user/gi, "you")
                              .replace(/they/gi, "you")
                              .trim();
        processed = processed.replace(/^To improve(?: their current state)?(?:,?\s*this user can take practical steps such as:)?\s*/i, "");
        if (index === 0) {
          if (!processed.toLowerCase().startsWith(desiredIntro.toLowerCase())) {
            processed = desiredIntro + "\n" + processed;
          }
          return `<li style="list-style:none; padding-left:0;"><strong>${processed}</strong></li>`;
        } else {
          return `<li>${processed.replace(/^(\d+\.\s*)/, "").trim()}</li>`;
        }
      }).join("");
      practicalAdvice.innerHTML = formattedAdvice;
    } else {
      practicalAdvice.innerHTML = currentLanguage === "en" ? "<li>No practical advice available.</li>" : "<li>אין עצות מעשיות זמינות.</li>";
    }
    downloadButton.onclick = () => generateStyledPDF();
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION 4: PDF Generation with Enhanced Styling
// ─────────────────────────────────────────────────────────────

function generateStyledPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(22);
  doc.setTextColor(0, 102, 204);
  doc.text("Your Life Story", 10, yPos);
  yPos += 6;

  // Horizontal line
  doc.setDrawColor(0, 102, 204);
  doc.line(10, yPos, 200, yPos);
  yPos += 10;

  // Section 1: Life Story Summary
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Life Story Summary:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  let lines = doc.splitTextToSize(storySummary.textContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });
  yPos += 10;

  // Section 2: Encouraging Rewrite
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Encouraging Rewrite:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  lines = doc.splitTextToSize(encouragingRewrite.textContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });
  yPos += 10;

  // Section 3: Practical Advice
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("Practical Advice:", 10, yPos);
  yPos += 8;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const adviceContent = Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n");
  lines = doc.splitTextToSize(adviceContent, 180);
  lines.forEach((line) => {
    yPos += 6;
    doc.text(line, 10, yPos);
  });

  doc.save("life_story.pdf");
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: Initialization on Page Load
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  displayQuestion();
  // Comment out warmUpAPI() if /api/keepalive is unavailable
  // warmUpAPI();
});

// Switch language logic
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
  document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
  selectedAnswers = [];
  currentQuestionIndex = 0;
  displayQuestion();
});
