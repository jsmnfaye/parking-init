import { Component, OnInit } from '@angular/core';

import { Vehicle } from './classes/vehicle.component';
import { ParkingSlot } from './classes/parking-slot.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public readonly VEHICLE_SIZES = ['small', 'medium', 'large'];

  title = 'parking-system';

  entranceCount: number = 3;
  entranceQueues = [0, 0, 0];
  // TODO: move this to a separate file (txt or json will do)
  availableParkingSlots: Array<Array<number>> = [[4, 5, 6], [1, 2, 4], [6, 7, 8], [9, 1, 4], [3, 2, 5]];
  parkingSlotSizes: Array<number> = [0, 2, 1, 1, 2]
  parkingSlots: Array<ParkingSlot> = [];
  vehicleSize: string = '';

  // test cases
  smallVehicle: Vehicle = new Vehicle(0);
  mediumVehicle: Vehicle = new Vehicle(1);
  largeVehicle: Vehicle = new Vehicle(2);

  ngOnInit() {
    // prepare data
    if (this.availableParkingSlots.length !== this.parkingSlotSizes.length) {
      throw new Error('Different numbers of parking slot distances and sizes; should be equal!');
    }
    // setup dummy parking slots; should be randomized in the future
    for (const idx in this.parkingSlotSizes) {
      this.parkingSlots.push(
        new ParkingSlot(idx, this.parkingSlotSizes[idx], this.availableParkingSlots[idx])
      );
    }

    // try {
    //   // Test with dummy timestamps
    //   // TODO: implement buttons for this
    //   this.parkVehicle(this.mediumVehicle);
    //   this.unparkVehicle(this.mediumVehicle);

    //   this.parkVehicle(this.mediumVehicle, new Date('Aug 6, 23 16:20'));
    //   this.unparkVehicle(this.mediumVehicle, new Date('Aug 6, 23 16:45'));

    //   this.parkVehicle(this.mediumVehicle, new Date('Aug 6, 23 16:58'));
    //   this.unparkVehicle(this.mediumVehicle, new Date('Aug 6, 23 18:40'));

    //   this.parkVehicle(this.mediumVehicle, new Date('Aug 6, 23 19:30'));
    //   this.unparkVehicle(this.mediumVehicle, new Date('Aug 6, 23 23:50'));

    //   this.parkVehicle(this.mediumVehicle, new Date('Aug 8, 23 19:30'));
    //   this.unparkVehicle(this.mediumVehicle, new Date('Aug 8, 23 20:50'));
    // } catch (error) {
    //   console.error(error);
    // }

    console.log('done');
  }

  public parkVehicle(vehicleSize: string, dateInTest: Date = new Date()): void {
    if (vehicleSize) {
      const vehicle = new Vehicle(this.VEHICLE_SIZES.findIndex(size => size === vehicleSize));
      const bestParkingSlot = this.getBestParkingSlot(vehicle.size, this.getEntranceNumber());
      if (bestParkingSlot) {
        bestParkingSlot.assignVehicle(vehicle);
        vehicle.setParkingSlot(bestParkingSlot.id);
        vehicle.setTimeIn(dateInTest || new Date());
        this.updateHtmlSlot(bestParkingSlot.id, vehicle.id);
      } else {
        throw new Error('No more slots available!');
        // TODO: must continue looking for other slots as long as there are available ones
      }
    } else {
      alert('Select a vehicle size!');
    }
  }

  public unparkVehicle(vehicle: Vehicle, testDate: Date = new Date()): void {
    const reservedSlot = this.getReservedParkingSlot(vehicle.parkingSlot);
    const charge = this.getTotalCharge(vehicle, reservedSlot.size, testDate);

    reservedSlot.removeVehicle();
    vehicle.setClockOut(testDate || new Date());
    vehicle.updateFutureDiscount(charge);

    console.log(`Vehicle ${vehicle.size} owes ${charge}PHP`);
  }

  public unparkTest(event: Event) {
    const slotHtmlId = (event.target as HTMLDivElement).id;
    const parkingSlot = this.parkingSlots.find(slot => slot.id === slotHtmlId.replace(/[A-Za-z]/g, ''));
    if (parkingSlot && document.getElementById(slotHtmlId)) {
      this.resetHtmlSlot(slotHtmlId);
      // this.unparkVehicle();
    }
  }

  getReservedParkingSlot(parkingSlotId: string): ParkingSlot {
    const slot = this.parkingSlots.find(parkingSlot => parkingSlot.id === parkingSlotId);
    if (!slot) throw new Error(`Parking slot ${parkingSlotId} not found!`);
    return slot;
  }

  private getTotalCharge(vehicle: Vehicle, parkingSlotSize: number, testDate: Date = new Date()): number {
    const clockOut = testDate.getTime() || new Date().getTime();
    const timeInHours = ((clockOut - vehicle.timeIn.getTime()) / 1000) / 3600;
    const multiplier = [20, 60, 100];
    let totalCharge = 40;

    if (timeInHours >= 24) {
      totalCharge = 0;
      totalCharge += Math.floor(timeInHours / 24) * 5000;                        // count 24-hour chunks
      totalCharge += Math.ceil(timeInHours % 24) * multiplier[parkingSlotSize];  // count additional hours
    } else if (timeInHours > 3) {
      totalCharge += Math.ceil(timeInHours - 3) * multiplier[parkingSlotSize];
    }

    return totalCharge - vehicle.previouslyPaid;
  }

  private getEntranceNumber(): number {
    const queueCount = this.entranceQueues.sort((a, b) => b - a)[0];
    return this.entranceQueues.findIndex(n => n === queueCount);
  }

  private getBestParkingSlot(vehicleSize: number, entranceNumber: number): ParkingSlot | undefined {
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

  private resetHtmlSlot(elementId: string) {
    document.getElementById(elementId)!.style.backgroundColor = 'lightyellow';
    document.getElementById(elementId)!.textContent = 'slot';
  }

  private updateHtmlSlot(parkingSlotId: string, vehicleId: string) {
    document.getElementById(`slot${parkingSlotId}`)!.style.backgroundColor = 'pink';
    document.getElementById(`slot${parkingSlotId}`)!.textContent = vehicleId;
  }
}