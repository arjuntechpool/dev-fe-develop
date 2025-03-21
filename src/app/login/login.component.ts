import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor( public translate: TranslateService) {
    translate.addLangs(['en','ml']);
    translate.setDefaultLang('en');
   }

  ngOnInit(): void {
    
  }

  onSubmit(formValues: any) {
    // navigation
  }

}
