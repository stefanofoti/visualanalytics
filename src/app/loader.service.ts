import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import { WinterSports, bronzes, golds, PreCheckedSports2, PreCheckedSports, silvers, Sport, Country, CountryPopulation, Decades, CountryGdp, Medal, Sports, Query, CacheEntry, MainComputationResult, NocsList } from 'src/data/data';
import { DataService } from './data.service';
import * as ld from "lodash";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public olympicsDict: any = {}
  subscription: Subscription;
  selectedSportsSub: Subscription;
  traditionSelectionSubscription: Subscription
  csvLines = []
  selectedSports: Sport[]

  public eventsPerSport = {}
  countries = {}

  selectedTradition = ""

  populations = {}

  gdp = {}

  traditionDeltas = {}

  cache: Array<CacheEntry> = []

  query: Query

  yearStats = {}

  avgGdpDict = {}
  avgPopDict = {}

  topNationsAmount:number = 40

  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    //this.selectedSportsSub = this.dataService.selectedSportsMessage.subscribe(message => this.selectedSports = message)
    this.loadOlympicsResults()
    this.traditionSelectionSubscription = this.dataService.traditionSelectionMessage.subscribe(message => {
      this.selectedTradition = message.noc
    })
  }


  async loadNocCsv() {
    let lines = await d3.csv("/assets/data/noc_regions.csv")
    let countries = {}
    lines.forEach(l => {
      let c: Country = {
        id: l.NOC,
        name: l.region,
        continent: l.continent,
        isChecked: false
      }
      countries[l.NOC] = c
    })
    return countries
  }

  async loadPopulationCsv() {
    let lines = await d3.csv("/assets/data/population.csv")
    let populations = {}
    lines.forEach(l => {
      let d: Decades = {
        1900: Number(l[1900]),
        1910: Number(l[1910]),
        1920: Number(l[1920]),
        1930: Number(l[1930]),
        1940: Number(l[1940]),
        1950: Number(l[1950]),
        1960: Number(l[1960]),
        1970: Number(l[1970]),
        1980: Number(l[1980]),
        1990: Number(l[1990]),
        2000: Number(l[2000]),
        2010: Number(l[2010]),
        2020: Number(l[2020])
      }
      let p: CountryPopulation = {
        name: l.Team,
        years: d,
        continent: l.Continent
      }
      populations[l.Team] = p
    })
    return populations
  }

  async loadGdpCsv() {
    let lines = await d3.dsv(";", "/assets/data/gdp.csv")
    let gdp = {}
    let currentYear
    lines.forEach(l => {
      let noc = l["CountryCode"]
      let years = []
      for (currentYear = 1960; currentYear <= 2016; currentYear++) {
        years[currentYear.toString()] = l[currentYear.toString()]
      }
      let p: CountryGdp = {
        id: noc,
        name: l["CountryName"],
        years: years
      }
      gdp[noc] = p
    })
    return gdp
  }



  async loadGdpPopCsv() {
    let lines = await d3.csv("/assets/data/gdp-per-capita.csv")
    let gdp = {}
    let currentNoc = ""
    lines.forEach(l => {
      if (l.Code != currentNoc) {
        let y = {
          [l.Year]: l.Output
        }
        let p: CountryGdp = {
          id: l.Code,
          name: l.Entity,
          years: y
        }
        currentNoc = l.Code
        gdp[l.Code] = p
      } else {
        // update gdp[l.Code] with new year value of Gdp:  gdp[l.Code].years[l.Year] = l.Output
        gdp[l.Code].years[l.Year] = l.Output
      }
    })
    return gdp
  }

  async loadOlympicsCsv() {
    let lines = await d3.dsv(";", "/assets/data/athlete_events.csv")
    // let lines = await d3.csv("/assets/data/athlete_events.csv")
    let res = this.preProcessData(lines, this)
    return [res, lines]
  }

  checkReadiness(noc_r: boolean, oly_r: boolean, pop_r: boolean, gdp_r: boolean) {
    if (noc_r && oly_r && pop_r && gdp_r) {
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    }
  }


  loadOlympicsResults(): void {
    console.log("loading olympics results")
    let rowData = []
    let c = this

    let noc_r, oly_r, pop_r, gdp_r = false

    this.loadNocCsv().then(data => {
      this.countries = data
      noc_r = true
      this.dataService.onCountriesDataReady(Object.values(this.countries))
      this.checkReadiness(noc_r, oly_r, pop_r, gdp_r)
    })

    this.loadOlympicsCsv().then(d => {

      this.olympicsDict["NOC"] = d[0]
      this.csvLines = d[1]
      oly_r = true
      this.checkReadiness(noc_r, oly_r, pop_r, gdp_r)
      this.dataService.onEventsPerSportDataReady(this.eventsPerSport)
    })

    this.loadPopulationCsv().then(data => {
      this.populations = data
      pop_r = true
      this.checkReadiness(noc_r, oly_r, pop_r, gdp_r)
      this.dataService.onPopulationsDataReady(Object.values(this.populations))
    })

    this.loadGdpCsv().then(data => {
      this.gdp = data
      console.log(this.gdp)
      gdp_r = true
      this.checkReadiness(noc_r, oly_r, pop_r, gdp_r)
    })

    // let data = await d3.csv("/assets/data/athlete_events.csv")
    /*d3.csv("/assets/data/athlete_events.csv").then(function (data) {
      rowData = data
    }).then(() => {
      let res = this.computeMedalsByNation(rowData)
      this.olympicsDict["NOC"] = res
      this.isOlympicsDataReady = true
      this.dataService.onOlympicsDataReady(this.isOlympicsDataReady)
    })
*/
  }

  computeSportsList(data) {
    let res: any = {}
    this.selectedSports = []
    data.forEach(line => {
      let sport = line.Sport
      if (!res[sport]) {
        res[sport] = {
          golds: 0,
          silvers: 0,
          bronzes: 0,
          goldsMale: 0,
          silversMale: 0,
          bronzesMale: 0,
          goldsFemale: 0,
          silversFemale: 0,
          bronzesFemale: 0
        }

        let season = WinterSports.includes(sport) ? "winter" : "summer"

        this.selectedSports.push({
          id: this.selectedSports.length,
          isChecked: PreCheckedSports.includes(sport),
          name: sport,
          group: line.Sport,
          totalMedals: 0,
          season: season
        })
      }
    })
    this.dataService.onSportsDataReady(this.selectedSports)
    return res
  }

  preProcessEventsPerSport(line: any, eventsPerSport: any) {
    let yearMap = eventsPerSport[line.Year] || {}
    let sport = yearMap[line.Sport] || [line.Event]
    if (!sport.includes(line.Event)) {
      sport.push(line.Event)
    }
    yearMap[line.Sport] = sport
    eventsPerSport[line.Year] = yearMap
  }

  preProcessMedalsByNation(line: any, res: any, sports: any) {
    let yearMap = res[line.Year] || {}
    let team = yearMap[line.NOC]
    if (!team) {
      let sportsCP = ld.cloneDeep(sports)
      team = {
        name: line.NOC,
        golds: 0,
        goldsMale: 0,
        goldsFemale: 0,
        goldsArr: [],
        silvers: 0,
        silversMale: 0,
        silversFemale: 0,
        silversArr: [],
        bronzes: 0,
        bronzesMale: 0,
        bronzesFemale: 0,
        bronzesArr: [],
        sports: sportsCP,
        year: line.Year
      }
    }
    if (line.Medal === "Gold" && !team.goldsArr.includes(line.Event)) {
      team.goldsArr.push(line.Event)
      team.sports[line.Sport].golds++
      line.Sex === "M" && team.sports[line.Sport].goldsMale++
      line.Sex === "F" && team.sports[line.Sport].goldsFemale++
      line.Sex === "M" && team.goldsMale++
      line.Sex === "F" && team.goldsFemale++
      team.golds++
    }
    if (line.Medal === "Silver" && !team.silversArr.includes(line.Event)) {
      team.silversArr.push(line.Event)
      team.sports[line.Sport].silvers++
      line.Sex === "M" && team.sports[line.Sport].silversMale++
      line.Sex === "F" && team.sports[line.Sport].silversFemale++
      line.Sex === "M" && team.silversMale++
      line.Sex === "F" && team.silversFemale++
      team.silvers++
    }
    if (line.Medal === "Bronze" && !team.bronzesArr.includes(line.Event)) {
      team.bronzesArr.push(line.Event)
      team.sports[line.Sport].bronzes++
      team.bronzes++
      line.Sex === "M" && team.sports[line.Sport].bronzesMale++
      line.Sex === "F" && team.sports[line.Sport].bronzesFemale++
      line.Sex === "M" && team.bronzesMale++
      line.Sex === "F" && team.bronzesFemale++

    }
    yearMap[line.NOC] = team
    res[line.Year] = yearMap
  }

  preProcessData(data, c) {
    let res: any = {}
    let eventsPerSport: any = {}
    let sports = c.computeSportsList(data)
    data.forEach(line => {
      this.preProcessEventsPerSport(line, eventsPerSport)
      this.preProcessMedalsByNation(line, res, sports)
    });





    for (let year in eventsPerSport) {
      for (let sports in eventsPerSport[year]) {
        let maleEvents = 0
        let femaleEvents = 0
        for (let event in eventsPerSport[year][sports]) {
          if (eventsPerSport[year][sports][event].includes("Men's")) {
            maleEvents++
          }
          if (eventsPerSport[year][sports][event].includes("Women's")) {
            femaleEvents++
          }
          if (eventsPerSport[year][sports][event].includes("Mixed")) {
            maleEvents++
            femaleEvents++
          }
        }
        eventsPerSport[year][sports] = [maleEvents, femaleEvents]
      }
    }
    c.eventsPerSport = eventsPerSport





    Object.keys(res).forEach(year => {
      let
        totalGoldsMale = 0,
        totalGoldsFemale = 0,
        totalSilversMale = 0,
        totalSilversFemale = 0,
        totalBronzesMale = 0,
        totalBronzesFemale = 0

      let sportscp = ld.cloneDeep(sports)
      this.yearStats[year] = {}
      Object.keys(res[year]).forEach(noc => {
        totalGoldsMale += res[year][noc].goldsMale
        totalGoldsFemale += res[year][noc].goldsFemale
        totalSilversMale += res[year][noc].silversMale
        totalSilversFemale += res[year][noc].silversFemale
        totalBronzesMale += res[year][noc].bronzesMale
        totalBronzesFemale += res[year][noc].bronzesFemale
        Object.keys(res[year][noc].sports).forEach(sport => {
          sportscp[sport].goldsFemale += res[year][noc].sports[sport].goldsFemale
          sportscp[sport].silversFemale += res[year][noc].sports[sport].silversFemale
          sportscp[sport].bronzesFemale += res[year][noc].sports[sport].bronzesFemale
          sportscp[sport].goldsMale += res[year][noc].sports[sport].goldsMale
          sportscp[sport].silversMale += res[year][noc].sports[sport].silversMale
          sportscp[sport].bronzesMale += res[year][noc].sports[sport].bronzesMale
        })

        this.yearStats[year].sumGoldsMaleDivByEvents = 0
        this.yearStats[year].sumGoldsFemaleDivByEvents = 0
        this.yearStats[year].sumSilversMaleDivByEvents = 0
        this.yearStats[year].sumSilversFemaleDivByEvents = 0
        this.yearStats[year].sumBronzesMaleDivByEvents = 0
        this.yearStats[year].sumBronzesFemaleDivByEvents = 0


        Object.keys(sportscp).forEach(sport => {
          if (this.eventsPerSport[year][sport] && this.eventsPerSport[year][sport][0] > 0) {
            sportscp[sport].totalGoldsMaleDivByEvents = sportscp[sport].goldsMale / this.eventsPerSport[year][sport][0]
            sportscp[sport].totalSilversMaleDivByEvents = sportscp[sport].silversMale / this.eventsPerSport[year][sport][0]
            sportscp[sport].totalBronzesMaleDivByEvents = sportscp[sport].bronzesMale / this.eventsPerSport[year][sport][0]
            this.yearStats[year].sumGoldsMaleDivByEvents += sportscp[sport].totalGoldsMaleDivByEvents
            this.yearStats[year].sumSilversMaleDivByEvents += sportscp[sport].totalSilversMaleDivByEvents
            this.yearStats[year].sumBronzesMaleDivByEvents += sportscp[sport].totalBronzesMaleDivByEvents
          }

          if (this.eventsPerSport[year][sport] && this.eventsPerSport[year][sport][1] > 0) {
            sportscp[sport].totalGoldsFemaleDivByEvents = sportscp[sport].goldsFemale / this.eventsPerSport[year][sport][1]
            sportscp[sport].totalSilversFemaleDivByEvents = sportscp[sport].silversFemale / this.eventsPerSport[year][sport][1]
            sportscp[sport].totalBronzesFemaleDivByEvents = sportscp[sport].bronzesFemale / this.eventsPerSport[year][sport][1]
            this.yearStats[year].sumGoldsFemaleDivByEvents += sportscp[sport].totalGoldsFemaleDivByEvents
            this.yearStats[year].sumSilversFemaleDivByEvents += sportscp[sport].totalSilversFemaleDivByEvents
            this.yearStats[year].sumBronzesFemaleDivByEvents += sportscp[sport].totalBronzesFemaleDivByEvents
          }
        })
      })



      this.yearStats[year] = {
        ...this.yearStats[year],
        totalGoldsMale: totalGoldsMale,
        totalGoldsFemale: totalGoldsFemale,
        totalSilversMale: totalSilversMale,
        totalSilversFemale: totalSilversFemale,
        totalBronzesMale: totalBronzesMale,
        totalBronzesFemale: totalBronzesFemale,
        normConstGoldsMale: totalGoldsMale/this.yearStats[year].sumGoldsMaleDivByEvents || 0,
        normConstGoldsFemale: totalGoldsFemale/this.yearStats[year].sumGoldsFemaleDivByEvents || 0,
        normConstSilversMale: totalSilversMale/this.yearStats[year].sumSilversMaleDivByEvents || 0,
        normConstSilversFemale: totalSilversFemale/this.yearStats[year].sumSilversFemaleDivByEvents || 0,
        normConstBronzesMale: totalBronzesMale/this.yearStats[year].sumBronzesMaleDivByEvents || 0,
        normConstBronzesFemale: totalBronzesFemale/this.yearStats[year].sumBronzesFemaleDivByEvents || 0,
        sports: sportscp
      }
    });

    console.log("yearstats:", this.yearStats)

    console.log("check eventsPerSport:", eventsPerSport)



    return res
  }


  async computeMedalsByNationInRange(start: number, end: number, medals: Medal[], selectedSports: string[], medalsByPop: boolean, medalsByGdp: boolean, normalize: boolean, tradition: boolean, selectedCountries: string[], isMale: boolean, isFemale: boolean, isScatter: boolean, topNationsAmount:number, traditionCountriesNumber?: number, traditionPastWeight?: number) {
    let query: Query = ld.cloneDeep({ start, end, medals, selectedCountries, selectedSports, medalsByPop, medalsByGdp, normalize, isMale, isFemale, isScatter, traditionCountriesNumber, traditionPastWeight })
    this.query = ld.cloneDeep(query)
    this.query.tradition = tradition
    let ce: CacheEntry = this.cache.find(ce => ld.isEqual(ce.query, query))
    this.topNationsAmount = topNationsAmount
    if (!ce) {
      let result = this.computeResult({ ...query, tradition: false })
      let traditionResult = this.computeResult({ ...query, tradition: true })
      let [res, traditionRes]: MainComputationResult[] = await Promise.all([result, traditionResult])

      ce = {
        query: query,
        res: res,
        traditionRes: traditionRes
      }
      //this.cache.push(ce)
    }
    if (tradition) {
      let tradResAffinity: MainComputationResult = ld.cloneDeep(ce.traditionRes)
      let countriesAmount: Number = isNaN(Number(traditionCountriesNumber)) ? 5 : Number(traditionCountriesNumber)
      tradResAffinity.stats = this.computeAffinity(tradResAffinity.stats, this.selectedTradition, countriesAmount)
      let selectedStats: Object = tradResAffinity.stats[this.selectedTradition]

      if(!selectedStats) {
        return undefined
      }

      let max = 0

      Object.values(tradResAffinity.stats).forEach(element => {
        typeof element === "object" && Object.values(element).forEach(sport => {
          sport.total > max && (max = sport.total)
        });
      });



      Object.keys(selectedStats).forEach(k => {
        typeof selectedStats[k] === "object" && (selectedStats[k].sport = k)
      })
      let values = Object.values(selectedStats)
      values = values.filter(v => typeof v === "object")
      values.sort((a, b) => b.total - a.total)
      let sortedSports = values.map(v => v && v.sport)
      tradResAffinity.sportsList = sortedSports
      tradResAffinity.maxSingleSport = max
      return tradResAffinity
    }
    return ce.res
  }




  getTop40Nations(gdpDict: {}) {
    let result = {}
    // Create items array
    var items = Object.keys(gdpDict).map(function (key) {
      return [key, gdpDict[key]];
    });

    // Sort the array based on the second element
    items.sort(function (first, second) {
      return second[1] - first[1];
    });

    items = items.slice(0, this.topNationsAmount)
    items.forEach(item => {
      result[item[0]] = item[1]
    })

    return result
  }

  async computeResult(q: Query) {

    if (q.selectedSports.length == 0) {
      q.selectedSports = PreCheckedSports2
    }
    let pastWeight
    if (q.tradition) {
      pastWeight = isNaN(Number(q.traditionPastWeight)) ? 100 : Number(q.traditionPastWeight)

    }
    this.selectedSports.forEach(s => s.totalMedals = 0)
    let dict = this.olympicsDict["NOC"]
    let res = {}
    let max = 0
    let maxSingleSport = 0
    let range = this.rangeOf(q.start, q.end)
    let gold = q.medals.find(m => m.id === golds)
    let silver = q.medals.find(m => m.id === silvers)
    let bronze = q.medals.find(m => m.id === bronzes)
    let decadesSelected
    console.log("dict", dict)
    q.medalsByPop && (decadesSelected = this.computeDecadesRange(q.start, q.end))
    console.log(decadesSelected)


    if (q.medalsByGdp) {
      NocsList.forEach(c => {
        this.avgGdpDict[c] = this.computeAverageGdpOfNation(range, c)
      })
      this.avgGdpDict = this.getTop40Nations(this.avgGdpDict)
      this.dataService.avgGdpPopReady([this.avgGdpDict, this.avgPopDict])
      console.log("avgGdpDict", this.avgGdpDict)
    }

    if (q.medalsByPop) {
      NocsList.forEach(c => {
        this.avgPopDict[c] = this.computeAveragePopulationOfNation(decadesSelected, c)
      })
      this.avgPopDict = this.getTop40Nations(this.avgPopDict)
      this.dataService.avgGdpPopReady([this.avgGdpDict, this.avgPopDict])
    }


    for (let i = q.start; i <= q.end; i++) {
      let currentYear = dict[i]
      currentYear && Object.keys(currentYear).forEach(noc => {
        let data = currentYear[noc]
        let teamStats = res[noc]

        q.selectedSports.forEach(sport => {
          if (data.sports[sport]) {
            if (!teamStats) {
              teamStats = {
                name: noc,
                golds: 0,
                bronzes: 0,
                silvers: 0,
                total: 0
              }
            }
            let teamSportStats = teamStats[sport]
            if (!teamSportStats) {
              teamSportStats = {
                golds: 0,
                bronzes: 0,
                silvers: 0,

                goldsMale: 0,
                bronzesMale: 0,
                silversMale: 0,
                goldsFemale: 0,
                bronzesFemale: 0,
                silversFemale: 0,

                total: 0
              }
            }

            // console.log("eventsAmount: " + eventsAmount + ", year: "+ currentYear + ", sport:" + sport)

            let goldsAmount = 0
            let silversAmount = 0
            let bronzesAmount = 0

            let eventsAmountMale = 0
            let eventsAmountFemale = 0
            if (q.normalize) {
              this.eventsPerSport[i] && this.eventsPerSport[i][sport] && (eventsAmountMale = this.eventsPerSport[i][sport][0])
              this.eventsPerSport[i] && this.eventsPerSport[i][sport] && (eventsAmountFemale = this.eventsPerSport[i][sport][1])

              // goldsAmount /= eventsAmount
              // silversAmount /= eventsAmount
              // bronzesAmount /= eventsAmount
            }


            if ((q.isMale && !q.normalize) || (q.isMale && q.normalize && eventsAmountMale > 0)) {
              goldsAmount += q.normalize ? (data.sports[sport].goldsMale / eventsAmountMale)*this.yearStats[i].normConstGoldsMale : data.sports[sport].goldsMale
              silversAmount += q.normalize ? (data.sports[sport].silversMale / eventsAmountMale)*this.yearStats[i].normConstSilversMale : data.sports[sport].silversMale
              bronzesAmount += q.normalize ? (data.sports[sport].bronzesMale / eventsAmountMale)*this.yearStats[i].normConstBronzesMale : data.sports[sport].bronzesMale
            }
            if ((q.isFemale && !q.normalize) || (q.isFemale && q.normalize && eventsAmountFemale > 0)) {
              goldsAmount += q.normalize ? (data.sports[sport].goldsFemale / eventsAmountFemale)*this.yearStats[i].normConstGoldsFemale : data.sports[sport].goldsFemale
              silversAmount += q.normalize ? (data.sports[sport].silversFemale / eventsAmountFemale)*this.yearStats[i].normConstSilversFemale : data.sports[sport].silversFemale
              bronzesAmount += q.normalize ? (data.sports[sport].bronzesFemale / eventsAmountFemale)*this.yearStats[i].normConstBronzesFemale : data.sports[sport].bronzesFemale
            }


            if (q.tradition) {
              let interval = q.end-q.start
              let tradVar =  pastWeight*0.01*(10/Math.pow(interval, 3/2))
              let tradFunction = tradVar*Math.pow((Math.pow((tradVar+1)/tradVar,(1/(interval)))), i-q.start) - tradVar
              goldsAmount *=  tradFunction   //Math.pow(pastWeight, 1/(q.end - i + 1))
              silversAmount *= tradFunction  //Math.pow(pastWeight, 1/(q.end - i + 1))
              bronzesAmount *= tradFunction  //Math.pow(pastWeight, 1/(q.end - i + 1))
            }


            let incrementSportGold = (q.medalsByPop && !isNaN(this.avgPopDict[noc])) ? goldsAmount * gold.weight / this.avgPopDict[noc] * 100000 : goldsAmount * gold.weight
            let incrementSportSilver = (q.medalsByPop && !isNaN(this.avgPopDict[noc])) ? silversAmount * silver.weight / this.avgPopDict[noc] * 100000 : silversAmount * silver.weight
            let incrementSportBronze = (q.medalsByPop && !isNaN(this.avgPopDict[noc])) ? bronzesAmount * bronze.weight / this.avgPopDict[noc] * 100000 : bronzesAmount * bronze.weight


            if (q.medalsByGdp && !isNaN(this.avgGdpDict[noc])) {
              incrementSportGold = incrementSportGold * gold.weight * 10000000000 / this.avgGdpDict[noc]
              incrementSportSilver = incrementSportSilver * silver.weight * 10000000000 / this.avgGdpDict[noc]
              incrementSportBronze = incrementSportBronze * bronze.weight * 10000000000 / this.avgGdpDict[noc]
            }

            if (isNaN(this.avgPopDict[noc]) && q.medalsByPop) {
              incrementSportGold = 0
              incrementSportSilver = 0
              incrementSportBronze = 0
              teamStats.noPop = true
            }
            if (isNaN(this.avgGdpDict[noc]) && q.medalsByGdp) {
              incrementSportGold = 0
              incrementSportSilver = 0
              incrementSportBronze = 0
              teamStats.noGdp = true
            }

            q.medals.some(m => m.id === golds && m.isChecked) && (teamSportStats.golds += incrementSportGold)
            q.medals.some(m => m.id === bronzes && m.isChecked) && (teamSportStats.bronzes += incrementSportBronze)
            q.medals.some(m => m.id === silvers && m.isChecked) && (teamSportStats.silvers += incrementSportSilver)
            q.medals.some(m => m.id === golds && m.isChecked) && (teamStats.golds += incrementSportGold)
            q.medals.some(m => m.id === bronzes && m.isChecked) && (teamStats.bronzes += incrementSportBronze)
            q.medals.some(m => m.id === silvers && m.isChecked) && (teamStats.silvers += incrementSportSilver)
            teamStats.total = teamStats.golds + teamStats.bronzes + teamStats.silvers
            teamSportStats.total = teamSportStats.golds + teamSportStats.bronzes + teamSportStats.silvers
            max = teamStats.total > max ? teamStats.total : max
            maxSingleSport = teamSportStats.total > maxSingleSport ? teamSportStats.total : maxSingleSport
            teamStats[sport] = teamSportStats
            res[noc] = teamStats
          }
        })

      })
    }

    let response: MainComputationResult = {
      stats: res,
      max: max as number,
      maxSingleSport: maxSingleSport as number,
      sportsList: q.selectedSports
    }

    return response
  }

  computeAffinity(res, sel, countriesAmount) {
    let mostSimilar = {}
    let minDeltas = {}
    console.log("res", res)
    Object.keys(res).forEach(noc => {
      //if(noc!=sel){
      let totalDelta = 0
      Object.keys(res[noc]).forEach(sport => {
        // if (sport != "bronzes" && sport != "silvers" && sport != "golds" && sport != "name" && sport != "total") {

        // }
        if (typeof res[noc][sport] === "object") {
          let weight = res[sel][sport].total + 0.1
          let delta = Math.abs((res[noc][sport].total - res[sel][sport].total) * weight)
          totalDelta += delta
        }
      })
      console.log("delta: ", minDeltas, totalDelta, noc)
      if (Object.keys(minDeltas).length < countriesAmount) {
        minDeltas[noc] = totalDelta
      } else {
        let maxConsidered = Number(minDeltas[Object.keys(minDeltas).reduce((a, b) => minDeltas[a] > minDeltas[b] ? a : b)])
        if (totalDelta < maxConsidered) {
          delete minDeltas[Object.keys(minDeltas).reduce((a, b) => minDeltas[a] > minDeltas[b] ? a : b)]
          minDeltas[noc] = totalDelta
        }
      }
      //}
    })

    this.traditionDeltas = minDeltas
    console.log("most similar Traditions: ", minDeltas)
    Object.keys(minDeltas).forEach(noc => {
      mostSimilar[noc] = res[noc]
    })
    console.log("my deltas: ", mostSimilar)

    console.log(res)
    return mostSimilar
  }

  computeDecadesRange(start: number, end: number) {
    let first, second
    let yearsArr = []
    if (start <= 1900) {
      first = 1900
    }
    else {
      if (start % 10 <= 5) {
        first = start - start % 10
      }
      else {
        first = start + 10 - start % 10
      }
    }
    if (end <= 1900) {
      second = 1900
    }
    else {
      if (end % 10 <= 5) {
        second = end - end % 10
      }
      else {
        second = end + 10 - end % 10
      }
    }
    if (first === second) {
      yearsArr = [first]
    }
    else {
      let decadesDiff = (second - first) / 10
      for (let i = 0; i <= decadesDiff; i++) {
        yearsArr.push(Number(first + i * 10))
      }
    }
    return yearsArr
  }

  computeAveragePopulationOfNation(selectedDecades, NOC) {
    let nation = this.countries[NOC] && this.countries[NOC].name
    if (nation) {
      let popSum = 0
      let popYears = 0
      selectedDecades.forEach(y => {
        if (this.populations[nation]) {
          if (this.populations[nation].years[y]) {
            popSum += this.populations[nation].years[y]
            popYears++
          }
        }
        else {
          console.log("not found in populations.csv: " + NOC + ", " + nation)
        }
      });
      return (popSum / popYears)
    }
    return 0

  }

  rangeOf(start, end) {
    let range = []
    for (let i = start; i <= end; i++) {
      range.push(i)
    }
    return range
  }

  computeAverageGdpOfNation(range, NOC) {
    let GdpSum = 0
    let GdpYears = 0
    let isLowGdp = false
    range.forEach(y => {
      if (this.gdp[NOC]) {
        let n = Number(this.gdp[NOC].years[y])
        if (!isNaN(n)) {
          GdpSum += Number(this.gdp[NOC].years[y])
          GdpYears++
        }
      }
    })
    if (GdpYears == 0 || isLowGdp) {
      return 0
    }
    let res = GdpSum / GdpYears
    return res
  }

}

