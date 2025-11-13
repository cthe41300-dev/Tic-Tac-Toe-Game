import React, { useState } from 'react'
import './TicTacToe.css'
import circle_icon from '../Assets/circle.png'
import x_icon from '../Assets/x.png'

export const TicTacToe = () => {

  const [count, setCount] = useState(0);
  const [lock, setLock] = useState(false);
  const [screen, setScreen] = useState("menu");
  const [statusText, setStatusText] = useState("Next move: X");
  const [data, setData] = useState(Array(9).fill(""));
  const [mode, setMode] = useState(""); // easy, medium, hard
  const [showPopup, setShowPopup] = useState(false);
  const [popupWinner, setPopupWinner] = useState("");
  const [winningLine, setWinningLine] = useState([]);

  const [scoreX, setScoreX] = useState(0);
  const [scoreO, setScoreO] = useState(0);

  const lines = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  const toggle = (num) => {
    if (lock || data[num] !== "") return;

    const newData = [...data];
    newData[num] = count % 2 === 0 ? "x" : "o";
    setData(newData);
    setCount(count + 1);

    const winner = checkWin(newData);
    if (winner) return;

    if (mode && newData[num] === "x") {
      setTimeout(() => botMove(newData), 400);
    }
  }

  const checkWin = (currentData) => {
    for (let line of lines) {
      const [a,b,c] = line;
      if (currentData[a] && currentData[a] === currentData[b] && currentData[a] === currentData[c]) {
        roundWon(currentData[a], line);
        return currentData[a];
      }
    }

    if (!currentData.includes("")) {
      setLock(true);
      setStatusText("Tie!");
      setTimeout(() => resetRound(), 1500);
      return null;
    }

    setStatusText(`Next move: ${count % 2 === 0 ? "O" : "X"}`);
    return null;
  }

  const roundWon = (winner, line) => {
    if (lock) return;
    setLock(true);
    setStatusText(`Winner: ${winner.toUpperCase()}`);

    if (winner === "x") setScoreX(prev => prev + 1);
    else setScoreO(prev => prev + 1);

    // evidențiază linia câștigătoare
    setWinningLine(line);

    setTimeout(() => {
      setWinningLine([]); // scoate evidențierea după 1 secundă
      const finalX = winner === "x" ? scoreX + 1 : scoreX;
      const finalO = winner === "o" ? scoreO + 1 : scoreO;

      if (finalX >= 3 || finalO >= 3) {
        setPopupWinner(winner.toUpperCase());
        setShowPopup(true);
      } else {
        resetRound();
      }
    }, 1000);
  }

  const resetRound = () => {
    setData(Array(9).fill(""));
    setCount(0);
    setLock(false);
    setStatusText("Next move: X");
  }

  const resetGame = () => {
    setScoreX(0);
    setScoreO(0);
    resetRound();
  }

  const handlePopupClose = () => {
    setShowPopup(false);
    resetGame();
  }

  // 🧠 Easy / Medium / Hard AI logic
  const botMove = (currentData) => {
    if (lock) return;

    let move;
    if (mode === "easy") move = randomMove(currentData);
    else if (mode === "medium") move = mediumMove(currentData);
    else if (mode === "hard") move = bestMove(currentData, "o").index;

    if (move === undefined || currentData[move] !== "") return;

    const newData = [...currentData];
    newData[move] = "o";
    setData(newData);
    setCount(prev => prev + 1);
    checkWin(newData);
  }

  const randomMove = (board) => {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
  }

  const mediumMove = (board) => {
    for (let [a,b,c] of lines) {
      if (board[a] === "o" && board[b] === "o" && board[c] === "") return c;
      if (board[a] === "o" && board[c] === "o" && board[b] === "") return b;
      if (board[b] === "o" && board[c] === "o" && board[a] === "") return a;
    }
    for (let [a,b,c] of lines) {
      if (board[a] === "x" && board[b] === "x" && board[c] === "") return c;
      if (board[a] === "x" && board[c] === "x" && board[b] === "") return b;
      if (board[b] === "x" && board[c] === "x" && board[a] === "") return a;
    }
    return randomMove(board);
  }

  const bestMove = (board, player) => {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);

    const winner = getWinner(board);
    if (winner === "x") return {score: -10};
    if (winner === "o") return {score: 10};
    if (empty.length === 0) return {score: 0};

    const moves = [];
    for (let i of empty) {
      const newBoard = [...board];
      newBoard[i] = player;
      const result = bestMove(newBoard, player === "o" ? "x" : "o");
      moves.push({index: i, score: result.score});
    }

    let best;
    if (player === "o") {
      let maxScore = -Infinity;
      for (let m of moves) {
        if (m.score > maxScore) { maxScore = m.score; best = m; }
      }
    } else {
      let minScore = Infinity;
      for (let m of moves) {
        if (m.score < minScore) { minScore = m; best = m; }
      }
    }
    return best;
  }

  const getWinner = (board) => {
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }

  // --- Meniu principal ---
  if (screen === "menu") {
    return (
      <div className="menu-container">
        <h1 className="menu-title">Tic Tac Toe</h1>
        <div className="menu-buttons">
          <button onClick={() => { setMode(""); setScreen("game"); }}>1v1 (Same PC)</button>
          <button onClick={() => setScreen("aiMenu")}>Vs AI</button>
          <button onClick={() => window.close()}>Exit</button>
        </div>
      </div>
    );
  }

  // --- Meniu AI ---
  if (screen === "aiMenu") {
    return (
      <div className="menu-container">
        <h1 className="menu-title">Select Difficulty</h1>
        <div className="menu-buttons">
          <button onClick={() => { setMode("easy"); setScreen("game"); }}>Easy</button>
          <button onClick={() => { setMode("medium"); setScreen("game"); }}>Medium</button>
          <button onClick={() => { setMode("hard"); setScreen("game"); }}>Hard</button>
          <button className="back" onClick={() => setScreen("menu")}>Go Back to Menu</button>
        </div>
      </div>
    );
  }

  // --- Joc ---
  return (
    <>
      <div className="container">
        <h1 className="title">Tic Tac Toe Game</h1>
        <h2 className="next-move">{statusText}</h2>

        <div className="scoreboard">
          <h3>X Score: {scoreX}</h3>
          <h3>O Score: {scoreO}</h3>
        </div>

        <div className="board">
          {[0,1,2].map(i => (
            <div className="row1" key={i}>
              {[i*3, i*3+1, i*3+2].map(j => (
                <div 
                  key={j} 
                  className={`boxes ${winningLine.includes(j) ? 'winning-box' : ''}`} 
                  onClick={() => toggle(j)}
                >
                  {data[j] === "x" && <img src={x_icon} alt="X" />}
                  {data[j] === "o" && <img src={circle_icon} alt="O" />}
                </div>
              ))}
            </div>
          ))}
        </div>

        <button className="reset" onClick={resetGame}>Reset Game</button>
        <button className="back" onClick={() => { resetGame(); setMode(""); setScreen("menu"); }}>Go back to Menu</button>
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Game Winner: {popupWinner}</h2>
            <button onClick={handlePopupClose}>OK</button>
          </div>
        </div>
      )}
    </>
  )
}

export default TicTacToe
