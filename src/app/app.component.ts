import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { Vehicle } from './classes/vehicle.component';
import { ParkingSlot } from './classes/parking-slot.component';
import { PARKING_SLOTS } from './resources/parking-slots.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('receiptText') receiptDiv: ElementRef | undefined;
  public readonly VEHICLE_SIZES = ['small', 'medium', 'large'];

  title = 'parking-system';

  entranceCount: number = 3;
  entranceQueues = [0, 0, 0];
  // TODO: move this to a separate file (txt or json will do)
  finalCharge: number = 0;
  parkingSlots: Array<ParkingSlot> = [];
  vehicleSize: string = '';

  minClockOutDate = new Date();
  clockOutDate!: Date;
  clockOutTime: any = null;

  // test cases
  smallVehicle: Vehicle = new Vehicle(0);
  mediumVehicle: Vehicle = new Vehicle(1);
  largeVehicle: Vehicle = new Vehicle(2);

  ngOnInit() {
    // prepare data
    for (const idx in PARKING_SLOTS) {
      this.parkingSlots.push(
        new ParkingSlot((parseInt(idx) + 1).toString(), PARKING_SLOTS[idx].size, PARKING_SLOTS[idx].distances)
      );
    }
  }

  public parkVehicle(vehicleSize: string, dateInTest: Date = new Date()): void {
    this.hideReceipt();
    if (vehicleSize) {
      const vehicle = new Vehicle(this.VEHICLE_SIZES.findIndex(size => size === vehicleSize));
      const bestParkingSlot = this.getBestParkingSlot(vehicle.size, this.getEntranceNumber());
      if (bestParkingSlot) {
        bestParkingSlot.assignVehicle(vehicle);
        vehicle.setParkingSlot(bestParkingSlot.id);
        vehicle.setTimeIn(dateInTest || new Date());
        this.updateHtmlSlot(bestParkingSlot.id, vehicle.id);
      } else {
        alert('No more slots available!');
        // TODO: must continue looking for other slots as long as there are available ones
      }
    } else {
      alert('Select a vehicle size!');
    }
  }

  public unparkVehicle(event: Event, testDate: Date = new Date()) {
    try {
      const reservedSlot = this.getReservedParkingSlot(event);
      const slotHtmlId = `slot${reservedSlot.id}`;
      if (reservedSlot && document.getElementById(slotHtmlId)) {
        const vehicle = reservedSlot.vehicle as Vehicle;
        const clockout = this.setClockOutDate(testDate);
        const charge = this.getTotalCharge(vehicle, reservedSlot.size, clockout);

        this.resetHtmlSlot(slotHtmlId);
        vehicle.setClockOut(clockout, charge);
        reservedSlot.removeVehicle();
        this.finalCharge = charge;
        this.showReceipt();
        console.log(`Vehicle ${vehicle.size} owes ${charge}PHP`);
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  getReservedParkingSlot(event: Event): ParkingSlot {
    const vehicleId = (event.target as HTMLDivElement).textContent;
    const reservedSlot = this.parkingSlots.find(slot => slot.vehicle?.id === vehicleId);
    if (!reservedSlot) throw new Error(`Could not find reserved parking slot for vehicle #${vehicleId}!`);
    return reservedSlot;
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

  private hideReceipt() {
    if (this.receiptDiv) this.receiptDiv.nativeElement.style.visibility = 'hidden';
  }

  private showReceipt() {
    if (this.receiptDiv) this.receiptDiv.nativeElement.style.visibility = 'visible';
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

  private setClockOutDate(date: Date) {
    const clockout = this.clockOutDate || date;
    if (this.clockOutTime) {
      clockout.setHours(this.clockOutTime.split(':')[0]);
      clockout.setMinutes(this.clockOutTime.split(':')[1]);
      if (clockout.getTime() < Date.now()) throw new Error('Invalid timestamp!');
    }
    return clockout;
  }

  private updateHtmlSlot(parkingSlotId: string, vehicleId: string) {
    document.getElementById(`slot${parkingSlotId}`)!.style.backgroundColor = 'pink';
    document.getElementById(`slot${parkingSlotId}`)!.textContent = vehicleId;
  }
}