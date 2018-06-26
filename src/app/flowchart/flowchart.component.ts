import { Component, OnInit, ElementRef, Input, Directive, OnChanges, SimpleChanges } from '@angular/core';
import { DraggingService } from './dragging.service';

declare var $;
declare var hasClassSVG;
declare var flowchart;

@Directive({
    selector: '[appChartJsonEdit]'
})
export class ChartJsonEditDirective implements OnInit, OnChanges {
    @Input('appChartJsonEdit') viewModel: any;

    constructor(private $element: ElementRef) { }

    private updateJson() {
        if (this.viewModel) {
            const json = JSON.stringify(this.viewModel.vmData.data, null, 4);
            this.$element.nativeElement.value = json;
        }
    }

    ngOnInit() {
        this.updateJson();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.viewModel.currentValue.vmData) {
            const json = JSON.stringify(changes.viewModel.currentValue.vmData.data, null, 4);
            this.$element.nativeElement.value = json;
        }
    }
}

@Component({
    selector: 'app-flow-chart',
    templateUrl: './flowchart_template.html',
    styleUrls: ['./flowchart.component.css']
})
export class FlowchartComponent implements OnInit {

    @Input() chart: any;

    controller = this;

    // Reference to the document and jQuery, can be overridden for testting.
    document = document;

    // Init data-model variables.
    draggingConnection = false;
    connectorSize = 10;
    dragSelecting = false;

    // Reference to the connection, connector or node that the mouse is currently over.
    mouseOverConnector = null;
    mouseOverConnection = null;
    mouseOverNode = null;

    // The class for connections and connectors.
    connectionClass = 'connection';
    connectorClass = 'connector';
    nodeClass = 'node';

    dragPoint1;
    dragPoint2;
    dragTangent1;
    dragTangent2;
    dragSelectionRect: any = {
        x: '',
        y: '',
        width: '',
        height: ''
    };
    dragSelectionStartPoint;


    constructor(
        private $element: ElementRef,
        private dragging: DraggingService
    ) { }

    ngOnInit() {

    }

    //
    // Wrap jQuery so it can easily be  mocked for testing.
    //
    jQuery(element) {
        return $(element);
    }

    // Search up the HTML element tree for an element the requested class.
    searchUp(element, parentClass) {
        // Reached the root.
        if (element == null || element.length === 0) {
            return null;
        }

        // Check if the element has the class that identifies it as a connector.
        if (hasClassSVG(element, parentClass)) {
            // Found the connector element.
            return element;
        }

        // Recursively search parent elements.
        return this.searchUp(element.parent(), parentClass);
    }

    // Hit test and retreive node and connector that was hit at the specified coordinates.
    hitTest(clientX, clientY) {
        // Retreive the element the mouse is currently over.
        return this.document.elementFromPoint(clientX, clientY);
    }

    // Hit test and retreive node and connector that was hit at the specified coordinates.
    checkForHit(mouseOverElement, whichClass) {
        // Find the parent element, if any, that is a connector.
        const hoverElement = this.searchUp(this.jQuery(mouseOverElement), whichClass);
        if (!hoverElement) {
            return null;
        }

        // return hoverElement.scope();
        return hoverElement;
    }

    //
    // Translate the coordinates so they are relative to the svg element.
    //
    translateCoordinates(x, y, evt) {
        let svg_elem: any = this.$element.nativeElement as HTMLElement;
        // console.log(svg_elem.getElementsByTagName('svg'));
        // svg_elem = this.$element.nativeElement;
        svg_elem = svg_elem.getElementsByTagName('svg');
        svg_elem = $(svg_elem).get(0);
        const matrix = svg_elem.getScreenCTM();
        const point = svg_elem.createSVGPoint();
        point.x = x - evt.view.pageXOffset;
        point.y = y - evt.view.pageYOffset;
        console.log(point);
        console.log(point.matrixTransform(matrix.inverse()));
        return point.matrixTransform(matrix.inverse());
    }

    //
    // Called on mouse down in the chart.
    //
    mouseDown(evt) {

        this.chart.deselectAll();

        const controller = this;

        this.dragging.startDrag(evt, {

            //
            // Commence dragging... setup variables to display the drag selection rect.
            //
            dragStarted: function (x, y) {
                controller.dragSelecting = true;
                const startPoint = controller.translateCoordinates(x, y, evt);
                controller.dragSelectionStartPoint = startPoint;
                controller.dragSelectionRect = {
                    x: startPoint.x,
                    y: startPoint.y,
                    width: 0,
                    height: 0,
                };
            },

            //
            // Update the drag selection rect while dragging continues.
            //
            dragging: function (x, y) {
                const startPoint = controller.dragSelectionStartPoint;
                const curPoint = controller.translateCoordinates(x, y, evt);

                controller.dragSelectionRect = {
                    x: curPoint.x > startPoint.x ? startPoint.x : curPoint.x,
                    y: curPoint.y > startPoint.y ? startPoint.y : curPoint.y,
                    width: curPoint.x > startPoint.x ? curPoint.x - startPoint.x : startPoint.x - curPoint.x,
                    height: curPoint.y > startPoint.y ? curPoint.y - startPoint.y : startPoint.y - curPoint.y,
                };
            },

            //
            // Dragging has ended... select all that are within the drag selection rect.
            //
            dragEnded: function () {
                controller.dragSelecting = false;
                // console.log('+++++++++++++++++++++++++++++++');
                // console.log(controller.dragSelectionRect);
                // console.log(this.dragSelectionRect);
                // console.log('+++++++++++++++++++++++++++++++');
                controller.chart.applySelectionRect(controller.dragSelectionRect);
                delete controller.dragSelectionStartPoint;
                delete controller.dragSelectionRect;
            },
        });
    }

