// 1. only allow piece to move if it's your turn
// 2. move piece
// 3. check if the move is legal
// 4. if move is illegal dont move piece
// 5. when piece is moved, make a sound
// 6. if opponent's move, flip board
// 7. if a piece is captured, remove the piece
// 8. when checkmate, stop the game

let currentPiece = null;
let originalSquare = null;
let legalMoves = [];
let newSelectedPiece = null;
let turn = 'W';
let availableSquares = null;
let opponentColour = "B";
let hasKingWMoved = false;
let hasKingBMoved = false;
let hasRookW1Moved = false;
let hasRookW2Moved = false;
let hasRookB1Moved = false;
let hasRookB2Moved = false;
let check = false;
let checkMoves = [];
let kingCheck = false;
let checkPiece = [];
let checkPieceAgain = [];
let counter = 0;
let existChecker = false;
let possibleMove = null;
let attackingPieceID = null;
let checkmate = true;
// let stopChecker = false;

let selectedPiece = document.querySelectorAll("#pawnW1, #pawnW2, #pawnW3, #pawnW4, #pawnW5, #pawnW6, #pawnW7, #pawnW8, \
 #pawnB1, #pawnB2, #pawnB3, #pawnB4, #pawnB5, #pawnB6, #pawnB7, #pawnB8, #rookW1, #rookW2, #rookB1, #rookB2, #knightW1, #knightW2, \
 #knightB1, #knightB2, #bishopW1, #bishopW2, #bishopB1, #bishopB2, #queenW1, #queenB1, #queenW2, #queenB2, #queenW3, #queenB3, \
 #queenW4, #queenB4, #queenW5, #queenB5, #queenW6, #queenB6, #queenW7, #queenB7, #queenW8, #queenB8, #queenW9, #queenB9, #kingW1, #kingB1");

const board = document.querySelector(".board");
const squares = board.querySelectorAll("div");

selectedPiece.forEach(piece => {
    if (piece.id.includes(turn)) {
        piece.addEventListener("click", selectPiece);
    }
});

// select piece
function selectPiece(event) {
    // removes the event listeners from the previous legal moves if new piece is selected
    legalMoves.forEach(square => {
        square.removeEventListener("click", movePiece);
    })

    removeMoves(legalMoves); // removes possible moves from any previously selected piece 
    counter = 0;
    existsCheck(); // check for any checks in the current position
    legalMoves = [];
    pieceType(event.target);

    opponentColour = event.target.id.includes("W") ? "B" : "W";
    turn = event.target.id.includes("W") ? "W" : "B";

    for (let i = 0; i < legalMoves.length; i++) {         
        console.log("number of legal moves", legalMoves.length);
        possibleMove = legalMoves[i];
        const legalMovesAgain = legalMoves;
        console.log("legal moves before exist check:", legalMovesAgain);
        legalMoves = [];
        possibleMove.id ? attackingPieceID = possibleMove.id : null;
        let originalID = event.target.id;
        possibleMove.id = originalID;
        event.target.removeAttribute("id");

        existsCheck();
        legalMoves = [];
        // console.log(check);
        event.target.id = originalID;
        attackingPieceID ? possibleMove.id = attackingPieceID : possibleMove.removeAttribute("id");
        attackingPieceID = null;
        legalMoves = legalMovesAgain;
        console.log("legal moves after exist check", legalMoves);
        if (check) {
            removeMoves(possibleMove);
            possibleMove.removeEventListener("click", movePiece);
            check = false;
            legalMoves.splice(i, 1); // removes one element from index i
            i--;
        }
    }

    showMoves(legalMoves);

    if (legalMoves == []) {
        return;
    }

    // removes event listeners from the opponent's pieces
    selectedPiece.forEach(piece => {
        if (piece.id.includes(opponentColour)) {
            piece.removeEventListener("click", selectPiece);
        }
    });

    // adds an event listener to the previously selected piece
    if (currentPiece) {
        originalSquare.addEventListener("click", selectPiece);
    }

    currentPiece = event.target.id;
    // console.log(currentPiece);
    originalSquare = event.target;

    originalSquare.removeEventListener("click", selectPiece); // removes the event listener from the orignal square that the piece was in
    
    // adds event listeners to the squares of possible moves
    legalMoves.forEach(square => {
        if (!square.id.startsWith("king")) {
            square.addEventListener("click", movePiece);
        }
    });
}

