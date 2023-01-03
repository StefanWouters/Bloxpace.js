"use strict";

class Random{
	/**
	 * Returns a random number between min and max values.
	 * @param {number} min 
	 * @param {number} max 
	 * @returns {number}
	 */
	static Next(min, max){
		return Math.floor((max - min) * Math.random()) + min;
	}

	/**
	 * Repeats the logic between min and max number of times.
	 * @param {number} min 
	 * @param {number} max 
	 * @param {Function} logic 
	 */
	static Repeat(min, max, logic){
		const times = this.Next(min, max);
		for (let i = 0; i < times; i++){
			logic();
		}
	}
}

class Document{
	constructor(){
		this._canvas = document.createElement('canvas');
		this._canvas.id = 'canvas';
		this._canvas.style.backgroundColor = 'black';
		this._canvas.style.width = '960px';
		this._canvas.style.height = '600px';
		this._canvas.style.imageRendering = '-webkit-optimize-contrast';
		this._canvas.style.imageRendering = '-moz-crisp-edges';
		this._canvas.setAttribute('width', '320px');
		this._canvas.setAttribute('height', '200px');
		
		document.body.insertBefore(this._canvas, document.body.childNodes[0]);

		this._mouseX = -1;
		this._mouseY = -1;

		this._canvas.addEventListener('mousemove', (e) => {
			this._mouseX = Math.floor(e.offsetX / 3);
			this._mouseY = Math.floor(e.offsetY / 3);
		});
	}

	/**
	 * @type {number}
	 */
	get MouseX(){
		return this._mouseX;
	}

	/**
	 * @type {number}
	 */
	get MouseY(){
		return this._mouseY;
	}

	/**
	 * Clear the canvas.
	 * @param {string} colour 
	 */
	Clear(colour){
		let context = this._canvas.getContext('2d');
		context.fillStyle = colour;
		context.fillRect(0, 0, 320, 200);
	}

	/**
	 * Draw a line on the canvas.
	 * @param {number} fromX 
	 * @param {number} fromY 
	 * @param {number} toX 
	 * @param {number} toY 
	 * @param {string} colour 
	 * @param {number} width 
	 */
	DrawLine(fromX, fromY, toX, toY, colour, width){
		let context = this._canvas.getContext('2d');
		context.strokeStyle = colour;
		context.lineWidth = width;

		context.beginPath();
		context.moveTo(fromX, fromY);
		context.lineTo(toX, toY);
		context.stroke();
	}

	DrawText(text, x, y){
		let context = this._canvas.getContext('2d');
		context.font = '10px sans-serif';

		context.strokeStyle = '#000';
		context.strokeText(text, x + 1, y + 1);

		context.strokeStyle = '#fff';
		context.strokeText(text, x, y);
	}

	/**
	 * Fill a rectangle on the canvas.
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} width 
	 * @param {number} height 
	 * @param {string} colour 
	 */
	FillRect(x, y, width, height, colour){
		let context = this._canvas.getContext('2d');
		context.fillStyle = colour;
		context.fillRect(x, y, width, height);
	}

	/**
	 * Is the mouse inside this area?
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} width 
	 * @param {number} height 
	 * @returns {boolean}
	 */
	MouseInside(x, y, width, height){
		if (this._mouseX < x || this._mouseX > (x + width)) return false;
		if (this._mouseY < y || this._mouseY > (y + height)) return false;
		return true;
	}

	/**
	 * Set the mouse cursor.
	 * @param {string} cursor 
	 */
	SetCursor(cursor){
		this._canvas.style.cursor = cursor;
	}
}

class Board{
	constructor(){
		this._board = new Array(64);
		this.Clear();
	}

	Clear(){
		for (let i = 0; i < 64; i++){
			this._board[i] = -1;
		}
	}

