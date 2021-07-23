import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoadingComponent } from '../loading/loading.component';
import { AlertController, Platform } from '@ionic/angular';
import { FileTransfer, FileTransferObject } from '@ionic-native/file-transfer/ngx/';
import { File } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})

export class AttendancePage implements OnInit {
  
  mode = 1; segment = 0;  temp = 1; mon_check;
  clss = ['MCA', 'MSc'];  selectAll = "Select All"; sel_btn;
  sems = ['I', 'II', 'III', 'IV', 'V']; date; countMarked = 0;
  subs; form; list; markedList = []; index = 0;

  constructor(private http: HttpClient, private load: LoadingComponent, private alertController: AlertController, 
    private file: File, private filetransfer: FileTransfer, private fileObject: FileTransferObject, 
    private fileOpen: FileOpener, private platform: Platform, private datePipe: DatePipe) 
  { 
    this.form = new FormGroup({clss: new FormControl(null, Validators.required),
                               sems: new FormControl(null, Validators.required),
                               subs: new FormControl(null, Validators.required),
                               date: new FormControl(null, Validators.required),
                               s_date: new FormControl(null, Validators.required),
                               e_date: new FormControl(null),
                               shift: new FormControl('Morning'),
                               marked: new FormControl(false)}); 
  }

  ngOnInit() {}

  segmentChanged(event)
  {
    if(event.detail.value == 'report')
    { this.segment = 3; this.temp = this.mode; this.mode = 1;  }
    else if(event.detail.value == 'mark')
    { this.segment = 0; this.mode = this.temp; }  
  }

  fetch_data(form)
  {
    if(form.clss && form.sems)
    {
      let url = "https://roshniindia.net/project1/api/data.php"

      let data = {mode: "subjects", clss: form.clss, sems: form.sems, shift: form.shift}; 

      //this.load.showLoading();
      this.http.post(url, data).subscribe(
        (response) =>
        {
          //this.load.dismiss();
          this.subs = response;
        },
        (err) => { console.log(JSON.stringify(err)); }
      );

      console.log( form.clss + " " + form.sems + "Fetching...");
    }
    
  }

  viewList(form)
  {
    if(this.segment == 0)
    {
      this.mode = 2;
    
      let url = "https://roshniindia.net/project1/api/data.php"

      let data = {mode: "viewList", clss: form.clss, sems: form.sems, shift: form.shift, date: this.date, sub: form.subs}; 

      this.load.showLoading();
      this.http.post(url, data).subscribe(
        (response) =>
        {
          this.load.dismiss();
          this.list = response;
          if(this.list)
            this.sel_btn = this.list[0].sel_btn;
          console.log(this.list);
        },
        (err) => { console.log(JSON.stringify(err)); }
      );

      console.log( form.clss + " " + form.sems + "Fetching...");
    }
    else if(this.segment == 3)
    {
      let s_year = form.s_date.substring(0,4);
      let e_year = form.e_date.substring(0,4);
      let s_mon = form.s_date.substring(5,7);
      let e_mon = form.e_date.substring(5,7);

      if(s_mon > e_mon || s_year != e_year)
      { this.mon_check = true;  return; }
      else
        this.mon_check = false;
      
      let url = "https://roshniindia.net/project1/api/attendance_sheet.php"

      let data = {mode: "att_sheet", year: s_year, s_mon: s_mon, e_mon: e_mon, clss: form.clss, sems: form.sems, shift: form.shift, sub: form.subs}; 

      this.http.post(url, data).subscribe(
        (response) =>
        {
          let path = null;
          console.log("success");
          if(this.platform.is('ios'))
            path = this.file.documentsDirectory;
          else
            path = this.file.dataDirectory

          let filename = 'att_sheet_' + s_mon + '_' + s_year + '_' + form.clss + '_' + form.shift.substring(0,3) + '_' + form.subs + '.pdf';
          this.fileObject = this.filetransfer.create();
          this.load.showLoading();
          this.fileObject.download("https://roshniindia.net/project1/api/Attendance_Sheet.pdf", path + filename).then(entry => 
          {
            this.load.dismiss();
            let url = entry.toURL();
            this.fileOpen.showOpenWithDialog(url, 'application/pdf');
          });

        },
        (err) => { console.log(JSON.stringify(err)); }
      );
      
    }
    
  }

  mark(mode, i)
  {
    if(mode == 1)
    {
      if(this.form.get('marked').value)
      { 
        this.markedList[this.index++] = {stud_id: this.list[i].id, date: this.date, sub: this.form.get('subs').value, 
        clss: this.form.get('clss').value};
        ++this.countMarked;
      }
      else
      {
        let j = 0; let count = this.markedList.length;
        
        for(j = 0; j < count; j++)
          if(this.markedList[j]["stud_id"] == this.list[i].id)
          {
            this.markedList.splice(j, 1); --this.index; break;
          }

        --this.countMarked;
        this.selectAll = "Select All";
         
      }
        
      if(this.countMarked == this.list.length)
        this.selectAll = "Unselect All";

      console.log(this.markedList);
    }
    else if(mode == 2)
    {
      let url = "https://roshniindia.net/project1/api/data.php"

      let data = {mode: "mark_attendance", sem: this.form.get('sems').value, shift: this.form.get('shift').value, 
                  markedList: this.markedList}; 

      this.load.showLoading();
      this.http.post(url, data).subscribe(
        (response) =>
        {
          this.load.dismiss();
          if(response == "success")
          {
            this.mode = 1;
            this.index = this.countMarked = this.markedList.length = 0;
          }
           
          console.log(response);
        },
        (err) => { console.log(JSON.stringify(err)); }
      );
    }
    
  }

  async createAlert()
  {
    const alert = await this.alertController.create({
          header: "Message",
          message: this.countMarked + " out of " + this.list.length + " students are marked as present." + 
                  " Check again. Attendance once marked cannot be unmarked later.",
          buttons: [{
            text: "Cancel",
            role: "cancel"
          },
          {
            text: "Mark",
            handler: () => {
              this.mark(2, null);
            }
          }]  
    })

    await alert.present();
  }

  selAll()
  {
    if(this.selectAll == "Select All" && !this.list.disable)
    { this.form.patchValue({marked: true}); this.selectAll = "Unselect All"; }
    else
    { this.form.patchValue({marked: false}); this.selectAll = "Select All"; }
  }

  close()
  {
    this.mode = 1;
    this.index = this.countMarked = this.markedList.length = 0;
  }

  parseDate(moment)
  {
    this.date = this.datePipe.transform(moment._d, 'yyyy-MM-dd');
   console.log(this.date);
  }

}
