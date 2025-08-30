export const rag = `
# Movements
Except for any move of the knight and castling, pieces cannot jump over other pieces. A piece is captured (or taken) when an attacking enemy piece replaces it on its square. The captured piece is thereby permanently removed from the game. The king can be put in check but cannot be captured

## King
The king moves exactly one square adjacent to it. A special move with the king known as castling is allowed only once per player, per game
Castling consists of moving the king two squares towards a rook, then placing the rook on the other side of the king, adjacent to it. Castling is only permissible if all of the following conditions
The king and rook involved in castling must not have previously moved;
There must be no pieces between the king and the rook;
The king may not currently be under attack, nor may the king pass through or end up in a square that is under attack by an enemy piece (though the rook is permitted to be under attack and to pass over an attacked square);
The castling rook must be on the same rank as the king
An unmoved king and an unmoved rook of the same color on the same rank are said to have castling rights

## Rook
A rook moves any number of vacant squares horizontally or vertically. It also is moved when castling.

## Bishop
A bishop moves any number of vacant squares diagonally

## Queen
The queen moves any number of vacant squares horizontally, vertically, or diagonally.

## Knight
A knight moves to one of the nearest squares not on the same rank, file, or diagonal. (This can be thought of as moving two squares horizontally then one square vertically, or moving one square horizontally then two squares vertically—i.e. in an "L" pattern.) The knight is not blocked by other pieces; it jumps to the new location.

## Pawn
A pawn moves straight forward one square, if that square is vacant. If it has not yet moved, a pawn also has the option of moving two squares straight forward, provided both squares are vacant. Pawns cannot move backwards.
`;