	CheckScore(){
		let lines = [], cols = [];
		for (let yy = 0; yy < 8; yy++){
			let total = 0;
			for (let xx = 0; xx < 8; xx++){
				if (this.Get(xx, yy) == -1) break;
				total++;
			}
			if (total == 8) lines.push(yy);
		}
		for (let xx = 0; xx < 8; xx++){
			let total = 0;
			for (let yy = 0; yy < 8; yy++){
				if (this.Get(xx, yy) == -1) break;
				total++;
			}
			if (total == 8) cols.push(xx);
		}

		for (let line of lines){
			for (let xx = 0; xx < 8; xx++){
				this._board[(line * 8) + xx] = -1;
			}
		}
		for (let col of cols){
			for (let yy = 0; yy < 8; yy++){
				this._board[(yy * 8) + col] = -1;
			}
		}

		let score = 0;
		while (lines.length > 0 && cols.length > 0) {
			lines = lines.slice(1);
			cols = cols.slice(1);
			score += 25;
		}
		score += lines.length * 8;
		score += cols.length * 8;

		return score;
	}

	/**
	 * Get the block on x,y coordinates.
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {any}
	 */
	Get(x, y){
		return this._board[(y * 8) + x];
	}

	Set(shape, x, y){
		if (!this.Fits(shape, x, y)) return false;

		for (let yy = 0; yy < shape.Height; yy++){
			for (let xx = 0; xx < shape.Width; xx++){
				if (shape.Get(xx, yy) == 0) continue;
				this._board[((yy + y) * 8) + xx + x] = shape.Colour;
			}
		}

		return true;
	}

	Fits(shape, x, y){
		if (x + shape.Width > 8) return false;
		if (y + shape.Height > 8) return false;
		for (let yy = 0; yy < shape.Height; yy++){
			for (let xx = 0; xx < shape.Width; xx++){
				if (shape.Get(xx, yy) == 0) continue;
				if (this._board[((yy + y) * 8) + xx + x] != -1) return false;
			}
		}
		return true;
	}

	FitsOnBoard(shape){
		for (let yy = 0; yy < 8 - (shape.Height - 1); yy++){	
			for (let xx = 0; xx < 8 - (shape.Width - 1); xx++){
				if (this.Fits(shape, xx, yy)) return true;
			}	
		}
		return false;
	}
}

class Shape{
	constructor(){
		this._shape = [];
		this._width = 0;
		this._height = 0;
		this._colour = '';

		this.New();
	}

	/**
	 * @type {number}
	 */
	get Width(){
		return this._width;
	}

	/**
	 * @type {number}
	 */
	get Height(){
		return this._height;
	}

	/**
	 * @type {string}
	 */
	get Colour(){
		return this._colour;
	}

	get Value(){
		let value = 0;
		for (let yy = 0; yy < this._height; yy++){
			for (let xx = 0; xx < this._width; xx++){
				if (this.Get(xx, yy) == 0) continue;
				value++;
			}
		}
		return value;
	}

	New(){
		this.SetColour();
		this.SetShape();
		Random.Repeat(0, 3, () => this.Rotate());
		if (Random.Next(0, 10) < 5) this.FlipH();
		if (Random.Next(0, 10) < 5) this.FlipV();
	}

	/**
	 * Draw the shape inside the area.
	 * @param {Document} document 
	 * @param {number} x 
	 * @param {number} y 
	 * @param {number} width 
	 * @param {number} height 
	 */
	DrawShape(document, x, y, width, height){
		const ww = width / 5, hh = height / 5;
		x += (width - this._width * ww) / 2;
		y += (height - this._height * hh) / 2;

		for (let yy = 0; yy < this._height; yy++){
			for (let xx = 0; xx < this._width; xx++){
				const block = this._shape[(yy * this._width) + xx];
				if (block == 0) continue;

				document.FillRect(x + (ww * xx), y + (hh * yy), ww, hh, this._colour);
			}
		}
	}

	/**
	 * Gets the shape block at x,y.
	 * @param {number} x 
	 * @param {number} y 
	 * @returns {number}
	 */
	Get(x, y){
		return this._shape[y * this._width + x];
	}

