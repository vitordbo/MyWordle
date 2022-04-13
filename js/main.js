document.addEventListener("DOMContentLoaded", () => {

    let guessedWordCount = 0; // saber qual vai mudar de cor
    let currentWordIndex = 0; // onde está 

    // precisamos saber qual espaço esta disponivel nos quadrados
    let availableSpace = 1;

    // queremos manter todas as palavras => cada palavra vai ser um array que contem cada letra
    let guessedWords = [
        []
    ];

    // muda de palavra a cada f5 
    const words = ["sagaz", "exito", "mexer", "termo", "senso", "nobre", "afeto", "plena", "etica", "mutua", "tenue", "sutil",
        "vigor", "aquem", "porem", "audaz", "fazer", "sanar", "inato", "assim", "ideia", "fosse", "desde", "poder", "moral",
        "honra", "muito", "justo", "futil", "anexo", "razao", "etnia", "sobre", "icone", "sonho", "lapso"
    ];

    let currentWord = words[currentWordIndex];

    // funções de inicialização
    initLocalStorage();
    initHelpModal();
    initStatsModal();
    createSquares();
    addKeyboardClicks();
    loadLocalStorage();

    function initLocalStorage() {
        // inicializar o localStorage => setar o currentWordIndex no localStorage e ler de lá tbm quaando resetar o jogo
        const storedCurrentWordIndex = window.localStorage.getItem('currentWordIndex'); // quando iniciar não vai ter nada

        if (!storedCurrentWordIndex) {
            window.localStorage.setItem('currentWordIndex', currentWordIndex); // primeiro => nome do item que vai pro localStor. e segundo é o value 
            // só set Strings no localStorage => tudo vira String
        } else {
            currentWordIndex = Number(storedCurrentWordIndex); // começa com 0 
            currentWord = words[currentWordIndex];
        }
    }

    function loadLocalStorage() {
        // pegar coisas que estão no LocalStorage
        currentWordIndex =
            Number(window.localStorage.getItem("currentWordIndex")) ||
            currentWordIndex;
        guessedWordCount =
            Number(window.localStorage.getItem("guessedWordCount")) ||
            guessedWordCount;
        availableSpace =
            Number(window.localStorage.getItem("availableSpace")) || availableSpace;
        guessedWords =
            JSON.parse(window.localStorage.getItem("guessedWords")) || guessedWords; //guessedWords = array => guardada como String => converte de volta para array

        currentWord = words[currentWordIndex];

        const storedBoardContainer = window.localStorage.getItem("boardContainer");
        if (storedBoardContainer) { // se já tem 
            document.getElementById("board-container").innerHTML =
                storedBoardContainer;
        }

        const storedKeyboardContainer =
            window.localStorage.getItem("keyboardContainer");
        if (storedKeyboardContainer) { // se já tem
            document.getElementById("keyboard-container").innerHTML =
                storedKeyboardContainer;

            addKeyboardClicks(); // voltar o teclado quando der refresh (volta com as cores mas sem funcionar)
        }
    }

    // como seria pra ver se palavra existe ?

    function preserveGameState() {
        // preservar somente quando a palavra foi enviada
        // atualizar e manter as palavras => evitar roubo
        window.localStorage.setItem('guessedWords', JSON.stringify(guessedWords)); // vai transformar array para String

        // manter atualizado no teclado => teclado ficar com as cores => container para o teclado
        const keyboardContainer = document.getElementById("keyboard-container");
        window.localStorage.setItem(
            "keyboardContainer", keyboardContainer.innerHTML
        );

        const boardContainer = document.getElementById("board-container");
        window.localStorage.setItem(
            "boardContainer", boardContainer.innerHTML
        );
    }

    function createSquares() {
        const gameBoard = document.getElementById("board")

        for (let i = 0; i < 30; i++) {
            let square = document.createElement("div"); // cria div para cada quadrado
            square.classList.add("square"); // classe square da div que criou 
            square.classList.add("animate__animated");
            square.setAttribute("id", i + 1);
            gameBoard.appendChild(square);

        }
    }

    function resetGameState() {
        // quando der a win e atualizar => zerar os quadrados
        window.localStorage.removeItem("guessedWordCount");
        window.localStorage.removeItem("guessedWords");
        window.localStorage.removeItem("keyboardContainer");
        window.localStorage.removeItem("boardContainer");
        window.localStorage.removeItem("availableSpace");

    }


    function getCurrentWordArr() {
        // como saber qual array atualizar?
        //vai retornar o array que esta sendo atualizado
        const numberOfGuessesWords = guessedWords.length
        return guessedWords[numberOfGuessesWords - 1]
    }

    // oq fazer com essa letra que foi pegada =>
    function updateGuessedLetters(letter) {
        // atualizar se tiver adivinhado ou errado e não deixar editar um linha que já foi tentada
        const currentWordArr = getCurrentWordArr()

        if (currentWordArr && currentWordArr.length < 5) { // se já não preencheu as 5 (espaço da palavra) do array e se existe 
            currentWordArr.push(letter);

            const availableSpaceEl = document.getElementById(availableSpace);
            availableSpaceEl.textContent = letter;
            availableSpace = availableSpace + 1;
        }
    }

    // quantidade de games jogados
    function updateTotalGames() {
        const totalGames = window.localStorage.getItem("totalGames") || 0;
        window.localStorage.setItem("totalGames", Number(totalGames) + 1);
    }

    // alert para evitar ficar por tras
    function showResult() {
        //adicionar estatisticas => guardar o numero de vitorias no nosso local storage
        const finalResultEl = document.getElementById("final-score");

        const totalWins = window.localStorage.getItem('totalWins') || 0 // não tiver vira 0
        window.localStorage.setItem("totalWins", Number(totalWins) + 1);


        const currentStreak = window.localStorage.getItem('currentStreak') || 0 // não tiver vira 0
        window.localStorage.setItem("currentStreak", Number(currentStreak) + 1);
    }

    // seta pra 0 qunado perde
    function showLosingResult() {
        const finalResultEl = document.getElementById("final-score");

        window.localStorage.setItem("currentStreak", 0);
    }

    function clearBoard() {
        for (let i = 0; i < 30; i++) {
            let square = document.getElementById(i + 1);
            square.textContent = "";
        }

        const keys = document.getElementsByClassName("keyboard-button");

        for (var key of keys) {
            key.disabled = true;
        }
    }

    function getIndicesOfLetter(letter, arr) {
        const indices = [];
        let idx = arr.indexOf(letter);
        while (idx != -1) {
            indices.push(idx);
            idx = arr.indexOf(letter, idx + 1);
        }
        return indices;
    }

    // colocar classe na div dos quadrados e mudar a cor  => cores estão definidas no css
    function getTileClass(letter, index, currentWordArr) {
        const isCorrectLetter = currentWord
            .toUpperCase()
            .includes(letter.toUpperCase());

        //mesma cor 
        if (!isCorrectLetter) {
            return "incorrect-letter";
        }

        const letterInThatPosition = currentWord.charAt(index);
        const isCorrectPosition =
            letter.toLowerCase() === letterInThatPosition.toLowerCase();

        //grenn
        if (isCorrectPosition) {
            return "correct-letter-in-place";
        }

        const isGuessedMoreThanOnce =
            currentWordArr.filter((l) => l === letter).length > 1;

        // amarela
        if (!isGuessedMoreThanOnce) {
            return "correct-letter";
        }

        const existsMoreThanOnce =
            currentWord.split("").filter((l) => l === letter).length > 1;

        // is guessed more than once and exists more than once
        if (existsMoreThanOnce) {
            return "correct-letter";
        }


        const hasBeenGuessedAlready = currentWordArr.indexOf(letter) < index;

        const indices = getIndicesOfLetter(letter, currentWord.split(""));
        const otherIndices = indices.filter((i) => i !== index);
        const isGuessedCorrectlyLater = otherIndices.some(
            (i) => i > index && currentWordArr[i] === letter
        );

        if (!hasBeenGuessedAlready && !isGuessedCorrectlyLater) {
            return "correct-letter";
        }

        return "incorrect-letter";
    }

    function updateWordIndex() {
        // precisamo atualizar o index quando ganhamos ou perdemos
        console.log({ currentWordIndex });
        window.localStorage.setItem("currentWordIndex", currentWordIndex + 1);
    }

    // verificaria se a palavra existe => no caso verifica se tem tamaho certo 
    async function handleSubmitWord() {
        const currentWordArr = getCurrentWordArr();
        const guessedWord = currentWordArr.join("");

        if (guessedWord.length !== 5) {
            return;
        }

        try {

            const firstLetterId = guessedWordCount * 5 + 1;

            localStorage.setItem("availableSpace", availableSpace);

            // animação e intervalo para ver animação individual
            const interval = 200;
            currentWordArr.forEach((letter, index) => {
                setTimeout(() => {
                    const tileClass = getTileClass(letter, index, currentWordArr);
                    if (tileClass) {
                        const letterId = firstLetterId + index;
                        const letterEl = document.getElementById(letterId);
                        letterEl.classList.add("animate__flipInX");
                        letterEl.classList.add(tileClass);
                        const keyboardEl = document.querySelector(`[data-key=${letter}]`);
                        keyboardEl.classList.add(tileClass);
                    }

                    if (index === 4) {
                        preserveGameState();
                    }
                }, index * interval);
            });
            guessedWordCount += 1;
            window.localStorage.setItem("guessedWordCount", guessedWordCount);

            // se acertou => avisa, limpa o board e atualiza estatisticas
            if (guessedWord === currentWord) {
                setTimeout(() => {
                    const okSelected = window.confirm("Muito bem!! Você ganhou!!");
                    if (okSelected) {
                        clearBoard();
                        showResult();
                        updateWordIndex();
                        updateTotalGames();
                        resetGameState();
                    }
                    return;
                }, 1200);
            }

            // se não conseguiu ganhar a partida 
            if (guessedWords.length === 6 && guessedWord !== currentWord) {
                setTimeout(() => {
                    const okSelected = window.confirm(
                        `Infelizmente você não conseguiu ): A palavra era: ${currentWord.toUpperCase()}".`
                    );
                    if (okSelected) {
                        clearBoard();
                        showLosingResult();
                        updateWordIndex();
                        updateTotalGames();
                        resetGameState();
                    }
                    return;
                }, 1200);
            }

            guessedWords.push([]);
        } catch (_error) {
            window.alert("Word is not recognised!");
        }
    }


    function updateStatsModal() {
        // para atualizar as estatiticas no modal
        // primeiro pegar as estatisticas do localStorage
        const currentStreak = window.localStorage.getItem("currentStreak");
        const totalWins = window.localStorage.getItem("totalWins");
        const totalGames = window.localStorage.getItem("totalGames");

        // indo no id do modal e adicionando
        document.getElementById("total-played").textContent = totalGames;
        document.getElementById("total-wins").textContent = totalWins;
        document.getElementById("current-streak").textContent = currentStreak;

        const winPct = Math.round((totalWins / totalGames) * 100) || 0;
        document.getElementById("win-pct").textContent = winPct;

    }

    function handleDelete() {
        const currentWordArr = getCurrentWordArr();

        if (!currentWordArr.length) {
            return;
        }

        currentWordArr.pop();

        guessedWords[guessedWords.length - 1] = currentWordArr; // para tirar no delete

        const lastLetterEl = document.getElementById(availableSpace - 1);

        lastLetterEl.innerHTML = ""; // ultima letra vira vazia
        availableSpace = availableSpace - 1; // ajeitar espaço vazio
    }

    // para cada letra um onclick 
    // pegar letra que clicou
    function addKeyboardClicks() {
        const keys = document.querySelectorAll(".keyboard-row button");
        for (let i = 0; i < keys.length; i++) {
            keys[i].addEventListener("click", ({ target }) => {
                const key = target.getAttribute("data-key");

                if (key === "enter") {
                    handleSubmitWord();
                    return;
                }

                if (key === "del") {
                    handleDelete();
                    return;
                }

                updateGuessedLetters(key);
            });
        }
    }

    function initHelpModal() {
        const modal = document.getElementById("help-modal");

        // Get the button that opens the modal
        const btn = document.getElementById("help");

        // Get the <span> element that closes the modal
        const span = document.getElementById("close-help");

        // When the user clicks on the button, open the modal
        btn.addEventListener("click", function() {
            modal.style.display = "block";
        });

        // When the user clicks on <span> (x), close the modal
        span.addEventListener("click", function() {
            modal.style.display = "none";
        });

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }

    function updateTotalGames() {
        // vai atualizar quando perder ou ganhar
        const totalGames = window.localStorage.getItem('totalGames') || 0 // não tiver vira 0
        window.localStorage.setItem("totalGames", Number(totalGames) + 1);
    }

    function initStatsModal() {
        const modal = document.getElementById("stats-modal");

        // Get the button that opens the modal
        const btn = document.getElementById("stats");

        // Get the <span> element that closes the modal
        const span = document.getElementById("close-stats");

        // When the user clicks on the button, open the modal
        btn.addEventListener("click", function() {
            updateStatsModal();
            modal.style.display = "block";
        });

        // When the user clicks on <span> (x), close the modal
        span.addEventListener("click", function() {
            modal.style.display = "none";
        });

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }
});