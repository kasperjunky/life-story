// Version 3.9 Final - Fully Optimized Code with Warm-Up and Organized Structure

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

// DOM Elements
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

// Warm-Up API Function (to be called on page load)
async function warmUpAPI() {
  try {
    // Replace with your actual keep-alive endpoint if available
    await fetch("https://interactive-backend.onrender.com/api/keepalive", { method: "GET" });
    console.log("API warmed up!");
  } catch (error) {
    console.error("API warm-up failed:", error);
  }
}

// Fetch insights from ChatGPT with specified prompt settings
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
          encouragingRewrite: "Rewrite the user's life story with a supportive, empowering tone. Use only second-person language. Begin with: 'Here's a new way to view your story in an empowering light: You navigate...' and provide an uplifting, realistic perspective.",
          practicalAdvice: "Provide 3-5 specific, actionable steps the user can take to improve their life and perception. The advice must be truly practical (e.g., 'Call an old friend' rather than vague suggestions). The first sentence must not be a bullet point."
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

// Download as PDF Function
function downloadAsPDF(content) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  doc.save("life_story.pdf");
}

// ─────────────────────────────────────────────────────────────
// SECTION 3: Core Logic Functions
// ─────────────────────────────────────────────────────────────

// Display current question
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

// Show results (fetch insights and display them step-by-step)
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Fetch "Your Life Story" Insight
  loadingContainer.style.display = "block";
  const insights = await getInsightsFromChatGPT(selectedAnswers, false, "Your Life Story");
  loadingContainer.style.display = "none";
  if (insights?.storySummary) {
    let summary = insights.storySummary;
    // Clean up summary: enforce second-person, remove duplicate prefixes, fix grammar.
    summary = summary.replace(/questionnaire answers provided/gi, "your answers")
                     .replace(/this user/gi, "you")
                     .replace(/the user/gi, "you")
                     .replace(/\byou's\b/gi, "you")
                     .replace(/you has/gi, "you have")
                     .trim();
    const desiredPrefix = "Based on your answers, you are a person who values";
    // Remove duplicate occurrences of desiredPrefix
    summary = summary.replace(new RegExp("^(?:" + desiredPrefix.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "\\s*)+", "i"), desiredPrefix + " ");
    storySummary.textContent = summary;
  } else {
    storySummary.textContent = currentLanguage === "en" ? "No summary available." : "אין סיכום זמין.";
  }

  // Fetch "Encouraging Rewrite" Insight
  setTimeout(async () => {
    encouragingRewriteHeading.style.display = "block";
    loadingContainer.style.display = "block";
    const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
    loadingContainer.style.display = "none";
    if (rewriteInsights?.encouragingRewrite) {
      let rewriteText = rewriteInsights.encouragingRewrite;
      // Remove unwanted introductory phrases and enforce second-person language
      rewriteText = rewriteText.replace(/^Reframing.*?light,?\s*/i, "");
      rewriteText = rewriteText.replace(/you is/gi, "you are")
                               .replace(/This user|The user/gi, "you")
                               .replace(/they/gi, "you");
      encouragingRewrite.textContent = rewriteText;
    } else {
      encouragingRewrite.textContent = currentLanguage === "en" ? "No rewritten version available." : "אין גרסה מחודשת זמינה.";
    }
    setTimeout(() => {
      downloadButton.style.display = "block";
    }, 500);
  }, 1500);
}

// Handle Practical Advice Button
adviceButton.addEventListener("click", async () => {
  practicalAdvice.style.display = "block";
  practicalAdviceHeading.style.display = "block";
  adviceButton.style.display = "none";
  loadingContainer.style.display = "block";
  const insights = await getInsightsFromChatGPT(selectedAnswers, true, "Practical Advice");
  loadingContainer.style.display = "none";
  if (insights?.practicalAdvice && insights.practicalAdvice.length > 0) {
    const adviceList = insights.practicalAdvice.slice(0, 5); // Limit to max 5 items
    const formattedAdvice = adviceList.map((advice, index) => {
      let processed = advice.replace(/This individual has/gi, "You have")
                            .replace(/the user/gi, "you")
                            .replace(/they/gi, "you")
                            .trim();
      if (index === 0) {
        // First item: no bullet/number; using inline style to remove bullet
        processed = processed.replace(/^[•\d\.\s]*/, "");
        return `<li style="list-style:none; padding-left:0;"><strong>${processed}</strong></li>`;
      } else {
        return `<li>${processed.replace(/^(\d+\.\s*)/, "").trim()}</li>`;
      }
    }).join("");
    practicalAdvice.innerHTML = formattedAdvice;
  } else {
    practicalAdvice.innerHTML = currentLanguage === "en" ? "<li>No practical advice available.</li>" : "<li>אין עצות מעשיות זמינות.</li>";
  }
  // Prepare PDF content including practical advice
  const pdfContent = `${currentLanguage === "en" ? "Your Life Story:" : "סיפור חייך:"}
${storySummary.textContent}

${currentLanguage === "en" ? "Encouraging Rewrite:" : "שכתוב מעודד:"}
${encouragingRewrite.textContent}

${currentLanguage === "en" ? "Practical Advice:" : "עצות מעשיות:"}
${Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n")}`;
  downloadButton.onclick = () => downloadAsPDF(pdfContent);
});

// ─────────────────────────────────────────────────────────────
// SECTION 4: Additional Utility Functions
// ─────────────────────────────────────────────────────────────

// Download as PDF
downloadButton.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const content = [
    "Your Life Story",
    storySummary.textContent,
    "",
    "Encouraging Rewrite",
    encouragingRewrite.textContent,
    "",
    "Practical Advice",
    Array.from(practicalAdvice.querySelectorAll("li")).map(li => li.textContent).join("\n")
  ].join("\n");
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  doc.save("life_story.pdf");
});

// Warm-Up API (to pre-warm the backend)
async function warmUpAPI() {
  try {
    await fetch("https://interactive-backend.onrender.com/api/keepalive", { method: "GET" });
    console.log("API warmed up!");
  } catch (error) {
    console.error("API warm-up failed:", error);
  }
}

// ─────────────────────────────────────────────────────────────
// SECTION 5: Initialization on Page Load
// ─────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  displayQuestion();
  warmUpAPI();
});
