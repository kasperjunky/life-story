// Version 1 - Fixing Practical Advice Display

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
  console.error("❌ Questions file not loaded!");
}

function displayQuestion() {
    if (!questions[currentLanguage] || currentQuestionIndex >= questions[currentLanguage].length) {
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

function handleAnswer(selectedButton, selectedIndex) {
    document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
    selectedButton.classList.add("selected");
    selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex].options[selectedIndex];
    nextButton.disabled = false;
}

nextButton.addEventListener("click", () => {
    currentQuestionIndex++;
    displayQuestion();
});

languageToggle.addEventListener("click", () => {
    currentLanguage = currentLanguage === "en" ? "he" : "en";
    languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
    document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
    selectedAnswers = [];
    currentQuestionIndex = 0;
    displayQuestion();
});

async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";
    adviceButton.style.display = "inline-block";
    practicalAdvice.style.display = "none";

    console.log("⏳ Fetching insights...");
    try {
        const insights = await getInsightsFromChatGPT(selectedAnswers, false);
        console.log("📜 Insights received:", insights);

        storySummary.textContent = insights.storySummary || "⚠ No summary available.";
        encouragingRewrite.textContent = insights.encouragingRewrite && insights.encouragingRewrite.trim() !== ""
            ? insights.encouragingRewrite.replace(/This user|The user|They/g, "You")
            : "⚠ No rewritten version available.";

        console.log("✅ Insights displayed successfully.");
        downloadButton.style.display = "block";
    } catch (error) {
        console.error("❌ Error fetching insights:", error);
        storySummary.textContent = "⚠ Error fetching insights. Please try again.";
    }
}

adviceButton.addEventListener("click", async () => {
    console.log("🔵 'Give me advice' button clicked");
    practicalAdvice.style.display = "block";
    practicalAdvice.textContent = "⏳ Fetching advice...";
    const insights = await getInsightsFromChatGPT(selectedAnswers, true);
    practicalAdvice.innerHTML = insights.practicalAdvice && insights.practicalAdvice.length > 0
        ? insights.practicalAdvice.map(advice => `<li>${advice}</li>`).join("")
        : "<li>⚠ No practical advice available.</li>";
    console.log("✅ Advice displayed successfully.");
    adviceButton.style.display = "none";
});

displayQuestion();
