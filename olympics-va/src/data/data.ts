export interface Team {
    id: number;
    name: string;
    isChecked: boolean;
}

export interface Medal {
    id: string;
    name: string;
    isChecked: boolean;
}

export interface Stat {
    id: string;
    name: string;
    noc: string;
    golds: number;
    silvers: number;
    bronzes: number;
    from: number;
    to: number;
}

export const golds = "golds"
export const silvers = "silvers"
export const bronzes = "bronzes"

export const isOlympicsDataReady: Boolean = false

export const requiredYearRange: number[] =  [1920, 2016]

export const Teams: Team[] = [
    {id: 0, isChecked: true, name: 'Italy'},
    {id: 1, isChecked: true, name: 'Germany'},
    {id: 2, isChecked: false, name: 'France'},
    {id: 3, isChecked: false, name: 'China'},
    {id: 4, isChecked: false, name: 'United States'},
    
];

export const Medals: Medal[] = [
    {id: golds, isChecked: true, name: 'Golds'},
    {id: silvers, isChecked: true, name: 'Silvers'},
    {id: bronzes, isChecked: false, name: 'Bronzes'},
];

export const StatsPieChart: any[] = [
    {party: 'BJP', electionP: 56},
    {party: 'INC', electionP: 18},
    {party: 'AA', electionP: 10},
    {party: 'CPI', electionP: 5},
    {party: 'CPI-M', electionP: 5},
    {party: 'BSP', electionP: 7},
    {party: 'AITS',  electionP: 10}
];

export interface Employee {
    company: string;
    frequency: number;
}

export const StatsBarChart: Employee[] = [
    {company: 'Apple', frequency: 100000},
    {company: 'IBM', frequency: 80000},
    {company: 'HP', frequency: 20000},
    {company: 'Facebook', frequency: 70000},
    {company: 'TCS', frequency: 12000},
    {company: 'Google', frequency: 110000},
    {company: 'Wipro', frequency: 5000},
    {company: 'EMC', frequency: 4000}
];