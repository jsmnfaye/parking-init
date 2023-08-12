export class ParkingSlot {
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

    setAvailability(available: boolean) {
        this.isAvailable = available;
    }
}