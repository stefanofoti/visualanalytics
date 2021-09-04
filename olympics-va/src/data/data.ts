import { NumberValue } from "d3-scale"

export interface Team {
    id: number;
    name: string;
    isChecked: boolean;
}

export interface Sport {
    id: number;
    name: string;
    group: string;
    isChecked: boolean;
}

export interface Medal {
    id: string;
    name: string;
    isChecked: boolean;
}

export interface Country {
    id: string;
    name: string;
    continent: string;
    isChecked: boolean;
}

export interface CountryPopulation {
    name: string;
    years: Decades;
    continent: string;
}

export interface CountryGdp {
    id: string;
    name: string;
    years: any;
}

// export interface GdpYears {
//     [y: Number]: Number;

// }

export interface Decades {
    1900: number;
    1910: number;
    1920: number;
    1930: number;
    1940: number;
    1950: number;
    1960: number;
    1970: number;
    1980: number;
    1990: number;
    2000: number;
    2010: number;
    2020: number;
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

export const requiredYearRange: number[] = [1896, 2016]

export const Teams: Team[] = [
    { id: 0, isChecked: true, name: 'Italy' },
    { id: 1, isChecked: true, name: 'Germany' },
    { id: 2, isChecked: false, name: 'France' },
    { id: 3, isChecked: false, name: 'China' },
    { id: 4, isChecked: false, name: 'United States' },
];

export const Sports: Sport[] = [

];

export const Countries: Country[] = [

];

export const Populations: CountryPopulation[] = [

]

export const PreCheckedSports: string[] = []


export const PreCheckedSports2: string[] = ["Basketball Men's Basketball",
    "Judo Men's Extra-Lightweight",
    "Football Men's Football",
    "Tug-Of-War Men's Tug-Of-War",
    "Speed Skating Women's 500 metres",
    "Speed Skating Women's 1,000 metres",
    "Cross Country Skiing Men's 10 kilometres",
    "Cross Country Skiing Men's 50 kilometres",
    "Cross Country Skiing Men's 10/15 kilometres Pursuit",
    "Cross Country Skiing Men's 4 x 10 kilometres Relay",
    "Cross Country Skiing Men's 30 kilometres",
    "Athletics Women's 100 metres",
    "Athletics Women's 4 x 100 metres Relay",
    "Ice Hockey Men's Ice Hockey",
    "Swimming Men's 400 metres Freestyle",
    "Badminton Men's Singles",
    "Sailing Women's Windsurfer",
    "Biathlon Women's 7.5 kilometres Sprint",
    "Swimming Men's 200 metres Breaststroke",
    "Swimming Men's 400 metres Breaststroke",
    "Gymnastics Men's Individual All-Around",
    "Gymnastics Men's Team All-Around",
    "Gymnastics Men's Floor Exercise",
    "Gymnastics Men's Horse Vault",
    "Gymnastics Men's Parallel Bars",
    "Gymnastics Men's Horizontal Bar",
    "Gymnastics Men's Rings",
    "Gymnastics Men's Pommelled Horse",
    "Athletics Men's Shot Put",
    "Art Competitions Mixed Sculpturing, Unknown Event",
    "Alpine Skiing Men's Downhill",
    "Alpine Skiing Men's Super G",
    "Alpine Skiing Men's Giant Slalom",
    "Alpine Skiing Men's Slalom",
    "Alpine Skiing Men's Combined",
    "Handball Women's Handball",
    "Weightlifting Women's Super-Heavyweight",
    "Wrestling Men's Light-Heavyweight, Greco-Roman",
    "Speed Skating Men's 500 metres",
    "Speed Skating Men's 1,500 metres",
    "Gymnastics Men's Team All-Around, Free System",
    "Luge Women's Singles",
    "Water Polo Men's Water Polo",
    "Sailing Mixed Three Person Keelboat",
    "Hockey Women's Hockey",
    "Rowing Men's Lightweight Double Sculls",
    "Athletics Men's Pole Vault",
    "Athletics Men's High Jump",
    "Sailing Men's Two Person Dinghy",
    "Athletics Men's 1,500 metres",
    "Bobsleigh Men's Four",
    "Swimming Men's 100 metres Butterfly",
    "Swimming Men's 200 metres Butterfly",
    "Swimming Men's 4 x 100 metres Medley Relay",
    "Football Women's Football",
    "Fencing Men's Foil, Individual",
    "Fencing Men's epee, Individual",
    "Fencing Men's epee, Team",
    "Speed Skating Men's 5,000 metres",
    "Speed Skating Men's 10,000 metres",
    "Sailing Mixed 8 metres",
    "Equestrianism Mixed Jumping, Individual",
    "Cross Country Skiing Men's 15 kilometres",
    "Shooting Men's Small-Bore Rifle, Prone, 50 metres",
    "Shooting Men's Rapid-Fire Pistol, 25 metres",
    "Shooting Men's Trap",
    "Athletics Men's 4 x 100 metres Relay",
    "Athletics Men's Long Jump",
    "Boxing Men's Light-Welterweight",
    "Athletics Women's Javelin Throw",
    "Wrestling Men's Heavyweight, Freestyle",
    "Taekwondo Men's Flyweight",
    "Boxing Men's Heavyweight",
    "Athletics Men's 5,000 metres",
    "Cycling Men's Road Race, Individual",
    "Cycling Men's Road Race, Team",
    "Weightlifting Men's Lightweight",
    "Weightlifting Men's Middleweight",
    "Rowing Men's Coxless Pairs",
    "Judo Men's Half-Middleweight",
    "Taekwondo Women's Flyweight",
    "Boxing Men's Flyweight",
    "Basketball Women's Basketball",
    "Diving Men's Platform",
    "Canoeing Men's Canadian Doubles, 500 metres",
    "Canoeing Men's Canadian Doubles, 1,000 metres",
    "Canoeing Men's Kayak Fours, 1,000 metres",
    "Handball Men's Handball",
    "Rowing Women's Coxless Pairs",
    "Boxing Men's Middleweight",
    "Judo Men's Lightweight",
    "Boxing Men's Featherweight",
    "Tennis Men's Doubles",
    "Shooting Mixed Skeet",
    "Wrestling Men's Featherweight, Freestyle",
    "Sailing Mixed Two Person Heavyweight Dinghy",
    "Athletics Women's Shot Put",
    "Rowing Men's Coxed Eights",
    "Cycling Women's Sprint",
    "Cycling Women's 500 metres Time Trial",
    "Athletics Men's 110 metres Hurdles",
    "Shooting Mixed Trap",
    "Athletics Women's Marathon",
    "Athletics Men's 100 metres",
    "Fencing Men's Foil, Team",
    "Fencing Men's Sabre, Team",
    "Swimming Men's 100 metres Freestyle",
    "Swimming Men's 4 x 200 metres Freestyle Relay",
    "Boxing Men's Lightweight",
    "Modern Pentathlon Men's Individual",
    "Boxing Men's Welterweight",
    "Rowing Men's Quadruple Sculls",
    "Rowing Men's Double Sculls",
    "Rowing Men's Coxed Pairs",
    "Athletics Men's 400 metres Hurdles",
    "Athletics Men's 400 metres",
    "Athletics Men's Hammer Throw",
    "Weightlifting Men's Featherweight",
    "Athletics Men's 800 metres",
    "Hockey Men's Hockey",
    "Alpine Skiing Women's Slalom",
    "Rowing Women's Single Sculls",
    "Swimming Men's 50 metres Freestyle",
    "Weightlifting Women's Featherweight",
    "Water Polo Women's Water Polo",
    "Figure Skating Men's Singles",
    "Weightlifting Men's Heavyweight",
    "Equestrianism Mixed Three-Day Event, Individual",
    "Equestrianism Mixed Three-Day Event, Team",
    "Figure Skating Mixed Team",
    "Sailing Women's Three Person Keelboat",
    "Cycling Women's Road Race, Individual",
    "Golf Women's Individual",
    "Softball Women's Softball",
    "Archery Women's Individual",
    "Wrestling Men's Heavyweight, Greco-Roman",
    "Volleyball Men's Volleyball",
    "Taekwondo Women's Heavyweight",
    "Synchronized Swimming Women's Duet",
    "Synchronized Swimming Women's Team",
    "Taekwondo Women's Featherweight",
    "Athletics Men's Marathon",
    "Athletics Men's 4 x 400 metres Relay",
    "Athletics Men's 10,000 metres",
    "Athletics Women's 3,000 metres",
    "Diving Women's Platform",
    "Shooting Men's Air Rifle, 10 metres",
    "Athletics Men's 200 metres",
    "Weightlifting Men's Flyweight",
    "Swimming Men's 100 metres Backstroke",
    "Weightlifting Men's Light-Heavyweight",
    "Wrestling Men's Lightweight, Greco-Roman",
    "Fencing Men's Sabre, Individual",
    "Wrestling Men's Super-Heavyweight, Greco-Roman",
    "Shooting Men's Free Pistol, 50 metres",
    "Shooting Men's Air Pistol, 10 metres",
    "Rowing Men's Coxless Fours",
    "Boxing Men's Light-Flyweight",
    "Boxing Men's Super-Heavyweight",
    "Wrestling Men's Flyweight, Greco-Roman",
    "Shooting Women's Air Rifle, 10 metres",
    "Weightlifting Men's Middle-Heavyweight",
    "Athletics Men's Javelin Throw",
    "Volleyball Women's Volleyball",
    "Wrestling Men's Welterweight, Greco-Roman",
    "Wrestling Men's Middleweight, Greco-Roman",
    "Athletics Men's 3,000 metres Steeplechase",
    "Wrestling Men's Middleweight, Freestyle",
    "Swimming Women's 100 metres Backstroke",
    "Swimming Women's 200 metres Backstroke",
    "Swimming Women's 4 x 100 metres Medley Relay",
    "Wrestling Men's Light-Heavyweight, Freestyle",
    "Modern Pentathlon Men's Team",
    "Boxing Men's Bantamweight",
    "Athletics Women's 200 metres",
    "Table Tennis Women's Singles",
    "Table Tennis Women's Doubles",
    "Shooting Men's Skeet",
    "Swimming Women's 50 metres Freestyle",
    "Shooting Men's Small-Bore Rifle, Three Positions, 50 metres",
    "Athletics Men's Triple Jump",
    "Weightlifting Women's Lightweight",
    "Athletics Women's Long Jump",
    "Fencing Women's epee, Individual",
    "Swimming Men's 200 metres Freestyle",
    "Swimming Men's 4 x 100 metres Freestyle Relay",
    "Swimming Men's 200 metres Backstroke",
    "Swimming Men's 200 metres Individual Medley",
    "Swimming Men's 400 metres Individual Medley",
    "Badminton Women's Singles",
    "Boxing Men's Light-Middleweight",
    "Tennis Men's Singles",
    "Wrestling Men's Bantamweight, Freestyle",
    "Wrestling Men's Flyweight, Freestyle",
    "Athletics Women's 5,000 metres",
    "Weightlifting Women's Light-Heavyweight",
    "Weightlifting Women's Heavyweight",
    "Athletics Men's Discus Throw",
    "Taekwondo Men's Featherweight",
    "Taekwondo Men's Welterweight",
    "Judo Men's Heavyweight",
    "Cycling Men's Sprint",
    "Bobsleigh Men's Two",
    "Wrestling Men's Lightweight, Freestyle",
    "Nordic Combined Men's Team",
    "Nordic Combined Men's Individual",
    "Baseball Men's Baseball",
    "Rowing Men's Coxed Fours",
    "Cycling Men's 100 kilometres Team Time Trial",
    "Rhythmic Gymnastics Women's Group",
    "Art Competitions Mixed Architecture, Designs For Town Planning",
    "Art Competitions Mixed Architecture, Architectural Designs",
    "Gymnastics Women's Individual All-Around",
    "Gymnastics Women's Team All-Around",
    "Gymnastics Women's Floor Exercise",
    "Gymnastics Women's Horse Vault",
    "Gymnastics Women's Uneven Bars",
    "Gymnastics Women's Balance Beam",
    "Diving Women's Springboard",
    "Diving Women's Synchronized Springboard",
    "Athletics Women's 10,000 metres",
    "Sailing Mixed 7 metres",
    "Judo Women's Half-Middleweight",
    "Athletics Men's Decathlon",
    "Biathlon Men's 10 kilometres Sprint",
    "Biathlon Men's 20 kilometres",
    "Biathlon Men's 4 x 7.5 kilometres Relay",
    "Freestyle Skiing Men's Moguls",
    "Wrestling Men's Middleweight A, Greco-Roman",
    "Athletics Women's Discus Throw",
    "Swimming Women's 4 x 100 metres Freestyle Relay",
    "Athletics Women's 1,500 metres",
    "Shooting Women's Air Pistol, 10 metres",
    "Shooting Women's Sporting Pistol, 25 metres",
    "Canoeing Men's Kayak Doubles, 500 metres",
    "Canoeing Men's Kayak Singles, 500 metres",
    "Canoeing Men's Kayak Singles, 1,000 metres",
    "Shooting Men's Running Target, 50 metres",
    "Judo Women's Half-Heavyweight",
    "Athletics Women's Pole Vault",
    "Rugby Sevens Women's Rugby Sevens",
    "Table Tennis Men's Team",
    "Figure Skating Mixed Pairs",
    "Freestyle Skiing Men's Aerials",
    "Rowing Women's Coxed Eights",
    "Athletics Women's 4 x 400 metres Relay",
    "Alpine Skiing Women's Giant Slalom",
    "Alpine Skiing Women's Super G",
    "Cross Country Skiing Women's 5 kilometres",
    "Cross Country Skiing Women's 10 kilometres",
    "Cross Country Skiing Women's 20 kilometres",
    "Cycling Men's 1,000 metres Time Trial",
    "Cycling Men's Individual Pursuit, 4,000 metres",
    "Wrestling Men's Welterweight, Freestyle",
    "Wrestling Men's Bantamweight, Greco-Roman",
    "Rowing Women's Lightweight Double Sculls",
    "Athletics Women's 800 metres",
    "Rowing Women's Coxed Quadruple Sculls",
    "Biathlon Men's 12.5 kilometres Pursuit",
    "Biathlon Mixed 2 x 6 kilometres and 2 x 7.5 kilometres Relay",
    "Rhythmic Gymnastics Women's Individual",
    "Canoeing Men's Kayak Singles, Slalom",
    "Archery Men's Individual",
    "Archery Men's Team",
    "Speed Skating Women's 1,500 metres",
    "Speed Skating Women's Team Pursuit (6 laps)",
    "Cross Country Skiing Men's Sprint",
    "Athletics Women's 400 metres",
    "Figure Skating Women's Singles",
    "Speed Skating Men's 1,000 metres",
    "Trampolining Men's Individual",
    "Beach Volleyball Men's Beach Volleyball",
    "Cycling Women's Mountainbike, Cross-Country",
    "Athletics Men's Javelin Throw, Both Hands",
    "Triathlon Women's Olympic Distance",
    "Gymnastics Women's Team Portable Apparatus",
    "Cycling Men's Mountainbike, Cross-Country",
    "Athletics Women's 400 metres Hurdles",
    "Diving Men's Springboard",
    "Wrestling Men's Featherweight, Greco-Roman",
    "Table Tennis Men's Singles",
    "Art Competitions Mixed Painting",
    "Cross Country Skiing Women's 3 x 5 kilometres Relay",
    "Judo Men's Open Class",
    "Rowing Women's Quadruple Sculls",
    "Gymnastics Men's Team All-Around, Swedish System",
    "Nordic Combined Men's Sprint",
    "Athletics Women's Pentathlon",
    "Art Competitions Mixed Painting, Unknown Event",
    "Cycling Men's Team Pursuit, 4,000 metres",
    "Weightlifting Women's Middleweight",
    "Swimming Men's 1,500 metres Freestyle",
    "Wrestling Women's Light-Heavyweight, Freestyle",
    "Swimming Women's 100 metres Freestyle",
    "Equestrianism Men's Jumping, Individual",
    "Equestrianism Men's Jumping, Team",
    "Equestrianism Men's Three-Day Event, Individual",
    "Equestrianism Men's Three-Day Event, Team",
    "Alpine Skiing Women's Combined",
    "Athletics Women's High Jump",
    "Ski Jumping Men's Normal Hill, Individual",
    "Canoeing Women's Kayak Fours, 500 metres",
    "Ice Hockey Women's Ice Hockey",
    "Sailing Men's One Person Dinghy",
    "Trampolining Women's Individual",
    "Curling Men's Curling",
    "Art Competitions Mixed Literature",
    "Judo Men's Middleweight",
    "Biathlon Women's 15 kilometres",
    "Biathlon Women's 3 x 7.5 kilometres Relay",
    "Biathlon Women's 4 x 7.5 kilometres Relay",
    "Judo Men's Half-Lightweight",
    "Fencing Women's Foil, Team",
    "Swimming Women's 200 metres Butterfly",
    "Swimming Women's 400 metres Individual Medley",
    "Golf Men's Individual",
    "Athletics Men's Standing High Jump",
    "Athletics Men's Standing Long Jump",
    "Athletics Men's 20 kilometres Walk",
    "Swimming Men's 220 yard Freestyle",
    "Swimming Men's 880 yard Freestyle",
    "Swimming Men's One Mile Freestyle",
    "Swimming Men's 4 x 50 Yard Freestyle Relay",
    "Swimming Men's Plunge For Distance",
    "Shooting Men's Free Rifle, Three Positions, 300 metres",
    "Shooting Men's Military Rifle, Three Positions, 300 metres",
    "Shooting Men's Military Rifle, Any Position, 600 metres",
    "Shooting Men's Military Rifle, 200, 400, 500 and 600 metres, Team",
    "Shooting Men's Military Rifle, Prone, 300 metres",
    "Judo Men's Half-Heavyweight",
    "Archery Women's Team",
    "Athletics Men's 50 kilometres Walk",
    "Rowing Women's Double Sculls",
    "Sailing Mixed 6 metres",
    "Boxing Men's Light-Heavyweight",
    "Boxing Women's Flyweight",
    "Athletics Women's 100 metres Hurdles",
    "Athletics Men's Discus Throw, Greek Style",
    "Curling Women's Curling",
    "Sailing Mixed One Person Dinghy",
    "Wrestling Women's Heavyweight, Freestyle",
    "Badminton Mixed Doubles",
    "Fencing Women's Foil, Individual",
    "Sailing Mixed Two Person Keelboat",
    "Shooting Men's Military Rifle, 300 metres and 600 metres, Prone, Team",
    "Table Tennis Men's Doubles",
    "Wrestling Men's Light-Flyweight, Freestyle",
    "Wrestling Women's Featherweight, Freestyle",
    "Swimming Women's 200 metres Freestyle",
    "Swimming Women's 400 metres Freestyle",
    "Swimming Women's 200 metres Individual Medley",
    "Sailing Men's Windsurfer",
    "Freestyle Skiing Men's Slopestyle",
    "Shooting Men's Running Target, Single Shot",
    "Shooting Men's Running Target, Double Shot",
    "Rugby Sevens Men's Rugby Sevens",
    "Wrestling Women's Lightweight, Freestyle",
    "Modern Pentathlon Women's Individual",
    "Canoeing Men's Canadian Doubles, Slalom",
    "Judo Women's Half-Lightweight",
    "Diving Women's Plain High",
    "Equestrianism Men's Dressage, Individual",
    "Equestrianism Men's Dressage, Team",
    "Tennis Women's Singles, Covered Courts",
    "Diving Men's Plain High",
    "Shooting Mixed Small-Bore Rifle, Three Positions, 50 metres",
    "Shooting Mixed Small-Bore Rifle, Prone, 50 metres",
    "Swimming Women's 800 metres Freestyle",
    "Sailing Women's Two Person Dinghy",
    "Alpine Skiing Women's Downhill",
    "Shooting Men's Free Pistol, 50 metres, Team",
    "Shooting Men's Free Rifle, Three Positions, 300 metres, Team",
    "Shooting Men's Military Rifle, Prone, 300 metres, Team",
    "Shooting Men's Military Rifle, Prone, 600 metres, Team",
    "Shooting Men's Military Rifle, Standing, 300 metres, Team",
    "Shooting Men's Free Rifle, Prone, 600 metres",
    "Shooting Men's Free Rifle, 400, 600 and 800 metres, Team",
    "Rowing Men's Single Sculls",
    "Cycling Men's Tandem Sprint, 2,000 metres",
    "Freestyle Skiing Women's Halfpipe",
    "Athletics Women's Heptathlon",
    "Cycling Men's Points Race",
    "Synchronized Swimming Women's Solo",
    "Equestrianism Mixed Dressage, Individual",
    "Equestrianism Mixed Dressage, Team",
    "Cross Country Skiing Men's 18 kilometres",
    "Swimming Men's 100 metres Breaststroke",
    "Figure Skating Mixed Ice Dancing",
    "Shooting Mixed Free Pistol, 50 metres",
    "Sailing Women's Skiff",
    "Canoeing Men's Kayak Doubles, 10,000 metres",
    "Triathlon Men's Olympic Distance",
    "Sailing Women's One Person Dinghy",
    "Cross Country Skiing Women's 30 kilometres",
    "Cross Country Skiing Women's 15 km Skiathlon",
    "Rowing Men's 17-Man Naval Rowing Boats",
    "Beach Volleyball Women's Beach Volleyball",
    "Weightlifting Men's Super-Heavyweight",
    "Rowing Men's Lightweight Coxless Fours",
    "Wrestling Men's Light-Flyweight, Greco-Roman",
    "Canoeing Men's Canadian Singles, 1,000 metres",
    "Sailing Mixed 5.5 metres",
    "Equestrianism Mixed Jumping, Team",
    "Diving Men's Synchronized Platform",
    "Snowboarding Men's Halfpipe",
    "Canoeing Women's Kayak Singles, Slalom",
    "Weightlifting Women's Flyweight",
    "Swimming Women's 100 metres Breaststroke",
    "Swimming Women's 200 metres Breaststroke",
    "Wrestling Men's Middleweight B, Greco-Roman",
    "Athletics Men's Stone Throw",
    "Athletics Men's Javelin Throw, Freestyle",
    "Athletics Men's Pentathlon (Ancient)",
    "Shooting Women's Small-Bore Rifle, Three Positions, 50 metres",
    "Swimming Women's 100 metres Butterfly",
    "Weightlifting Men's Heavyweight I",
    "Athletics Women's 3,000 metres Steeplechase",
    "Athletics Men's Shot Put, Both Hands",
    "Ski Jumping Men's Large Hill, Individual",
    "Ski Jumping Men's Large Hill, Team",
    "Shooting Women's Trap",
    "Badminton Men's Doubles",
    "Swimming Women's 4 x 200 metres Freestyle Relay",
    "Athletics Men's 10 kilometres Walk",
    "Athletics Women's 20 kilometres Walk",
    "Athletics Women's 80 metres Hurdles",
    "Sailing Men's One Person Heavyweight Dinghy",
    "Freestyle Skiing Women's Aerials",
    "Art Competitions Mixed Painting, Paintings",
    "Tennis Mixed Doubles, Covered Courts",
    "Cycling Men's Madison",
    "Art Competitions Mixed Sculpturing, Statues",
    "Rugby Men's Rugby",
    "Weightlifting Men's Heavyweight II",
    "Canoeing Women's Kayak Doubles, 500 metres",
    "Short Track Speed Skating Men's 5,000 metres Relay",
    "Cycling Men's Individual Time Trial",
    "Judo Women's Heavyweight",
    "Canoeing Men's Kayak Doubles, 1,000 metres",
    "Gymnastics Men's Individual All-Around, 5 Events",
    "Wrestling Men's Super-Heavyweight, Freestyle",
    "Biathlon Women's 10 kilometres Pursuit",
    "Biathlon Women's 12.5 kilometres Mass Start",
    "Biathlon Women's 4 x 6 kilometres Relay",
    "Fencing Women's Sabre, Team",
    "Shooting Men's Double Trap",
    "Weightlifting Men's Bantamweight",
    "Taekwondo Men's Heavyweight",
    "Sailing Mixed Windsurfer",
    "Taekwondo Women's Welterweight",
    "Shooting Mixed Free Rifle, Three Positions, 300 metres",
    "Skeleton Men's Skeleton",
    "Cycling Men's 50 kilometres",
    "Shooting Mixed Rapid-Fire Pistol, 25 metres",
    "Cycling Men's 333 metres Time Trial",
    "Cycling Men's 20 kilometres",
    "Canoeing Men's Kayak Singles, 10,000 metres",
    "Sailing Mixed Open",
    "Sailing Mixed 1-2 Ton",
    "Canoeing Men's Canadian Singles, Slalom",
    "Luge Men's Singles",
    "Luge Mixed (Men)'s Doubles",
    "Sailing Mixed Multihull",
    "Badminton Women's Doubles",
    "Speed Skating Women's 3,000 metres",
    "Cross Country Skiing Women's 5/10 kilometres Pursuit",
    "Cross Country Skiing Women's 4 x 5 kilometres Relay",
    "Cross Country Skiing Women's 15 kilometres",
    "Cross Country Skiing Women's 5/5 kilometres Pursuit",
    "Diving Women's Synchronized Platform",
    "Athletics Women's Triple Jump",
    "Skeleton Women's Skeleton",
    "Bobsleigh Men's Four/Five",
    "Art Competitions Mixed Painting, Drawings And Water Colors",
    "Shooting Men's Dueling Pistol, 30 metres",
    "Boxing Women's Lightweight",
    "Cycling Women's BMX",
    "Canoeing Men's Kayak Doubles, 200 metres",
    "Fencing Men's Sabre, Masters, Individual",
    "Lacrosse Men's Lacrosse",
    "Canoeing Women's Kayak Singles, 500 metres",
    "Athletics Women's 10 kilometres Walk",
    "Sailing Mixed 12 metres",
    "Judo Women's Extra-Lightweight",
    "Diving Men's Synchronized Springboard",
    "Rowing Men's Coxed Fours, Outriggers",
    "Gymnastics Men's Rope Climbing",
    "Sailing Mixed Two Person Dinghy",
    "Art Competitions Mixed Architecture, Unknown Event",
    "Archery Men's Target Archery, 28 metres, Team",
    "Archery Men's Target Archery, 33 metres, Team",
    "Archery Men's Target Archery, 50 metres, Team",
    "Short Track Speed Skating Women's 3,000 metres Relay",
    "Freestyle Skiing Women's Moguls",
    "Short Track Speed Skating Men's 500 metres",
    "Shooting Men's Running Target, 10 metres",
    "Polo Men's Polo",
    "Rowing Men's Coxed Fours, Inriggers",
    "Cycling Men's BMX",
    "Art Competitions Mixed Sculpturing",
    "Athletics Men's Cross-Country, Individual",
    "Athletics Men's Cross-Country, Team",
    "Sailing Mixed 40 metres",
    "Cross Country Skiing Men's 10/10 kilometres Pursuit",
    "Ski Jumping Women's Normal Hill, Individual",
    "Short Track Speed Skating Men's 1,000 metres",
    "Short Track Speed Skating Men's 1,500 metres",
    "Gymnastics Men's Club Swinging",
    "Tennis Women's Singles",
    "Tennis Mixed Doubles",
    "Tennis Women's Doubles",
    "Judo Women's Middleweight",
    "Judo Women's Lightweight",
    "Cross Country Skiing Men's Team Sprint",
    "Snowboarding Women's Halfpipe",
    "Canoeing Women's Kayak Singles, 200 metres",
    "Canoeing Men's Kayak Relay 4 x 500 metres",
    "Athletics Men's 3,000 metres, Team",
    "Cross Country Skiing Women's Sprint",
    "Shooting Men's Small-Bore Rifle, Prone, 50 and 100 yards",
    "Shooting Men's Small-Bore Rifle, 50 and 100 yards, Team",
    "Shooting Men's Small-Bore Rifle, Disappearing Target, 25 yards",
    "Shooting Men's Small-Bore Rifle, Moving Target, 25 yards",
    "Shooting Men's Military Pistol, Team",
    "Rowing Women's Coxed Fours",
    "Weightlifting Men's Unlimited, One Hand",
    "Canoeing Men's Canadian Singles, 500 metres",
    "Fencing Men's Foil, Masters, Individual",
    "Fencing Men's epee, Masters, Individual",
    "Gymnastics Men's Individual All-Around, Field Sports",
    "Gymnastics Men's Individual All-Around, Apparatus Work",
    "Art Competitions Mixed Music, Compositions For Solo Or Chorus",
    "Fencing Women's epee, Team",
    "Swimming Men's 4,000 metres Freestyle",
    "Swimming Men's Underwater Swimming",
    "Sailing Mixed Skiff",
    "Shooting Men's Military Rifle, 200/500/600/800/900/1,000 Yards, Team",
    "Shooting Men's Running Target, Single And Double Shot",
    "Shooting Men's Small-Bore Rifle, Any Position, 50 metres",
    "Shooting Men's Small-Bore Rifle, Disappearing Target, 25 metres",
    "Swimming Women's 10 kilometres Open Water",
    "Snowboarding Women's Slopestyle",
    "Snowboarding Men's Giant Slalom",
    "Snowboarding Men's Parallel Giant Slalom",
    "Snowboarding Men's Boardercross",
    "Snowboarding Men's Parallel Slalom",
    "Cycling Men's Team Pursuit, 1,980 yards",
    "Cycling Men's 5,000 metres",
    "Cycling Men's 100 kilometres",
    "Cricket Men's Cricket",
    "Canoeing Men's Canadian Singles, 10,000 metres",
    "Cross Country Skiing Women's Team Sprint",
    "Boxing Women's Middleweight",
    "Sailing Men's Skiff",
    "Athletics Men's Pentathlon",
    "Swimming Men's 1,200 metres Freestyle",
    "Shooting Women's Skeet",
    "Biathlon Men's 15 kilometres Mass Start",
    "Cross Country Skiing Men's 30 km Skiathlon",
    "Cycling Men's 1/4 mile",
    "Cycling Men's 1/2 mile",
    "Cycling Men's 5 mile",
    "Cycling Men's 25 mile",
    "Shooting Men's Small-Bore Rifle, Standing, 50 metres",
    "Shooting Men's Small Bore-Rifle, Standing, 50 metres, Team",
    "Speed Skating Men's Team Pursuit (8 laps)",
    "Shooting Men's Free Rifle, 1,000 Yards",
    "Cycling Women's Team Pursuit",
    "Speed Skating Women's 5,000 metres",
    "Athletics Men's 3,000 metres Walk",
    "Snowboarding Women's Boardercross",
    "Shooting Mixed Running Target, 50 metres",
    "Luge Mixed Team Relay",
    "Cycling Women's Individual Time Trial",
    "Fencing Women's Sabre, Individual",
    "Fencing Men's Sabre, Individual, Three Hits",
    "Archery Women's Double National Round",
    "Cycling Men's Omnium",
    "Equestrianism Mixed Hacks And Hunter Combined",
    "Sailing Mixed 10 metres",
    "Shooting Men's Trap, Team",
    "Cycling Women's Individual Pursuit, 3,000 metres",
    "Cycling Women's Points Race",
    "Sailing Men's Two Person Keelboat",
    "Cycling Men's Keirin",
    "Cycling Men's Team Sprint",
    "Athletics Men's 5 mile",
    "Shooting Men's Running Target, Single Shot, Team",
    "Bobsleigh Women's Two",
    "Racquets Men's Singles",
    "Racquets Men's Doubles",
    "Art Competitions Mixed Literature, Lyric Works",
    "Motorboating Mixed A-Class (Open)",
    "Archery Men's Continental Style",
    "Military Ski Patrol Men's Military Ski Patrol",
    "Art Competitions Mixed Painting, Graphic Arts",
    "Wrestling Women's Flyweight, Freestyle",
    "Art Competitions Mixed Literature, Unknown Event",
    "Sailing Mixed 0.5-1 Ton",
    "Art Competitions Mixed Painting, Applied Arts",
    "Croquet Mixed Singles, One Ball",
    "Croquet Mixed Doubles",
    "Shooting Men's Running Target, Double Shot, Team",
    "Shooting Men's Free Pistol, 50 yards",
    "Shooting Men's Free Pistol, 50 yards, Team",
    "Fencing Men's epee, Masters and Amateurs, Individual",
    "Swimming Men's 10 kilometres Open Water",
    "Art Competitions Mixed Music, Compositions For Orchestra",
    "Archery Men's Double York Round",
    "Wrestling Women's Middleweight, Freestyle",
    "Equestrianism Men's Vaulting, Individual",
    "Swimming Men's 4 x 250 metres Freestyle Relay",
    "Freestyle Skiing Women's Slopestyle",
    "Table Tennis Women's Team",
    "Athletics Women's Hammer Throw",
    "Canoeing Men's Kayak Singles, 200 metres",
    "Short Track Speed Skating Women's 500 metres",
    "Shooting Women's Double Trap",
    "Rowing Men's 6-Man Naval Rowing Boats",
    "Art Competitions Mixed Music",
    "Shooting Men's Free Rifle, Kneeling, 300 metres",
    "Shooting Men's Free Rifle, Prone, 300 metres",
    "Shooting Men's Free Rifle, Standing, 300 metres",
    "Short Track Speed Skating Women's 1,000 metres",
    "Athletics Men's 3,200 metres Steeplechase",
    "Rowing Women's Coxless Fours",
    "Freestyle Skiing Women's Ski Cross",
    "Freestyle Skiing Men's Ski Cross",
    "Tennis Men's Doubles, Covered Courts",
    "Tennis Men's Singles, Covered Courts",
    "Cycling Men's 25 kilometres",
    "Nordic Combined Men's Normal Hill / 10 km, Individual",
    "Nordic Combined Men's Large Hill / 10 km, Individual",
    "Shooting Men's Military Rifle, 200 metres",
    "Short Track Speed Skating Women's 1,500 metres",
    "Athletics Men's Standing Triple Jump",
    "Rowing Men's Coxed Pairs (1 kilometres)",
    "Shooting Men's Military Pistol, 30 metres",
    "Cycling Women's Keirin",
    "Archery Men's Au Cordon Dore, 50 metres",
    "Swimming Women's 300 metres Freestyle",
    "Snowboarding Women's Giant Slalom",
    "Canoeing Men's Canadian Singles, 200 metres",
    "Sailing Mixed 30 metres",
    "Athletics Men's 4,000 metres Steeplechase",
    "Athletics Men's 5,000 metres, Team",
    "Snowboarding Men's Slopestyle",
    "Rowing Men's Coxed Pairs (1 mile)",
    "Art Competitions Mixed Unknown Event",
    "Cycling Women's Omnium",
    "Freestyle Skiing Men's Halfpipe",
    "Swimming Men's 200 metres Obstacle Course",
    "Swimming Men's 200 metres Team Swimming",
    "Sailing Mixed 12 foot",
    "Art Competitions Mixed Music, Instrumental And Chamber",
    "Art Competitions Mixed Music, Vocals",
    "Art Competitions Mixed Literature, Dramatic Works",
    "Jeu De Paume Men's Singles",
    "Sailing Mixed 10-20 Ton",
    "Cycling Men's 1/3 mile",
    "Cycling Men's 1 mile",
    "Cycling Men's 2 mile",
    "Art Competitions Mixed Sculpturing, Medals And Plaques",
    "Athletics Men's 1,600 metres Medley Relay",
    "Croquet Mixed Singles, Two Balls",
    "Canoeing Men's Folding Kayak Doubles, 10 kilometres",
    "Athletics Men's 60 metres",
    "Snowboarding Women's Parallel Giant Slalom",
    "Sailing Mixed 2-3 Ton",
    "Speed Skating Men's Allround",
    "Shooting Men's Military Rifle, Prone, 600 metres",
    "Canoeing Men's Canadian Doubles, 10,000 metres",
    "Snowboarding Women's Parallel Slalom",
    "Shooting Men's Dueling Pistol, 30 metres, Team",
    "Gymnastics Men's Parallel Bars, Teams",
    "Gymnastics Men's Horizontal Bar, Teams",
    "Shooting Men's Small-Bore Rifle, Disappearing Target, 25 metres, Team",
    "Art Competitions Mixed Sculpturing, Medals And Reliefs",
    "Athletics Men's 1,500 metres Walk",
    "Athletics Men's 3 mile, Team",
    "Art Competitions Mixed Sculpturing, Medals",
    "Shooting Men's Military Rifle, Kneeling Or Standing, 300 metres",
    "Equestrianism Men's Vaulting, Team",
    "Shooting Men's Free Rifle, Any Position, 300 metres",
    "Shooting Men's Military Rifle, 1873-1874 Gras Model, Kneeling Or Standing, 200 metres",
    "Swimming Men's 100 Yard Backstroke",
    "Swimming Men's 440 Yard Breaststroke",
    "Art Competitions Mixed Literature, Epic Works",
    "Art Competitions Mixed Architecture",
    "Athletics Men's 3,500 metres Walk",
    "Roque Men's Singles",
    "Gymnastics Men's Side Horse",
    "Alpinism Mixed Alpinism",
    "Archery Men's Double American Round",
    "Archery Men's Team Round",
    "Archery Men's Target Archery, 33 metres, Individual",
    "Archery Men's Target Archery, 50 metres, Individual",
    "Swimming Men's 1,000 metres Freestyle",
    "Athletics Men's 10 mile Walk",
    "Athletics Men's Discus Throw, Both Hands",
    "Golf Men's Team",
    "Sailing Mixed 0-0.5 Ton",
    "Sailing Mixed 20+ Ton",
    "Cycling Women's Team Sprint",
    "Weightlifting Men's Unlimited, Two Hands",
    "Shooting Men's Free Pistol, 25 metres",
    "Shooting Men's Military Revolver, 1873-1874 Gras Model, 20 metres",
    "Shooting Men's Military Revolver, 20 metres",
    "Shooting Men's Dueling Pistol Au Vise 20 metres",
    "Shooting Men's Dueling Pistol Au Commandement, 25 metres",
    "Shooting Men's Small-Bore Rifle, Prone, 50 metres, Team",
    "Sailing Mixed 6.5 metres",
    "Athletics Men's 200 metres Hurdles",
    "Athletics Men's 56-pound Weight Throw",
    "Equestrianism Mixed Four-In-Hand Competition",
    "Athletics Men's 2,500 metres Steeplechase",
    "Art Competitions Mixed Music, Unknown Event",
    "Athletics Men's All-Around Championship",
    "Archery Men's Pole Archery, Small Birds, Individual",
    "Archery Men's Pole Archery, Large Birds, Individual",
    "Archery Men's Pole Archery, Small Birds, Team",
    "Archery Men's Pole Archery, Large Birds, Team",
    "Athletics Men's 2,590 metres Steeplechase",
    "Archery Women's Double Columbia Round",
    "Athletics Men's 4 mile, Team",
    "Figure Skating Men's Special Figures",
    "Shooting Men's Military Rifle, Standing, 300 metres",
    "Swimming Men's 50 yard Freestyle",
    "Swimming Men's 100 yard Freestyle",
    "Swimming Men's 440 yard Freestyle",
    "Basque Pelota Men's Two-Man Teams With Cesta",
    "Shooting Men's Trap, Single Shot, 16 metres",
    "Shooting Men's Trap, Double Shot, 14 metres",
    "Equestrianism Mixed Long Jump",
    "Canoeing Men's Folding Kayak Singles, 10 kilometres",
    "Shooting Men's Free Pistol, 30 metres",
    "Shooting Men's Military Pistol, 25 metres",
    "Swimming Men's 100 metres Freestyle For Sailors",
    "Archery Men's Sur La Perche a La Herse",
    "Sailing Mixed 3-10 Ton",
    "Gymnastics Men's Individual All-Around, 4 Events",
    "Wrestling Men's Unlimited Class, Greco-Roman",
    "Motorboating Mixed B-Class (Under 60 Feet)",
    "Motorboating Mixed C-Class",
    "Cycling Men's 10,000 metres",
    "Art Competitions Mixed Sculpturing, Reliefs",
    "Shooting Men's Muzzle-Loading Pistol, 25 metres",
    "Equestrianism Mixed High Jump",
    "Archery Men's Sur La Perche a La Pyramide",
    "Fencing Men's Single Sticks, Individual",
    "Gymnastics Men's Tumbling",
    "Shooting Men's Unknown Event",
    "Sailing Mixed 18 foot",
    "Archery Men's Unknown Event",
    "Archery Men's Au Chapelet, 50 metres",
    "Archery Men's Championnat Du Monde",
    "Archery Women's Team Round",
    "Wrestling Men's All-Around, Greco-Roman",
    "Cycling Men's 12-Hours Race",
    "Swimming Men's 500 metres Freestyle",
    "Weightlifting Men's All-Around Dumbbell Contest",
    "Archery Men's Au Chapelet, 33 metres",
    "Archery Men's Au Cordon Dore, 33 metres",
    "Archery Men's Target Archery, 28 metres, Individual",
    "Aeronautics Mixed Aeronautics"];

export const Medals: Medal[] = [
    { id: golds, isChecked: true, name: 'Golds' },
    { id: silvers, isChecked: true, name: 'Silvers' },
    { id: bronzes, isChecked: true, name: 'Bronzes' },
];

export const StatsPieChart: any[] = [
    { party: 'BJP', electionP: 56 },
    { party: 'INC', electionP: 18 },
    { party: 'AA', electionP: 10 },
    { party: 'CPI', electionP: 5 },
    { party: 'CPI-M', electionP: 5 },
    { party: 'BSP', electionP: 7 },
    { party: 'AITS', electionP: 10 }
];

export interface Employee {
    company: string;
    frequency: number;
}

export const StatsBarChart: Employee[] = [
    { company: 'Apple', frequency: 100000 },
    { company: 'IBM', frequency: 80000 },
    { company: 'HP', frequency: 20000 },
    { company: 'Facebook', frequency: 70000 },
    { company: 'TCS', frequency: 12000 },
    { company: 'Google', frequency: 110000 },
    { company: 'Wipro', frequency: 5000 },
    { company: 'EMC', frequency: 4000 }
];