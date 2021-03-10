export function dijkstra(grid, startNode, goalNode) {
        const visitedNodes = []
        startNode.distance = 0
        const unvisitedNodes = listAllNodes(grid)
        while (unvisitedNodes.length > 0) {
            sortNodes(unvisitedNodes)
            const closestNode = unvisitedNodes.shift()
            const visitedNodesNoGoal = visitedNodes.slice()
            if (closestNode.isWall) continue
            if (closestNode.distance === Infinity) return visitedNodesNoGoal
            closestNode.isVisited = true
            visitedNodes.push(closestNode)
            const visitedNodesGoal = visitedNodes.slice()
            if (closestNode === goalNode) return visitedNodesGoal
            getDistanceOfNeighborsDijkstra(grid, closestNode)
        }   
    }

export function astar(grid, startNode, goalNode) {
    const visitedNodes = []
    const heuristicStart = Math.sqrt((goalNode.row- startNode.row)**2 + (goalNode.col - startNode.col)**2)
    startNode.distance = 0 + heuristicStart
    startNode.gScore = 0
    const unvisitedNodes = listAllNodes(grid)
    while (unvisitedNodes.length > 0) {
        sortNodes(unvisitedNodes)
        const closestNode = unvisitedNodes.shift()
        const visitedNodesNoGoal = visitedNodes.slice()
        if (closestNode.isWall) continue
        if (closestNode.distance === Infinity) return visitedNodesNoGoal
        closestNode.isVisited = true
        visitedNodes.push(closestNode)
        const visitedNodesGoal = visitedNodes.slice()
        if (closestNode === goalNode) return visitedNodesGoal
        getDistanceOfNeighborsAstar(grid, closestNode, goalNode)
    }   
}

export function dfs(grid, startNode, goalNode) {
    const visitedNodes = []
    const stack = [startNode]
    while (stack.length > 0) {
        const currentNode = stack.pop()
        if (currentNode.isWall) continue
        currentNode.isVisited = true
        visitedNodes.push(currentNode)
        if (currentNode === goalNode) return visitedNodes
        const neighbors = getNeighbors(grid, currentNode)
        for (let neighbor of neighbors) {
            neighbor.previousNode = currentNode
            stack.push(neighbor)
        }
    }
    return visitedNodes
}

export function bfs(grid, startNode, goalNode) {
    const visitedNodes = []
    startNode.isVisited = true
    const queue = [startNode]
    while (queue.length > 0) {
        const currentNode = queue.shift()
        if (currentNode.isWall) continue
        visitedNodes.push(currentNode)
        if (currentNode === goalNode) return visitedNodes
        const neighbors = getNeighbors(grid, currentNode)
        for (let neighbor of neighbors) {
            neighbor.previousNode = currentNode
            neighbor.isVisited = true
            queue.push(neighbor)
        }
    }
    return visitedNodes
}
    
function listAllNodes(grid) {
    const nodes = []
    for (let row of grid) {
        for (let node of row) {
            nodes.push(node)
        }
    }
    return nodes
}

function sortNodes(allNodes) {
    allNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance)
}

function getNeighbors(grid, node) {
    const neighbors = []
    const {row, col} = node
    // 1 in y direction
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col])
    // 1 in x direction
    if (col < grid[0].length - 1) neighbors.push(grid[row][col+1])
    // -1 in y direction
    if (row > 0) neighbors.push(grid[row-1][col])
    //-1 in x direction
    if (col > 0) neighbors.push(grid[row][col-1])
    // remove visited neighbors
    return neighbors.filter(neighbor => !neighbor.isVisited)
}

function getDistanceOfNeighborsDijkstra(grid, node) {
    const neighbors = getNeighbors(grid, node)
    for (let neighbor of neighbors) {
        const tempDistance = node.distance + 1
        if (tempDistance < neighbor.distance) {
            neighbor.distance = tempDistance
        }
        neighbor.previousNode = node
    }
}

function getDistanceOfNeighborsAstar(grid, node, goalNode) {
    const neighbors = getNeighbors(grid, node)
    for (let neighbor of neighbors) {
        const neighborX = neighbor.col
        const neighborY = neighbor.row
        const goalNodeX = goalNode.col
        const goalNodeY = goalNode.row
        //use manhattan distance for heuristic
        const heuristic = Math.abs(goalNodeY - neighborY) + Math.abs(goalNodeX - neighborX)
        const gScore = node.gScore + 1
        const tempDistance = gScore + heuristic
        if (tempDistance < neighbor.distance) {
            neighbor.distance = tempDistance
            neighbor.gScore = gScore
            neighbor.previousNode = node
        }
        neighbor.isVisited = false
    }
}

export function getShortestPath(allPaths, startNode) {
    const shortestPath = []
    // maybe change pop ?
    const copyPaths = allPaths.slice()
    let currentNode = copyPaths.pop()
    shortestPath.unshift(currentNode)
    while (currentNode != startNode) {
        shortestPath.unshift(currentNode.previousNode)
        currentNode = currentNode.previousNode
    }
    return shortestPath
}