// move piece
function movePiece(event) {
    removeMoves(legalMoves);

    if (currentPiece.startsWith("king") && (event.target.classList.contains("castling1") || event.target.classList.contains("castling2"))) {
        castling(originalSquare, event.target);
        console.log("castling");
    }

    originalSquare.removeAttribute("id");
    event.target.id = currentPiece;
    
    if ((Array.from(event.target.classList).some(className => className.includes("8")) || Array.from(event.target.classList).some(className => className.includes("1"))) && currentPiece.startsWith("pawn")) {
        pawnPromotion(event.target);
    }

    if (currentPiece == "kingW1") {
        hasKingWMoved = true;
    } 
    if (currentPiece == "kingB1") {
        hasKingBMoved = true;
    }
    if (currentPiece == "rookW1") {
        hasRookW1Moved = true;
    } 
    if (currentPiece == "rookB1") {
        hasRookB1Moved = true;
    }
    if (currentPiece == "rookW2") {
        hasRookW2Moved = true;
    }
    if (currentPiece == "rookB2") {
        hasRookB2Moved = true;
    }

    currentPiece = null;

    legalMoves.forEach(square => {
        square.removeEventListener("click", movePiece); // removes the event listeners from all squares to allow only pieces to be now selected
    });

    // removes event listeners from the current colour pieces
    selectedPiece.forEach(piece => {
        if (piece.id.includes(turn)) {
            piece.removeEventListener("click", selectPiece);
        }
    });

    opponentColour = event.target.id.includes("W") ? "B" : "W";

    // the selectedPiece node lists needs to updated with the new positions of the pieces
    selectedPiece = document.querySelectorAll("#pawnW1, #pawnW2, #pawnW3, #pawnW4, #pawnW5, #pawnW6, #pawnW7, #pawnW8, \
     #pawnB1, #pawnB2, #pawnB3, #pawnB4, #pawnB5, #pawnB6, #pawnB7, #pawnB8, #rookW1, #rookW2, #rookB1, #rookB2, #knightW1, #knightW2, \
     #knightB1, #knightB2, #bishopW1, #bishopW2, #bishopB1, #bishopB2, #queenW1, #queenB1, #queenW2, #queenB2, #queenW3, #queenB3, \
     #queenW4, #queenB4, #queenW5, #queenB5, #queenW6, #queenB6, #queenW7, #queenB7, #queenW8, #queenB8, #queenW9, #queenB9, #kingW1, #kingB1");

    // adds event listeners to the opponent's colour pieces
    selectedPiece.forEach(piece => {
        if (piece.id.includes(opponentColour)) {
            piece.addEventListener("click", selectPiece);
        }
    });

    const temp = opponentColour;
    opponentColour = turn;
    turn = temp;

    // console.log(opponentColour);

    existsCheck();
    legalMoves = [];
    console.log("is it check", check);
    if (check) {
        turn = opponentColour;
        opponentColour = temp;
        const pieces = document.querySelectorAll(`[id*=${opponentColour}]`);
        stopChecker = true;
        let totalMoves = 0;
        let checkCounter = 0;
        pieces.forEach(element => {
            pieceType(element);
            totalMoves += legalMoves.length;
            for (let i = 0; i < legalMoves.length; i++) {         
                possibleMove = legalMoves[i];
                const legalMovesAgain = legalMoves;
                legalMoves = [];
                possibleMove.id ? attackingPieceID = possibleMove.id : null;
                let originalID = element.id;
                possibleMove.id = originalID;
                element.removeAttribute("id");
                existsCheck();
                console.log("legal moves after checked", legalMoves);
                legalMoves = [];
                console.log("is this check:", check);
                console.log("piece:", element);
                console.log("is this checkmate:", checkmate);
                element.id = originalID;
                attackingPieceID ? possibleMove.id = attackingPieceID : possibleMove.removeAttribute("id");
                attackingPieceID = null;
                legalMoves = legalMovesAgain;
                // console.log("legal moves after checked", legalMoves);
                if (check) {
                    checkCounter++;
                    check = false;
                    legalMoves.splice(i, 1); // removes one element from index i
                    i--;
                } else {
                    console.log("checkmate false with piece:", element);
                    checkmate = false;
                    break;
                }
            }
        });

        if (checkmate || checkCounter == totalMoves) {
            if (turn == 'B') {
                const checkmateDiv = document.querySelector(".checkmateWhite");
                checkmateDiv.classList.add("show");
                console.log("checkmate");
                return;
            } else {
                const checkmateDiv = document.querySelector(".checkmateBlack");
                checkmateDiv.classList.add("show");
                console.log("checkmate");
                return;
            }
        }
    }
    // console.log(opponentColour);

    opponentColour = event.target.id.includes("W") ? "W" : "B";
    turn = event.target.id.includes("W") ? "B" : "W";
    legalMoves = [];
}

