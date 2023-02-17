const ANIMATION_TIME_MS = 150;
const ANIMATION_FLOATING_MSG_MS = 2000;
const BOARD = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
const RANGES = [
	[0, 1, 2, 3],
	[4, 5, 6, 7],
	[8, 9, 10, 11],
	[12, 13, 14, 15],
];
const DIRECTIONS = {
	UP: -4,
	DOWN: 4,
	LEFT: -1,
	RIGHT: 1,
};
let LAST_HIDDEN_INDEX = BOARD.findIndex((val) => val === 0);
let MOVES = 0;
const moveCounter = document.querySelector('.moves');
let msg25 = false;
let msg50 = false;
let msg75 = false;

// CREATING TILES:
const boardElement = document.querySelector('.board');
BOARD.forEach((val) => {
	const tile = document.createElement('div');
	tile.className = 'tile';
	boardElement.appendChild(tile);
});

function IdentifyDirection(tileIndex) {
	if (BOARD[tileIndex + DIRECTIONS.UP] === 0) return DIRECTIONS.UP;
	if (BOARD[tileIndex + DIRECTIONS.DOWN] === 0) return DIRECTIONS.DOWN;
	if (BOARD[tileIndex + DIRECTIONS.LEFT] === 0) return DIRECTIONS.LEFT;
	if (BOARD[tileIndex + DIRECTIONS.RIGHT] === 0) return DIRECTIONS.RIGHT;
	return BOARD.length;
}

function ValidateRightLeft(tileIndex, direction) {
	if (direction == DIRECTIONS.UP || direction == DIRECTIONS.DOWN) return true;
	const tileRange = RANGES.find((range) => range.includes(tileIndex));
	if (tileRange.includes(tileIndex + direction)) return true;
	return false;
}

async function animate(fromIndex, toIndex) {
	const tiles = document.querySelectorAll('.tile');
	const tileToAnimate = tiles[toIndex];
	if (toIndex - fromIndex == DIRECTIONS.UP)
		tileToAnimate.style.animation = `moveUp ${ANIMATION_TIME_MS}ms`;
	if (toIndex - fromIndex == DIRECTIONS.DOWN)
		tileToAnimate.style.animation = `moveDown ${ANIMATION_TIME_MS}ms`;
	if (toIndex - fromIndex == DIRECTIONS.RIGHT)
		tileToAnimate.style.animation = `moveRight ${ANIMATION_TIME_MS}ms`;
	if (toIndex - fromIndex == DIRECTIONS.LEFT)
		tileToAnimate.style.animation = `moveLeft ${ANIMATION_TIME_MS}ms`;
	await sleep(ANIMATION_TIME_MS);
	tileToAnimate.style.animation = 'unset';
}

function MoveTile(tileIndex, direction) {
	if (direction == BOARD.length) return;
	if (tileIndex + direction >= BOARD.length || tileIndex + direction < 0)
		return;
	if (!ValidateRightLeft(tileIndex, direction)) return;
	animate(tileIndex, tileIndex + direction);
	const saver = BOARD[tileIndex];
	BOARD[tileIndex] = BOARD[tileIndex + direction];
	BOARD[tileIndex + direction] = saver;
	++MOVES;
	RenderBoard();
	return tileIndex + direction;
}

function CheckForWin() {
	let checker = 0;
	BOARD.forEach((value, index) => {
		if (value !== index + 1) ++checker;
		if (index == 4 && checker == 1 && !msg25) {
			DisplayFloatingMsg('YOU GOT THIS');
			msg25 = true;
		} else if (index == 8 && checker == 1 && !msg50) {
			DisplayFloatingMsg('KEEP GOING!');
			msg50 = true;
		} else if (index == 12 && checker == 1 && !msg75) {
			DisplayFloatingMsg('ALMOST THERE!');
			msg75 = true;
		} else if (MOVES % 50 == 0 && MOVES != 0)
			DisplayFloatingMsg(`${MOVES} MOVES!`);
	});
	if (checker === 1) {
		DisplayFloatingMsg('AWESOME!');
	}
}

function GetRandomDirection() {
	return DIRECTIONS[Object.keys(DIRECTIONS)[Math.floor(Math.random() * 4)]];
}

async function sleep(msec) {
	return new Promise((resolve) => setTimeout(resolve, msec));
}

async function ShuffleBoard() {
	let index = BOARD.findIndex((tile) => tile === 0);
	for (let i = 0; i < 1000; ++i) {
		let newIndex = MoveTile(index, GetRandomDirection());
		while (newIndex == undefined)
			newIndex = MoveTile(index, GetRandomDirection());
		index = newIndex;
		LAST_HIDDEN_INDEX = index;
	}
}

async function RenderBoard() {
	moveCounter.innerHTML = MOVES;
	const tiles = document.querySelectorAll('.tile');
	tiles[LAST_HIDDEN_INDEX].setAttribute('class', 'tile');
	for (let i = 0; i < BOARD.length; ++i) {
		tiles[i].innerHTML = BOARD[i];
		if (BOARD[i] === 0) {
			tiles[i].setAttribute('class', 'tile hidden');
			LAST_HIDDEN_INDEX = i;
		}
	}
	setTimeout(() => {
		CheckForWin();
	}, ANIMATION_TIME_MS);
}

function DisplayFloatingMsg(text) {
	const floatingMsg = document.querySelector('.floatingMsg');
	floatingMsg.textContent = text;
	floatingMsg.style.display = 'block';
	floatingMsg.style.animation = `floatingMsgAnim ${ANIMATION_FLOATING_MSG_MS}ms ease forwards`;
	setTimeout(() => {
		floatingMsg.style.animation = 'unset';
		floatingMsg.style.display = 'none';
	}, ANIMATION_FLOATING_MSG_MS);
}

function ResetGame() {
	document.querySelectorAll('.tile').forEach((tile, index) => {
		tile.addEventListener('click', () => {
			MoveTile(index, IdentifyDirection(index));
		});
	});
	ShuffleBoard();
	MOVES = 0;
	RenderBoard();
}

ResetGame();

// Registering keypresses for gameplay:
document.addEventListener(
	'keydown',
	(e) => {
		const zeroIndex = BOARD.findIndex((val) => val === 0);
		const moveToDirection = {
			ArrowUp: DIRECTIONS.DOWN,
			ArrowDown: DIRECTIONS.UP,
			ArrowRight: DIRECTIONS.LEFT,
			ArrowLeft: DIRECTIONS.RIGHT,
		};
		MoveTile(zeroIndex, moveToDirection[e.code]);
	},
	false
);
