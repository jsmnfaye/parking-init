export class Vehicle {
    id: string;
    parkingSlot!: string;
    size: number = 0;
    totalCharge: number = 0;
    timeIn!: Date;
    timeOut!: Date;
    previousTimeIn!: Date;
    previouslyPaid: number = 0;

    constructor(size: number) {
        if (size > 3) throw new Error('Invalid vehicle size!');
        this.size = size;
        this.id = `V${size}-${Math.floor(Math.random() * 100)}`;
    }

    setParkingSlot(parkingSlotId: string) {
        this.parkingSlot = parkingSlotId;
    }

    setTimeIn(time: Date) {
        this.timeIn = time;
        if (this.timeOut && (this.timeIn.getTime() - this.timeOut.getTime()) / 1000 < 3600) {
            this.timeIn = this.previousTimeIn;  // retain previous time-in if came back within an hour
        } else {
            this.previousTimeIn = time;
            this.previouslyPaid = 0;            // treat this as a new record
        }
    }

    setClockOut(time: Date) {
        this.timeOut = time;
    }

    updateFutureDiscount(amount: number) {
        this.previouslyPaid = this.previouslyPaid ? amount + this.previouslyPaid : amount;
    }
}