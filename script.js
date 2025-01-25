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
      question: "מה הזיכרונות המוקדמים ביותר שלך לתחושת ביטחון ודאגה?",
      options: [
        "תמיד הרגשתי בטוח ואהוב.",
        "הרגשתי בטוח רוב הזמן.",
        "לפעמים הרגשתי בטוח אך לעיתים קרובות לא.",
        "לעיתים רחוקות הרגשתי בטוח או שמישהו דאג לי.",
        "מעולם לא הרגשתי בטוח או שמישהו דאג לי."
      ]
    },
    {
      question: "איך הרגשת לגבי עצמך כמתבגר?",
      options: [
        "בטוח בעצמי.",
        "בדרך כלל בסדר עם ספקות מדי פעם.",
        "לא בטוח בעצמי.",
        "הרגשתי קושי בערך העצמי שלי.",
        "נמנעתי לחשוב על עצמי."
      ]
    },
    {
      question: "איך היית מתאר את היחסים שלך עם חבריך?",
      options: [
        "יש לי חברויות עמוקות ומשמעותיות.",
        "יש לי כמה חברים קרובים אבל לא רבים.",
        "יש לי בעיקר חברויות שטחיות.",
        "אני מתקשה לשמר חברויות.",
        "אני מרגיש מבודד וללא חברים קרובים."
      ]
    },
    {
      question: "מה לדעתך חסר לך בחיים?",
      options: [
        "אהבה וחיבור.",
        "מישהו שבאמת דואג לי.",
        "ביטחון עצמי.",
        "מטרה או כיוון.",
        "שלום ויציבות רגשית."
      ]
    },
    {
      question: "האם אתה מרגיש בנוח עם חוויות חדשות?",
      options: [
        "כן, אני אוהב לנסות דברים חדשים.",
        "אני נהנה מחוויות חדשות אך צריך זמן להתרגל.",
        "אני מהסס אך בסוף מנסה.",
        "אני נמנע מחוויות חדשות אם אפשר.",
        "אני חושש וכמעט אף פעם לא מנסה דברים חדשים."
      ]
    }
  ]
};

let currentLanguage = "en"; // Default language
let currentQuestionIndex = 0;
const selectedAnswers = [];

// DOM elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");
const encouragingRewrite = document.getElementById("encouraging-rewrite");
const practicalAdvice = document.getElementById("practical-advice");
const languageToggleButton = document.getElementById("language-toggle");

// Toggle language
languageToggleButton.addEventListener("click", () => {
  currentLanguage = currentLanguage === "en" ? "he" : "en";
  languageToggleButton.textContent = currentLanguage === "en" ? "He" : "En";
  currentQuestionIndex = 0;
  selectedAnswers.length = 0; // Reset answers
  displayQuestion(); // Restart with new language
});

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
    button.onclick = () => handleAnswer(button, index); // Handle selection
    optionsContainer.appendChild(button);
  });
}

// Handle answer selection and enable the "Next" button
function handleAnswer(selectedButton, selectedIndex) {
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));
  selectedButton.classList.add("selected");
  selectedAnswers[currentQuestionIndex] = questions[currentLanguage][currentQuestionIndex].options[selectedIndex];
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

// Function to fetch insights from the backend
async function getInsightsFromChatGPT(answers) {
  try {
    const response = await fetch("https://interactive-backend.onrender.com/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: currentLanguage === "en" 
              ? "You are a helpful assistant that provides detailed insights based on user answers."
              : "אתה עוזר שימושי שמספק תובנות מפורטות בהתבסס על תשובות המשתמש."
          },
          {
            role: "user",
            content: currentLanguage === "en" 
              ? `Here are the answers: ${answers.join(", ")}. Please provide a detailed summary of their life story, rewrite it in an encouraging tone, and suggest practical advice to improve their situation.`
              : `להלן התשובות: ${answers.join(", ")}. אנא ספק סיכום מפורט של סיפור חייהם, כתוב אותו מחדש בטון מעודד והצע עצות מעשיות לשיפור המצב.`
          }
        ],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.choices[0].message.content;
    } else {
      console.error("Backend API Error:", data.error);
      return "Error generating insights.";
    }
  } catch (error) {
    console.error("Network Error:", error);
    return "Network error occurred.";
  }
}

// Show results with insights from ChatGPT
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";
  storySummary.textContent = "Generating insights... Please wait.";
  encouragingRewrite.textContent = "";
  practicalAdvice.innerHTML = ""; // Clear previous advice

  const insights = await getInsightsFromChatGPT(selectedAnswers);

  // Parse insights into separate sections
  const [lifeStory, encouragingText, adviceText] = insights.split("\n\n").map((section) => section.trim());

  storySummary.textContent = lifeStory;
  encouragingRewrite.textContent = encouragingText;
  adviceText.split("\n").forEach((advice) => {
    const listItem = document.createElement("li");
    listItem.textContent = advice;
    practicalAdvice.appendChild(listItem);
  });
}

// Initialize the first question
displayQuestion();
