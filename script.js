// Clear previous cache or local storage
function clearCache() {
  console.log("Clearing cache...");
  localStorage.clear(); // Clears all local storage data
  sessionStorage.clear(); // Clears all session storage data
  console.log("Cache cleared.");
}

// Call clearCache on page load
clearCache();

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
    },
    {
      question: "How would you describe your relationships with your friends?",
      options: [
        "I have deep, meaningful friendships.",
        "I have some close friends, but not many.",
        "I have mostly casual friendships.",
        "I struggle to maintain friendships.",
        "I feel isolated and without close friends."
      ]
    },
    {
      question: "What do you feel you don’t have enough of in life?",
      options: [
        "Love and connection.",
        "Someone who truly cares for me.",
        "Confidence or self-esteem.",
        "Purpose or direction.",
        "Peace and emotional stability."
      ]
    },
    {
      question: "Do you feel comfortable with new experiences?",
      options: [
        "Yes, I love trying new things.",
        "I enjoy new experiences but need time to adjust.",
        "I feel hesitant but eventually try them.",
        "I avoid new experiences whenever possible.",
        "I’m fearful and rarely try new things."
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
    },
    {
      question: "איך היית מתאר את היחסים שלך עם החברים שלך?",
      options: [
        "יש לי חברויות עמוקות ומשמעותיות.",
        "יש לי כמה חברים קרובים, אבל לא רבים.",
        "יש לי בעיקר חברויות מזדמנות.",
        "אני מתקשה לשמור על חברויות.",
        "אני מרגיש מבודד וללא חברים קרובים."
      ]
    },
    {
      question: "מה לדעתך חסר לך בחיים?",
      options: [
        "אהבה וחיבור.",
        "מישהו שבאמת דואג לי.",
        "ביטחון עצמי או הערכה עצמית.",
        "מטרה או כיוון.",
        "שקט נפשי ויציבות רגשית."
      ]
    },
    {
      question: "האם אתה מרגיש בנוח עם חוויות חדשות?",
      options: [
        "כן, אני אוהב לנסות דברים חדשים.",
        "אני נהנה מחוויות חדשות אבל צריך זמן להסתגל.",
        "אני מרגיש היסוס אבל בסופו של דבר מנסה.",
        "אני נמנע מחוויות חדשות מתי שרק אפשר.",
        "אני חושש ולעיתים נדירות מנסה דברים חדשים."
      ]
    }
  ]
};


// Clear previous cache or local storage
function clearCache() {
  console.log("Clearing cache...");
  localStorage.clear(); // Clears all local storage data
  sessionStorage.clear(); // Clears all session storage data
  console.log("Cache cleared.");
}

// Call clearCache on page load
clearCache();

let currentQuestionIndex = 0;
let selectedAnswers = [];
let currentLanguage = "en";

// DOM elements
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

// Display the current question
function displayQuestion() {
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
  downloadButton.style.display = "block";
  adviceButton.style.display = "inline-block";

  storySummary.textContent =
    currentLanguage === "en"
      ? "Generating insights... Please wait."
      : "יוצר תובנות... אנא המתן.";

  const insights = await getInsightsFromChatGPT(selectedAnswers, false);

  storySummary.textContent = insights.storySummary
    ? insights.storySummary.replace(/this user|the user|they/g, "you")
    : currentLanguage === "en"
      ? "No summary available."
      : "אין סיכום זמין.";

  encouragingRewrite.textContent = insights.encouragingRewrite
    ? insights.encouragingRewrite.replace("This user", "You")
    : currentLanguage === "en"
      ? "No encouraging rewrite available."
      : "אין שכתוב מעודד זמין.";

  // Show the advice button only after generating results
  adviceButton.style.display = "inline-block";

  // Prepare content for PDF download
  const pdfContent = `${currentLanguage === "en" ? "Your Life Story:" : "סיפור חייך:"}
${storySummary.textContent}

${currentLanguage === "en" ? "Encouraging Rewrite:" : "שכתוב מעודד:"}
${encouragingRewrite.textContent}`;

  downloadButton.onclick = () => downloadAsPDF(pdfContent);
}

// Fetch insights from the backend
async function getInsightsFromChatGPT(answers, includeAdvice) {
  try {
    const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: currentLanguage,
        answers,
        includeAdvice
      })
    });

    return await response.json();
  } catch (error) {
    console.error("Network error:", error);
    return {
      storySummary: "Error generating story summary.",
      encouragingRewrite: "Error generating encouraging rewrite.",
      practicalAdvice: ["Error generating practical advice."]
    };
  }
}

// Handle practical advice button click
adviceButton.addEventListener("click", async () => {
  adviceButton.disabled = true;
  practicalAdvice.textContent =
    currentLanguage === "en"
      ? "Generating advice... Please wait."
      : "יוצר עצות... אנא המתן.";

  const insights = await getInsightsFromChatGPT(selectedAnswers, true);

  practicalAdvice.innerHTML = insights.practicalAdvice
    ? insights.practicalAdvice
        .map((advice) => `<li>${advice}</li>`)
        .join("")
    : currentLanguage === "en"
      ? "<li>No practical advice available.</li>"
      : "<li>אין עצות מעשיות זמינות.</li>";

  // Prepare updated PDF with practical advice
  const pdfContent = `${currentLanguage === "en" ? "Your Life Story:" : "סיפור חייך:"}
${storySummary.textContent}

${currentLanguage === "en" ? "Encouraging Rewrite:" : "שכתוב מעודד:"}
${encouragingRewrite.textContent}

${currentLanguage === "en" ? "Practical Advice:" : "עצות מעשיות:"}
${Array.from(practicalAdvice.querySelectorAll("li"))
  .map((li) => li.textContent)
  .join("\n")}`;

  downloadButton.onclick = () => downloadAsPDF(pdfContent);
});

// 📌 Function to Download as PDF (FIXED!)
function downloadAsPDF(content) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Format content for better PDF layout
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10); // Adjust text position
  doc.save("life_story.pdf");
}

// Initialize
displayQuestion();
// Update Encouraging Rewrite heading dynamically based on language
document.addEventListener("DOMContentLoaded", function () {
  const encouragingRewriteHeading = document.querySelector("#result-container h2:nth-of-type(2)");
  if (encouragingRewriteHeading) {
    encouragingRewriteHeading.textContent =
      currentLanguage === "en"
        ? "Let's look at your life story in a kind, empowering way—like your most beloved friends would."
        : "בוא נסתכל על סיפור חייך בצורה אוהבת ומעצימה—כמו שהחברים האהובים עליך היו רואים אותו.";
  }
});

