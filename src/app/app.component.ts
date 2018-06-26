import { Component, ViewEncapsulation, OnInit } from '@angular/core';

declare var flowchart;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';
  objectKeys = Object.keys;

  // Code for the delete key.
  deleteKeyCode = 46;

  // Code for control key.
  ctrlKeyCode = 17;

  // Set to true when the ctrl key is down.
  ctrlDown = false;

  // Code for A key.
  aKeyCode = 65;

  // Code for esc key.
  escKeyCode = 27;

  // Selects the next node id.
  nextNodeID = 10;

  // Setup the data-model for the chart.
  chartDataModel = {

    nodes: [
      {
        name: 'Node 1',
        id: 0,
        x: 20,
        y: 10,
        width: 150,
        inputConnectors: [],
        outputConnectors: [
          {
            name: 'O1',
          },
          {
            name: 'O2',
          },
          {
            name: 'O3',
          },
        ],
      },

      {
        name: 'Node 2',
        id: 1,
        x: 400,
        y: 150,
        width: 150,
        inputConnectors: [
          {
            name: 'I1',
          },
          {
            name: 'I2',
          },
          {
            name: 'I3',
          },
        ],
        outputConnectors: [
          {
            name: 'O1',
          },
          {
            name: 'O2',
          },
          {
            name: 'O3',
          },
        ],
      },

    ],

    connections: [
      {
        name: 'Connection 1',
        source: {
          nodeID: 0,
          connectorIndex: 1,
        },

        dest: {
          nodeID: 1,
          connectorIndex: 2,
        },
      },
      {
        name: 'Connection 2',
        source: {
          nodeID: 0,
          connectorIndex: 0,
        },

        dest: {
          nodeID: 1,
          connectorIndex: 0,
        },
      },

    ]
  };

  // Create the view-model for the chart and attach to the scope.
  chartViewModel: any;
  objectChartViewModel;

  ngOnInit() {
    this.chartViewModel = new flowchart.ChartViewModel(this.chartDataModel);
    this.objectChartViewModel = { vmData: this.chartViewModel };
  }

  inputChanged(val) {
    const dataModel = JSON.parse(val['value']);
    this.chartViewModel = new flowchart.ChartViewModel(dataModel);
    this.objectChartViewModel = { vmData: this.chartViewModel };
  }

  //
  // Event handler for key-down on the flowchart.
  //
  keyDown(evt) {
    if (evt.keyCode === this.ctrlKeyCode) {
      this.ctrlDown = true;
      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  //
  // Event handler for key-up on the flowchart.
  //
  keyUp(evt) {

    if (evt.keyCode === this.deleteKeyCode) {
      //
      // Delete key.
      //
      this.chartViewModel.deleteSelected();
      this.objectChartViewModel = { vmData: this.chartViewModel };
    }

    if (evt.keyCode === this.aKeyCode && this.ctrlDown) {
      // 
      // Ctrl + A
      //
      this.chartViewModel.selectAll();
      this.objectChartViewModel = { vmData: this.chartViewModel };
    }

    if (evt.keyCode === this.escKeyCode) {
      // Escape.
      this.chartViewModel.deselectAll();
      this.objectChartViewModel = { vmData: this.chartViewModel };
    }

    if (evt.keyCode === this.ctrlKeyCode) {
      this.ctrlDown = false;

      evt.stopPropagation();
      evt.preventDefault();
    }
  }

  //
  // Add a new node to the chart.
  //
  addNewNode() {

    const nodeName = prompt('Enter a node name:', 'New node');
    if (!nodeName) {
      return;
    }

    //
    // Template for a new node.
    //
    const newNodeDataModel = {
      name: nodeName,
      id: this.nextNodeID++,
      x: 0,
      y: 0,
      inputConnectors: [
        {
          name: 'X'
        },
        {
          name: 'Y'
        },
        {
          name: 'Z'
        }
      ],
      outputConnectors: [
        {
          name: '1'
        },
        {
          name: '2'
        },
        {
          name: '3'
        }
      ],
    };

    this.chartViewModel.addNode(newNodeDataModel);
    this.objectChartViewModel = { vmData: this.chartViewModel };
  }

  //
  // Add an input connector to selected nodes.
  //
  addNewInputConnector() {
    const connectorName = prompt('Enter a connector name:', 'New connector');
    if (!connectorName) {
      return;
    }

    const selectedNodes = this.chartViewModel.getSelectedNodes();
    for (let i = 0; i < selectedNodes.length; ++i) {
      const node = selectedNodes[i];
      node.addInputConnector({
        name: connectorName,
      });
    }
  }

  //
  // Add an output connector to selected nodes.
  //
  addNewOutputConnector() {
    const connectorName = prompt('Enter a connector name:', 'New connector');
    if (!connectorName) {
      return;
    }

    const selectedNodes = this.chartViewModel.getSelectedNodes();
    for (let i = 0; i < selectedNodes.length; ++i) {
      const node = selectedNodes[i];
      node.addOutputConnector({
        name: connectorName,
      });
    }
  }

  // Delete selected nodes and connections.
  deleteSelected() {

    this.chartViewModel.deleteSelected();
    this.objectChartViewModel = { vmData: this.chartViewModel };

  }

}