    //
    // Called for each mouse move on the svg element.
    //
    mouseMove(evt) {

        //
        // Clear out all cached mouse over elements.
        //
        this.mouseOverConnection = null;
        this.mouseOverConnector = null;
        this.mouseOverNode = null;

        const mouseOverElement = this.hitTest(evt.clientX, evt.clientY);
        if (mouseOverElement == null) {
            // Mouse isn't over anything, just clear all.
            return;
        }

        if (!this.draggingConnection) { // Only allow 'connection mouse over' when not dragging out a connection.

            // Figure out if the mouse is over a connection.
            const scope = this.checkForHit(mouseOverElement, this.connectionClass);
            this.mouseOverConnection = (scope && scope.connection) ? scope.connection : null;
            if (this.mouseOverConnection) {
                // Don't attempt to mouse over anything else.
                return;
            }
        }

        // Figure out if the mouse is over a connector.
        let scope = this.checkForHit(mouseOverElement, this.connectorClass);
        this.mouseOverConnector = (scope && scope.connector) ? scope.connector : null;
        if (this.mouseOverConnector) {
            // Don't attempt to mouse over anything else.
            return;
        }

        // Figure out if the mouse is over a node.
        scope = this.checkForHit(mouseOverElement, this.nodeClass);
        this.mouseOverNode = (scope && scope.node) ? scope.node : null;
    }

    //
    // Handle mousedown on a node.
    //
    nodeMouseDown(evt, node) {

        const chart = this.chart;
        let lastMouseCoords;

        const controller = this;

        // console.log('nodeMouseDown');

        this.dragging.startDrag(evt, {

            //
            // Node dragging has commenced.
            //
            dragStarted: function (x, y) {

                // console.log('Node dragging has commenced.');
                // console.log(`x : ${x} , y : ${y} `);

                lastMouseCoords = controller.translateCoordinates(x, y, evt);

                //
                // If nothing is selected when dragging starts,
                // at least select the node we are dragging.
                //
                if (!node.selected()) {
                    chart.deselectAll();
                    node.select();
                }
            },

            //
            // Dragging selected nodes... update their x,y coordinates.
            //
            dragging: function (x, y) {
                // console.log('Dragging selected nodes... update their x,y coordinates.');
                const curCoords = controller.translateCoordinates(x, y, evt);
                const deltaX = curCoords.x - lastMouseCoords.x;
                const deltaY = curCoords.y - lastMouseCoords.y;

                chart.updateSelectedNodesLocation(deltaX, deltaY);

                lastMouseCoords = curCoords;
            },

            //
            // The node wasn't dragged... it was clicked.
            //
            clicked: function () {
                // console.log('The node wasn\'t dragged... it was clicked.');
                chart.handleNodeClicked(node, evt.ctrlKey);
            },

        });
    }

    //
    // Handle mousedown on a connection.
    //
    connectionMouseDown(evt, connection) {
        const chart = this.chart;
        chart.handleConnectionMouseDown(connection, evt.ctrlKey);

        // Don't let the chart handle the mouse down.
        evt.stopPropagation();
        evt.preventDefault();
    }

    //
    // Handle mousedown on an input connector.
    //
    connectorMouseDown = function (evt, node, connector, connectorIndex, isInputConnector) {

        const controller = this;
        //
        // Initiate dragging out of a connection.
        //
        this.dragging.startDrag(evt, {

            //
            // Called when the mouse has moved greater than the threshold distance
            // and dragging has commenced.
            //
            dragStarted: function (x, y) {

                const curCoords = controller.translateCoordinates(x, y, evt);

                controller.draggingConnection = true;
                controller.dragPoint1 = flowchart.computeConnectorPos(node, connectorIndex, isInputConnector);
                controller.dragPoint2 = {
                    x: curCoords.x,
                    y: curCoords.y
                };
                controller.dragTangent1 = flowchart.computeConnectionSourceTangent(controller.dragPoint1, controller.dragPoint2);
                controller.dragTangent2 = flowchart.computeConnectionDestTangent(controller.dragPoint1, controller.dragPoint2);
            },

            //
            // Called on mousemove while dragging out a connection.
            //
            dragging: function (x, y, evt) {
                const startCoords = controller.translateCoordinates(x, y, evt);
                controller.dragPoint1 = flowchart.computeConnectorPos(node, connectorIndex, isInputConnector);
                controller.dragPoint2 = {
                    x: startCoords.x,
                    y: startCoords.y
                };
                controller.dragTangent1 = flowchart.computeConnectionSourceTangent(controller.dragPoint1, controller.dragPoint2);
                controller.dragTangent2 = flowchart.computeConnectionDestTangent(controller.dragPoint1, controller.dragPoint2);
            },

            //
            // Clean up when dragging has finished.
            //
            dragEnded: function () {

                if (controller.mouseOverConnector &&
                    controller.mouseOverConnector !== connector) {

                    //
                    // Dragging has ended...
                    // The mouse is over a valid connector...
                    // Create a new connection.
                    //
                    controller.chart.createNewConnection(connector, controller.mouseOverConnector);
                }

                controller.draggingConnection = false;
                delete controller.dragPoint1;
                delete controller.dragTangent1;
                delete controller.dragPoint2;
                delete controller.dragTangent2;
            }

        });
    };

}
