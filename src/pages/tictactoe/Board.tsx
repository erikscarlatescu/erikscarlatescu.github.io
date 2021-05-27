
class BoardState {
    private state: Array<string>;

    constructor(state: Array<string>) {
        // creates copy of state
        this.state = [...state];
    }

    public getState(): Array<string> {
        return this.state;
    }

    // represents board state as ternary number for ease of indexing in lookup table
    static fromNumber(state: number) {
        let s = new Array<string>(9);
        let bs  = new BoardState(s);

        for (let i = 8; i >= 0; i--) {
            let divisor = 3 ** i;
            let remainder = state / divisor;
            if (remainder < 1) {
                bs.state[i] = '_';
            }
            else if (remainder < 2) {
                bs.state[i] = 'X';
                state -= divisor;
            }
            else {
                bs.state[i] = 'O';
                state -= 2*divisor;
            }
        }

        return bs;
    }

    public toString(): string {
        let s = "";
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                s += this.state[row * 3 + col];
                s += " ";
            }
            s += "\n";
        }

        return s;
    }

    public toNumber(): number {
        let res = 0;

        let mult = 1;
        for (var i = 0; i < 9; i++) {
            if (this.state[i] === "X") {
                res += mult;
            }
            else if (this.state[i] === "O") {
                res += 2*mult;
            }

            mult *= 3;
        }
        return res;
    }

    public findWinner(): string {
        let winningPatterns = [ [0,1,2], [3,4,5], [6,7,8], [0,3,6], [1,4,7], [2,5,8], [0,4,8], [2,4,6] ]
        for (let i = 0; i < winningPatterns.length; i++) {
            let currentPattern = winningPatterns[i];

            // excludes possibilility that all 3 positions are blank
            if (this.state[currentPattern[0]] == "_")
                continue;

            // if all 3 match, a winner is found
            if (this.state[currentPattern[0]] == this.state[currentPattern[1]] &&
                this.state[currentPattern[1]] == this.state[currentPattern[2]]) {
                    return this.state[currentPattern[0]];
                }
        }
        // otherwise there is no winner
        return "_";
    }

    public makeMove(index: number, player: string): Boolean {
        // spot was already taken, move was unsuccessful
        // or, invalid player was passed in
        let legalMove = this.isMoveLegal(index, player);
        if (!legalMove) {
            return false;
        }

        this.state[index] = player;
        return true;
    }

    public isMoveLegal(index: number, player: string): Boolean {
        if (index < 0 || index >= 9 || this.state[index] != "_" || (player != "X" && player != "O") ) {
            return false;
        }

        return true;
    }

    public getCurrentPlayer(): string {
        // these could be theoretically done in one loop for the sake of "efficiency", but who cares?
        let numX = this.countType("X");
        let numO = this.countType("O");

        let currentPlayer = "X";
        if ((numX - numO) % 2 == 1) {
            currentPlayer = "O";
        }

        return currentPlayer;
    }

    public getLegalMoves(): Array<[number, string]> {
        let moves = new Array<[number, string]>();

        let currentPlayer = this.getCurrentPlayer();

        for (var i = 0; i < 9; i++) {
            if (this.state[i] == "_") {
                moves.push([i, currentPlayer]);
            }
        }

        return moves;
    }

    public countType(type: string): number {
        let count = 0;
        for (var i = 0; i < 9; i++) {
            if (this.state[i] == type) {
                count++;
            }
        }
        return count;
    }
}

export function pickMoveRandomly(moves: Array<[number, string]>): [number, string] {
    return moves[Math.floor(Math.random() * moves.length)];
}

export function aiMove(state: BoardState, lookup: { [state: number] : string}): [number, string] {
    let moves = state.getLegalMoves();

    let winningMoves = [];
    let drawingMoves = [];
    let losingMoves = [];

    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];

        let succ = BoardState.fromNumber(state.toNumber());
        succ.makeMove(move[0], move[1]);

        let winner = lookup[succ.toNumber()];
        if (winner === state.getCurrentPlayer()) {
            console.log("AI has determined winning move.");
            winningMoves.push(move);
        }
        else if (winner === "_") {
            drawingMoves.push(move);
        }
        else {
            losingMoves.push(move);
        }
    }

    if (winningMoves.length > 0) {
        return pickMoveRandomly(winningMoves);
    }
    else if (drawingMoves.length > 0) {
        return pickMoveRandomly(drawingMoves);
    }
    else if (losingMoves.length > 0) {
        return pickMoveRandomly(losingMoves);
    }

    // we should only reach this point when no moves are possible at all (board is full)
    return [0, 'X'];
}

export function buildLookup(state: BoardState, lookup: { [state: number] : string}): string {
    let stateNum = state.toNumber();
    if (stateNum in lookup) {
        return lookup[stateNum];
    }

    let moves = state.getLegalMoves();
    let currentPlayer = state.getCurrentPlayer();
    let oppositePlayer = currentPlayer == "X" ? "O" : "X";
    let winner = state.findWinner();

    if (winner !== "_") {
        lookup[stateNum] = winner;
        return winner;
    }

    // if there are zero legal moves left and no winner, the position is a draw
    if (moves.length === 0) {
        lookup[stateNum] = "_";
        return "_";
    }

    // assume position is losing by default
    let winning = oppositePlayer;
    for (var i = 0; i < moves.length; i++) {
        let move = moves[i];

        let succ = BoardState.fromNumber(state.toNumber());
        succ.makeMove(move[0], move[1]);

        let succWinning = buildLookup(succ, lookup);
        // if the position evaluated so far is losing for the current player,
        // the best we can do is the new node that we've found
        if (winning === oppositePlayer) {
            winning = succWinning;
        }
        else if (winning === "_" && succWinning === currentPlayer) {
            winning = currentPlayer;
        }
    }
    lookup[stateNum] = winning;
    return winning;
}

export default BoardState;