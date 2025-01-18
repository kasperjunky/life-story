const questions = [
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
];

let currentQuestionIndex = 0;
const selectedAnswers = [];

// DOM elements
const questionText = document.getElementById("question-text");
const optionsContainer = document.getElementById("options-container");
const nextButton = document.getElementById("next-button");
const resultContainer = document.getElementById("result-container");
const storySummary = document.getElementById("story-summary");

// Display the current question
function displayQuestion() {
  console.log("Current Question Index inside displayQuestion:", currentQuestionIndex);
  const currentQuestion = questions[currentQuestionIndex];
  console.log("Current Question Data:", currentQuestion);

  // Update question text
  questionText.textContent = currentQuestion.question;
  console.log("Updated question text:", questionText.textContent);

  // Update options
  optionsContainer.innerHTML = ""; // Clear previous options
  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.classList.add("option-button");
    button.onclick = () => handleAnswer(button, index); // Handle selection
    optionsContainer.appendChild(button);
  });

  // Disable the "Next" button
  nextButton.disabled = true;
}

// Handle answer selection and enable the "Next" button
function handleAnswer(selectedButton, selectedIndex) {
  console.log("Answer selected:", selectedIndex, selectedButton.textContent);

  // Remove highlight from all buttons
  const allButtons = document.querySelectorAll(".option-button");
  allButtons.forEach((button) => button.classList.remove("selected"));

  // Highlight the chosen button
  selectedButton.classList.add("selected");

  // Save the selected answer
  selectedAnswers[currentQuestionIndex] = questions[currentQuestionIndex].options[selectedIndex];
  console.log("Selected Answers Array:", selectedAnswers);

  // Enable the "Next" button
  nextButton.disabled = false;
}

// Move to the next question or show results
nextButton.addEventListener("click", () => {
  console.log("Next button clicked");
  console.log("Current Question Index before increment:", currentQuestionIndex);

  currentQuestionIndex++;

  console.log("Current Question Index after increment:", currentQuestionIndex);

  if (currentQuestionIndex < questions.length) {
    console.log("Displaying the next question");
    displayQuestion();
  } else {
    console.log("No more questions. Showing results");
    showResults();
  }
});

// Function to get insights from ChatGPT
async function getInsightsFromChatGPT(answers) {
  const apiKey = "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"; // Replace with your actual OpenAI API key
  const endpoint = "https://api.openai.com/v1/chat/completions";

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that provides deep insights about personal stories based on user answers to a questionnaire.",
          },
          {
            role: "user",
            content: `Here are the answers to the questionnaire: ${answers.join(
              ", "
            )}. Please provide detailed insights about this user's life story.`,
          },
        ],
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return data.choices[0].message.content; // ChatGPT's response
    } else {
      console.error("OpenAI API Error:", data);
      return "Error: Unable to generate insights.";
    }
  } catch (error) {
    console.error("Network Error:", error);
    return "Network error occurred. Please check your connection.";
  }
}

// Show results with insights from ChatGPT
async function showResults() {
  questionText.style.display = "none";
  optionsContainer.style.display = "none";
  nextButton.style.display = "none";
  resultContainer.style.display = "block";

  // Show loading while fetching insights
  storySummary.textContent = "Generating insights... Please wait.";

  const insights = await getInsightsFromChatGPT(selectedAnswers);
  storySummary.textContent = `Here are your answers:\n${selectedAnswers.join(
    "\n"
  )}\n\nInsights:\n${insights}`;
}

// Initialize the first question
displayQuestion();
