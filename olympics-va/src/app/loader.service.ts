import { Injectable, NgModule, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { ObjectUnsubscribedError, of, Subscription } from 'rxjs';
import { bronzes, golds, PreCheckedSports2, PreCheckedSports, silvers, Sport, Country, CountryPopulation, Decades, CountryGdp, Medal, Sports, Query, CacheEntry, MainComputationResult } from 'src/data/data';
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

  selectedSports: Sport[]

  eventsPerSport = {}
  countries = {}

  selectedTradition = ""

  populations = {}
  
  gdp = {}

  cache: Array<CacheEntry> = []
  

  private isOlympicsDataReady: Boolean = false

  constructor(private dataService: DataService) {
    this.subscription = this.dataService.olympycsReadinessMessage.subscribe(message => this.isOlympicsDataReady = message)
    this.selectedSportsSub = this.dataService.selectedSportsMessage.subscribe(message => this.selectedSports = message)
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
    let lines = await d3.csv("/assets/data/gdp-per-capita.csv")
    let gdp = {}
    let currentNoc = ""
    lines.forEach(l => {
      if (l.Code != currentNoc){
        let y = {
          [l.Year]: l.Output
        }
        let p: CountryGdp = {
            id: l.Code,
            name: l.Entity,
            years: y
          }
          currentNoc= l.Code
          gdp[l.Code] = p
        }else {
          // update gdp[l.Code] with new year value of Gdp:  gdp[l.Code].years[l.Year] = l.Output
          gdp[l.Code].years[l.Year] = l.Output
        }
    })
    return gdp
  }

  async loadOlympicsCsv() {
    let lines = await d3.csv("/assets/data/athlete_events.csv")
    let res = this.preProcessData(lines, this)
    return res
  }

  checkReadiness(noc_r:boolean, oly_r:boolean, pop_r:boolean, gdp_r:boolean) {
    if(noc_r && oly_r && pop_r && gdp_r) {
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
      this.olympicsDict["NOC"] = d
      oly_r = true
      this.checkReadiness(noc_r, oly_r, pop_r, gdp_r)
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
          bronzes: 0
        }
        this.selectedSports.push({
          id: this.selectedSports.length,
          isChecked: PreCheckedSports.includes(sport),
          name: sport,
          group: line.Sport,
          totalMedals: 0
        })
      }
    })
    console.log(res)
    this.dataService.onSportsDataReady(this.selectedSports)
    return res
  }

  preProcessEventsPerSport(line: any, eventsPerSport: any) {
    let yearMap = eventsPerSport[line.Year] || {}
    let sport = yearMap[line.Sport] || [line.Event]
    if(!sport.includes(line.Event)) {
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
        goldsArr: [],
        silvers: 0,
        silversArr: [],
        bronzes: 0,
        bronzesArr: [],
        sports: sportsCP,
        year: line.Year
      }
    }
    if (line.Medal === "Gold" && !team.goldsArr.includes(line.Event)) {
      team.goldsArr.push(line.Event)
      team.sports[line.Sport].golds++
      team.golds++
    }
    if (line.Medal === "Silver" && !team.silversArr.includes(line.Event)) {
      team.silversArr.push(line.Event)
      team.sports[line.Sport].silvers++
      team.silvers++
    }
    if (line.Medal === "Bronze" && !team.bronzesArr.includes(line.Event)) {
      team.bronzesArr.push(line.Event)
      team.sports[line.Sport].bronzes++
      team.bronzes++
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

    for(let year in eventsPerSport) {
      for(let sports in eventsPerSport[year]) {
        eventsPerSport[year][sports] = eventsPerSport[year][sports].length 
      }
    }
    c.eventsPerSport = eventsPerSport
    console.log(eventsPerSport)
    
    var totgolds = 0
    var totsilvers = 0
    var totbronzes = 0
    var nation = "USA"
    for (const year in res) {
      if (res[year][nation] != undefined) {
        totgolds += res[year][nation].golds
        totsilvers += res[year][nation].silvers
        totbronzes += res[year][nation].bronzes
      }
    }
    console.log(totgolds + totsilvers + totbronzes)
    console.log(res)
    
    return res
  }

  async computeMedalsByNationInRange(start: number, end: number, medals: Medal[], selectedSports: string[], medalsByPop: boolean, medalsByGdp: boolean, normalize?: boolean, tradition?: boolean) {
    let query: Query = ld.cloneDeep({ start, end, medals, selectedSports, medalsByPop, medalsByGdp, normalize })
    let ce: CacheEntry = this.cache.find(ce => ld.isEqual(ce.query, query))
    if(!ce) {
      let result = this.computeResult({...query, tradition: false})
      let traditionResult = this.computeResult({...query, tradition: true})
      let [res, traditionRes]:MainComputationResult[] = await Promise.all([result, traditionResult])

      ce = {
        query: query,
        res: res,
        traditionRes: traditionRes
      }
      this.cache.push(ce)  
    }
    if (tradition){
      let tradResAffinity: MainComputationResult = ld.cloneDeep(ce.traditionRes)
      tradResAffinity.stats = this.computeAffinity(tradResAffinity.stats, this.selectedTradition)
      let selectedStats: Object = tradResAffinity.stats[this.selectedTradition]
      
      Object.keys(selectedStats).forEach(k => {
        typeof selectedStats[k] === "object" &&(selectedStats[k].sport = k)
      })
      let values = Object.values(selectedStats)
      values = values.filter(v => typeof v === "object")
      values.sort((a,b) => b.total - a.total)
      let sortedSports = values.map(v => v && v.sport)
      tradResAffinity.sportsList = sortedSports
      console.log("tradResAffinity: ", tradResAffinity)
      // todo sorting 
      return tradResAffinity
    }
    return ce.res
  }

  async computeResult(q: Query) {
    console.log("compute results speaking", q.medals)
    console.log("computeMedalsByNationInRange sports: " + q.selectedSports.length)
    console.log("tradition is active: ", q.tradition)


    if (q.selectedSports.length == 0) {
      q.selectedSports = PreCheckedSports2
    }
    this.selectedSports.forEach(s => s.totalMedals = 0)
    let dict = this.olympicsDict["NOC"]
    let res = {}
    let max = 0
    let maxSingleSport = 0
    let range = this.rangeOf(q.start,q.end)
    let gold = q.medals.find(m => m.id === golds)
    let silver = q.medals.find(m => m.id === silvers)
    let bronze = q.medals.find(m => m.id === bronzes)
    let decadesSelected 
      q.medalsByPop && (decadesSelected = this.computeDecadesRange(q.start, q.end))
    console.log (decadesSelected)

    for (let i = q.start; i <= q.end; i++) {
      let currentYear = dict[i]
      currentYear && Object.keys(currentYear).forEach(noc => {
        let data = currentYear[noc]
        let teamStats = res[noc]
        let currentAvgGdp 
          q.medalsByGdp && (currentAvgGdp = this.computeAverageGdpOfNation(range, noc))
        let currentAvgPop 
          q.medalsByPop && (currentAvgPop = this.computeAveragePopulationOfNation(decadesSelected, noc))

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
                total: 0
              }
            }

            let eventsAmount = 1
            this.eventsPerSport[i] && this.eventsPerSport[i][sport] && (eventsAmount = this.eventsPerSport[i][sport])
            // console.log("eventsAmount: " + eventsAmount + ", year: "+ currentYear + ", sport:" + sport)
            let goldsAmount = data.sports[sport].golds
            let silversAmount = data.sports[sport].silvers
            let bronzesAmount = data.sports[sport].bronzes
            
            if(q.normalize) {
              goldsAmount/=eventsAmount
              silversAmount/=eventsAmount
              bronzesAmount/=eventsAmount
            }

            if(q.tradition) {
              goldsAmount*=Math.pow(100, 1/(q.end-i+1))
              silversAmount*=Math.pow(100, 1/(q.end-i+1))
              bronzesAmount*=Math.pow(100, 1/(q.end-i+1))
            }

            
            let incrementSportGold = (q.medalsByPop && !isNaN(currentAvgPop))? goldsAmount*gold.weight/currentAvgPop *100000: goldsAmount*gold.weight
            let incrementSportSilver = (q.medalsByPop && !isNaN(currentAvgPop))? silversAmount*silver.weight/currentAvgPop *100000: silversAmount*silver.weight
            let incrementSportBronze = (q.medalsByPop && !isNaN(currentAvgPop))? bronzesAmount*bronze.weight/currentAvgPop *100000: bronzesAmount*bronze.weight

            
            if (q.medalsByGdp && !isNaN(currentAvgGdp)){
              incrementSportGold = incrementSportGold*gold.weight/currentAvgGdp
              incrementSportSilver = incrementSportSilver*silver.weight/currentAvgGdp
              incrementSportBronze = incrementSportBronze*bronze.weight/currentAvgGdp
            }

            if (isNaN(currentAvgPop) && q.medalsByPop){
              incrementSportGold = 0
              incrementSportSilver = 0
              incrementSportBronze = 0
              teamStats.noPop = true
            }
            if (isNaN(currentAvgGdp) && q.medalsByGdp){
              incrementSportGold = 0
              incrementSportSilver = 0
              incrementSportBronze = 0
              teamStats.noGdp = true
            }

            q.medals.some(m => m.id===golds && m.isChecked) && (teamSportStats.golds += incrementSportGold)
            q.medals.some(m => m.id===bronzes && m.isChecked) && (teamSportStats.bronzes += incrementSportBronze)
            q.medals.some(m => m.id===silvers && m.isChecked) && (teamSportStats.silvers += incrementSportSilver)
            q.medals.some(m => m.id===golds && m.isChecked) && (teamStats.golds += incrementSportGold)
            q.medals.some(m => m.id===bronzes && m.isChecked) && (teamStats.bronzes += incrementSportBronze)
            q.medals.some(m => m.id===silvers && m.isChecked) && (teamStats.silvers += incrementSportSilver)
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

  computeAffinity(res, sel){
    let mostSimilar = {}
    let minDeltas = {}
    Object.keys(res).forEach(noc => {
      //if(noc!=sel){
        let totalDelta = 0
        Object.keys(res[noc]).forEach(sport =>{
          if (sport != "bronzes" && sport != "silvers" && sport != "golds" && sport != "name" && sport != "total"){
            let weight = res[sel][sport].total+0.1
            let delta = Math.abs((res[noc][sport].total-res[sel][sport].total)*1)
            totalDelta += delta
          }
        })
        if (Object.keys(minDeltas).length<5){
          minDeltas[noc] = totalDelta
        }else{
          let maxConsidered = Number(minDeltas[Object.keys(minDeltas).reduce((a, b) => minDeltas[a] > minDeltas[b] ? a : b)])
          if (totalDelta<maxConsidered){
            delete minDeltas[Object.keys(minDeltas).reduce((a, b) => minDeltas[a] > minDeltas[b] ? a : b)]
            minDeltas[noc] = totalDelta
          }
        }
      //}
    })
    console.log("most similar Traditions: ", minDeltas)
    Object.keys(minDeltas).forEach(noc =>{
      mostSimilar[noc]=res[noc]
    })
    console.log("my deltas: ", mostSimilar)

    console.log(res)
    return mostSimilar
  }

  computeDecadesRange(start: number, end: number) {
    let first, second
    let yearsArr = []
    if (start<=1900){
      first = 1900
    }
    else {
      if (start%10 <= 5) {
        first = start - start%10
      }
      else{
        first = start + 10 - start%10
      }
    }
    if (end <=1900) {
      second = 1900
    }
    else {
      if (end%10 <= 5) {
        second = end - end%10
      }
      else {
        second = end + 10 - end%10
      }
    }
    if (first === second) {
        yearsArr = [first]
    }
    else {
      let decadesDiff = (second - first)/10
      for (let i = 0; i<= decadesDiff; i++) {
        yearsArr.push(Number(first+i*10))
      }
    }
    return yearsArr
  }

  computeAveragePopulationOfNation(selectedDecades, NOC) {
    let nation = this.countries[NOC].name
    let popSum = 0
    let popYears = 0
    selectedDecades.forEach(y => {
      if (this.populations[nation]) {
        if (this.populations[nation].years[y]){
          popSum += this.populations[nation].years[y]
          popYears++
        }
      }
      else {
        console.log("not found in populations.csv: " + NOC + ", "+ nation)
      }      
    });
    return(popSum/popYears)
  }

  rangeOf(start, end) {
    let range = []
    for (let i=start; i<=end; i++){
      range.push(i)
    }
    return range
  }

  computeAverageGdpOfNation(range,NOC) {
    let GdpSum = 0
    let GdpYears = 0
    range.forEach(y => {
      if (this.gdp[NOC]){
        if (this.gdp[NOC].years[y]){
          GdpSum += Number(this.gdp[NOC].years[y])
          GdpYears++
        }
      } else {
        //console.log("not found in gdp.csv " + NOC)
      }
    })
    return (GdpSum/GdpYears)
  }

}