// show possible moves
const showMoves = (legalMoves) => {
    for (let i = 0; i < legalMoves.length; i++) {
        !legalMoves[i].id.startsWith("king") ? legalMoves[i].classList.add("legalMoves") : null;
    }
}

// remove possible moves
const removeMoves = (legalMoves) => {
    for (let i = 0; i < legalMoves.length; i++) {
        !legalMoves[i].id.startsWith("king") ? legalMoves[i].classList.remove("legalMoves") : null;
    }
}

// get the type of piece selected
const pieceType = (piece) => {
    checkMoves = [];
    if (piece.id.includes("pawn")) {
        pawnMoves(piece);
        return;
    } else if (piece.id.includes("knight")) {
        knightMoves(piece);
        return;
    } else if (piece.id.includes("bishop")) {
        bishopMoves(piece);
        return;
    } else if (piece.id.includes("rook")) {
        rookMoves(piece);
        return;
    } else if (piece.id.includes("queen")) {
        queenMoves(piece);
        return;
    } else if (piece.id.includes("king")) {
        kingMoves(piece);
        return;
    }
}

// check if character is between a and h
const isLetterOnBoard = (character) => {
    return 97 <= character.charCodeAt(0) && character.charCodeAt(0) <= 104;
}

// check if number is between 1 and 8
const isNumberOnBoard = (number) => {
    return 1 <= number && number <= 8;
}

// check if the kings will be in touching distance
const willTwoKingsTouch = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = Number(currentPosition[1]);

    const opponentsKing = document.querySelector(`#king${opponentColour}1`);
    const position = opponentsKing.classList[0];
    const file = position[0];
    const rank = Number(position[1]);
    
    return Math.abs(currentRank - rank) < 2 && Math.abs(currentFile.charCodeAt(0) - file.charCodeAt(0)) < 2;
}

// castling
const castling = (square, event) => {
    if (turn == "W") {
        if (event.classList.contains("castling1") && square.id.includes("kingW1")) {
            const rookW1 = document.querySelector("#rookW1");
            rookW1.removeAttribute("id");
            rookW1.removeEventListener("click", selectPiece);
            document.querySelector(".d1").id = "rookW1";
            event.classList.remove("castling1");
        } else if (event.classList.contains("castling2") && square.id.includes("kingW1")) {
            const rookW2 = document.querySelector("#rookW2");
            rookW2.removeAttribute("id");
            rookW2.removeEventListener("click", selectPiece);
            document.querySelector(".f1").id = "rookW2";
            event.classList.remove("castling2");
        }
    } else if (turn == "B"){
        if (event.classList.contains("castling1") && square.id.includes("kingB1")) {
            const rookB1 = document.querySelector("#rookB1");
            rookB1.removeAttribute("id");
            rookB1.removeEventListener("click", selectPiece);
            document.querySelector(".d8").id = "rookB1";
            event.classList.remove("castling1");
        } else if (event.classList.contains("castling2") && square.id.includes("kingB1")) {
            const rookB2 = document.querySelector("#rookB2");
            rookB2.removeAttribute("id");
            rookB2.removeEventListener("click", selectPiece);
            document.querySelector(".f8").id = "rookB2";
            event.classList.remove("castling2");
        }
    }
}

// check if a move creates check
const isCheck = (square) => {
    if (!square.id.includes("king")) {
        pieceType(square);
        if (checkMoves.length > 0) {
            // console.log("check");
            check = true;
            // console.log(checkMoves);
            checkPiece.push(square);
        } 
    }
}

