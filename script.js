const questions = {
  en: [
    {
      question: "What are your earliest memories of feeling safe and cared for?",
      options: [
        "I always felt safe and loved.",
        "I felt safe most of the time.",
        "I sometimes felt safe but often uncertain.",
        "I rarely felt safe or cared for.",
        "I never felt safe or cared for."
      ]
    },
    {
      question: "How did you feel about yourself as a teenager?",
      options: [
        "Confident and self-assured.",
        "Generally okay, with occasional self-doubt.",
        "Insecure and unsure of myself.",
        "I struggled with my self-worth.",
        "I avoided thinking about myself."
      ]
    }
  ],
  he: [
    {
      question: "מה הזכרונות הראשונים שלך מתחושת ביטחון ודאגה?",
      options: [
        "תמיד הרגשתי בטוח ואהוב.",
        "הרגשתי בטוח רוב הזמן.",
        "לפעמים הרגשתי בטוח אבל לעיתים קרובות לא.",
        "נדיר שהרגשתי בטוח או שמישהו דאג לי.",
        "מעולם לא הרגשתי בטוח או שמישהו דאג לי."
      ]
    },
    {
      question: "איך הרגשת לגבי עצמך כמתבגר?",
      options: [
        "בטוח בעצמי.",
        "בסדר גמור, עם מדי פעם ספק עצמי.",
        "לא בטוח בעצמי.",
        "נאבקתי בתחושת הערך העצמי שלי.",
        "נמנעתי מלחשוב על עצמי."
      ]
    }
  ]
};

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en"; // Default language

// DOM elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const languageToggle = document.getElementById("language-toggle");

// Display the current question
function displayQuestion() {
  const currentQuestion = questions[currentLanguage][currentQuestionIndex];
  questionText.textContent = currentQuestion.question;
  optionsContainer.innerHTML = "";

  // Disable the "Next" button initially
  nextButton.disabled = true;

  // Add options as buttons
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
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));

  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] =
    questions[currentLanguage][currentQuestionIndex].options[selectedIndex];
  nextButton.disabled = false;
}

// Move to the next question or show results
nextButton.addEventListener("click", () => {
  currentQuestionIndex++;

  if (currentQuestionIndex < questions[currentLanguage].length) {
    displayQuestion();
  } else {
    showResults();
  }
});

// Switch language
languageToggle.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggle.textContent = currentLanguage === "en" ? "He" : "En";
  document.body.style.direction = currentLanguage === "he" ? "rtl" : "ltr";
  selectedAnswers = [];
  currentQuestionIndex = 0;
  displayQuestion();
});

// Show results
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  storySummary.textContent = "Generating insights... Please wait.";

  const insights = await getInsightsFromChatGPT(selectedAnswers);
  storySummary.textContent = insights.storySummary;
  encouragingRewrite.textContent = insights.encouragingRewrite;
  practicalAdvice.innerHTML = insights.practicalAdvice
    .map((advice) => `<li>${advice}</li>`)
    .join("");
}

// Fetch insights
async function getInsightsFromChatGPT(answers) {
  try {
    const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: currentLanguage,
        answers: answers
      })
    });
    return response.json();
  } catch (error) {
    console.error("Network error:", error);
    return {
      storySummary: "Error generating story summary.",
      encouragingRewrite: "Error generating encouraging rewrite.",
      practicalAdvice: ["Error generating practical advice."]
    };
  }
}

// Initialize
displayQuestion();
