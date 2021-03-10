import React, { useEffect, useState } from 'react';
import Node from './Node'

import {dijkstra, astar, dfs, bfs, getShortestPath} from '../algorithms/algorithms'

import Button from 'react-bootstrap/Button';
import DropdownButton from 'react-bootstrap/DropdownButton'
import Dropdown from 'react-bootstrap/Dropdown'

import './PathfindingVisualizer.css';

//problem with drawing a wall when a graph is drawn is that the grid is not being set as the new one so whatever is drawn is not being saved?
export default function PathfindingVisualizer() {
    const [algoType, setAlgoType] = useState("")
    const [grid, setGrid] = useState([])
    const [mousePress, setMousePress] = useState(false)
    const [startSelected, setStartSelected] = useState(false)
    const [goalSelected, setGoalSelected] = useState(false)
    const [startRow, setStartRow] = useState(10)
    const [startCol, setStartCol] = useState(15)
    const [goalRow, setGoalRow] = useState(10)
    const [goalCol, setGoalCol] = useState(35)
    const [running, setRunning] = useState(false)

    useEffect(() => {
        const startGrid = initializeGrid();
        setGrid(startGrid)
    }, [])

    const initializeGrid = () => {
        const grid = [];
        for (let row = 0; row<20; row++) {
            const currentRow = [];
            for (let col = 0; col<50; col++) {
                currentRow.push(createNode(row, col))
            }
            grid.push(currentRow)
        }
        return grid
    }

    const createNode = (row, col) => {
        return {
            row,
            col,
            isStart: row === startRow && col === startCol,
            isGoal: row === goalRow && col === goalCol,
            isWall: false,
            isVisited: false,
            isShortestPath: false,
            distance: Infinity,
        }
    }

    const handleMouseDown = (row, col) => {
        if(running) return
        if (row == startRow && col == startCol) {
            setStartSelected(true)
            setMousePress(true)
        } else if (row == goalRow && col == goalCol) {
            setGoalSelected(true)
            setMousePress(true)
        } else {
        const newGrid = updateGridWall(grid, row, col);
        setGrid(newGrid)
        setMousePress(true)
        }
    }

    const handleMouseEnter = (row, col) => {
        if(running) return
        if(!mousePress) return
        if(startSelected || goalSelected) {
            const newGrid = updateGridStartOrGoal(grid, row, col)
            setGrid(newGrid)
        } else {
        if(row == startRow && col == startCol) return
        if(row == goalRow && col == goalCol) return
        const newGrid = updateGridWall(grid, row, col);
        setGrid(newGrid)
        }
    }

    const handleMouseUp = () => {
        if(running) return
        setMousePress(false)
        if (startSelected && grid[startRow][startCol].isWall === true) {
            setStartSelected(false)
            grid[startRow][startCol].isWall = false
        } else if (goalSelected && grid[goalRow][goalCol].isWall === true) {
            setGoalSelected(false)
            grid[goalRow][goalCol].isWall = false
        } else {
            setStartSelected(false)
            setGoalSelected(false)
        }
    }

    const updateGridStartOrGoal = (grid, row, col) => {
        const newGrid = grid.slice()
        if (startSelected) {
            if (row == goalRow && col == goalCol) {
                return newGrid
            }

            // First deselect the start

            newGrid[startRow][startCol].isStart = false
            if (newGrid[startRow][startCol].isWall) {
                document.getElementById(`node-${startRow}-${startCol}`).style.fill = "black"
            } else if(newGrid[startRow][startCol].isVisited) {
                document.getElementById(`node-${startRow}-${startCol}`).style.fill = "blue"
            } else if(newGrid[startRow][startCol].isShortestPath) {
                document.getElementById(`node-${startRow}-${startCol}`).style.fill = "yellow"
            } else {
                document.getElementById(`node-${startRow}-${startCol}`).style.fill = "white"
            }

            // Next create new start
            
            newGrid[row][col].isStart = true
            document.getElementById(`node-${row}-${col}`).style.fill = "green"
            setStartRow(row)
            setStartCol(col)
            return newGrid
        } else if (goalSelected) {
            if (row == startRow && col == startCol) {
                return newGrid
            }
            //same as start selection
            // First deselect the goal
            newGrid[goalRow][goalCol].isGoal = false

            if (newGrid[goalRow][goalCol].isWall) {
                document.getElementById(`node-${goalRow}-${goalCol}`).style.fill = "black"
            } else if(newGrid[goalRow][goalCol].isVisited) {
                document.getElementById(`node-${goalRow}-${goalCol}`).style.fill = "blue"
            } else if(newGrid[goalRow][goalCol].isShortestPath) {
                document.getElementById(`node-${goalRow}-${goalCol}`).style.fill = "yellow"
            } else {
                document.getElementById(`node-${goalRow}-${goalCol}`).style.fill = "white"
            }
            // Next create new goal
            newGrid[row][col].isGoal = true
            document.getElementById(`node-${row}-${col}`).style.fill = "red"

            setGoalRow(row)
            setGoalCol(col)
            return newGrid
        }
    }
    
    const updateGridWall = (grid, row, col) => {
        const newGrid = grid.slice()
        const newNode = createNode(row, col)
        // const newNode = {
        //     ...targetNode,
        //     isWall: !targetNode.isWall,
        //     isVisited: false,
        //     isShortestPath: false
        // }
        newNode.isWall = !grid[row][col].isWall
        if (newNode.isWall) {
            document.getElementById(`node-${row}-${col}`).style.fill = "black"
        } else {
            document.getElementById(`node-${row}-${col}`).style.fill = "white"

        }
        newGrid[row][col] = newNode
        return newGrid
    }

    const clearWalls = () => {
        if(running) return
        const clearedWallsGrid = grid.slice()
        for (let row of clearedWallsGrid) {
            for (let node of row) {
                if (node.isWall === true) {
                    node.isWall = false
                    document.getElementById(`node-${node.row}-${node.col}`).style.fill = "white"
                }
            }
        }
        setGrid(clearedWallsGrid)
    }

    const clearPaths = () => {
        if(running) return
        const clearedPathsGrid = grid.slice()
        for (let row of clearedPathsGrid) {
            for (let node of row) {
                if (node.isWall) {
                    continue
                }
                const newNode = createNode(node.row, node.col)
                clearedPathsGrid[node.row][node.col] = newNode
                if (node.row == startRow && node.col == startCol) continue
                if (node.row == goalRow && node.col == goalCol) continue
                document.getElementById(`node-${node.row}-${node.col}`).style.fill = "white"
            }
        }
            setGrid(clearedPathsGrid)
    }

    // const clearPaths = () => {
    //     const newGrid = [];
    //     const currentGrid = grid;
    //     // redraw whole grid
    //     for (let row of currentGrid) {
    //         const currentRow = []
    //         for (let node of row) {

    //             if ((node.isVisited && !node.isGoal)) {
    //                 if ((node.isVisited && !node.isStart)) {
    //                     document.getElementById(`node-${node.row}-${node.col}`).className.baseVal = 'node'
    //                 }
    //             }

    //             if (node.isWall) {
    //                 currentRow.push(node)
    //             } else {
    //                 currentRow.push(createNode(node.row, node.col))
    //             }
    //         }
    //         newGrid.push(currentRow)
    //     }
    //     setGrid(newGrid)
    // }
    
    const runAlgorithm = () => {
        if(running) return
        setRunning(true)

        clearPaths()

        const newGrid = grid.slice()
        const startNode = newGrid[startRow][startCol] 
        const goalNode = newGrid[goalRow][goalCol] 

        // if(startRow == 0) {
        //     if(startCol == 0) {
        //         if(grid[startRow+1][startCol].isWall && grid[startRow][startCol+1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     } else if(startCol == grid[0].length-1) {
        //         if(grid[startRow+1][startCol].isWall && grid[startRow][startCol-1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     } else {
        //         if(grid[startRow+1][startCol].isWall && grid[startRow][startCol-1].isWall && grid[startRow][startCol+1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     }
        // } else if(startRow == grid.length-1) {
        //     if(startCol == 0) {
        //         if(grid[startRow-1][startCol].isWall && grid[startRow][startCol+1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     } else if(startCol == grid[0].length-1) {
        //         if(grid[startRow-1][startCol].isWall && grid[startRow][startCol-1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     } else {
        //         if(grid[startRow-1][startCol].isWall && grid[startRow][startCol-1].isWall && grid[startRow][startCol+1].isWall) {
        //             setRunning(false)
        //             return
        //         }
        //     }
        // } else if(startCol == 0) {
        //     if(grid[startRow+1][startCol].isWall && grid[startRow-1][startCol].isWall && grid[startRow][startCol+1].isWall) {
        //         setRunning(false)
        //         return
        //     }
        // } else if(startCol == grid[0].length-1) {
        //     if(grid[startRow+1][startCol].isWall && grid[startRow-1][startCol].isWall && grid[startRow][startCol-1].isWall) {
        //         setRunning(false)
        //         return
        //     }
        // } else {
        //     if (grid[startRow+1][startCol].isWall && grid[startRow-1][startCol].isWall && grid[startRow][startCol+1].isWall && grid[startRow][startCol-1].isWall) {
        //         setRunning(false)
        //         return
        //     }
        // }

        if (algoType == "Dijkstra") {
            const visitedNodes = dijkstra(newGrid, startNode, goalNode)
            drawPaths(visitedNodes, startNode, goalNode)
        } else if (algoType == "A*") {
            const visitedNodes = astar(newGrid, startNode, goalNode)
            drawPaths(visitedNodes, startNode, goalNode)
        } else if (algoType == "DFS") {
            const visitedNodes = dfs(newGrid, startNode, goalNode)
            drawPaths(visitedNodes, startNode, goalNode)
        } else if (algoType == "BFS") {
            const visitedNodes = bfs(newGrid, startNode, goalNode)
            drawPaths(visitedNodes, startNode, goalNode)
        }

    }

    const drawPaths = (visitedNodes, startNode) => {
        const newGrid = grid.slice()
        const shortestPath = getShortestPath(visitedNodes, startNode)
        console.log(shortestPath)
        for (let i=1; i<visitedNodes.length; i++) {
            const node = visitedNodes[i]
            if (node.row == startRow && node.col == startCol) continue
            if (node.row == goalRow && node.col == goalCol) continue
            newGrid[node.row][node.col] = node
            setGrid(newGrid)
            setTimeout(() => document.getElementById(`node-${node.row}-${node.col}`).style.fill = "blue", i*10)
            var time = i*10
        }
        setTimeout(() => drawShortestPath(shortestPath), time)
        // setRunning(false)
    }

    // const drawPaths = (visitedNodes, startNode, goalNode) => {
    //     const shortestPath = getShortestPath(startNode, goalNode)
    //     for (let i=1; i<visitedNodes.length -1 ; i++) {
    //         const node = visitedNodes[i]
    //         setTimeout(() => document.getElementById(`node-${node.row}-${node.col}`).className.baseVal = 'node node-visited', i*10)
    //         if (i === visitedNodes.length-2) {
    //             setTimeout(() => drawShortestPath(shortestPath),i*10)
    //         }
    //     }
    // }

    const drawShortestPath = (shortestPath) => {
        // const newGrid = grid.slice()
        for (let i=1; i<shortestPath.length; i++) {
            const node = shortestPath[i]
            if(node.row == goalRow && node.col == goalCol) continue
            node.isVisited = false
            node.isShortestPath = true
            setTimeout(() => document.getElementById(`node-${node.row}-${node.col}`).style.fill = "yellow", i*30)
            var time = i * 30
        //     newGrid[node.row][node.col] = node
        //     setTimeout(() => {
        //         setGrid(newGrid)
        //     }, 1000)
        }
        setGrid(grid)
        setTimeout(() => setRunning(false), time)
    }


    // const drawShortestPath = (shortestPath) => {
    //     for (let i=1; i<shortestPath.length; i++) {
            // const node = shortestPath[i]
            // setTimeout(() => document.getElementById(`node-${node.row}-${node.col}`).className.baseVal = 'node node-shortest-path', i*30)
    //     }
    // }
    
    // need to make new node object and put it into new grid. then setgrid which re renders the grid
    // const testButton = () => {
    //     const newGrid = grid.slice()
    //     const targetNode = grid[12][12]
    //     const newNode = {
    //         ...targetNode,
    //         isWall: !targetNode.isWall,
    //         isVisited: false,
    //     }
    //     newGrid[12][12] = newNode
    //     setGrid(newGrid)
    // }

    // const test2 = () => {
    //     const newGrid = grid.slice()
    //     newGrid[12][12].isVisited = true
    //     setGrid(newGrid)    
    // }

    return(
        <>
        <div className="header1">
            {algoType === "" 
            ? <Button className="Button" variant='primary' disabled>Algorithm Required</Button> 
            : <Button className="Button" variant='primary' onClick={runAlgorithm}>{`Visualize ${algoType}`}</Button>}
            <Button className="Button" variant='outline-dark' onClick={clearWalls}>Clear Walls</Button>
            <Button className="Button" variant='outline-dark' onClick={clearPaths}>Clear Paths</Button>
        </div>

        <div className="header2">
            <DropdownButton title="Select Algorithm" variant='outline-dark'>
                <Dropdown.Item onClick={() => {
                    setAlgoType("A*")
                }}>A*
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {
                    setAlgoType("Dijkstra")
                }}>Dijkstra
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {
                    setAlgoType("BFS")
                }}>BFS
                </Dropdown.Item>
                <Dropdown.Item onClick={() => {
                    setAlgoType("DFS")
                }}>DFS
                </Dropdown.Item>
            </DropdownButton>
        </div>

        <div className="grid">
                {grid.map((row, rowIndex) => {
                    return (
                        <div key={rowIndex}>
                            {row.map((node, nodeIndex) => {
                                const {row, col, isGoal, isStart, isWall, isVisited, isShortestPath} = node;
                                return(
                                    <svg key={nodeIndex} className="svg">
                                        <Node
                                            key={nodeIndex}
                                            col={col}
                                            row={row}
                                            isGoal={isGoal}
                                            isStart={isStart}
                                            isWall={isWall}
                                            isVisited={isVisited}
                                            isShortestPath={isShortestPath}
                                            mousePress={mousePress}
                                            onMouseDown={(row, col) => handleMouseDown(row, col)}
                                            onMouseEnter={(row, col) => handleMouseEnter(row,col)}
                                            onMouseUp={() => handleMouseUp()}
                                        ></Node>
                                    </svg>
                                )
                            })}
                        </div>
                    )
                })}
            </div>
        </>
    );
}