// check if king moves into check
const kingIntoCheck = () => {
    legalMoves = [];
    kingCheck = true;

    if (turn == "W") {
        const pawns = document.querySelectorAll("[id^='pawnB']");
        for (let pawn of pawns) { // 'in' specifies index and 'of' specifies element
            pawn ? pawnMoves(pawn) : null;
        }
        const knights = document.querySelectorAll("[id^='knightB']"); // ^= is id starts with
        for (let knight of knights) {
            knight ? knightMoves(knight) : null;
        }
        const bishops = document.querySelectorAll("[id^='bishopB']");
        for (let bishop of bishops) {
            bishop ? bishopMoves(bishop) : null;
        }
        const rooks = document.querySelectorAll("[id^='rookB']");
        for (let rook of rooks) {
            rook ? rookMoves(rook) : null;
        }
        const queen = document.querySelector("[id^='queenB']");
        queen ? queenMoves(queen) : null;
    } else {
        const pawns = document.querySelectorAll("[id^='pawnW']");
        for (let pawn of pawns) { // 'in' specifies index and 'of' specifies element
            pawn ? pawnMoves(pawn) : null;
        }
        const knights = document.querySelectorAll("[id^='knightW']"); // ^= is id starts with
        for (let knight of knights) {
            knight ? knightMoves(knight) : null;
        }
        const bishops = document.querySelectorAll("[id^='bishopW']");
        for (let bishop of bishops) {
            bishop ? bishopMoves(bishop) : null;
        }
        const rooks = document.querySelectorAll("[id^='rookW']");
        for (let rook of rooks) {
            rook ? rookMoves(rook) : null;
        }
        const queen = document.querySelector("[id^='queenW']");
        queen ? queenMoves(queen) : null;
    }
    kingCheck = false;
}

const existsCheck = () => {
    const prevMoves = legalMoves;
    checkMoves = [];
    existChecker = true;
    checkPiece = [];
    check = false;

    if (turn == "W") {
        const pawns = document.querySelectorAll("[id^='pawnB']");
        for (let pawn of pawns) { // 'in' specifies index and 'of' specifies element
            pawn ? isCheck(pawn) : null;
        }
        const knights = document.querySelectorAll("[id^='knightB']"); // ^= is id starts with
        for (let knight of knights) {
            knight ? isCheck(knight) : null;
        }
        const bishops = document.querySelectorAll("[id^='bishopB']");
        for (let bishop of bishops) {
            bishop ? isCheck(bishop) : null;
        }
        // console.log(legalMoves);
        const rooks = document.querySelectorAll("[id^='rookB']");
        for (let rook of rooks) {
            rook ? isCheck(rook) : null;
        }
        const queen = document.querySelector("[id^='queenB']");
        queen ? isCheck(queen) : null;
    } else {
        const pawns = document.querySelectorAll("[id^='pawnW']");
        for (let pawn of pawns) { // 'in' specifies index and 'of' specifies element
            pawn ? isCheck(pawn) : null;
        }
        const knights = document.querySelectorAll("[id^='knightW']"); // ^= is id starts with
        for (let knight of knights) {
            knight ? isCheck(knight) : null;
        }
        const bishops = document.querySelectorAll("[id^='bishopW']");
        for (let bishop of bishops) {
            bishop ? isCheck(bishop) : null;
        }
        const rooks = document.querySelectorAll("[id^='rookW']");
        for (let rook of rooks) {
            rook ? isCheck(rook) : null;
        }
        const queen = document.querySelector("[id^='queenW']");
        queen ? isCheck(queen) : null;
    }
    checkPiece.length !== 0 ? check = true : check = false;
    existChecker = false;
}

const pawnPromotion = (square) => {
    console.log(square);
    const isPawnW = square.id.includes("pawnW");
    const isPawnB = square.id.includes("pawnB");
    // console.log("promotion");
    let numQueens = document.querySelectorAll(`[id^='queen${turn}']`).length + 1;

    if (Array.from(square.classList).some(className => className.includes("8")) && isPawnW) {
        square.removeAttribute('id');
        square.id = "queenW" + numQueens;
    } else if (Array.from(square.classList).some(className => className.includes("1")) && isPawnB) {
        square.removeAttribute('id');
        square.id = "queenB" + numQueens;
    }
}

// ------------------------------------------piece moves-------------------------------------

