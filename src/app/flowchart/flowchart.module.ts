import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { FlowchartComponent, ChartJsonEditDirective } from './flowchart.component';
import { MouseCaptureService, MouseCaptureDirective } from './mouse-capture.service';
import { DraggingService } from './dragging.service';

@NgModule({
  declarations: [
    FlowchartComponent,
    MouseCaptureDirective,
    ChartJsonEditDirective
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    MouseCaptureService,
    DraggingService
  ],
  exports: [
    FlowchartComponent,
    MouseCaptureDirective,
    ChartJsonEditDirective
  ]
})
export class FlowchartModule { }