	/**
	 * Rotate the shape.
	 */
	Rotate(){
		const shape = new Array(this._shape.length);
		const width = this._height, height = this._width;

		for (let yy = 0; yy < this._height; yy++){
			for (let xx = 0; xx < this._width; xx++){
				const dx = (width - 1 - yy), dy = xx;
				shape[(dy * width) + dx] = this._shape[(yy * this._width) + xx];
			}
		}

		this._width = width;
		this._height = height;
		this._shape = shape;
	}

	/**
	 * Flip the shape horizontally.
	 */
	FlipH(){
		const shape = new Array(this._shape.length);
		for (let yy = 0; yy < this._height; yy++){
			for (let xx = 0; xx < this._width; xx++){
				const dx = (this._width - 1 - xx), dy = yy;
				shape[(dy * this._width) + dx] = this._shape[(yy * this._width) + xx];
			}
		}
		this._shape = shape;
	}

	/**
	 * Flip the shape vertically.
	 */
	FlipV(){
		const shape = new Array(this._shape.length);
		for (let yy = 0; yy < this._height; yy++){
			for (let xx = 0; xx < this._width; xx++){
				const dx = xx, dy = (this._height - 1 - yy);
				shape[(dy * this._width) + dx] = this._shape[(yy * this._width) + xx];
			}
		}
		this._shape = shape;
	}

	/**
	 * Set a random shape.
	 */
	SetShape(){
		switch(Random.Next(0, 12)){
			case 0:
				this._shape = [
					1,
				];
				this._height = 1;
				this._width = 1;
				break;
			case 1:
				this._shape = [
					1,1,
				];
				this._height = 1;
				this._width = 2;
				break;
			case 2:
				this._shape = [
					1,1,
					1,0,
				];
				this._height = 2;
				this._width = 2;
				break;
			case 3:
				this._shape = [
					1,1,1,
					1,0,0,
				];
				this._height = 2;
				this._width = 3;
				break;
			case 4:
				this._shape = [
					1,1,1,
					0,1,0,
				];
				this._height = 2;
				this._width = 3;
				break;
			case 5:
				this._shape = [
					0,1,1,
					1,1,0,
				];
				this._height = 2;
				this._width = 3;
				break;
			case 6:
				this._shape = [
					1,0,1,
					1,1,1,
				];
				this._height = 2;
				this._width = 3;
				break;
			case 7:
				this._shape = [
					1,0,0,
					1,1,1,
					0,0,1,
				];
				this._height = 3;
				this._width = 3;
				break;
			case 8:
				this._shape = [
					1,0,0,0,
					1,1,1,1,
				];
				this._height = 2;
				this._width = 4;
				break;
			case 9:
				this._shape = [
					1,1,1,
				];
				this._height = 1;
				this._width = 3;
				break;
			case 10:
				this._shape = [
					1,1,1,1,
				];
				this._height = 1;
				this._width = 4;
				break;
			case 11:
				this._shape = [
					1,1,
					1,1,
				];
				this._height = 2;
				this._width = 2;
				break;
		}
	}

	/**
	 * Set a random shape colour.
	 */
	SetColour(){
		this._colour = ['#f00','#0f0', '#00f', '#f0f', '#0ff', '#ff0'][Random.Next(0, 6)];
	}
}

let doc = new Document();

const boardX = 50, boardY = 20;

const board = new Board();
const shapes = [
	new Shape(), new Shape(), new Shape()
];

const shapeHover = new Array(3);

let gameOver = false;
let score = 0, displayScore = 0;
let selectedShape = -1;
let boardHoverX = -1, boardHoverY = -1;

