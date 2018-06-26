

import { Injectable } from '@angular/core';
import { MouseCaptureService } from './mouse-capture.service';

// declare var $;

@Injectable()
export class DraggingService {

    constructor(private mouseCapture: MouseCaptureService) { }

    //
    // Threshold for dragging.
    // When the mouse moves by at least this amount dragging starts.
    //
    threshold = 5;

    //
    // Called by users of the service to register a mousedown event and start dragging.
    // Acquires the 'mouse capture' until the mouseup event.
    //
    startDrag(evt, config) {

        let dragging = false;
        let x = evt.pageX;
        let y = evt.pageY;
        
        // Acquire the mouse capture and start handling mouse events.
        this.mouseCapture.acquire(evt, {
            mouseMove: () => {
                if (!dragging) {
                    let x1 = Math.abs(evt.pageX - x);
                    let y1 = Math.abs(evt.pageY - y);
                    if (x1 > this.threshold || y1 > this.threshold) {
                        console.log(`FALSE dragging: x: ${x}, y: ${y}`);
                        dragging = true;

                        if (config.dragStarted) {
                            config.dragStarted(x, y, evt);
                        }

                        if (config.dragging) {
                            // First 'dragging' call to take into account that we have
                            // already moved the mouse by a 'threshold' amount.
                            config.dragging(evt.pageX, evt.pageY, evt);
                        }
                    }
                } else {
                    console.log(`TRUE dragging: x: ${x}, y: ${y}`);
                    if (config.dragging) {
                        config.dragging(evt.pageX, evt.pageY, evt);
                    }

                    x = evt.pageX;
                    y = evt.pageY;
                }
            },
            mouseUp: () => {
                console.log('dragging.service.ts :   mouseUp');
                this.mouseCapture.release();
                evt.stopPropagation();
                evt.preventDefault();
            },
            released: () => {
                console.log('dragging.service.ts :  released');
                if (dragging) {
                    if (config.dragEnded) {
                        config.dragEnded();
                    }
                } else {
                    if (config.clicked) {
                        config.clicked();
                    }
                }
            },
        });

        evt.stopPropagation();
        evt.preventDefault();
    }


}









