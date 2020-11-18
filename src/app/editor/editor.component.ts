import { ChangeDetectionStrategy, Component, ViewChild, ElementRef, AfterViewInit, Input, OnInit } from '@angular/core';
import { Change } from './types';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorComponent implements AfterViewInit, OnInit {

  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('box', {static: true}) box: ElementRef<HTMLDivElement>;

  @Input() public images: string[];  

  private ctx: CanvasRenderingContext2D;
  public url: string = '/assets/images/card1.jpg';  
  public text = 'SUNNY DAY';
  public showText = false;  
  private img = new Image();
  private angle = 0;
  private zoomDelta = 0.1;
  private currentScale = 1;
  private currentAngle = 0;
  private canvasSize = {
    width: 0,
    height: 0
  }
  private imageSize = {
    width: 0,    
    height: 0
  }
  private current = 0;
  private changes = [];
  private lastUnDo: Change[] = new Array(2);

  constructor() { }

  ngOnInit() {
    
    this.images.forEach((img: string, index: number) => {
      this.changes[index] = [];
      this.changes[index].push({
        text: this.text,
        currentScale: this.currentScale,
        currentAngle: this.currentAngle})
    });
  }

  ngAfterViewInit() {
    this.ctx = this.canvas.nativeElement.getContext('2d');
    this.canvasSize = { width: this.box.nativeElement.offsetWidth, height: this.box.nativeElement.offsetHeight}

    this.ctx.canvas.width = this.canvasSize.width;
    this.ctx.canvas.height = this.canvasSize.height;
    this.ctx.shadowColor = "rgba(0,0,0,0.25)";
    this.ctx.shadowBlur = 10;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = "24px Roboto";

    this.img.onload = () => {
      this.imageSize = {width: this.img.width, height: this.img.height}
      this.drawImage();
    }
    this.img.src = this.images[this.current];
  }

  public onChangeText(event: Event): void {
    this.showText = !this.showText;
    this.changes[this.current].push({
      ...this.getSettings(),
      text: this.text
    });
    this.drawImage();
  }

  public newtext(): void {
    this.text = this.getSettings().text;
    this.showText = !this.showText;
  }

  public zoomin(): void {
    this.currentScale = this.getSettings().currentScale;
    this.changes[this.current].push({
      ...this.getSettings(),
    currentScale: this.currentScale + this.zoomDelta
  });
    this.drawImage();
  }

  public zoomout(): void {
    this.currentScale = this.getSettings().currentScale;
    this.changes[this.current].push({
      ...this.getSettings(),
    currentScale: this.currentScale - this.zoomDelta
  });
    this.drawImage();
  }

  public rotate(): void {
    this.angle = 90;
    this.currentAngle = this.getSettings().currentAngle;
    this.changes[this.current].push({
      ...this.getSettings(),
      currentAngle: this.currentAngle + this.angle
    });
    this.drawImage();
  }

  private getSettings(): Change {
    const settingList = this.changes[this.current];
    const settingListSize = settingList.length - 1;
    return settingList[settingListSize];
  }

  private drawImage(): void {
    const { currentScale, currentAngle, text} = this.getSettings();

    this.clear();
    this.ctx.save();
    this.ctx.translate(this.canvasSize.width/2, this.canvasSize.height/2);
    this.ctx.scale(currentScale, currentScale);
    this.ctx.rotate(currentAngle * Math.PI / 180);
    this.ctx.translate(-this.canvasSize.width/2, -this.canvasSize.height/2);

    this.ctx.drawImage(this.img, this.canvasSize.width / 2 - this.imageSize.width / 2, this.canvasSize.height / 2 - this.imageSize.height / 2);
    this.ctx.fillText(text, this.canvasSize.width / 2, 140, this.imageSize.width);
  
    this.ctx.restore();
  }

  private clear(): void {
    this.ctx.clearRect(-2000,-2000,5000,5000);
  }

  public setCurrent(i: number): void {
    this.current = i;
    this.img.src = this.images[this.current];
    this.drawImage();
  }

  public undo(): void {
    if(this.changes[this.current].length > 1) {
      this.lastUnDo[this.current] = this.getSettings();
      this.changes[this.current].pop();

      this.drawImage();
    }
  }

  public redo(): void {
    if(this.lastUnDo[this.current]) {
      this.changes[this.current].push(this.lastUnDo[this.current]);

      this.drawImage();
    }
  }

}
