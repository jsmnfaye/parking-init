import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'parking-system';
  entranceCount: number = 3;
  entranceQueues = [0, 0, 0];
  availableParkingSlots: Array<Array<number>> = [[4, 5, 6], [1, 2, 4], [6, 7 ,8], [9, 1, 4]];
  parkingSlotSizes: Array<number> = [0, 2, 1, 1]
  parkingSlots: Array<ParkingSlot> = [];

  // test cases
  smallVehicle: Vehicle = new Vehicle(0);
  mediumVehicle: Vehicle = new Vehicle(1);
  largeVehicle: Vehicle = new Vehicle(2);

  ngOnInit() {    
    if (this.availableParkingSlots.length !== this.parkingSlotSizes.length) {
      throw new Error('Different numbers of parking slot distances and sizes; should be equal!');
    }
    // setup dummy parking slots
    // should be randomized in the future
    for (const idx in this.parkingSlotSizes) {
      this.parkingSlots.push(
        new ParkingSlot(idx, this.parkingSlotSizes[idx], this.availableParkingSlots[idx])
      );
    }
    console.log(this.parkingSlots);
  }

  public parkVehicle(vehicle: Vehicle) {
    const queueCount = this.entranceQueues.sort((a, b) => b - a)[0];
    const entranceNumber = this.entranceQueues.findIndex(n => n === queueCount);
    const freeSlot = this.availableParkingSlots.map(arr => arr[entranceNumber]).sort()[0];
    // TODO: hindi na take into account yung size ni vehicle
    vehicle.parkingSlot = this.availableParkingSlots.findIndex(arr => arr[entranceNumber] === freeSlot);
    vehicle.timeIn = Date.now();
  }

  public unparkVehicle() {

  }
}

class Vehicle {
  parkingSlot: number = 0;
  size: number = 0;
  totalCharge: number = 0;
  timeIn: number = 0;
  timeOut: number = 0;

  constructor(size: number) {
    if (size > 3) throw new Error('Invalid vehicle size!');
    this.size = size;
  }
}

class ParkingSlot {
  id: string;
  size: number = 0;
  distances: Array<number> = [];
  isAvailable: boolean = true;

  constructor(id: string, size: number, distances: Array<number>) {
    this.id = id;
    this.size = size;
    this.distances = distances;
  }
}