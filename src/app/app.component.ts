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
  availableParkingSlots: Array<Array<number>> = [[4, 5, 6], [1, 2, 4], [6, 7, 8], [9, 1, 4], [3, 2, 5]];
  parkingSlotSizes: Array<number> = [0, 2, 1, 1, 2]
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

    try {
      // TODO: implement buttons for this
      this.parkVehicle(this.smallVehicle);
      this.parkVehicle(this.mediumVehicle);
      this.parkVehicle(this.largeVehicle);
  
      // this.unparkVehicle(this.smallVehicle);
      this.unparkVehicle(this.mediumVehicle);
      // this.unparkVehicle(this.largeVehicle); 
    } catch (error) {
      console.error(error);
    }

    console.log('done');
  }

  public parkVehicle(vehicle: Vehicle) {
    const bestParkingSlot = this.getBestParkingSlot(vehicle.size, this.getEntranceNumber());
    if (bestParkingSlot) {
      bestParkingSlot.isAvailable = false;
      vehicle.parkingSlot = bestParkingSlot.id;
      vehicle.timeIn = new Date().getTime();
      console.log(`Reserved parking slot ${bestParkingSlot.id} for Vehicle ${vehicle.size}`);
    } else {
      console.log('No more slots available!');
    }
  }

  public unparkVehicle(vehicle: Vehicle) {
    const reservedSlot = this.parkingSlots.find(parkingSlot => parkingSlot.id === vehicle.parkingSlot);
    if (!reservedSlot) throw new Error(`Parking slot ${vehicle.parkingSlot} not found!`);
    reservedSlot.isAvailable = true;

    const charge = this.getTotalCharge(vehicle.timeIn, reservedSlot.size, new Date('Aug 8, 23 20:30').getTime());
    console.log(`Vehicle ${vehicle.size} owes ${charge}PHP`);
    // TODO: bug! new Date('Aug 5, 23 21:55').getTime()) % 3 doesn't work in extra hours
  }

  private getTotalCharge(timeIn: number, parkingSlotSize: number, testTime: number = 0) {
    const clockOut = testTime || new Date().getTime();
    const timeInHours = ((clockOut - timeIn) / 1000)/3600;
    const multiplier = [20, 60, 100];
    let totalCharge = 40;

    if (timeInHours >= 24) {
      totalCharge += Math.floor(timeInHours / 24) * 5000;                        // count 24-hour chunks
      totalCharge += Math.ceil(timeInHours % 24) * multiplier[parkingSlotSize];  // count additional hours
    } else if (timeInHours > 3) {
      totalCharge += Math.ceil(timeInHours - 3) * multiplier[parkingSlotSize];
    }

    return totalCharge;
  }

  private getEntranceNumber() {
    const queueCount = this.entranceQueues.sort((a, b) => b - a)[0];
    return this.entranceQueues.findIndex(n => n === queueCount);
  }

  private getBestParkingSlot(vehicleSize: number, entranceNumber: number) {
    // Right now I'm prioritizing distance over size. Is this a good trade-off?
    // 08.04.23: no, it's not a good trade-off hahaha
    const freeSlots = this.parkingSlots.filter(parkingSlot =>
      (parkingSlot.isAvailable && vehicleSize === 2 && parkingSlot.size === 2) ||
      (parkingSlot.isAvailable && vehicleSize === 1 && parkingSlot.size > 0) ||
      (parkingSlot.isAvailable && vehicleSize === 0 && parkingSlot.size >= 0)
    );
    const closestSlot = freeSlots.map(parkingSlot => parkingSlot.distances[entranceNumber]).sort()[0];
    return freeSlots.find(parkingSlot => parkingSlot.distances[entranceNumber] === closestSlot);
  }
}

class Vehicle {
  parkingSlot!: string;
  size: number = 0;
  totalCharge: number = 0;
  timeIn: number = 0;
  lastTimeIn: number = 0;

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
    if (size > 3) throw new Error('Invalid parking slot size!');
    if (distances.length !== 3) throw new Error('Number of distances should be equal to number of entrances!');
    // TODO: entrance count should be dynamic
    this.id = id;
    this.size = size;
    this.distances = distances;
  }
}