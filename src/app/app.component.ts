import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  
  //all the important stuff
  title = 'snake';
  boardWidth: number = Math.floor(window.innerWidth/28);
  boardHeight: number = Math.floor(window.innerHeight/28)
  gameBoard: string[][] = this.board();
  xDirection: number = 0;
  yDirection: number = 0;
  cellQueue: number = 0;
  snakeIds: string[] = [this.getInitialSnakeCell()];
  cellIds: string[] = this.getCellIds();
  fruitLocation: string = this.getRandomFruitCell();
  alive: boolean = true;
  highScore: number = 0;
  deadDuration: number = 0;
  gameResetUnderline: boolean = false;
  cooldownActive: boolean = false;

  //setInterval(() => {this.allowNewServer=!this.allowNewServer}, 4000);
  //listen for keypresses, but only take note if the snake is alive
  @HostListener('window:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (this.alive && !this.cooldownActive){
      
      //cooldown helps reduce number of accidental deaths from chaotic keypresses
      this.cooldownActive = true;
      if (event.key==='ArrowDown'){
        if ((this.yDirection !== -1) || (this.snakeIds.length === 1)){
          this.xDirection = 0;
          this.yDirection = 1;
        }
      }

      if (event.key==='ArrowUp'){
        if ((this.yDirection !== 1) || (this.snakeIds.length === 1)){
          this.xDirection = 0;
          this.yDirection = -1;
        }
      }

      if (event.key==='ArrowLeft'){
        if ((this.xDirection !== 1) || (this.snakeIds.length === 1)){      
          this.xDirection = -1;
          this.yDirection = 0;
        }
      }

      if (event.key==='ArrowRight'){
        if ((this.xDirection !== -1) || (this.snakeIds.length === 1)){      
          this.xDirection = 1;
          this.yDirection = 0;
        }
      }
    }
  }

  //iterates the game: advance snake cells => check death => check fruit => loop
  gameIteration(): void {
    this.cooldownActive = false;
    //advance snake head in the direction it's headed in
    let indices: string[] = this.snakeIds[0].split(" ");
    let newSnakeCell: string = ''+(+indices[0]+this.yDirection)+' '+(+indices[1]+this.xDirection);
    
    if (!this.checkDeath(newSnakeCell)){
      this.snakeIds.unshift(newSnakeCell)
      if (this.cellQueue === 0){
        this.cellIds.push(this.snakeIds[this.snakeIds.length-1])
        this.snakeIds.splice(-1);
      } else {
        this.cellQueue -= 1;
      }
      delete this.cellIds[this.cellIds.indexOf(newSnakeCell)];
    } else {
      this.deadDuration += 1;
    }

    //update the non-snake array that we use for generating fruits
    this.cellIds.push()
    this.cellIds = this.cellIds.filter(element => {
      return element !== null;
    });

    //check if we hit a fruit
    this.checkFruit();
  }

  //computes starting snake cell based on screen dimensions
  getInitialSnakeCell(): string {
    let xCoord: number = Math.floor(this.boardHeight/2);
    let yCoord: number = Math.floor(this.boardWidth/2);
    return (xCoord + " " + yCoord);

  }

  getRandomFruitCell(): string {
    return this.cellIds[Math.floor(Math.random() * this.cellIds.length-1) + 1];
  }

  //generates board based on window size
  board(): string[][] {
    let result: string[][] = [];
    for (let i=0; i<this.boardHeight; i++){
      let sublist: string[] = []
      for (let j=0; j<this.boardWidth; j++){
        sublist.push(i+' '+j);
      }
      result.push(sublist);
    }
    return result;
  }


  //returns one-dimensional array of current non-snake cell ids
  //to be used for fruit generation
  getCellIds(): string[] {
    let result: string[] = [];
    for (let subarray of this.gameBoard){
      for (let atom of subarray) {
        result.push(atom);
      }
    }
    return result;
  }


  //assigns one of the following classes to each cell:
  //cell, snake, fruit, dead-cell
  //note that cells are non-snake cells but dead-cells are dead snake cells
  giveColor(cellId: string): string {
    let cellClass: string = 'cell';
    if (this.snakeIds.includes(cellId)) {
      if (this.snakeIds[0] === cellId && this.deadDuration === 0) {
        cellClass = 'head';
      } else if (!this.alive){
        cellClass = 'dead-cell';
      } else {
          cellClass = 'snake';
      }
    } else if (cellId === this.fruitLocation) {
      cellClass = 'fruit';
    }

    //makes snake blink red upon dying
    if (!this.alive && this.snakeIds.includes(cellId) && (this.deadDuration%2===1) && this.deadDuration<6){
      cellClass = 'cell';
    }  
    return cellClass;    
  }


  //check if snake gets a fruit
  checkFruit(): void {
    if (this.snakeIds[0] === this.fruitLocation){
      this.cellQueue += 5;
      this.fruitLocation = this.getRandomFruitCell();
    }
  }

  //check if the snake hit a wall/itself
  checkDeath(newCell: string): boolean {
    let indices: string[] = newCell.split(" ");
    if (((this.snakeIds.includes(newCell) && this.snakeIds.length !== 1)
    || (+indices[0]<0)
    || (+indices[1]<0)
    || (+indices[0]>=this.boardHeight)
    || (+indices[1]>=this.boardWidth))){
      this.alive = false;

      //set highscore if applicable
      if (this.snakeIds.length > this.highScore) {
        this.highScore = this.snakeIds.length;
      }
      return true;
    } else {
      return false;
    }
  }


  //reset the game
  gameReset(): void {
    
    //clear old snake array
    this.snakeIds.splice(0, this.snakeIds.length);
    this.snakeIds.push(this.getInitialSnakeCell());
    
    //reset everything
    this.cellQueue = 0;
    this.alive = true;
    this.xDirection = 0;
    this.yDirection = 0;
    this.deadDuration = 0;
    this.cellIds = this.getCellIds();
    this.fruitLocation = this.getRandomFruitCell();
  }




  //set game to iterate upon initializing
  ngOnInit(): void {
    setInterval(() => {this.gameIteration()}, 110);
    delete this.cellIds[this.cellIds.indexOf(this.snakeIds[0])]
  }


}

