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

  existingVehicle!: Vehicle | null;
  existingVehicles: Array<Vehicle> = [];
  finalCharge: number = 0;
  parkedIds: Array<string> = [];
  parkingSlots: Array<ParkingSlot> = [];
  prioritizedEntrance: number = 0;
  vehicleSize: string = '';

  minClockOutDate = new Date();
  clockOutDate!: Date | null;
  clockOutTime: any = null;

  ngOnInit() {
    // prepare data
    for (const idx in PARKING_SLOTS) {
      this.parkingSlots.push(
        new ParkingSlot((parseInt(idx) + 1).toString(), PARKING_SLOTS[idx].size, PARKING_SLOTS[idx].distances)
      );
    }
  }

  public chooseEntrance(entrance: number, event: Event) {
    document.getElementsByName('entrance').forEach(element => element.style.backgroundColor = 'lightblue');
    (event.target as HTMLDivElement).style.backgroundColor = 'lightgreen';
    this.prioritizedEntrance = entrance;
  }

  public clearClockOutSettings() {
    this.clockOutDate = null;
    this.clockOutTime = null;
  }

  public parkVehicle(vehicleSize: string, dateInTest: Date = new Date()) {
    this.hideReceipt();  // TODO: use form group
    if (vehicleSize || this.existingVehicle) {
      const vehicle = this.createVehicle(vehicleSize);
      const bestParkingSlot = this.getBestParkingSlot(vehicle.size, this.prioritizedEntrance);
      if (bestParkingSlot) {
        bestParkingSlot.assignVehicle(vehicle);
        vehicle.setParkingSlot(bestParkingSlot.id);
        vehicle.setTimeIn(dateInTest || new Date());

        this.updateHtmlSlot(bestParkingSlot.id, vehicle.id);
        this.parkedIds.push(vehicle.id);
        this.removeExistingVehicles(vehicle.id);
      } else {
        alert('No more slots available!');
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

        this.resetHtmlSlot(slotHtmlId, reservedSlot.size);
        vehicle.setClockOut(clockout, charge);
        reservedSlot.removeVehicle();
        this.showReceipt(charge);
        this.updateExistingVehicles(vehicle);
      }
    } catch (error: any) {
      alert(error.message);
    }
  }

  private createVehicle(vehicleSize: string) {
    if (this.existingVehicle) return this.existingVehicle;

    let vehicle;
    while (!vehicle || vehicleIdExists(this, vehicle)) {
      vehicle = new Vehicle(this.VEHICLE_SIZES.findIndex(size => size === vehicleSize))
    }

    return vehicle;

    function vehicleIdExists(self: AppComponent, vehicle: Vehicle) {
      return self.existingVehicles.map(v => v.id).includes(vehicle.id) || self.parkedIds.includes(vehicle.id);
    }
  }

  private getReservedParkingSlot(event: Event) {
    const vehicleId = (event.target as HTMLDivElement).textContent;
    const reservedSlot = this.parkingSlots.find(slot => slot.vehicle?.id === vehicleId);
    if (!reservedSlot) throw new Error(`Could not find reserved parking slot for vehicle #${vehicleId}!`);
    return reservedSlot;
  }

  private getTotalCharge(vehicle: Vehicle, parkingSlotSize: number, testDate: Date = new Date()) {
    const clockOut = testDate.getTime() || new Date().getTime();
    const timeInHours = ((clockOut - vehicle.timeIn.getTime()) / 1000) / 3600;
    const multiplier = [20, 60, 100];
    let totalCharge = 40;

    if (timeInHours >= 24) {
      totalCharge = 0;
      totalCharge += Math.floor(timeInHours / 24) * 5000;  // count 24-hour chunks
      totalCharge += Math.ceil(parseFloat((timeInHours % 24).toFixed(4))) * multiplier[parkingSlotSize];  // count additional hours
      console.log(timeInHours % 24);
    } else if (timeInHours > 3) {
      totalCharge += Math.ceil(timeInHours - 3) * multiplier[parkingSlotSize];
    }

    return totalCharge - vehicle.previouslyPaid;
  }

  private hideReceipt() {
    if (this.receiptDiv) this.receiptDiv.nativeElement.style.visibility = 'hidden';
  }

  private showReceipt(charge: number) {
    this.finalCharge = charge;
    if (this.receiptDiv) this.receiptDiv.nativeElement.style.visibility = 'visible';
  }

  private getBestParkingSlot(vehicleSize: number, entranceNumber: number) {
    const freeSlots = this.parkingSlots.filter(parkingSlot => parkingSlot.isAvailable && parkingSlot.size >= vehicleSize);
    return freeSlots.sort((slot1, slot2) => slot1.distances[entranceNumber] - slot2.distances[entranceNumber])[0];
  }

  private resetHtmlSlot(elementId: string, parkingSlotSize: number) {
    const colorMap = ['lightyellow', 'yellow', 'orange'];
    document.getElementById(elementId)!.style.backgroundColor = colorMap[parkingSlotSize];
    document.getElementById(elementId)!.textContent = 'slot';
  }

  private setClockOutDate(date: Date) {
    const clockout = this.clockOutDate || date;
    if (this.clockOutTime) {
      clockout.setHours(this.clockOutTime.split(':')[0]);
      clockout.setMinutes(this.clockOutTime.split(':')[1]);
      if (clockout.getTime() < Date.now()) throw new Error('Invalid timestamp!');
    } else {
      clockout.setHours(new Date().getHours());
      clockout.setMinutes(new Date().getMinutes());
      clockout.setSeconds(new Date().getSeconds());
    }
    return clockout;
  }

  private removeExistingVehicles(vehicleId: string) {
    const vehicleIdx = this.existingVehicles.findIndex(v => v.id === vehicleId);
    if (vehicleIdx > -1) {
      this.existingVehicles.splice(vehicleIdx, 1);
    }
    this.existingVehicle = null;
  }

  private updateHtmlSlot(parkingSlotId: string, vehicleId: string) {
    document.getElementById(`slot${parkingSlotId}`)!.style.backgroundColor = 'pink';
    document.getElementById(`slot${parkingSlotId}`)!.textContent = vehicleId;
  }

  private updateExistingVehicles(vehicle: Vehicle) {
    this.parkedIds.splice(this.parkedIds.findIndex(v => v === vehicle.id), 1);
    if (!this.existingVehicles.find(v => v.id === vehicle.id)) {
      this.existingVehicles.push(vehicle);
    }
  }
}