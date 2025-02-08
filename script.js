// Version 1.6 - Fixing Missing getInsightsFromChatGPT Function

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
const practicalAdviceHeading = document.querySelector("#result-container h2:nth-of-type(3)");
const languageToggle = document.getElementById("language-toggle");
const downloadButton = document.getElementById("download-pdf");
const adviceButton = document.getElementById("advice-button");
const loadingContainer = document.getElementById("loading-container");

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// Ensure questions.js is loaded
if (typeof questions === "undefined") {
  console.error("❌ Questions file not loaded! Check if questions.js is properly linked in index.html");
}

// Hide elements initially
downloadButton.style.display = "none";
practicalAdvice.style.display = "none";
practicalAdviceHeading.style.display = "none";

// 🟢 FUNCTION TO FETCH INSIGHTS FROM API
async function getInsightsFromChatGPT(answers, includeAdvice) {
    try {
        console.log("📡 Sending request to API with answers:", answers);

        const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: currentLanguage, answers, includeAdvice })
        });

        console.log("✅ API response received:", response);
        if (!response.ok) {
            throw new Error(`API Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("📜 Parsed JSON:", data);
        return data;
    } catch (error) {
        console.error("❌ Network error:", error);
        return { 
            storySummary: "⚠ Error generating story summary.", 
            encouragingRewrite: "⚠ No rewritten version available.", 
            practicalAdvice: [] 
        };
    }
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

// 🟢 FUNCTION TO HANDLE ANSWER SELECTION
function handleAnswer(selectedButton, selectedIndex) {
    document.querySelectorAll(".option-button").forEach(button => button.classList.remove("selected"));
    selectedButton.classList.add("selected");
    selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex]?.options[selectedIndex] || "";
    nextButton.disabled = false;
}

// 🟢 FUNCTION TO MOVE TO NEXT QUESTION OR SHOW RESULTS
nextButton.addEventListener("click", () => {
    if (currentQuestionIndex < questions[currentLanguage].length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        showResults();
    }
});

// 🟢 FUNCTION TO DISPLAY RESULTS & CONTROL PDF BUTTON
async function showResults() {
    questionText.style.display = "none";
    optionsContainer.style.display = "none";
    nextButton.style.display = "none";
    resultContainer.style.display = "block";
    adviceButton.style.display = "inline-block";
    downloadButton.style.display = "none";

    loadingContainer.style.display = "block";
    try {
        const insights = await getInsightsFromChatGPT(selectedAnswers, false);
        console.log("📜 Insights received:", insights);
        loadingContainer.style.display = "none";
        
        if (insights.storySummary) {
            storySummary.textContent = insights.storySummary;
        }
        if (insights.encouragingRewrite) {
            encouragingRewrite.textContent = insights.encouragingRewrite;
        }

        if (insights.storySummary && insights.encouragingRewrite) {
            setTimeout(() => {
                downloadButton.style.display = "block";
            }, 1000);
        }
    } catch (error) {
        console.error("❌ Error fetching insights:", error);
        loadingContainer.style.display = "none";
        storySummary.textContent = "⚠ Error fetching insights. Please try again.";
    }
}

// 🟢 FUNCTION TO FETCH & SHOW PRACTICAL ADVICE
adviceButton.addEventListener("click", async () => {
    console.log("🔵 'Give me advice' button clicked");
    practicalAdvice.textContent = "⏳ Fetching advice...";
    practicalAdvice.style.display = "block";
    practicalAdviceHeading.style.display = "block";

    const insights = await getInsightsFromChatGPT(selectedAnswers, true);
    practicalAdvice.innerHTML = insights.practicalAdvice && insights.practicalAdvice.length > 0
        ? insights.practicalAdvice.map(advice => `<li>${advice}</li>`).join("")
        : "<li>⚠ No practical advice available.</li>";
    
    adviceButton.style.display = "none";
});

// 🟢 INITIATE QUESTIONS ON PAGE LOAD
document.addEventListener("DOMContentLoaded", () => {
    if (typeof questions !== "undefined") {
        displayQuestion();
    } else {
        console.error("❌ Questions data is missing!");
    }
});
