const videos = { 1: document.getElementById("camera1"), 2: document.getElementById("camera2") };
const playerData = document.getElementById("player-data");
const playerNames = { player1: playerData.dataset.player1, player2: playerData.dataset.player2 };
const state = { moves: { 1: null, 2: null }, scores: { 1: 0, 2: 0 }, draws: 0, round: 1, completedMoves: 0, finished: false };
const winningMoves = { rock: "scissors", paper: "rock", scissors: "paper" };

navigator.mediaDevices?.getUserMedia({ video: true }).then(stream => {
    videos[1].srcObject = stream;
    videos[2].srcObject = stream;
}).catch(() => {
    document.querySelectorAll(".camera-guide").forEach(guide => guide.textContent = "Camera unavailable - check permissions");
});

function normalizeMove(prediction) {
    const value = String(prediction).trim().toLowerCase();

    if (value.includes("rock")) return "rock";
    if (value.includes("paper")) return "paper";
    if (value.includes("scissor")) return "scissors";

    return null;
}

function getWinner(playerOne, playerTwo) {
    if (playerOne === playerTwo) return 0;

    if (
        (playerOne === "rock" && playerTwo === "scissors") ||
        (playerOne === "paper" && playerTwo === "rock") ||
        (playerOne === "scissors" && playerTwo === "paper")
    ) {
        return 1;
    }

    return 2;
}

function revealRound() {
    if (!state.moves[1] || !state.moves[2]) {
        document.getElementById("resultKicker").textContent =
            "One move locked in";
        document.getElementById("result").textContent =
            "Waiting for the other player";
        return;
    }

    const first = state.moves[1];
    const second = state.moves[2];
    const winner = getWinner(first, second);

    console.log("Player 1:", first);
    console.log("Player 2:", second);
    console.log("Winner:", winner);

    state.completedMoves++;
    updateScoreboardVisibility();

    if (winner === 0) {
        state.draws++;
        document.getElementById("draws").textContent = state.draws;
        showResult(
            "It's a draw",
            `${title(first)} meets ${title(second)}. Throw again!`,
            "draw"
        );
        setTimeout(startNextRound, 1100);
        return;
    }

    state.scores[winner]++;
    document.getElementById(`score${winner}`).textContent =
        state.scores[winner];
    document.getElementById(`scoreCard${winner}`).classList.add("winner");

    const winnerName = playerNames[`player${winner}`];

    showResult(
        `${winnerName} takes the round`,
        `${title(first)} vs ${title(second)} - ${winnerName} wins!`,
        "win"
    );

    document.getElementById("nextButton").classList.remove("hidden");
}


function capture(player) {
    if (state.finished || state.moves[player]) return;
    const video = videos[player];
    if (!video.videoWidth) {
        setStatus(player, "Camera is still starting...");
        return;
    }
    const canvas = document.getElementById(`canvas${player}`);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const button = document.getElementById(`capture${player}`);
    button.disabled = true;
    button.textContent = "Reading sign...";
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append("image", blob, "capture.jpg");
        fetch("/predict", { method: "POST", body: formData })
            .then(response => response.ok ? response.json() : Promise.reject())
            .then(data => {
                const move = normalizeMove(data.prediction);
                if (!move) return Promise.reject();
                state.moves[player] = move;
                document.getElementById(`lock${player}`).classList.add("visible");
                button.textContent = "Move locked";
                setStatus(player, "Move hidden until both are ready");
                document.getElementById(`panel${player}`).classList.add("locked");
                revealRound();
            })
            .catch(() => {
                button.disabled = false;
                button.textContent = "Try again";
                setStatus(player, "Could not read that sign");
            });
    }, "image/jpeg");
}

function setStatus(player, text) { document.getElementById(`move${player}`).textContent = text; }

function revealRound() {
    if (!state.moves[1] || !state.moves[2]) {
        document.getElementById("resultKicker").textContent = "One move locked in";
        document.getElementById("result").textContent = "Waiting for the other player";
        return;
    }
    const first = state.moves[1];
    const second = state.moves[2];
    state.completedMoves++;
    updateScoreboardVisibility();
    const winner = first === second ? 0 : winningMoves[first] === second ? 1 : 2;
    if (winner === 0) {
        state.draws++;
        document.getElementById("draws").textContent = state.draws;
        showResult("It's a draw", `${title(first)} meets ${title(second)}. Throw again!`, "draw");
        setTimeout(startNextRound, 1100);
        return;
    }
    state.scores[winner]++;
    document.getElementById(`score${winner}`).textContent = state.scores[winner];
    document.getElementById(`scoreCard${winner}`).classList.add("winner");
    const winnerName = playerNames[`player${winner}`];
    showResult(`${winnerName} takes the round`, `${title(first)} vs ${title(second)} - ${winnerName} wins!`, "win");
    if (state.scores[winner] === 2) {
        state.finished = true;
        revealScoreboard();
        showResult(`${winnerName} is champion`, `Final score ${state.scores[1]} - ${state.scores[2]}`, "champion");
    }
    document.getElementById("nextButton").classList.remove("hidden");
}

function updateScoreboardVisibility() {
    if (state.completedMoves < 3) {
        document.getElementById("scoreHint").textContent = `Scores reveal after ${3 - state.completedMoves} move${3 - state.completedMoves === 1 ? "" : "s"}`;
        return;
    }
    revealScoreboard();
}

function revealScoreboard() {
    document.getElementById("scoreboard").classList.remove("score-hidden");
    document.getElementById("scoreHint").textContent = "Scoreboard revealed";
}

function showResult(titleText, detail, kind) {
    document.getElementById("resultKicker").textContent = kind === "champion" ? "Game over" : kind === "draw" ? "No points this time" : "Round result";
    document.getElementById("result").textContent = titleText;
    document.getElementById("resultDetail").textContent = detail;
    document.querySelector(".result-panel").className = `result-panel ${kind}`;
}

function startNextRound() {
    if (state.finished) { window.location.reload(); return; }
    state.round++;
    state.moves = { 1: null, 2: null };
    document.getElementById("roundLabel").textContent = `Round ${state.round}`;
    document.getElementById("nextButton").classList.add("hidden");
    document.getElementById("resultKicker").textContent = "Ready when you are";
    document.getElementById("result").textContent = "Make your moves!";
    document.getElementById("resultDetail").textContent = "The reveal happens after both players lock in.";
    document.querySelector(".result-panel").className = "result-panel";
    [1, 2].forEach(player => {
        document.getElementById(`capture${player}`).disabled = false;
        document.getElementById(`capture${player}`).innerHTML = '<span class="button-icon">↗</span> Lock in move';
        document.getElementById(`lock${player}`).classList.remove("visible");
        document.getElementById(`panel${player}`).classList.remove("locked");
        setStatus(player, "Waiting for your sign");
    });
}

function title(move) { return move.charAt(0).toUpperCase() + move.slice(1); }