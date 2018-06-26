import { Injectable, ElementRef, Renderer2, ApplicationRef } from '@angular/core';
import { Directive } from '@angular/core';

declare var $;
declare var self;

@Injectable()
export class MouseCaptureService {
    renderer: Renderer2;
    constructor(
        private appRef: ApplicationRef
    ) { }

    //
    // Element that the mouse capture applies to, defaults to 'document' 
    // unless the 'mouse-capture' directive is used.
    //
    $element = $(document);

    //
    // Set when mouse capture is acquired to an object that contains 
    // handlers for 'mousemove' and 'mouseup' events.
    //
    mouseCaptureConfig = null;

    self = this;

    //
    // Handler for mousemove events while the mouse is 'captured'.
    //
    mouseMove(evt) {
        if (this.mouseCaptureConfig && this.mouseCaptureConfig.mouseMove) {
            this.mouseCaptureConfig.mouseMove(evt);
            this.appRef.tick();
        }
    }

    //
    // Handler for mouseup event while the mouse is 'captured'.
    //
    mouseUp(evt) {
        if (this.mouseCaptureConfig && this.mouseCaptureConfig.mouseUp) {
            this.mouseCaptureConfig.mouseUp(evt);
            this.appRef.tick();
        }
    }

    // Register an element to use as the mouse capture element instead of
    // the default which is the document.
    registerElement(element) {
        this.$element = element;
    }

    // Acquire the 'mouse capture'.
    // After acquiring the mouse capture mousemove and mouseup events will be 
    // forwarded to callbacks in 'config'.
    acquire(evt, config) {
        //
        // Release any prior mouse capture.
        //
        this.release();

        this.mouseCaptureConfig = config;

        this.$element.mousemove(this.mouseMove(evt));
        this.$element.mouseup(this.mouseUp(evt));
    }

    release() {
        if (this.mouseCaptureConfig) {

            if (this.mouseCaptureConfig.released) {
                //
                // Let the client know that their 'mouse capture' has been released.
                //
                this.mouseCaptureConfig.released();
            }

            this.mouseCaptureConfig = null;
        }

        this.$element.unbind('mousemove', this.mouseMove);
        this.$element.unbind('mouseup', this.mouseUp);
    }

}

@Directive({
    selector: '[mouseCapture]'
})
export class MouseCaptureDirective {

    constructor(
        private mouseCapture: MouseCaptureService,
        private $element: ElementRef
    ) {
        const domElement = this.$element.nativeElement as HTMLElement;
        this.mouseCapture.registerElement($(domElement));
    }

}
