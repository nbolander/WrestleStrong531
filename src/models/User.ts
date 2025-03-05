export interface User {
    id: string;
    name: string;
    weightClass: string;
    trainingMaxes: {
      deadlift: number;
      benchPress: number;
      squat: number;
      powerClean: number;
    };
    currentCycle: {
      number: number;
      week: number;
    };
    startDate: Date;
  }