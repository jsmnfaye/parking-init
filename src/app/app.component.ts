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
  availableParkingSlots: Array<Array<number>> = [[4, 5, 6], [1, 2, 4], [6, 7, 8], [9, 1, 4]];
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

    this.parkVehicle(this.smallVehicle);
    this.parkVehicle(this.mediumVehicle);
    this.parkVehicle(this.largeVehicle);
  }

  public parkVehicle(vehicle: Vehicle) {
    const entranceNumber = this.getEntranceNumber();
    // const freeSlot = this.availableParkingSlots.map(arr => arr[entranceNumber]).sort()[0];
    const freeSlots = this.parkingSlots.filter(parkingSlot => 
      // get slots that the car can fit in
      (parkingSlot.isAvailable && vehicle.size === 2 && parkingSlot.size === 2) ||
      (parkingSlot.isAvailable && vehicle.size === 1 && parkingSlot.size > 0) ||
      (parkingSlot.isAvailable && vehicle.size === 0 && parkingSlot.size >= 0)
    ).map(parkingSlot => parkingSlot.distances[entranceNumber]).sort()[0];
    
      // then sort the distances in ascending order with respect to entranceNumber

    // TODO: set parking slot availability to 'false'
    // TODO: set time in

    // vehicle.parkingSlot = this.availableParkingSlots.findIndex(arr => arr[entranceNumber] === freeSlot);
    vehicle.timeIn = Date.now();
  }

  public unparkVehicle() {

  }

  private getEntranceNumber() {
    const queueCount = this.entranceQueues.sort((a, b) => b - a)[0];
    return this.entranceQueues.findIndex(n => n === queueCount);
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