import React from 'react';
import './Node.css'

export default function Node(props) {
    const {
        col,
        isGoal,
        isStart,
        isWall,
        isVisited,
        isShortestPath,
        onMouseDown,
        onMouseUp,
        onMouseEnter,
        row
    } = props
    const extraClassName = isGoal ? 'node-goal' : isStart ? 'node-start' : isWall ? 'node-wall' : isVisited ? 'node-visited' : isShortestPath ? 'node-shortest-path' : ''
    return (
        <rect
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={() => onMouseDown(row,col)}
        onMouseUp={() => onMouseUp(row,col)}
        onMouseEnter={() => onMouseEnter(row,col)}>
        </rect>
    )
}
