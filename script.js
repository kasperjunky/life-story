// Version 3.2 - Fixing Insight 1 Intro, Practical Advice Formatting, & Ensuring Proper PDF Download

// 🟢 SECTION 1: Initialization & Global Variables
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
const practicalAdviceHeading = document.getElementById("practical-advice-heading");
const encouragingRewriteHeading = document.querySelector("#result-container h2:nth-of-type(2)");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure `questions.js` is loaded correctly
if (typeof questions === "undefined") {
    console.error("❌ Questions file not loaded! Check if `questions.js` is properly linked in `index.html`.");
}

// Hide elements initially
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";
encouragingRewriteHeading.style.display = "none";

// 🟢 SECTION 2: Fetch Insights from ChatGPT
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
                    storySummary: "Summarize the user's answers objectively, without encouragement or empowerment. The response **must always use second-person ('you', 'your')** instead of third-person ('the user', 'they'). Avoid generic phrases like 'experienced feelings again.' Start with: 'Based on your answers...' and ensure a neutral, factual summary.",
                    encouragingRewrite: "Rewrite the user's life story with a supportive, empowering tone. The response **must be in the second person ('you')** instead of third person ('this individual' or 'they'). Start with: 'Here's a new way to view your story in an empowering light: You navigate...' and ensure an uplifting but realistic tone.",
                    practicalAdvice: "Provide 3-5 specific, actionable steps the user can take to improve their life and perception of it. Advice must be truly practical (e.g., 'Call an old friend' instead of 'Embrace change'). The first sentence must NOT be a bullet point. Each bullet point should NOT contain both a number and a bullet."
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

// 🟢 SECTION 3: Display Questions
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

// 🟢 SECTION 4: Handle Answer Selection
function handleAnswer(selectedButton, selectedIndex) {
    document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
    selectedButton.classList.add("selected");
    selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
    nextButton.disabled = false;
}

// 🟢 SECTION 5: Move to Next Question
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions[currentLanguage].length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResults();
    }
});

// 🟢 SECTION 6: Show Results (Step-by-Step Insights)
async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";

    loadingContainer.style.display = "block";
    const insights = await getInsightsFromChatGPT(selectedAnswers, false, "Your Life Story");
    loadingContainer.style.display = "none";

    if (insights?.storySummary) {
        storySummary.textContent = insights.storySummary;
    }

    setTimeout(async () => {
        encouragingRewriteHeading.style.display = "block";
        loadingContainer.style.display = "block";
        const rewriteInsights = await getInsightsFromChatGPT(selectedAnswers, false, "Encouraging Rewrite");
        loadingContainer.style.display = "none";

        if (rewriteInsights?.encouragingRewrite) {
            encouragingRewrite.textContent = rewriteInsights.encouragingRewrite;
        }

        setTimeout(() => {
            downloadButton.style.display = "block";
        }, 500);
    }, 1500);
}

// 🟢 SECTION 7: Fetch Practical Advice & Fix Formatting
adviceButton.addEventListener("click", async () => {
    practicalAdvice.style.display = "block";
    practicalAdviceHeading.style.display = "block";
    adviceButton.style.display = "none";
    loadingContainer.style.display = "block";

    const insights = await getInsightsFromChatGPT(selectedAnswers, true, "Practical Advice");
    loadingContainer.style.display = "none";

    practicalAdvice.innerHTML = insights?.practicalAdvice?.slice(0, 5).map((advice, index) =>
        index === 0 
            ? `<strong>${advice.replace("This individual has", "You have")}</strong>` 
            : `<li>${advice.replace(/^(\d+\.\s*)/, "")}</li>` 
    ).join("");
});

// 🟢 SECTION 8: Ensure PDF Download Works
downloadButton.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Your Life Story", 10, 10);
    doc.text(storySummary.textContent, 10, 20);
    doc.save("life_story.pdf");
});

// 🟢 SECTION 9: Start Quiz on Page Load
document.addEventListener("DOMContentLoaded", displayQuestion);
