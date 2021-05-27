import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas } from '../../util/Canvas';
import BoardState, { pickMoveRandomly, aiMove, buildLookup } from './Board';

let board: BoardState = BoardState.fromNumber(0);
let lookup: { [state: number] : string} = {};

let player1AI = true;
let player2AI = false;

let player1Turn = true;
let lastMoveTime = Date.now();

const aiMoveTime = 300;

function draw(c: CanvasRenderingContext2D, width: number, height: number): void {
    // updates game

    // makes move for AI at the necessary time
    let currentTime = Date.now();
    if ( ( (player1Turn && player1AI) || (!player1Turn && player2AI) ) && currentTime - lastMoveTime > aiMoveTime) {
        lastMoveTime = currentTime;
        let move = aiMove(board, lookup);
        board.makeMove(move[0], move[1]);

        // changes player turn
        player1Turn = !player1Turn;
    }

    // clears screen
    c.fillStyle = "#fef8f6";
    c.fillRect(0,0,width, height);

    drawBoardState(c, board, width, height, 10);
}

function drawBoardState(c: CanvasRenderingContext2D, board: BoardState, width: number, height: number, linewidth: number): void {
    // size of Xs and Os
    let symbolsize = 90;

    c.strokeStyle = "#483d38";
    c.lineWidth = linewidth;

    // draws grid
    for (var x = 0; x < 2; x++) {
        c.beginPath();
        c.moveTo( (x+1) * width/3, 0);
        c.lineTo( (x+1) * width/3, height);
        c.stroke();
    }
    for (var y = 0; y < 2; y++) {
        c.beginPath();
        c.moveTo(0, (y+1) * height/3);
        c.lineTo(width, (y+1) * height/3);
        c.stroke();
    }

    // draws Xs and Os on board
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 3; x++) {
            if (board.getState()[y*3 + x] === 'X') {
                c.beginPath();
                c.moveTo(x * width/3 + width/6 - symbolsize/2, y * height/3 + height/6 - symbolsize/2);
                c.lineTo(x * width/3 + width/6 + symbolsize/2, y * height/3 + height/6 + symbolsize/2);
                c.stroke();

                c.beginPath();
                c.moveTo(x * width/3 + width/6 + symbolsize/2, y * height/3 + height/6 - symbolsize/2);
                c.lineTo(x * width/3 + width/6 - symbolsize/2, y * height/3 + height/6 + symbolsize/2);
                c.stroke();
            }
            else if (board.getState()[y*3 + x] === 'O') {
                c.beginPath();
                c.arc(x * width/3 + width/6, y * height/3 + height/6, symbolsize/2, 0, 2 * Math.PI);
                c.stroke();
            }
        }
    }
}

let canvaswidth = 512;
let canvasheight = 512;

export const Tictactoe = () => {
    useEffect(() => {
        document.title = "Tictactoe";
        let blank = BoardState.fromNumber(0);
        buildLookup(blank, lookup);
    });

    return (
        <div className="mainContent">
            <Link to="/">Back to main page</Link>
            <Canvas contextType='2d' renderFunc={draw} width={canvaswidth} height={canvasheight} 
                mouseDown = {(e: MouseEvent) => {
                    if (board.findWinner() !== "_" || board.countType("_") === 0 || (player1Turn && player1AI) || (!player1Turn && player2AI)) {
                        return;
                    }

                    let xcoord = 2;
                    let ycoord = 2;
                    
                    if (e.offsetX < canvaswidth / 3) {
                        xcoord = 0;
                    }
                    else if (e.offsetX < 2 * canvaswidth / 3) {
                        xcoord = 1;
                    }

                    if (e.offsetY < canvasheight / 3) {
                        ycoord = 0;
                    }
                    else if (e.offsetY < 2 * canvasheight / 3) {
                        ycoord = 1;
                    }

                    let index = 3 * ycoord + xcoord;
                    let currentPlayer = board.getCurrentPlayer();
                    board.makeMove(index, currentPlayer);

                    lastMoveTime = Date.now();
                    player1Turn = !player1Turn;
                }}
            />
        </div>
    );
}

export default Tictactoe;