setInterval(() => {
	if (displayScore < score) displayScore++;

	const fits = [
		board.FitsOnBoard(shapes[0]),
		board.FitsOnBoard(shapes[1]),
		board.FitsOnBoard(shapes[2]),
	];
	gameOver = !fits.some(x => x);

	shapeHover[0] = selectedShape == -1 && doc.MouseInside(230, 20, 40, 40);
	shapeHover[1] = selectedShape == -1 && doc.MouseInside(230, 80, 40, 40);
	shapeHover[2] = selectedShape == -1 && doc.MouseInside(230, 140, 40, 40);

	if (shapeHover.some(x => x)) {
		doc.SetCursor('pointer');
	} else {
		doc.SetCursor('auto');
	}

	doc.Clear('#300');
	doc.FillRect(boardX, boardY, 160, 160, '#a94');
	doc.FillRect(230, 20, 40, 40, !fits[0] ? '#000' : shapeHover[0] || selectedShape == 0 ? '#872' : '#a94');
	doc.FillRect(230, 80, 40, 40, !fits[1] ? '#000' : shapeHover[1] || selectedShape == 1 ? '#872' :  '#a94');
	doc.FillRect(230, 140, 40, 40, !fits[2] ? '#000' : shapeHover[2] || selectedShape == 2 ? '#872' :  '#a94');

	if (selectedShape != 0) shapes[0].DrawShape(doc, 230, 20, 40, 40);
	if (selectedShape != 1) shapes[1].DrawShape(doc, 230, 80, 40, 40);
	if (selectedShape != 2) shapes[2].DrawShape(doc, 230, 140, 40, 40);

	for (let yy = 0; yy < 8; yy++){
		for (let xx = 0; xx < 8; xx++){
			if (board.Get(xx, yy) == -1) {
				doc.FillRect(boardX + 16 + (18 * xx), boardY + 16 + (18 * yy), 2, 2, '#000');
			} else {
				doc.FillRect(boardX + 8 + (18 * xx), boardY + 8 + (18 * yy), 18, 18, board.Get(xx, yy));
			}
		}
	}

	if (selectedShape != -1) {
		const shape = shapes[selectedShape];

		const cx = Math.floor((doc.MouseX - (boardX + 8) - (shape.Width * 9)) / 18);
		const cy = Math.floor((doc.MouseY - (boardY + 8) - (shape.Height * 9)) / 18);

		if (cx < 0 || cx > 7 || cy < 0 || cy > 7) {
			shapes[selectedShape].DrawShape(doc, doc.MouseX - 40, doc.MouseY - 40, 80, 80);
		} else if (board.Fits(shape, cx, cy)) {
			// draw shape if it fits
			for (let yy = 0; yy < shape.Height; yy++){
				for (let xx = 0; xx < shape.Width; xx++){
					if (shape.Get(xx, yy) == 0) continue;
					doc.FillRect(boardX + 9 + (18 * (xx + cx)), boardY + 9 + (18 * (yy + cy)), 16, 16, shape.Colour);
				}
			}

			boardHoverX = cx;
			boardHoverY = cy;
		} else {
			for (let yy = 0; yy < shape.Height; yy++){
				for (let xx = 0; xx < shape.Width; xx++){
					if (shape.Get(xx, yy) == 0) continue;
					doc.FillRect(boardX + 9 + (18 * (xx + cx)), boardY + 9 + (18 * (yy + cy)), 16, 16, 'rgba(0,0,0,0.5)');
				}
			}

			boardHoverX = -1;
			boardHoverY = -1;
		}
	}

	if (gameOver) {
		doc.DrawText('Game over!', 132, 100);
	}
	doc.DrawText(`Score: ${displayScore}`, 140, 12);
}, 1000 / 15);

document.onmousedown = (e) => {
	if (gameOver) {
		board.Clear();
		score = 0;
		displayScore = 0;
		for (let i = 0; i < 3; i++){
			shapes[i].New();
		}
	} else if (selectedShape == -1){
		for (let i = 0; i < 3; i++){
			if (!shapeHover[i]) continue;
			if (!board.FitsOnBoard(shapes[i])) continue;
			selectedShape = i;
			break;
		}
	} else if (boardHoverX != -1 && boardHoverY != -1) {
		if (board.Set(shapes[selectedShape], boardHoverX, boardHoverY)) {
			score += shapes[selectedShape].Value;
			shapes[selectedShape].New();
			selectedShape = -1;
			score += board.CheckScore();
		}
	} else {
		selectedShape = -1;
	}
};