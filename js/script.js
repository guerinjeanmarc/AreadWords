let gameData;
let currentLanguage = 'french'; // Default language
let currentWord;
let correctAnswers = 0;
let remainingSquares = [0, 1, 2, 3, 4, 5, 6, 7, 8];
let hasFailed = false;
let learnedItems = new Set();
let currentRewardImage;

const restartTexts = {
    'french': 'Rejouer',
    'english': 'Restart',
    'french+english': 'Rejouer / Restart'
};

// Fetch game data
fetch('game_data.json')
  .then(response => response.json())
  .then(data => {
    gameData = data;
    initializeGame();
  });

function initializeGame() {
  initializeCoverGrid();
  setupLanguageSelector();
  changeLanguage(currentLanguage);
  selectRewardImage();
  updateRestartButton();
  newRound();
  document.getElementById('restart-button').addEventListener('click', restartGame);
}

function selectRewardImage() {
    currentRewardImage = gameData.rewardImages[Math.floor(Math.random() * gameData.rewardImages.length)];
    const gameImage = document.getElementById('game-image');
    gameImage.src = currentRewardImage;
    gameImage.style.filter = 'grayscale(100%)';
  }

function changeLanguage(lang) {
    currentLanguage = lang;
    updateRestartButton();
    updateLearnedItemsTitle();
    newRound();
}

function setupLanguageSelector() {
  const selector = document.getElementById('language-selector');
  selector.addEventListener('change', (event) => {
    currentLanguage = event.target.value;
    updateRestartButton();
    newRound();
  });
}

function updateRestartButton() {
    const restartButton = document.getElementById('restart-button');
    restartButton.textContent = restartTexts[currentLanguage];
}

function getRandomWord() {
  return gameData.words[Math.floor(Math.random() * gameData.words.length)];
}

function generateOptions(correct) {
    let options = [correct];
    while (options.length < 3) {
      let option = getRandomWord();
      if (!options.find(o => o.id === option.id)) {
        options.push(option);
      }
    }
    return options.sort(() => Math.random() - 0.5);
}

function newRound() {
    currentWord = getRandomWord();
    const wordToGuess = document.getElementById('word-to-guess');
    
    if (currentLanguage === 'french+english') {
      wordToGuess.textContent = `${currentWord.french} / ${currentWord.english}`;
    } else {
      wordToGuess.textContent = currentWord[currentLanguage];
    }
  
    hasFailed = false;
  
    const options = generateOptions(currentWord);
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    options.forEach(option => {
      const button = document.createElement('button');
      const img = document.createElement('img');
      img.src = option.image;
      img.alt = option[currentLanguage];
      img.style.width = '100px';
      img.style.height = '100px';
      button.appendChild(img);
      button.onclick = () => checkAnswer(option);
      optionsContainer.appendChild(button);
    });
    document.getElementById('language-selector').style.display = 'none';
    document.getElementById('restart-container').style.display = 'none';
  }
  
function checkAnswer(selectedOption) {
    const button = event.target.closest('button');
    if (selectedOption.id === currentWord.id) {
      document.body.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
      correctAnswers++;
      updateImage();
      if (hasFailed) {
        addLearnedItem();
      }
      setTimeout(() => {
        if (correctAnswers < 9) {
          document.body.style.backgroundColor = '#f0f0f0';
          newRound();
        } else {
            endGame();
        }
      }, 1000);
    } else {
      document.body.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
      button.disabled = true;
      hasFailed = true;
      setTimeout(() => {
        document.body.style.backgroundColor = '#f0f0f0';
      }, 1000);
    }
  }

function endGame() {
    const gameImage = document.getElementById('game-image');
    gameImage.style.filter = 'grayscale(0%)';
    document.getElementById('restart-container').style.display = 'flex';
    document.getElementById('options').innerHTML = ''; // Vide les options
    document.getElementById('word-to-guess').textContent = 'Bravo Anatole !'; // Ou un message approprié
  }

function updateImage() {
  //const gameImage = document.getElementById('game-image');
  const coverSquares = document.querySelectorAll('.cover-square');
  const restartButton = document.getElementById('restart-button');
  
  if (remainingSquares.length > 0) {
    const randomIndex = Math.floor(Math.random() * remainingSquares.length);
    const squareToRemove = remainingSquares.splice(randomIndex, 1)[0];
    coverSquares[squareToRemove].style.opacity = '0';
  }
  
  if (correctAnswers === 9) {
   gameImage.style.filter = 'grayscale(0%)';
   document.getElementById('restart-container').style.display = 'flex';
    //restartButton.style.display = 'block';
  }
}

function addLearnedItem() {
    if (!learnedItems.has(currentWord.id)) {
        learnedItems.add(currentWord.id);
        const learnedItemsDiv = document.getElementById('learned-items');
        const itemPair = document.createElement('div');
        
        if (currentLanguage === 'french+english') {
            itemPair.textContent = `${currentWord.french} / ${currentWord.english}`;
        } else {
            itemPair.textContent = currentWord[currentLanguage];
        }
        
        const itemImage = document.createElement('img');
        itemImage.src = currentWord.image;
        itemImage.alt = currentWord[currentLanguage];
        itemImage.style.width = '50px';
        itemImage.style.height = '50px';
        itemPair.prepend(itemImage);
        learnedItemsDiv.appendChild(itemPair);
    }
}

function updateLearnedItemsTitle() {
    const titleElement = document.querySelector('#memory-column h3');
    if (currentLanguage === 'french') {
        titleElement.textContent = 'Mots à réviser';
    } else if (currentLanguage === 'english') {
        titleElement.textContent = 'Words to review';
    } else {
        titleElement.textContent = 'Mots à réviser / Words to review';
    }
}

function initializeCoverGrid() {
    const coverGrid = document.getElementById('cover-grid');
    for (let i = 0; i < 9; i++) {
        const square = document.createElement('div');
        square.className = 'cover-square';
        coverGrid.appendChild(square);
    }
}

function restartGame() {
    correctAnswers = 0;
    remainingSquares = [0, 1, 2, 3, 4, 5, 6, 7, 8];
    learnedItems.clear();
    hasFailed = false;
    
    const gameImage = document.getElementById('game-image');
    gameImage.style.filter = 'grayscale(100%)';
    
    const coverSquares = document.querySelectorAll('.cover-square');
    coverSquares.forEach(square => square.style.opacity = '1');
    
    const learnedItemsDiv = document.getElementById('learned-items');
    learnedItemsDiv.innerHTML = '';
    
    document.getElementById('restart-container').style.display = 'none';
    document.body.style.backgroundColor = '#f0f0f0';

    selectRewardImage();
    newRound();
}

initializeCoverGrid();
newRound();

document.getElementById('restart-button').addEventListener('click', restartGame);