const pawnMoves = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = currentPosition[1];

    const isPawnW = square.id.includes("pawnW");
    const isPawnB = square.id.includes("pawnB");

    const direction = isPawnW ? 1 : -1; // ? is a ternary operator and checks if isPawnW is true

    const nextRank = Number(currentRank) + Number(direction);
    const oneSquareForward = document.querySelector(`.${currentFile}${nextRank}`);
    if (oneSquareForward && !oneSquareForward.id && !legalMoves.includes(oneSquareForward)) {
        legalMoves.push(oneSquareForward);
    }

    const initialRank = isPawnW ? "2" : "7";

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    if (currentRank == initialRank) {
        const nextTwoRanks = Number(currentRank) + 2 * Number(direction);
        const twoSquaresForward = document.querySelector(`.${currentFile}${nextTwoRanks}`);
        if (!twoSquaresForward.id && !oneSquareForward.id && !legalMoves.includes(twoSquaresForward)) {
            legalMoves.push(twoSquaresForward);
        }
    }

    const leftFile = String.fromCharCode(currentFile.charCodeAt(0) - 1);
    const rightFile = String.fromCharCode(currentFile.charCodeAt(0) + 1);

    const leftDiagonal = isLetterOnBoard(leftFile) && isNumberOnBoard(nextRank) ? document.querySelector(`.${leftFile}${nextRank}`) : null;
    const rightDiagonal = isLetterOnBoard(rightFile) && isNumberOnBoard(nextRank) ? document.querySelector(`.${rightFile}${nextRank}`) : null;

    leftDiagonal && leftDiagonal.id.includes(opponentColour) && !legalMoves.includes(leftDiagonal) ? legalMoves.push(leftDiagonal) : null;
    // check if left diagonal attacks a king
    if (leftDiagonal && leftDiagonal.id.includes(opponentColour) && leftDiagonal.id.startsWith("king")) {
        checkMoves.push(leftDiagonal);
        return;
    }

    // make sure king can't enter these squares
    leftDiagonal && !leftDiagonal.id && kingCheck && !legalMoves.includes(leftDiagonal) ? legalMoves.push(leftDiagonal) : null;
    rightDiagonal && !rightDiagonal.id && kingCheck && !legalMoves.includes(rightDiagonal) ? legalMoves.push(rightDiagonal) : null;

    rightDiagonal && rightDiagonal.id.includes(opponentColour) && !legalMoves.includes(rightDiagonal) ? legalMoves.push(rightDiagonal) : null;
    // check if right diagonal attacks a king
    if (rightDiagonal && rightDiagonal.id.includes(opponentColour) && rightDiagonal.id.startsWith("king")) {
        checkMoves.push(rightDiagonal);
        return;
    }
}

