import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Storage } from '@ionic/storage';
import { ChartDataSets } from 'chart.js';
import { LoadingComponent } from '../loading/loading.component';
import { HttpClient } from '@angular/common/http';
import { Color } from 'ng2-charts-x';
import { MatCalendarCellCssClasses, MatCalendar } from '@angular/material/datepicker';
import { DateAdapter, MatDateFormats, MAT_DATE_FORMATS } from '@angular/material/core';
import { SwiperOptions } from 'swiper'; 


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  readOnce = true;  data; mode; statsData; overallPer = 0;
  datasets: ChartDataSets[] = [{data: [], label: 'Total Attendance'}];
  subDatasets = []; tDatasets = {data1: null, data2: null, label1: null, label2: null, options: null, colors: null}; 
  monLabels;  calheadercomp; labels; cType = 'line'; chartOptions; chartColors: Color[] = [];
  startDates = [];  endDates = []; dateCSS; noAttend; disableSat;
  form; clss = ['MCA', 'MSc']; sems = ['I', 'II', 'III', 'IV', 'V']; subs;
  filter: boolean = false; filterBtn = true; tStats; stud_index; stud_refresh;
  Swiper_Op: SwiperOptions = {
    slidesPerView: 4, spaceBetween: 30,
    freeMode: true, observer: true, observeParents: true
  };
  
  constructor(private store: Storage, private load: LoadingComponent, private http: HttpClient) 
  {
    this.form = new FormGroup({clss: new FormControl('MCA'), sem: new FormControl('5'), 
                    shift: new FormControl('Morning'), sub: new FormControl(null)});
  }
  
  ngOnInit() {}
  
  ionViewDidEnter()
  {
    
    if(this.readOnce)
    {
      this.store.get("data").then(data => {
        if(data)
        { 
          this.data = data;
          if(this.data.utype == "Student")
          { this.mode = 1;   this.fetchData("student_stats", null, null);  }
          else if(this.data.utype == "Teaching-Staff")
          { 
            this.mode = 2; 
            
            this.http.post("https://roshniindia.net/project1/api/data.php", {mode: 'subjects', clss: 'MCA', sems: '5'})
            .subscribe(
                        response => 
                        {
                          this.subs = response;
                          this.form.patchValue({sub: this.subs[0]});
                          this.fetchData("teacher_stats", null, null);
                        });
          }
          this.readOnce = false;
        }  
      });
    }
    else
    {
      if(this.mode == 1 && this.stud_refresh)
        this.fetchData("student_stats", this.stud_index, 1);
      else if(this.mode == 1)
        this.fetchData("student_stats", null, null);
      else if(this.mode == 2)
        this.fetchData("teacher_stats", null, null);
    }
      
  }

  fetchData(action, i, mode)
  {
    let url = "https://roshniindia.net/project1/api/stats_data.php";

    let data = {mode: action, pid: this.data.pid, clss: this.form.get('clss').value, sem: this.form.get('sem').value, 
                shift: this.form.get('shift').value, sub: this.form.get('sub').value};

    if(this.data.utype == "Teaching-Staff" && this.tStats && mode)
    { data['pid'] = this.tStats[1].studs[i].pid;  this.stud_index = i;  this.stud_refresh = true;  }

    if(mode)
      this.mode = mode;
                
    console.log(data);

    this.load.showLoading();
    this.http.post(url, data).subscribe(
      (response) =>
      {
        this.load.dismiss();
        if(this.mode == 1)
        {
          this.statsData = response;
          console.log(this.statsData);
          this.showStats();
        }
        else if(this.mode == 2)
        {
          this.tStats = response;
          this.show_teacher_stats();
        }
        
        //console.log(this.statsData[2][0]);
      },
      (err) => { console.log(JSON.stringify(err)); }
    );
  } 

  showStats()
  {
    //For Overall Subjects
    this.labels = [];
    this.datasets[0].data = [];

    this.chartOptions = {
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true
            }
          }
        ]
      }
    };
    
    this.chartColors = [
      {
          backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(255, 206, 86, 0.5)",
          "rgba(34, 16, 230, 0.5)",
          "rgba(166, 75, 5, 0.5)",
          "rgba(130, 4, 44, 0.5)", 
        ],
        borderColor: [
          "rgba(255,99,132,1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)"
        ]
      }
    ];

    for(var i in this.statsData[1])
      this.labels.push(this.statsData[1][i]);

    this.datasets[0].borderWidth = 1;

    //For Subjects Monthwise

    if(this.statsData[4].sem % 2 == 0)
      this.monLabels = ["January", "February", "March", "April", "May"];
    else
      this.monLabels = ["July", "August", "September", "October", "November", "December"];

    
    let sub_count = this.statsData[2].length, total_lec = this.overallPer = 0, mon_count = this.monLabels.length;
    let sub = this.form.get('sub').value;

    for(let i = 0; i < sub_count; i++)
    {
      let datasets: ChartDataSets[] = [{data: [], label: "Total Attendance"}];
      let sum = 0;

      for(let j = 0; j < mon_count; j++)
      {
        datasets[0].data.push(this.statsData[2][i]['mon' + (j + 1)].length);
        //Overall Total
        sum += this.statsData[2][i]['mon' + (j + 1)].length
      }

      this.datasets[0].data.push(sum);
      this.subDatasets[i] = {"data": datasets};
      
      let per = 0; 
      if(this.statsData[3]['lec_count' + (i + 1)] != 0)
      {
        total_lec += parseInt(this.statsData[3]['lec_count' + (i + 1)]);
        this.overallPer += sum;
        per = sum / parseInt(this.statsData[3]['lec_count' + (i + 1)]) * 100;
        this.subDatasets[i]['percentage'] = per.toFixed(2);

        //Calculate Lectures Required to achive target
        this.subDatasets[i]['lecture_required'] = Math.trunc((0.75 * this.statsData[3]['lec_count' + (i + 1)]) - sum);
      }
    }

    this.overallPer = parseFloat((this.overallPer / total_lec * 100).toFixed(2));
    console.log(this.datasets)
  }

  getDatesList(i)
  {
    this.mode = 3;
    
    let sub = this.statsData[0]['sub' + (i + 1)], mon_count = this.monLabels.length, year, mon;
    let url = "https://roshniindia.net/project1/api/stats_data.php";

    if(this.statsData[4].sem % 2 == 0)
      mon = 0;
    else
      mon = 6;

    let data = {mode: 'get_year', pid: this.data.pid, sub: sub};
    if(this.data.utype == 'Teaching-Staff')
      data['pid'] = this.tStats[1].studs[i].pid;

    this.http.post(url, data).subscribe(
      response => 
      {
        if(response['status'] == "OK")
        {
          year = response['year'];
          for(let i = 0; i < mon_count; i++, mon++)
          {
            this.startDates[i] = new Date(year, mon, 1);
            this.endDates[i] = new Date(year, mon, new Date(year, mon + 1, 0).getDate());
          }

          this.calheadercomp = CalHeader;
          this.setDates(i, this.startDates[0]);
        }
        else
          this.noAttend = true;

      },
      err => { alert(err); }
    );
    
  }

  setDates(i, startDate)
  {
    let j = 0, k = 0, endMonth = startDate.getMonth() + 1;

    this.dateCSS = (d: Date): MatCalendarCellCssClasses => {

      //Get Calendar Date
      let date = new Date(d).getDate(), currMonth = new Date(d).getMonth();
      
      if(currMonth == endMonth)
      { j++; k = 0; endMonth = new Date(d).getMonth() + 1; }
      
      //Get Attendance Dates
      let presentDates = this.statsData[2][i]['mon' + (j + 1)];
      
      if(date == new Date(presentDates[k]).getDate())
      {
        k++
        return 'calendar-date';
      }
      else
        return '';
    }

    this.disableSat = (d: Date): boolean => {
      const day = new Date(d).getDay();
      // Prevent Saturday and Sunday from being selected.
      return day !== 0 && day !== 6;
    }
  }

  //Teachers Dashboard Data
  fetch_sub(form)
  {
    if(form.clss && form.sem)
    {
      let url = "https://roshniindia.net/project1/api/data.php"

      let data = {mode: "subjects", clss: form.clss, sems: form.sem}; 

      this.subs = null;
      //this.load.showLoading();
      this.http.post(url, data).subscribe(
        (response) =>
        {
          //this.load.dismiss();
          this.subs = response;
        },
        (err) => { console.log(JSON.stringify(err)); }
      );
    }
  }

  filterResults(action)
  {
    this.filter = true; this.filterBtn = false;

    if(action == 2)
    {
      this.filter = false;  this.filterBtn = true;
      this.fetchData("teacher_stats", null, null);
    }
    else if(action == 'cancel')
    { this.filter = false;  this.filterBtn = true;  }
  }

  show_teacher_stats()
  {
    
    let count = this.tStats[1].studs.length, sub, num_studs = this.tStats[1].studs.length, sum = 0, tl_lec = 0;
    
    for(let i = 0; i < count; i++)
      this.tStats[1].studs[i]['att_count'] = (this.tStats[1].studs[i]['att_count'] / this.tStats[2].lecture_count * 100).toFixed(2);

    let datasets: ChartDataSets[] = [{data: [], label: "Attendance %"}, {data: [], label: "Average Attendance"}];

    count = this.subs.length;
    sub = this.form.get('sub').value;

    //Calculate Subject specific % and Avg
    for(let i = 0; i < count; i++)
    { 
      let mon_length = this.tStats[3]['mon_count' + (i + 1)].length;

      if(sub == this.tStats[3]['sub' + (i + 1)])
      {
        for(let j = 0; j < mon_length; j++)
        {
          if(this.tStats[3]['lec_count' + (i + 1)][j] != 0)
          {
            datasets[0].data.push((this.tStats[3]['mon_count' + (i + 1)][j] / (this.tStats[3]['lec_count' + (i + 1)][j] * num_studs) * 100).toFixed(2));
            datasets[1].data.push(Math.round(this.tStats[3]['mon_count' + (i + 1)][j] / this.tStats[3]['lec_count' + (i + 1)][j]));
          }
          else
          {
            datasets[0].data.push(0);
            datasets[1].data.push(0);
          }
          
          this.tDatasets["data2"] = datasets;
        }
      }
    }

    if(this.form.get('sem').value % 2 == 0)
      this.tDatasets['label2'] = ["January", "February", "March", "April", "May"];
    else
      this.tDatasets['label2'] = ["July", "August", "September", "October", "November", "December"];

    //Calculate All Subject % and Avg
    let datasets2: ChartDataSets[] = [{data: [], label: "Attendance %"}, {data: [], label: "Average Attendance"}], temp = [];
    
    for(let i = 0; i < count; i++)
    {
      let mon_length = this.tStats[3]['mon_count' + (i + 1)].length;
      sum = tl_lec = 0;
      for(let j = 0; j < mon_length; j++)
      {
        tl_lec += this.tStats[3]['lec_count' + (i + 1)][j] * 1;
        sum += this.tStats[3]['mon_count' + (i + 1)][j] * 1;
      }

      if(tl_lec != 0)
      {
        datasets2[0].data.push((sum / (tl_lec * num_studs) * 100).toFixed(2));
        datasets2[1].data.push(Math.round(sum / tl_lec));
      }
      else
      {
        datasets2[0].data.push(0);
        datasets2[1].data.push(0);
      }

      temp.push(this.tStats[3]['sub_code' + (i + 1)]);
    }

    this.tDatasets['label1'] = temp;  
    this.tDatasets["data1"] = datasets2;

    this.tDatasets['options'] = {
      elements: {
        line: {
                fill: false}
        },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true }
            }]
          }
        };

    this.tDatasets['colors'] = [{
      backgroundColor: [
      "rgba(255, 206, 86, 0.5)",
      "rgba(54, 162, 235, 0.5)",
      "rgba(255, 99, 132, 0.5)",
      "rgba(34, 16, 230, 0.5)",
      "rgba(130, 4, 44, 0.5)",
      "rgba(166, 75, 5, 0.5)" 
      ],
      borderColor: [
        "rgba(255,99,132,1)"
      ]},
      {
        backgroundColor: [
        "rgba(13, 186, 59, 0.8)",
        "rgba(186, 53, 13, 0.8)",
        "rgba(156, 151, 9, 0.8)",
        "rgba(34, 16, 230, 0.8)",
        "rgba(130, 4, 44, 0.8)",
        "rgba(242, 7, 7, 0.8)" 
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)"
        ]}
    ];

    console.log(this.tDatasets);
    console.log(this.tStats);
    
  }

  close()
  {
    if(this.data.utype == 'Student')
      this.mode = 1;
    else if(this.data.utype == 'Teaching-Staff' && this.mode == 3)
      this.mode = 1;
    else if(this.data.utype == 'Teaching-Staff')
      this.mode = 2;
  }

  doRefresh(event)
  {
    setTimeout(() => {
      event.target.complete();
      this.ionViewDidEnter();
    }, 2000);
  }

}


//For Calendar Settings
@Component({
  selector: 'cal-header',
  styleUrls: ['./dashboard.page.scss'], 
  template: `<div class="example-header"> 
              <span class="example-header-label">{{getYear}}</span>
              <br><br>
            </div>`
})

export class CalHeader<D>
{
  constructor(private calendar: MatCalendar<D>, private dateAdapter: DateAdapter<D>, 
    @Inject(MAT_DATE_FORMATS) private dateFormats: MatDateFormats)
  {}
  
  get getYear()
  {
    return this.dateAdapter.format(this.calendar.activeDate, this.dateFormats.display.monthYearA11yLabel).toLocaleUpperCase();
  }
}



