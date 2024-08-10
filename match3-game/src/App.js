import React, { useState, useEffect } from 'react';
import './App.css';

const TILE_SIZE = 48;
const GRID_SIZE = 6;
const TILE_TYPES = ['🍒', '🍋', '🍇', '🍉', '🍍'];

const App = () => {
  const [grid, setGrid] = useState([]);
  const [score, setScore] = useState(0);
  const [selectedTile, setSelectedTile] = useState(null);

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
  
      // Вы можете установить кнопку закрытия и другие параметры здесь
      tg.MainButton.setText("Start Game").show();
  
      tg.MainButton.onClick(() => {
        initializeGrid();
        tg.MainButton.hide(); // Скрыть кнопку после начала игры
      });
    } else {
      initializeGrid(); // Инициализация сетки для тестирования вне Telegram
    }
  }, []);

  const initializeGrid = () => {
    const newGrid = [];
  
    for (let row = 0; row < GRID_SIZE; row++) {
      const newRow = [];
      for (let col = 0; col < GRID_SIZE; col++) {
        let randomTile;
  
        do {
          randomTile = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
        } while (
          (col > 1 && randomTile === newRow[col - 1] && randomTile === newRow[col - 2]) || // Проверка горизонтального совпадения
          (row > 1 && randomTile === newGrid[row - 1][col] && randomTile === newGrid[row - 2][col]) // Проверка вертикального совпадения
        );
  
        newRow.push(randomTile);
      }
      newGrid.push(newRow);
    }
  
    setGrid(newGrid);
  };

  const handleTileClick = (row, col) => {
    if (selectedTile) {
      const { row: selectedRow, col: selectedCol } = selectedTile;
      const isAdjacent = 
        (selectedRow === row && Math.abs(selectedCol - col) === 1) ||
        (selectedCol === col && Math.abs(selectedRow - row) === 1);
  
      if (isAdjacent) {
        swapTiles(selectedRow, selectedCol, row, col);
      }
      setSelectedTile(null);
    } else {
      setSelectedTile({ row, col });
    }
  };
  const swapTiles = (row1, col1, row2, col2) => {
    // Добавляем анимацию свайпа
    animateSwap(row1, col1, row2, col2);
  
    // Делаем задержку, чтобы анимация успела выполниться перед изменением данных
    setTimeout(() => {
      const newGrid = [...grid];
      [newGrid[row1][col1], newGrid[row2][col2]] = [newGrid[row2][col2], newGrid[row1][col1]];
      
      setGrid([...newGrid]);
  
      setTimeout(() => {
        if (!hasMatches(newGrid)) {
          // Если не было совпадений, возвращаем плитки на место
          animateSwap(row2, col2, row1, col1); // Анимация обратного свайпа
          setTimeout(() => {
            [newGrid[row1][col1], newGrid[row2][col2]] = [newGrid[row2][col2], newGrid[row1][col1]];
            setGrid([...newGrid]);
          }, 500); // Время для выполнения анимации обратного свайпа
        } else {
          checkMatches(newGrid);
        }
      }, 500); // Время для выполнения анимации
    }, 100); // Задержка перед изменением плиток
  };
  
  
  const hasMatches = (grid) => {
    // Проверка горизонтальных совпадений
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (grid[row][col] === grid[row][col + 1] && grid[row][col] === grid[row][col + 2]) {
          return true;
        }
      }
    }
  
    // Проверка вертикальных совпадений
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        if (grid[row][col] === grid[row + 1][col] && grid[row][col] === grid[row + 2][col]) {
          return true;
        }
      }
    }
  
    return false;
  };
  
  const animateSwap = (row1, col1, row2, col2) => {
    const tile1 = document.querySelector(`.tile[row='${row1}'][col='${col1}']`);
    const tile2 = document.querySelector(`.tile[row='${row2}'][col='${col2}']`);
  
    if (tile1 && tile2) {
      // Вычисляем направление перемещения
      const dx = col2 - col1;
      const dy = row2 - row1;
  
      // Анимация перемещения
      tile1.style.transform = `translate(${dx * 100}%, ${dy * 100}%)`;
      tile2.style.transform = `translate(${-dx * 100}%, ${-dy * 100}%)`;
  
      // Возвращаем плитки в исходное положение
      setTimeout(() => {
        tile1.style.transform = '';
        tile2.style.transform = '';
      }, 500); // Время для завершения анимации
    }
  };
  

  const checkMatches = (newGrid) => {
    const matches = [];
    
    // Проверка горизонтальных совпадений
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE - 2; col++) {
        if (newGrid[row][col] === newGrid[row][col + 1] && newGrid[row][col] === newGrid[row][col + 2]) {
          matches.push({ row, col });
          matches.push({ row, col: col + 1 });
          matches.push({ row, col: col + 2 });
        }
      }
    }
    
    // Проверка вертикальных совпадений
    for (let col = 0; col < GRID_SIZE; col++) {
      for (let row = 0; row < GRID_SIZE - 2; row++) {
        if (newGrid[row][col] === newGrid[row + 1][col] && newGrid[row][col] === newGrid[row + 2][col]) {
          matches.push({ row, col });
          matches.push({ row: row + 1, col });
          matches.push({ row: row + 2, col });
        }
      }
    }
  
    if (matches.length > 0) {
      matches.forEach(({ row, col }) => {
        newGrid[row][col] = null;
      });
  
      setGrid([...newGrid]);
  
      setTimeout(() => {
        let updatedGrid = [...newGrid];
        for (let col = 0; col < GRID_SIZE; col++) {
          for (let row = GRID_SIZE - 1; row >= 0; row--) {
            if (updatedGrid[row][col] === null) {
              for (let r = row - 1; r >= 0; r--) {
                if (updatedGrid[r][col] !== null) {
                  [updatedGrid[row][col], updatedGrid[r][col]] = [updatedGrid[r][col], null];
                  break;
                }
              }
            }
          }
          for (let row = 0; row < GRID_SIZE; row++) {
            if (updatedGrid[row][col] === null) {
              let newTile;
              do {
                newTile = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
              } while (
                (col > 1 && newTile === updatedGrid[row][col - 1] && newTile === updatedGrid[row][col - 2]) ||
                (row > 1 && newTile === updatedGrid[row - 1][col] && newTile === updatedGrid[row - 2][col])
              );
              updatedGrid[row][col] = newTile;
            }
          }
        }
        setGrid(updatedGrid);
        setScore(score + matches.length);
  
      }, 500);
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Match-3 Game</h1>
        <div className="score">Score: {score}</div>
        <div className="grid">
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                row={rowIndex}
                col={colIndex}
                className={`tile ${selectedTile && selectedTile.row === rowIndex && selectedTile.col === colIndex ? 'selected' : ''}`}
                onClick={() => handleTileClick(rowIndex, colIndex)}
                style={{ width: TILE_SIZE, height: TILE_SIZE, lineHeight: `${TILE_SIZE}px` }}
              >
                {tile}
              </div>
            ))
          )}
        </div>
      </header>
    </div>
  );
  
};

export default App;
