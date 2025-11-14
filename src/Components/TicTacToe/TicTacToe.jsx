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

    // 1v1 mode
    if (!mode) {
      newData[num] = count % 2 === 0 ? "x" : "o";
      setData(newData);
      setCount(c => c + 1);
      checkWin(newData);
      return;
    }

    // VS AI mode
    newData[num] = "x";
    setData(newData);
    setCount(c => c + 1);
    setLock(true); // blocăm până AI mută

    const winner = checkWin(newData);
    if (!winner) setTimeout(() => botMove(newData), 350);
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
      setStatusText("Tie!");
      setTimeout(() => resetRound(), 1500);
      return "draw";
    }

    setStatusText(`Next move: ${count % 2 === 0 ? "O" : "X"}`);
    return null;
  }

  const roundWon = (winner, line) => {
    setLock(true);
    setWinningLine(line);
    setStatusText(`Winner: ${winner.toUpperCase()}`);

    if (winner === "x") setScoreX(prev => prev + 1);
    else if (winner === "o") setScoreO(prev => prev + 1);

    setTimeout(() => {
      setWinningLine([]);
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

  // AI logic
  const botMove = (currentData) => {
    let move;
    if (mode === "easy") move = randomMove(currentData);
    else if (mode === "medium") move = mediumMove(currentData);
    else if (mode === "hard") move = minimaxRoot(currentData, "o").index;

    if (move === undefined || currentData[move] !== "") {
      setLock(false);
      return;
    }

    const newData = [...currentData];
    newData[move] = "o";
    setData(newData);
    setCount(c => c + 1);

    const winner = checkWin(newData);
    if (!winner) setLock(false);
  }

  const randomMove = (board) => {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    return empty[Math.floor(Math.random()*empty.length)];
  }

  const mediumMove = (board) => {
    for (let [a,b,c] of lines) {
      if (board[a]==="o" && board[b]==="o" && board[c]==="") return c;
      if (board[a]==="o" && board[c]==="o" && board[b]==="") return b;
      if (board[b]==="o" && board[c]==="o" && board[a]==="") return a;
    }
    for (let [a,b,c] of lines) {
      if (board[a]==="x" && board[b]==="x" && board[c]==="") return c;
      if (board[a]==="x" && board[c]==="x" && board[b]==="") return b;
      if (board[b]==="x" && board[c]==="x" && board[a]==="") return a;
    }
    return randomMove(board);
  }

  const minimaxRoot = (board, player) => {
    const empty = board.map((v,i)=>v===""?i:null).filter(v=>v!==null);
    let bestScore = -Infinity;
    let bestIndex = null;
    for (let i of empty) {
      let newBoard = [...board];
      newBoard[i] = player;
      let score = minimax(newBoard, false);
      if (score > bestScore) { bestScore = score; bestIndex = i; }
    }
    return { index: bestIndex, score: bestScore };
  }

  const minimax = (board, isMax) => {
    const winner = getWinner(board);
    if (winner === "o") return 10;
    if (winner === "x") return -10;
    if (!board.includes("")) return 0;

    if (isMax) {
      let best = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i]==="") {
          board[i] = "o";
          best = Math.max(best, minimax(board, false));
          board[i] = "";
        }
      }
      return best;
    } else {
      let best = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i]==="") {
          board[i] = "x";
          best = Math.min(best, minimax(board, true));
          board[i] = "";
        }
      }
      return best;
    }
  }

  const getWinner = (board) => {
    for (let [a,b,c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
    }
    return null;
  }

  // --- UI MENUS & GAME ---

  if (screen === "menu") return (
    <div className="menu-container">
      <h1 className="menu-title">Tic Tac Toe</h1>
      <div className="menu-buttons">
        <button onClick={() => { setMode(""); setScreen("game"); }}>1v1 (Same PC)</button>
        <button onClick={() => setScreen("aiMenu")}>Vs AI</button>
        <button onClick={() => window.close()}>Exit</button>
      </div>
    </div>
  );

  if (screen === "aiMenu") return (
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
                <div key={j} className={`boxes ${winningLine.includes(j)?'winning-box':''}`} onClick={() => toggle(j)}>
                  {data[j]==="x" && <img src={x_icon} alt="X" />}
                  {data[j]==="o" && <img src={circle_icon} alt="O" />}
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
  );
}

export default TicTacToe