const knightMoves = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = currentPosition[1];

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    const nextRank = Number(currentRank) + 1;
    const previousRank = Number(currentRank) - 1;
    const nextTwoRanks = Number(currentRank) + 2;
    const previousTwoRanks = Number(currentRank) - 2;

    const nextFile = String.fromCharCode(currentFile.charCodeAt(0) + 1);
    const previousFile = String.fromCharCode(currentFile.charCodeAt(0) - 1);
    const nextTwoFiles = String.fromCharCode(currentFile.charCodeAt(0) + 2);
    const previousTwoFiles = String.fromCharCode(currentFile.charCodeAt(0) - 2);

    // check the squares are on the board
    const leftTop = isLetterOnBoard(previousTwoFiles) && isNumberOnBoard(nextRank) ? document.querySelector(`.${previousTwoFiles}${nextRank}`) : null;
    const topLeft = isLetterOnBoard(previousFile) && isNumberOnBoard(nextTwoRanks) ? document.querySelector(`.${previousFile}${nextTwoRanks}`) : null;
    const topRight = isLetterOnBoard(nextFile) && isNumberOnBoard(nextTwoRanks) ? document.querySelector(`.${nextFile}${nextTwoRanks}`) : null;
    const rightTop = isLetterOnBoard(nextTwoFiles) && isNumberOnBoard(nextRank) ? document.querySelector(`.${nextTwoFiles}${nextRank}`) : null;
    const rightBottom = isLetterOnBoard(nextTwoFiles) && isNumberOnBoard(previousRank) ? document.querySelector(`.${nextTwoFiles}${previousRank}`) : null;
    const bottomRight = isLetterOnBoard(nextFile) && isNumberOnBoard(previousTwoRanks) ? document.querySelector(`.${nextFile}${previousTwoRanks}`) : null;
    const bottomLeft = isLetterOnBoard(previousFile) && isNumberOnBoard(previousTwoRanks) ? document.querySelector(`.${previousFile}${previousTwoRanks}`) : null;
    const leftBottom = isLetterOnBoard(previousTwoFiles) && isNumberOnBoard(previousRank) ? document.querySelector(`.${previousTwoFiles}${previousRank}`) : null;

    // checks that the squares are valid moves
    leftTop && (!leftTop.id.includes(turn) || !leftTop.id) && !legalMoves.includes(leftTop) ? legalMoves.push(leftTop) : null;
    topLeft && (!topLeft.id.includes(turn) || !topLeft.id) && !legalMoves.includes(topLeft) ? legalMoves.push(topLeft) : null;
    topRight && (!topRight.id.includes(turn) || !topRight.id) && !legalMoves.includes(topRight) ? legalMoves.push(topRight) : null;
    rightTop && (!rightTop.id.includes(turn) || !rightTop.id) && !legalMoves.includes(rightTop) ? legalMoves.push(rightTop) : null;
    rightBottom && (!rightBottom.id.includes(turn) || !rightBottom.id) && !legalMoves.includes(rightBottom) ? legalMoves.push(rightBottom) : null;
    bottomRight && (!bottomRight.id.includes(turn) || !bottomRight.id) && !legalMoves.includes(bottomRight) ? legalMoves.push(bottomRight) : null;
    bottomLeft && (!bottomLeft.id.includes(turn) || !bottomLeft.id) && !legalMoves.includes(bottomLeft) ? legalMoves.push(bottomLeft) : null;
    leftBottom && (!leftBottom.id.includes(turn) || !leftBottom.id) && !legalMoves.includes(leftBottom) ? legalMoves.push(leftBottom) : null;

    if (leftTop && leftTop.id.includes(opponentColour) && leftTop.id.startsWith("king")) {
        checkMoves.push(leftTop);
        return;
    }
    if (topLeft && topLeft.id.includes(opponentColour) && topLeft.id.startsWith("king")) {
        checkMoves.push(topLeft);
        return;
    }
    if (topRight && topRight.id.includes(opponentColour) && topRight.id.startsWith("king")) {
        checkMoves.push(topRight);
        return;
    }
    if (rightTop && rightTop.id.includes(opponentColour) && rightTop.id.startsWith("king")) {
        checkMoves.push(rightTop);
        return;
    }
    if (rightBottom && rightBottom.id.includes(opponentColour) && rightBottom.id.startsWith("king")) {
        checkMoves.push(rightBottom);
        return;
    }
    if (bottomRight && bottomRight.id.includes(opponentColour) && bottomRight.id.startsWith("king")) {
        checkMoves.push(bottomRight);
        return;
    }
    if (bottomLeft && bottomLeft.id.includes(opponentColour) && bottomLeft.id.startsWith("king")) {
        checkMoves.push(bottomLeft);
        return;
    }
    if (leftBottom && leftBottom.id.includes(opponentColour) && leftBottom.id.startsWith("king")) {
        checkMoves.push(leftBottom);
        return;
    }

    if (existChecker){
        opponentColour = square.id.includes("W") ? "W" : "B";
        turn = square.id.includes("W") ? "B" : "W";
    }
}

