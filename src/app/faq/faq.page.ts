import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {

  name = "";
  
  constructor(private http: HttpClient) {
    console.log("constructor");
  }

  ngOnInit() {
  }

  addData()
  {
    let url = "http://localhost/ionic_data/data.php";

    let data = {uname: this.name};

    this.http.post(url,data).subscribe((data)=>{
      console.log(data);
    }, err => {
    console.log("error" + err);
        });

    console.log(this.name);
  }
}