const bishopMoves = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = currentPosition[1];

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    // top left diagonal
    for (i = 1; i < 8; i++) {
        const previousFile = String.fromCharCode(currentFile.charCodeAt(0) - i);
        const nextRank = Number(currentRank) + i;
        if (isLetterOnBoard(previousFile) && isNumberOnBoard(nextRank)) {
            const checkSquare = document.querySelector(`.${previousFile}${nextRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    // console.log(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }
    // top right diagonal
    for (i = 1; i < 8; i++) {
        const nextFile = String.fromCharCode(currentFile.charCodeAt(0) + i);
        const nextRank = Number(currentRank) + i;
        if (isLetterOnBoard(nextFile) && isNumberOnBoard(nextRank)) {
            const checkSquare = document.querySelector(`.${nextFile}${nextRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }
    // bottom right diagonal
    for (i = 1; i < 8; i++) {
        const nextFile = String.fromCharCode(currentFile.charCodeAt(0) + i);
        const previousRank = Number(currentRank) - i;
        if (isLetterOnBoard(nextFile) && isNumberOnBoard(previousRank)) {
            const checkSquare = document.querySelector(`.${nextFile}${previousRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }
    // bottom left diagonal
    for (i = 1; i < 8; i++) {
        const previousFile = String.fromCharCode(currentFile.charCodeAt(0) - i);
        const previousRank = Number(currentRank) - i;
        if (isLetterOnBoard(previousFile) && isNumberOnBoard(previousRank)) {
            const checkSquare = document.querySelector(`.${previousFile}${previousRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }
    if (existChecker){
        opponentColour = square.id.includes("W") ? "W" : "B";
        turn = square.id.includes("W") ? "B" : "W";
    }
}

const rookMoves = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = currentPosition[1];

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    // left direction
    for (i = 1; i < 8; i++) {
        const nextFile = String.fromCharCode(currentFile.charCodeAt(0) + i);

        if (isLetterOnBoard(nextFile)) {
            const checkSquare = document.querySelector(`.${nextFile}${currentRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }

    // right direction
    for (i = 1; i < 8; i++) {
        const previousFile = String.fromCharCode(currentFile.charCodeAt(0) - i);

        if (isLetterOnBoard(previousFile)) {
            const checkSquare = document.querySelector(`.${previousFile}${currentRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }

    // forward direction
    for (i = 1; i < 8; i++) {
        const nextRank = Number(currentRank) + i;

        if (isNumberOnBoard(nextRank)) {
            const checkSquare = document.querySelector(`.${currentFile}${nextRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }

     // backward direction
    for (i = 1; i < 8; i++) {
        const previousRank = Number(currentRank) - i;

        if (isNumberOnBoard(previousRank)) {
            const checkSquare = document.querySelector(`.${currentFile}${previousRank}`);
            if (checkSquare.id.includes(opponentColour) && checkSquare.id.startsWith("king") && !legalMoves.includes(checkSquare)) {
                checkMoves.push(checkSquare);
                legalMoves.push(checkSquare);
                break;
            }
            if (!checkSquare.id && !legalMoves.includes(checkSquare)) {
                legalMoves.push(checkSquare);
            }
            if (checkSquare.id.includes(opponentColour)) {
                if (!legalMoves.includes(checkSquare)) {
                    legalMoves.push(checkSquare);
                    break; // exit the for loop
                } else {
                    break;
                }
            }
            if (checkSquare.id.includes(turn)) {
                break;
            }
        } else {
            break;
        }
    }
    if (existChecker){
        opponentColour = square.id.includes("W") ? "W" : "B";
        turn = square.id.includes("W") ? "B" : "W";
    }
}

const queenMoves = (square) => {
    bishopMoves(square);
    rookMoves(square);
}

const kingMoves = (square) => {
    const currentPosition = square.classList[0];
    const currentFile = currentPosition[0];
    const currentRank = currentPosition[1];

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    const nextFile = String.fromCharCode(currentFile.charCodeAt(0) + 1);
    const previousFile = String.fromCharCode(currentFile.charCodeAt(0) - 1);
    const nextRank = Number(currentRank) + 1;
    const previousRank = Number(currentRank) - 1;
    const nextTwoFiles = String.fromCharCode(currentFile.charCodeAt(0) + 2);
    const previousTwoFiles = String.fromCharCode(currentFile.charCodeAt(0) - 2);
    const previousThreeFiles = String.fromCharCode(currentFile.charCodeAt(0) - 3);

    var oneSquareForward = isNumberOnBoard(nextRank) ? document.querySelector(`.${currentFile}${nextRank}`) : null;
    var oneSquareBackwards = isNumberOnBoard(previousRank) ? document.querySelector(`.${currentFile}${previousRank}`) : null;
    var oneSquareRight = isLetterOnBoard(previousFile) ? document.querySelector(`.${nextFile}${currentRank}`) : null;
    var oneSquareLeft = isLetterOnBoard(nextFile) ? document.querySelector(`.${previousFile}${currentRank}`) : null;
    var topLeftDiagonal = isLetterOnBoard(previousFile) && isNumberOnBoard(nextRank) ? document.querySelector(`.${previousFile}${nextRank}`) : null;
    var bottomLeftDiagonal = isLetterOnBoard(previousFile) && isNumberOnBoard(previousRank) ? document.querySelector(`.${previousFile}${previousRank}`) : null;
    var topRightDiagonal = isLetterOnBoard(nextFile) && isNumberOnBoard(nextRank) ? document.querySelector(`.${nextFile}${nextRank}`) : null;
    var bottomRightDiagonal = isLetterOnBoard(nextFile) && isNumberOnBoard(previousRank) ? document.querySelector(`.${nextFile}${previousRank}`) : null; 
    
    kingIntoCheck();

    opponentColour = square.id.includes("W") ? "B" : "W";
    turn = square.id.includes("W") ? "W" : "B";

    if (legalMoves.includes(oneSquareForward)) {
        oneSquareForward = null;
    }
    if (legalMoves.includes(oneSquareBackwards)) {
        oneSquareBackwards = null;
    }
    if (legalMoves.includes(oneSquareLeft)) {
        oneSquareLeft = null;
    }
    if (legalMoves.includes(oneSquareRight)) {
        oneSquareRight = null;
    }
    if (legalMoves.includes(topLeftDiagonal)) {
        topLeftDiagonal = null;
    }
    if (legalMoves.includes(bottomLeftDiagonal)) {
        bottomLeftDiagonal = null;
    }
    if (legalMoves.includes(topRightDiagonal)) {
        topRightDiagonal = null;
    }
    if (legalMoves.includes(bottomRightDiagonal)) {
        bottomRightDiagonal = null;
    }

    legalMoves = [];

    oneSquareForward && !willTwoKingsTouch(oneSquareForward) && (!oneSquareForward.id || oneSquareForward.id.includes(opponentColour)) ? legalMoves.push(oneSquareForward) : null;
    oneSquareBackwards && !willTwoKingsTouch(oneSquareBackwards) && (!oneSquareBackwards.id || oneSquareBackwards.id.includes(opponentColour)) ? legalMoves.push(oneSquareBackwards) : null;
    oneSquareLeft && !willTwoKingsTouch(oneSquareLeft) && (!oneSquareLeft.id || oneSquareLeft.id.includes(opponentColour)) ? legalMoves.push(oneSquareLeft) : null;
    oneSquareRight && !willTwoKingsTouch(oneSquareRight) && (!oneSquareRight.id || oneSquareRight.id.includes(opponentColour)) ? legalMoves.push(oneSquareRight) : null;
    topLeftDiagonal && !willTwoKingsTouch(topLeftDiagonal) && (!topLeftDiagonal.id || topLeftDiagonal.id.includes(opponentColour)) ? legalMoves.push(topLeftDiagonal) : null;
    bottomLeftDiagonal && !willTwoKingsTouch(bottomLeftDiagonal) && (!bottomLeftDiagonal.id || bottomLeftDiagonal.id.includes(opponentColour)) ? legalMoves.push(bottomLeftDiagonal) : null;
    topRightDiagonal && !willTwoKingsTouch(topRightDiagonal) && (!topRightDiagonal.id || topRightDiagonal.id.includes(opponentColour)) ? legalMoves.push(topRightDiagonal) : null;
    bottomRightDiagonal && !willTwoKingsTouch(bottomRightDiagonal) && (!bottomRightDiagonal.id || bottomRightDiagonal.id.includes(opponentColour)) ? legalMoves.push(bottomRightDiagonal) : null;
    console.log("legal king moves:", legalMoves);
    // console.log(oneSquareRight);
    if (turn == "W") {
        if (!hasKingWMoved && !hasRookW1Moved && !document.querySelector(`.${previousTwoFiles}${currentRank}`).id && !document.querySelector(`.${previousFile}${currentRank}`).id && !document.querySelector(`.${previousThreeFiles}${currentRank}`).id && legalMoves.includes(oneSquareLeft)) {
            legalMoves.push(document.querySelector(`.${previousTwoFiles}${currentRank}`));
            document.querySelector(`.${previousTwoFiles}${currentRank}`).classList.add("castling1");
        }    
        if (!hasKingWMoved && !hasRookW2Moved && !document.querySelector(`.${nextTwoFiles}${currentRank}`).id && !document.querySelector(`.${nextFile}${currentRank}`).id && legalMoves.includes(oneSquareRight)) {
            legalMoves.push(document.querySelector(`.${nextTwoFiles}${currentRank}`));
            document.querySelector(`.${nextTwoFiles}${currentRank}`).classList.add("castling2");
        }
    } else if (turn == "B") {
        if (!hasKingBMoved && !hasRookB1Moved && !document.querySelector(`.${previousTwoFiles}${currentRank}`).id && !document.querySelector(`.${previousFile}${currentRank}`).id && !document.querySelector(`.${previousThreeFiles}${currentRank}`).id && legalMoves.includes(oneSquareLeft)) {
            legalMoves.push(document.querySelector(`.${previousTwoFiles}${currentRank}`));
            document.querySelector(`.${previousTwoFiles}${currentRank}`).classList.add("castling1");
        }
        if (!hasKingBMoved && !hasRookB2Moved && !document.querySelector(`.${nextTwoFiles}${currentRank}`).id && !document.querySelector(`.${nextFile}${currentRank}`).id && legalMoves.includes(oneSquareRight)) {
            legalMoves.push(document.querySelector(`.${nextTwoFiles}${currentRank}`));
            document.querySelector(`.${nextTwoFiles}${currentRank}`).classList.add("castling2");
        }
    }
}